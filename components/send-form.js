'use client';

import { Anchor, Button, Checkbox, Group, TextInput, Modal, Stack, Text } from '@mantine/core';
import { useTimeout, useDisclosure, useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useSearchParams } from 'next/navigation';

import { useState } from 'react';
import { createTransaction, sendAmount, selectUtxos } from '@/lib/ledger';
import styles from './send-form.module.css';
import AddressText from '@/components/address-text';

let timeout = null;

export default function SendForm(props) {
    const [amount, setAmount] = useState('');
    const [sendTo, setSendTo] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [fee, setFee] = useState('-');

    const [errorAddress, setErrorAddress] = useState(null);

    const [canSendAmount, setCanSendAmount] = useState(false);
    const [includeFeeInAmount, setIncludeFeeInAmount] = useState(false);

    const [isSuccessModalOpen, { open: openSuccessModal, close: closeSuccessModal }] =
        useDisclosure();
    const [sentAmount, setSentAmount] = useState('');
    const [sentTo, setSentTo] = useState('');
    const [sentTxId, setSentTxId] = useState(null);

    const searchParams = useSearchParams();

    const deviceType = searchParams.get('deviceType');
    const { width: viewportWidth } = useViewportSize();

    const cleanupOnSuccess = (transactionId) => {
        const targetAmount = includeFeeInAmount ? Number((amount - fee).toFixed(8)) : amount;
        setSentAmount(targetAmount);
        setSentTo(sendTo);
        setSentTxId(transactionId);
        openSuccessModal();

        // Reset setup
        setConfirming(false);
        setSendTo('');
        setAmount('');
        setFee('-');
        setIncludeFeeInAmount(false);

        if (props.onSuccess) {
            props.onSuccess(transactionId);
        }
    };

    const { start: simulateConfirmation } = useTimeout((args) => {
        // Hide when ledger confirms
        const notifId = args[0];

        notifications.hide(notifId);

        cleanupOnSuccess('c130ca7a3edeeeb2dc0130a8bac188c040415dc3ef2265d541336334c3c75f00');
    }, 3000);

    const signAndSend = async () => {
        setConfirming(true);
        const notifId = notifications.show({
            title: 'Confirming',
            message: `Review and Confirm the transaction in your Ledger`,
            loading: true,
        });

        if (deviceType == 'demo') {
            simulateConfirmation(notifId);
        } else if (deviceType == 'usb') {
            try {
                const { tx } = createTransaction(
                    Math.round(amount * 100000000),
                    sendTo,
                    props.addressContext.utxos,
                    props.addressContext.derivationPath,
                    props.addressContext.address,
                    includeFeeInAmount,
                );

                const transactionId = await sendAmount(tx, deviceType);

                cleanupOnSuccess(transactionId);
            } catch (e) {
                console.error(e);
                notifications.show({
                    title: 'Error',
                    message: e.message,
                    loading: false,
                });
                setConfirming(false);
            } finally {
                notifications.hide(notifId);
            }
        }
    };

    const calcFee = (sendTo, amount, includeFeeInAmount) => {
        if (amount && sendTo) {
            let calculatedFee = '-';
            if (deviceType === 'demo') {
                calculatedFee =
                    fee === '-' ? Math.round(Math.random() * 10000) / 100000000 : Number(fee);
                setCanSendAmount(Number(amount) <= props.addressContext.balance - calculatedFee);
            } else if (deviceType === 'usb') {
                const [hasEnough, selectedUtxos, feeCalcResult] = selectUtxos(
                    amount * 100000000,
                    props.addressContext.utxos,
                    includeFeeInAmount,
                );
                if (hasEnough) {
                    calculatedFee = feeCalcResult / 100000000;
                    setCanSendAmount(true);
                } else {
                    setCanSendAmount(false);
                }
            }

            if (fee === '-' || fee !== calculatedFee) {
                setFee(calculatedFee);
            }
        } else {
            setFee('-');
            setCanSendAmount(false);
        }
    };

    const headerDetails = !props.hideHeader ? (
        <>
            <Text fw={700}>Address:</Text>
            <Text className={styles.modalAddress}>{props.addressContext.address}</Text>

            <Group justify='space-between'>
                <Text fw={700}>Balance:</Text>
                <Text>{props.addressContext.balance}</Text>
            </Group>
        </>
    ) : null;

    return (
        <>
            <Stack {...props}>
                {headerDetails}

                <TextInput
                    label='Send to Address'
                    placeholder='Address'
                    value={sendTo}
                    onChange={(event) => {
                        const curr = event.currentTarget.value;
                        setSendTo(curr || null);
                        calcFee(curr, amount, includeFeeInAmount);

                        if (curr && !/^kaspa\:[a-z0-9]{61,63}$/.test(curr)) {
                            setCanSendAmount(false);
                            setErrorAddress('Invalid address format');
                        } else {
                            setErrorAddress(null);
                        }
                    }}
                    disabled={confirming}
                    error={errorAddress}
                    required
                />

                {/* TODO: Add validations. When NumberInput is ready, use that here. */}
                <TextInput
                    label='Amount in KAS'
                    placeholder='0'
                    value={amount}
                    onChange={(event) => {
                        const curr = event.currentTarget.value;
                        setAmount(curr);
                        calcFee(sendTo, curr, includeFeeInAmount);
                    }}
                    disabled={confirming}
                    required
                />

                <Checkbox
                    value={includeFeeInAmount}
                    onChange={(event) => {
                        setIncludeFeeInAmount(event.currentTarget.checked);
                        calcFee(sendTo, amount, event.currentTarget.checked);
                    }}
                    label='Include fee in amount'
                    disabled={confirming}
                />

                <Group justify='space-between'>
                    <Text fw={700}>Fee:</Text>
                    <Text>{fee}</Text>
                </Group>

                <Button fullWidth onClick={signAndSend} disabled={confirming || !canSendAmount}>
                    Sign with Ledger and Send
                </Button>
            </Stack>
            <Modal
                centered
                withCloseButton={false}
                opened={isSuccessModalOpen}
                onClose={closeSuccessModal}
                size={viewportWidth > 700 ? 'auto' : 'md'}
            >
                <Stack align='center'>
                    <Text size='lg' align='center' c='brand'>
                        Sent!
                    </Text>

                    <Text fw={600}>Transaction ID</Text>

                    <Anchor
                        href={`https://explorer.kaspa.org/txs/${sentTxId}`}
                        target='_blank'
                        c='brand'
                        align='center'
                        w={'calc(var(--modal-size) - 6rem)'}
                        style={{ overflowWrap: 'break-word' }}
                    >
                        {sentTxId}
                    </Anchor>

                    <Text component='h2' align='center' fw={600}>
                        {sentAmount} KAS
                    </Text>

                    <Text align='center'>sent to</Text>

                    <Text
                        w={'calc(var(--modal-size) - 6rem)'}
                        style={{ overflowWrap: 'break-word' }}
                        align='center'
                    >
                        <AddressText address={sentTo} />
                    </Text>

                    <Button onClick={closeSuccessModal}>Close</Button>
                </Stack>
            </Modal>
        </>
    );
}
