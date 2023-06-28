import { Divider, Group, Stack, ScrollArea, Text, Loader, CopyButton } from '@mantine/core';
import AddressModal from './address-modal';
import { useDisclosure, useViewportSize } from '@mantine/hooks';
import { useRef, useState } from 'react';
import KaspaQrCode from '@/components/kaspa-qrcode';
import SendForm from '@/components/send-form';
import { IconCopy, IconCheck } from '@tabler/icons-react';
import AddressText from '@/components/address-text';
import { fetchAddressDetails } from '@/lib/ledger';

import styles from './overview-tab.module.css';
import axios from 'axios';

function delay(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default function OverviewTab(props) {
    const groupRef = useRef(null);
    const [updatingDetails, setUpdatingDetails] = useState(false);
    const [isSendModalOpen, { open: openSendModal, close: closeSendModal }] = useDisclosure(false);
    const { width, height } = useViewportSize();

    const selectedAddress = props.selectedAddress || {};

    const partitionWidth = width >= 700 ? width / 2 - 32.5 : width - 32;
    const divider = width >= 700 ? <Divider orientation='vertical' /> : null;

    const updateAddressDetails = async (transactionId) => {
        if (!props.setAddresses && !props.setSelectedAddress) {
            return;
        }

        setUpdatingDetails(true);

        try {
            // Data needs some time to propagrate. Before we load new info, let's wait
            await delay(1500);

            for (let tries = 0; tries < 3; tries++) {
                try {
                    const { data: txData } = await axios.get(
                        `https://api.kaspa.org/transactions/${transactionId}`,
                    );

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

            selectedAddress.balance = addressDetails.balance / 100000000;
            selectedAddress.utxos = addressDetails.utxos;
            selectedAddress.txCount = addressDetails.txCount;

            if (props.setAddresses) {
                props.addresses.forEach((address) => {
                    if (address.key === selectedAddress.key) {
                        address.balance = selectedAddress.balance;
                        address.utxos = selectedAddress.utxos;
                        address.txCount = selectedAddress.txCount;
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

    return (
        <>
            <ScrollArea.Autosize ref={groupRef} mah={scrollHeight}>
                <Group pt={width >= 700 ? '2rem' : '1rem'} pb={width >= 700 ? '0rem' : '1rem'}>
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
                                            <IconCopy
                                                color='white'
                                                size='18.5px'
                                                className={styles['copy-icon']}
                                                onClick={copy}
                                            />
                                        )}
                                    </>
                                )}
                            </CopyButton>
                        </Text>

                        <KaspaQrCode value={selectedAddress.address} />

                        <Group gap={'xs'}>
                            {updatingDetails ? (
                                <Loader size={20} />
                            ) : (
                                <Text fz='lg'>{selectedAddress.balance} KAS</Text>
                            )}
                        </Group>

                        {/* <Button
                        onClick={openSendModal}
                        color='#DC143C'
                        rightSection={<IconArrowRight size={14} />}
                    >Send</Button> */}
                    </Stack>

                    {divider}

                    <SendForm
                        onSuccess={updateAddressDetails}
                        addressContext={selectedAddress}
                        hideHeader={true}
                        w={partitionWidth}
                    />
                </Group>
            </ScrollArea.Autosize>
            <AddressModal
                opened={isSendModalOpen}
                onClose={closeSendModal}
                addressContext={selectedAddress}
            />
        </>
    );
}
