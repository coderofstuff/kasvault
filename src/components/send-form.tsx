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
    UnstyledButton,
} from '@mantine/core';
import { useTimeout, useDisclosure, useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { useState, useEffect } from 'react';
import { createTransaction, sendAmount, selectUtxos } from '../lib/ledger';
import AddressText from '../components/address-text';
import { useForm } from '@mantine/form';
import { kasToSompi, sompiToKas, NETWORK_UTXO_LIMIT } from '../lib/kaspa-util';

export default function SendForm(props) {
    const [confirming, setConfirming] = useState(false);
    const [fee, setFee] = useState<string | number>('-');
    const [amountDescription, setAmountDescription] = useState<string>();

    const [canSendAmount, setCanSendAmount] = useState(false);

    const [isSuccessModalOpen, { open: openSuccessModal, close: closeSuccessModal }] =
        useDisclosure();

    const deviceType = new URLSearchParams(window.location.search).get('deviceType');
    const { width: viewportWidth } = useViewportSize();

    const form = useForm({
        initialValues: {
            amount: undefined,
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
        let baseValues = { amount: '', sendTo: '', includeFeeInAmount: false };

        if (resetAllValues) {
            form.setValues({ sentTo: '', sentTxId: '', sentAmount: '', ...baseValues });
        } else {
            form.setValues(baseValues);
        }
    };

    const cleanupOnSuccess = (transactionId) => {
        const targetAmount = form.values.includeFeeInAmount
            ? (Number(form.values.amount) - Number(fee)).toFixed(8)
            : form.values.amount;

        form.setValues({
            sentTo: form.values.sendTo,
            sentTxId: transactionId,
            sentAmount: targetAmount,
        });
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
            autoClose: false,
        });

        if (deviceType == 'demo') {
            simulateConfirmation(notifId);
        } else if (deviceType == 'usb') {
            try {
                const { tx } = createTransaction(
                    kasToSompi(Number(form.values.amount)),
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

                if (e.statusCode == 0xb005 && props.addressContext.utxos.length > 15) {
                    // This is probably a Nano S
                    const maxCompoundableAmount = sompiToKas(
                        props.addressContext.utxos.slice(0, 15).reduce((acc, utxo) => {
                            return acc + utxo.amount;
                        }, 0),
                    );
                    notifications.show({
                        title: 'Error',
                        color: 'red',
                        message: `You have too many UTXOs to send this amount. Please compound first by sending KAS to your address. Maximum sendable without compounding (including fee): ${maxCompoundableAmount}`,
                        autoClose: false,
                        loading: false,
                    });
                } else {
                    notifications.show({
                        title: 'Error',
                        color: 'red',
                        message: e.message,
                        loading: false,
                    });
                }

                setConfirming(false);
            } finally {
                notifications.hide(notifId);
            }
        }
    };

    const calcFee = (sendTo, amount, includeFeeInAmount) => {
        setAmountDescription('');

        if (amount && sendTo) {
            let calculatedFee: string | number = '-';

            const {
                hasEnough,
                utxos,
                fee: feeCalcResult,
                total: utxoTotalAmount,
            } = selectUtxos(kasToSompi(amount), props.addressContext.utxos, includeFeeInAmount);

            if (utxos.length > NETWORK_UTXO_LIMIT) {
                const maxCompoundableAmount = sompiToKas(
                    utxos.slice(0, NETWORK_UTXO_LIMIT).reduce((acc, utxo) => {
                        return acc + utxo.amount;
                    }, 0),
                );
                notifications.show({
                    title: 'Error',
                    color: 'red',
                    message: `You have too many UTXOs to send this amount. Please compound first by sending KAS to your address. Maximum sendable without compounding (including fee): ${maxCompoundableAmount}`,
                    autoClose: false,
                    loading: false,
                });
                setCanSendAmount(false);
            } else if (hasEnough) {
                let changeAmount = utxoTotalAmount - kasToSompi(amount);
                if (!includeFeeInAmount) {
                    changeAmount -= feeCalcResult;
                }

                let expectedFee = feeCalcResult;
                // The change is added to the fee if it's less than 0.0001 KAS
                console.info('changeAmount', changeAmount);
                if (changeAmount < 10000) {
                    console.info(`Adding dust change ${changeAmount} sompi to fee`);
                    expectedFee += changeAmount;
                }

                calculatedFee = sompiToKas(expectedFee);
                const afterFeeDisplay = sompiToKas(kasToSompi(amount) - expectedFee);
                setCanSendAmount(true);
                if (includeFeeInAmount) {
                    setAmountDescription(`Amount after fee: ${afterFeeDisplay}`);
                }
            } else {
                setCanSendAmount(false);
            }

            if (fee === '-' || fee !== calculatedFee) {
                setFee(calculatedFee);
            }
        } else {
            setFee('-');
            setCanSendAmount(false);
            setAmountDescription('');
        }
    };

    const setMaxAmount = () => {
        const total = props.addressContext.utxos.reduce((acc, utxo) => {
            return acc + utxo.amount;
        }, 0);

        form.setValues({
            amount: sompiToKas(total),
            includeFeeInAmount: true,
        });
    };

    return (
        <>
            <Stack {...props}>
                <TextInput
                    label='Send to Address'
                    placeholder='Address'
                    {...form.getInputProps('sendTo')}
                    disabled={confirming}
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
                    rightSectionWidth={'3rem'}
                    rightSection={
                        <UnstyledButton aria-label='Set Max Amount' onClick={setMaxAmount}>
                            <Text size='0.8rem' c={'brand'}>
                                MAX
                            </Text>
                        </UnstyledButton>
                    }
                    inputWrapperOrder={['label', 'input', 'description', 'error']}
                    description={amountDescription}
                />

                <Checkbox
                    {...form.getInputProps('includeFeeInAmount', { type: 'checkbox' })}
                    label='Include fee in amount'
                    disabled={confirming}
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
                    <Text size='lg' c='brand'>
                        Sent!
                    </Text>

                    <Text fw={600}>Transaction ID</Text>

                    <Anchor
                        href={`https://explorer.kaspa.org/txs/${form.values.sentTxId}`}
                        target='_blank'
                        c='brand'
                        w={'calc(var(--modal-size) - 6rem)'}
                        style={{ overflowWrap: 'break-word' }}
                    >
                        {form.values.sentTxId}
                    </Anchor>

                    <Text component='h2' fw={600}>
                        {form.values.sentAmount} KAS
                    </Text>

                    <Text>sent to</Text>

                    <Text
                        w={'calc(var(--modal-size) - 6rem)'}
                        style={{ overflowWrap: 'break-word' }}
                    >
                        <AddressText address={form.values.sentTo} />
                    </Text>

                    <Button onClick={closeSuccessModal}>Close</Button>
                </Stack>
            </Modal>
        </>
    );
}
