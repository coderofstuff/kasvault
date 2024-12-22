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
    // Tooltip,
} from '@mantine/core';
import { useTimeout, useDisclosure, useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

import { useState, useEffect } from 'react';
import {
    createTransaction,
    sendAmount,
    selectUtxos,
    // fetchFeeRate,
    SendAmountResult,
} from '../lib/ledger';
import AddressText from '../components/address-text';
import { useForm } from '@mantine/form';
import { kasToSompi, sompiToKas, NETWORK_UTXO_LIMIT } from '../lib/kaspa-util';
import { IMempoolEntry } from '../lib/kaspa-rpc';
// import { IconAlertCircle } from '@tabler/icons-react';

interface SendFormProps {
    // TODO: set correct typing
    addressContext?: any;
    mempoolEntryToReplace?: IMempoolEntry;
    onSuccess?: (result: SendAmountResult) => void;
}

export default function SendForm(props: SendFormProps) {
    const [confirming, setConfirming] = useState(false);
    const [minimumFee, setMinimumFee] = useState<number>(0);
    const [amountDescription, setAmountDescription] = useState<string>();
    const [selectedUtxos, setSelectedUtxos] = useState([]);

    const [canSendAmount, setCanSendAmount] = useState(false);
    // const [currFeeRate, setCurrFeeRate] = useState<IFeeEstimate | null>(null);

    const [isSuccessModalOpen, { open: openSuccessModal, close: closeSuccessModal }] =
        useDisclosure();

    const deviceType = new URLSearchParams(window.location.search).get('deviceType');
    const { width: viewportWidth } = useViewportSize();

    const form = useForm({
        initialValues: {
            amount: undefined,
            sendTo: '',
            includeFeeInAmount: false,
            manualFee: false,
            fee: 0,
            sentAmount: '',
            sentTo: '',
            sentTxId: '',
            replacedTxId: '',
        },
        validate: {
            amount: (value) => (!(Number(value) > 0) ? 'Amount must be greater than 0' : null),
            fee: (value) =>
                form.values.manualFee && value < minimumFee
                    ? 'Fee must be at least ' + minimumFee
                    : null,
            sendTo: (value) => (!/^kaspa\:[a-z0-9]{61,63}$/.test(value) ? 'Invalid address' : null),
        },
        validateInputOnBlur: true,
    });

    const resetState = (resetAllValues = false) => {
        // Reset setup
        setConfirming(false);
        setMinimumFee(0);
        let baseValues = { amount: '', sendTo: '', includeFeeInAmount: false };

        if (resetAllValues) {
            form.setValues({ sentTo: '', sentTxId: '', sentAmount: '', ...baseValues });
        } else {
            form.setValues(baseValues);
        }
    };

    const cleanupOnSuccess = (result: SendAmountResult) => {
        const targetAmount = form.values.includeFeeInAmount
            ? (Number(form.values.amount) - Number(form.values.fee)).toFixed(8)
            : form.values.amount;

        form.setValues({
            sentTo: form.values.sendTo,
            sentTxId: result.transactionId,
            replacedTxId: result.replacedTransactionId || '',
            sentAmount: targetAmount,
            fee: 0,
            manualFee: false,
        });

        openSuccessModal();

        resetState();

        props.onSuccess?.(result);
    };

    useEffect(() => {
        resetState();
    }, [props.addressContext]);

    useEffect(() => {
        if (props.mempoolEntryToReplace) {
            // Prefill the transactions when the mempool entry changes
            form.setValues({
                sendTo: props.mempoolEntryToReplace.transaction.outputs[0].verboseData
                    .scriptPublicKeyAddress,
                amount: sompiToKas(
                    Number(props.mempoolEntryToReplace.transaction.outputs[0].value),
                ),
                manualFee: true,
                fee: sompiToKas(Number(props.mempoolEntryToReplace.fee)),
            });
        }
    }, [props.mempoolEntryToReplace]);

    useEffect(() => {
        // Whenever any of fields change, we calculate the fees
        calcFee(
            form.values.sendTo,
            form.values.amount,
            form.values.includeFeeInAmount,
            form.values.manualFee,
        );
    }, [
        form.values.sendTo,
        form.values.amount,
        form.values.includeFeeInAmount,
        form.values.manualFee,
        form.values.fee,
    ]);

    // TODO: handle fee rate estimation
    // useEffect(() => {
    //     // Fee Rate interval
    //     fetchFeeRate().then((rate) => setCurrFeeRate(rate.estimate));
    //     const feeRateInterval = setInterval(async () => {
    //         const rate = await fetchFeeRate();
    //         console.info('rate', rate);
    //         setCurrFeeRate(rate.estimate);
    //     }, 5000);

    //     return () => {
    //         clearInterval(feeRateInterval);
    //     };
    // }, []);

    const { start: simulateConfirmation } = useTimeout((args) => {
        // Hide when ledger confirms
        const notifId = args[0];

        notifications.hide(notifId);

        cleanupOnSuccess({
            transactionId: 'c130ca7a3edeeeb2dc0130a8bac188c040415dc3ef2265d541336334c3c75f00',
        });
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
        } else if (deviceType == 'usb' || deviceType == 'bluetooth') {
            try {
                const { tx } = createTransaction(
                    kasToSompi(Number(form.values.amount)),
                    form.values.sendTo,
                    selectedUtxos,
                    props.addressContext.derivationPath,
                    props.addressContext.address,
                    form.values.includeFeeInAmount,
                    kasToSompi(form.values.fee),
                );

                const result: SendAmountResult = await sendAmount(
                    tx,
                    deviceType,
                    props.mempoolEntryToReplace?.transaction.verboseData?.transactionId,
                );

                cleanupOnSuccess(result);
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

    const calcFee = (sendTo, amount, includeFeeInAmount, manualFee) => {
        setAmountDescription('');

        if (amount && sendTo) {
            let calculatedFee = 0;
            const requiredFee = manualFee ? form.values.fee : 0;

            const {
                hasEnough,
                utxos,
                fee: feeCalcResult,
                total: utxoTotalAmount,
            } = selectUtxos(
                kasToSompi(amount),
                props.addressContext.utxos,
                includeFeeInAmount,
                kasToSompi(requiredFee),
            );

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
                setSelectedUtxos(utxos);
                if (includeFeeInAmount) {
                    setAmountDescription(`Amount after fee: ${afterFeeDisplay}`);
                }
            } else {
                setCanSendAmount(false);
                setSelectedUtxos([]);
            }

            if (minimumFee !== calculatedFee) {
                setMinimumFee(calculatedFee);
            }

            if (!form.values.manualFee) {
                form.setValues({ fee: calculatedFee });
            }
        } else {
            setMinimumFee(0);
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
                    step={0.00000001}
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

                <Group justify='space-between'>
                    <Checkbox
                        {...form.getInputProps('includeFeeInAmount', { type: 'checkbox' })}
                        label='Include fee in amount'
                        disabled={confirming}
                    />

                    <Group>
                        {/* {canSendAmount && currFeeRate?.normalBucket?.[0]?.feerate > 1 ? (
                            <Tooltip label='Higher network fee rate detected. Consider raising transaction fee.'>
                                <IconAlertCircle color='red' />
                            </Tooltip>
                        ) : null} */}

                        <Checkbox
                            {...form.getInputProps('manualFee', { type: 'checkbox' })}
                            label='Set fee manually'
                            disabled={confirming}
                        />
                    </Group>
                </Group>

                <Group justify='space-between'>
                    <Text fw={700}>Fee:</Text>
                    {form.values.manualFee ? (
                        <NumberInput
                            placeholder='0'
                            min={0}
                            decimalScale={8}
                            disabled={confirming}
                            required
                            {...form.getInputProps('fee')}
                            inputWrapperOrder={['label', 'input', 'description', 'error']}
                        />
                    ) : (
                        <Text>{minimumFee > 0 ? minimumFee : '-'}</Text>
                    )}
                </Group>

                <Button
                    fullWidth
                    onClick={signAndSend}
                    disabled={confirming || !canSendAmount || !form.isValid()}
                >
                    Sign with Ledger and Send {form.isValid()}
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
