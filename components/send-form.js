'use client';

import {
    Anchor,
    Button,
    Checkbox,
    Group,
    TextInput,
    Modal,
    Stack,
    Text,
    NumberInput,
} from '@mantine/core';
import { useTimeout, useDisclosure, useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useSearchParams } from 'next/navigation';

import { useState, useEffect } from 'react';
import { createTransaction, sendAmount, selectUtxos } from '@/lib/ledger';
import styles from './send-form.module.css';
import AddressText from '@/components/address-text';
import { useForm } from '@mantine/form';

export default function SendForm(props) {
    const [confirming, setConfirming] = useState(false);
    const [fee, setFee] = useState('-');

    const [canSendAmount, setCanSendAmount] = useState(false);

    const [isSuccessModalOpen, { open: openSuccessModal, close: closeSuccessModal }] =
        useDisclosure();

    const deviceType = useSearchParams().get('deviceType');
    const { width: viewportWidth } = useViewportSize();

    const form = useForm({
        initialValues: {
            amount: '',
            sendTo: '',
            includeFeeInAmount: false,
            sentAmount: '',
            sentTo: '',
            sentTxId: '',
        },
        validate: {
            amount: (value) => (!(Number(value) > 0) ? 'Amount must be greater than 0' : null),
            sendTo: (value) => (!/^kaspa\:[a-z0-9]{61,63}$/.test(value) ? 'Invalid address' : null),
        },
        validateInputOnBlur: true,
    });

    const resetState = (resetAllValues = false) => {
        // Reset setup
        setConfirming(false);
        setFee('-');
        const baseValues = { amount: '', sendTo: '', includeFeeInAmount: false };

        if (resetAllValues) {
            baseValues.sentTo = '';
            baseValues.sentTxId = '';
            baseValues.sentAmount = '';
        }

        form.setValues(baseValues);
    };

    const cleanupOnSuccess = (transactionId) => {
        const targetAmount = form.values.includeFeeInAmount
            ? Number((form.values.amount - fee).toFixed(8))
            : form.values.amount;

        form.setValues({sentTo: form.values.sendTo, sentTxId: transactionId, sentAmount: targetAmount});
        openSuccessModal();

        resetState();

        if (props.onSuccess) {
            props.onSuccess(transactionId);
        }
    };

    useEffect(() => {
        resetState();
    }, [props.addressContext]);

    useEffect(() => {
        // Whenever any of fields change, we calculate the fees
        calcFee(form.values.sendTo, form.values.amount, form.values.includeFeeInAmount);
    }, [form.values.sendTo, form.values.amount, form.values.includeFeeInAmount]);

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
                    Math.round(form.values.amount * 100000000),
                    form.values.sendTo,
                    props.addressContext.utxos,
                    props.addressContext.derivationPath,
                    props.addressContext.address,
                    form.values.includeFeeInAmount,
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

    return (
        <>
            <Stack {...props}>
                <TextInput
                    label='Send to Address'
                    placeholder='Address'
                    {...form.getInputProps('sendTo')}
                    disabled={form.getInputProps('sendTo').disabled || confirming}
                    required
                />

                <NumberInput
                    label='Amount in KAS'
                    placeholder='0'
                    min={0}
                    decimalScale={8}
                    disabled={confirming}
                    required
                    {...form.getInputProps('amount')}
                />

                <Checkbox
                    {...form.getInputProps('includeFeeInAmount')}
                    label='Include fee in amount'
                    disabled={confirming || form.getInputProps('includeFeeInAmount').disabled}
                />

                <Group justify='space-between'>
                    <Text fw={700}>Fee:</Text>
                    <Text>{fee}</Text>
                </Group>

                <Button
                    fullWidth
                    onClick={signAndSend}
                    disabled={confirming || !canSendAmount || !form.isValid()}
                >
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
                        href={`https://explorer.kaspa.org/txs/${form.values.sentTxId}`}
                        target='_blank'
                        c='brand'
                        align='center'
                        w={'calc(var(--modal-size) - 6rem)'}
                        style={{ overflowWrap: 'break-word' }}
                    >
                        {form.values.sentTxId}
                    </Anchor>

                    <Text component='h2' align='center' fw={600}>
                        {form.values.sentAmount} KAS
                    </Text>

                    <Text align='center'>sent to</Text>

                    <Text
                        w={'calc(var(--modal-size) - 6rem)'}
                        style={{ overflowWrap: 'break-word' }}
                        align='center'
                    >
                        <AddressText address={form.values.sentTo} />
                    </Text>

                    <Button onClick={closeSuccessModal}>Close</Button>
                </Stack>
            </Modal>
        </>
    );
}
