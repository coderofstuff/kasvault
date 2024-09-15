import {
    Divider,
    Group,
    Stack,
    ScrollArea,
    Text,
    CopyButton,
    UnstyledButton,
    SegmentedControl,
    Tooltip,
    Notification,
} from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRef, useState, useEffect } from 'react';
import KaspaQrCode from '../../components/kaspa-qrcode';
import SendForm from '../../components/send-form';
import MessageForm from '../../components/message-form';
import {
    IconCopy,
    IconCheck,
    IconShieldCheckFilled,
    IconShield,
    IconReplace,
} from '@tabler/icons-react';
import AddressText from '../../components/address-text';
import {
    SendAmountResult,
    confirmationsSinceDaaScore,
    fetchAddressDetails,
    fetchBlock,
    // fetchTransaction,
    getAddress,
    trackUntilConfirmed,
} from '../../lib/ledger';
import { delay } from '../../lib/util';

import styles from './overview-tab.module.css';
import { sompiToKas } from '../../lib/kaspa-util';
import { ISelectedAddress } from './types';
import { IMempoolEntry } from '../../lib/kaspa-rpc/kaspa';

interface OverviewTabProps {
    containerWidth: number;
    containerHeight: number;
    selectedAddress?: ISelectedAddress;
    mempoolEntryToReplace?: IMempoolEntry;
    setSelectedAddress: (selectedAddress: ISelectedAddress) => void;
    setMempoolEntryToReplace: (mempoolEntry: IMempoolEntry | null) => void;
    setPendingTxId: (txId: string | null) => void;
    // FIXME: set correct typing for these two
    setAddresses: (addresses: any[]) => void;
    addresses: any[];
    deviceType: string;
}

export default function OverviewTab(props: OverviewTabProps) {
    const groupRef = useRef(null);
    const [isAddressVerified, setIsAddressVerified] = useState(false);
    const [signView, setSignView] = useState('Transaction');
    const [acceptingTxId, setAcceptingTxId] = useState<string | null>(null);
    const [confirmingTxId, setConfirmingTxId] = useState<string | null>(null);
    const [confirmationCount, setConfirmationCount] = useState<number>(0);
    const { width, height } = useViewportSize();

    useEffect(() => {
        setIsAddressVerified(false);
    }, [props.selectedAddress]);

    const selectedAddress = props.selectedAddress;

    if (!selectedAddress) {
        // Short circuit if there's no address selected yet:
        return null;
    }

    const partitionWidth =
        props.containerWidth >= 700 ? props.containerWidth / 2 - 32.5 : props.containerWidth - 32;
    const divider = props.containerWidth >= 700 ? <Divider orientation='vertical' /> : null;

    const verifyAddress = async () => {
        if (isAddressVerified) {
            return;
        }

        const notifId = notifications.show({
            title: 'Action Required',
            message: 'Please verify the address on your device',
            loading: true,
            autoClose: false,
        });

        try {
            const { address } = await getAddress(props.selectedAddress.derivationPath, true);

            if (address === props.selectedAddress.address) {
                notifications.show({
                    title: 'Success',
                    message: 'Address verified!',
                });
                setIsAddressVerified(true);
            } else {
                notifications.show({
                    title: 'Address not verified',
                    message: 'Address does not match',
                });
                setIsAddressVerified(false);
            }
        } catch (e) {
            if (e.statusText === 'CONDITIONS_OF_USE_NOT_SATISFIED' && e.message) {
                notifications.show({
                    title: 'Address not verified',
                    message: e.message,
                });
            } else {
                console.error(e);
                notifications.show({
                    title: 'Address not verified',
                    message: 'Failed to verify address on the device',
                    color: 'red',
                });
            }

            setIsAddressVerified(false);
        } finally {
            notifications.hide(notifId);
        }
    };

    const updateAddressDetails = async (result: SendAmountResult) => {
        props.setMempoolEntryToReplace(null);
        props.setPendingTxId(result.transactionId);
        setAcceptingTxId(result.transactionId);
        setConfirmingTxId(result.transactionId);

        try {
            // TODO: Fix a possible case where transaction was already added in a block before
            // we started tracking
            const acceptingBlock: any = await trackUntilConfirmed(result.transactionId);

            setAcceptingTxId(null);
            props.setPendingTxId(null);

            const block = await fetchBlock(acceptingBlock.acceptingBlockHash, false);

            for (let i = 0; i < 20; i++) {
                const conf = await confirmationsSinceDaaScore(block.block.header.daaScore);
                setConfirmationCount(conf);

                if (conf >= 10) {
                    break;
                }

                await delay(1000);
            }
            // Track confirmations:
            setConfirmingTxId(null);
            setConfirmationCount(0);

            // After waiting for a bit, now we update the address details
            const addressDetails = await fetchAddressDetails(
                selectedAddress.address,
                selectedAddress.derivationPath,
            );

            selectedAddress.balance = sompiToKas(Number(addressDetails.balance));
            selectedAddress.utxos = addressDetails.utxos;

            if (props.setAddresses) {
                props.addresses.forEach((address) => {
                    if (address.key === selectedAddress.key) {
                        address.balance = selectedAddress.balance;
                        address.utxos = selectedAddress.utxos;
                    }
                });
                props.setAddresses(props.addresses);
            }

            if (props.setSelectedAddress) {
                props.setSelectedAddress(selectedAddress);
            }
        } finally {
            setConfirmingTxId(null);
        }
    };

    const scrollHeight =
        groupRef && groupRef.current ? height - groupRef.current.offsetTop : height;

    let signSection = null;

    switch (signView) {
        case 'Transaction':
            signSection = (
                <SendForm
                    onSuccess={updateAddressDetails}
                    addressContext={selectedAddress}
                    mempoolEntryToReplace={props.mempoolEntryToReplace}
                />
            );
            break;
        case 'Message':
            signSection = (
                <MessageForm selectedAddress={selectedAddress} deviceType={props.deviceType} />
            );
            break;
        default:
            break;
    }

    const replacingTxText = props.mempoolEntryToReplace ? (
        <Group w={partitionWidth - 4} justify='space-between'>
            <Notification
                title='Replacing Transaction'
                icon={<IconReplace size={16} />}
                onClose={() => {
                    props.setMempoolEntryToReplace(null);
                    notifications.show({
                        message: 'RBF cancelled',
                        autoClose: 3000,
                    });
                }}
            >
                <Text style={{ overflowWrap: 'break-word' }} fz={'0.8rem'}>
                    {props.mempoolEntryToReplace.transaction.verboseData.transactionId}
                </Text>
            </Notification>
        </Group>
    ) : null;

    const confirmingOrBalanceSection =
        confirmingTxId && !props.mempoolEntryToReplace ? (
            <Group w={partitionWidth - 4} justify='space-between'>
                <Notification
                    loading
                    title={acceptingTxId ? 'Waiting for Acceptance' : 'Confirming Transaction'}
                    withCloseButton={false}
                >
                    <Text style={{ overflowWrap: 'break-word' }} fz={'0.8rem'}>
                        {confirmingTxId} (Confirmations: {confirmationCount})
                    </Text>
                </Notification>
            </Group>
        ) : (
            <Text fz='lg'>{selectedAddress.balance} KAS</Text>
        );

    return (
        <>
            <ScrollArea.Autosize ref={groupRef} mah={scrollHeight}>
                <Group
                    pt={width >= 700 ? '2rem' : '1rem'}
                    pb={width >= 700 ? '0rem' : '1rem'}
                    align='top'
                >
                    <Stack align='center' w={partitionWidth}>
                        <Text fw={700}>Receive Address:</Text>

                        <Text
                            w={partitionWidth}
                            style={{ overflowWrap: 'break-word' }}
                            ta={'center'}
                        >
                            <AddressText address={selectedAddress.address} />

                            <CopyButton value={selectedAddress.address}>
                                {({ copied, copy }) => (
                                    <>
                                        {copied ? (
                                            <IconCheck
                                                color='green'
                                                size='18.5px'
                                                className={styles['copy-icon']}
                                            />
                                        ) : (
                                            <Tooltip label='Copy Address'>
                                                <IconCopy
                                                    color='white'
                                                    size='18.5px'
                                                    className={styles['copy-icon']}
                                                    onClick={copy}
                                                />
                                            </Tooltip>
                                        )}
                                    </>
                                )}
                            </CopyButton>

                            <Tooltip label='Verify Address on device'>
                                <UnstyledButton onClick={verifyAddress}>
                                    {isAddressVerified ? (
                                        <IconShieldCheckFilled
                                            size='18.5px'
                                            className={styles['verified-icon']}
                                        />
                                    ) : (
                                        <IconShield
                                            color='white'
                                            size='18.5px'
                                            className={styles['verify-icon']}
                                        />
                                    )}
                                </UnstyledButton>
                            </Tooltip>
                        </Text>

                        <KaspaQrCode value={selectedAddress.address} />

                        <Group gap={'xs'}>{confirmingOrBalanceSection}</Group>
                    </Stack>

                    {divider}

                    <Stack w={partitionWidth}>
                        <SegmentedControl
                            data={['Transaction', 'Message']}
                            value={signView}
                            onChange={setSignView}
                            fullWidth
                        />
                        {signSection}

                        {replacingTxText}
                    </Stack>
                </Group>
            </ScrollArea.Autosize>
        </>
    );
}
