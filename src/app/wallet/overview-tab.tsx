import {
    Divider,
    Group,
    Stack,
    ScrollArea,
    Text,
    Loader,
    CopyButton,
    UnstyledButton,
    SegmentedControl,
    Tooltip,
} from '@mantine/core';
import { useViewportSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useRef, useState, useEffect } from 'react';
import KaspaQrCode from '../../components/kaspa-qrcode';
import SendForm from '../../components/send-form';
import MessageForm from '../../components/message-form';
import { IconCopy, IconCheck, IconShieldCheckFilled, IconShield } from '@tabler/icons-react';
import AddressText from '../../components/address-text';
import { fetchAddressDetails, fetchTransaction, getAddress } from '../../lib/ledger';
import { delay } from '../../lib/util';

import styles from './overview-tab.module.css';
import { sompiToKas } from '../../lib/kaspa-util';

export default function OverviewTab(props) {
    const groupRef = useRef(null);
    const [updatingDetails, setUpdatingDetails] = useState(false);
    const [isAddressVerified, setIsAddressVerified] = useState(false);
    const [signView, setSignView] = useState('Transaction');
    const { width, height } = useViewportSize();

    const selectedAddress = props.selectedAddress || {};

    const partitionWidth =
        props.containerWidth >= 700 ? props.containerWidth / 2 - 32.5 : props.containerWidth - 32;
    const divider = props.containerWidth >= 700 ? <Divider orientation='vertical' /> : null;

    useEffect(() => {
        setIsAddressVerified(false);
    }, [props.selectedAddress]);

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

    const updateAddressDetails = async (transactionId) => {
        if (!props.setAddresses && !props.setSelectedAddress) {
            return;
        }

        setUpdatingDetails(true);

        try {
            // Data needs some time to propagrate. Before we load new info, let's wait
            await delay(1500);

            for (let tries = 0; tries < 10; tries++) {
                try {
                    const txData = await fetchTransaction(transactionId);

                    if (txData.is_accepted) {
                        break;
                    }

                    await delay(1000);
                } catch (e) {
                    if (e.response && e.response.status === 404) {
                        await delay(1000);
                        continue;
                    } else {
                        // No errors expected here. Only log it if there's any:
                        console.error(e);
                        break;
                    }
                }
            }

            // After waiting for a bit, now we update the address details
            const addressDetails = await fetchAddressDetails(
                selectedAddress.address,
                selectedAddress.derivationPath,
            );

            selectedAddress.balance = sompiToKas(addressDetails.balance);
            selectedAddress.utxos = addressDetails.utxos;
            selectedAddress.newTransactions++;
            // selectedAddress.txCount = addressDetails.txCount;

            if (props.setAddresses) {
                props.addresses.forEach((address) => {
                    if (address.key === selectedAddress.key) {
                        address.balance = selectedAddress.balance;
                        address.utxos = selectedAddress.utxos;
                        address.newTransactions = selectedAddress.newTransactions;
                        // address.txCount = selectedAddress.txCount;
                    }
                });
                props.setAddresses(props.addresses);
            }

            if (props.setSelectedAddress) {
                props.setSelectedAddress(selectedAddress);
            }
        } finally {
            setUpdatingDetails(false);
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
                    hideHeader={true}
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

                        <Group gap={'xs'}>
                            {updatingDetails ? (
                                <Loader size={20} />
                            ) : (
                                <Text fz='lg'>{selectedAddress.balance} KAS</Text>
                            )}
                        </Group>
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
                    </Stack>
                </Group>
            </ScrollArea.Autosize>
        </>
    );
}
