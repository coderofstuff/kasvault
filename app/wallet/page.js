'use client';

import styles from './page.module.css';
import {
    getAddress,
    fetchAddressDetails,
    fetchTransactions,
    initTransport,
} from '../../lib/ledger.js';
import { useState, useEffect } from 'react';
import { Stack, Tabs, Breadcrumbs, Anchor, Button, Center } from '@mantine/core';
import Header from '../../components/header';
import AddressesTab from './addresses-tab';
import OverviewTab from './overview-tab';
import TransactionsTab from './transactions-tab';
import MessageTab from './message-tab';
import { useSearchParams } from 'next/navigation';
import { IconCircleX } from '@tabler/icons-react';
import { format } from 'date-fns';

import KaspaBIP32 from '../../lib/bip32';

import { useLocalStorage } from '@mantine/hooks';

let loadingAddressBatch = false;
let addressInitialized = false;

function loadAddresses(bip32, addressType = 0, from = 0, to = from + 10) {
    const addresses = [];

    for (let addressIndex = from; addressIndex < to; addressIndex++) {
        const derivationPath = `44'/111111'/0'/${addressType}/${addressIndex}`;
        const address = bip32.getAddress(addressType, addressIndex);

        addresses.push({
            derivationPath,
            address,
            addressIndex,
            addressType,
        });
    }

    return addresses;
}

const addressFilter = (lastReceiveIndex) => {
    return (addressData, index) => {
        return (
            index == 0 || // Always show the first address
            addressData.addressIndex <= lastReceiveIndex || // Always show if we've "generated" this address
            addressData.balance > 0
        ); // Always show if balance is positive
    };
};

function loadAddressDetails(rawAddress) {
    const fetchAddressPromise = fetchAddressDetails(rawAddress.address, rawAddress.derivationPath);

    return fetchAddressPromise.then((addressDetails) => {
        rawAddress.balance = addressDetails.balance / 100000000;
        rawAddress.utxos = addressDetails.utxos;
        // rawAddress.txCount = addressDetails.txCount;
        rawAddress.loading = false;

        return rawAddress;
    });
}

async function loadAddressBatch(callback, callbackSetRawAddresses, lastReceiveIndex) {
    if (loadingAddressBatch || addressInitialized) {
        return;
    }

    loadingAddressBatch = true;

    try {
        let rawAddresses = [];

        const { chainCode, compressedPublicKey } = await getAddress("44'/111111'/0'");

        const bip32 = new KaspaBIP32(compressedPublicKey, chainCode);

        for (let addressIndex = 0; addressIndex <= lastReceiveIndex; addressIndex++) {
            const addressType = 0; // Receive
            const derivationPath = `44'/111111'/0'/${addressType}/${addressIndex}`;
            const address = bip32.getAddress(addressType, addressIndex);
            const receiveAddress = {
                key: address,
                address,
                derivationPath,
                balance: 0,
                loading: true,
                addressIndex,
                addressType,
            };

            rawAddresses.push(receiveAddress);

            callbackSetRawAddresses(rawAddresses);
            callback(rawAddresses.filter(addressFilter(lastReceiveIndex)));
        }

        let promises = [];
        for (const rawAddress of rawAddresses) {
            if (!rawAddress.loading) {
                continue;
            }

            promises.push(
                loadAddressDetails(rawAddress).then((data) => {
                    callback(rawAddresses.filter(addressFilter(lastReceiveIndex)));
                    return data;
                }),
            );

            if (promises.length >= 5) {
                await Promise.all(promises);

                promises = [];
            }
        }

        if (promises.length >= 0) {
            await Promise.all(promises);

            promises = [];
        }
    } finally {
        addressInitialized = true;
        loadingAddressBatch = false;
    }
}

async function loadAddressTransactions(selectedAddress, setTransactions) {
    if (!selectedAddress) {
        setTransactions([]);
        return;
    }

    const txsData = await fetchTransactions(selectedAddress.address, 0, 10);

    const processedTxData = txsData.map((tx) => {
        const myInputSum = tx.inputs.reduce((prev, curr) => {
            if (curr.previous_outpoint_address === selectedAddress.address) {
                return prev + curr.previous_outpoint_amount;
            }

            return prev;
        }, 0);
        const myOutputSum = tx.outputs.reduce((prev, curr) => {
            if (curr.script_public_key_address === selectedAddress.address) {
                return prev + curr.amount;
            }

            return prev;
        }, 0);

        return {
            key: tx.transaction_id,
            timestamp: format(new Date(tx.block_time), 'yyyy-MM-dd HH:mm:ss'),
            transactionId: tx.transaction_id,
            amount: (myOutputSum - myInputSum) / 100000000,
        };
    });

    setTransactions(processedTxData);
}

async function demoLoadAddress(setAddresses, setRawAddresses, lastReceiveIndex) {
    const demoAddresses = [];

    for (let i = 0; i <= lastReceiveIndex; i++) {
        const currAddress = {
            key: i,
            address: demoGetAddress(0, i),
            balance: Math.round(Math.random() * 10000),
            derivationPath: `44'/111111'/0'/0/${i}`,
            utxos: [],
            loading: true,
        };

        demoAddresses.push(currAddress);

        setRawAddresses([...demoAddresses]);
        setAddresses([...demoAddresses]);

        delay(Math.round(Math.random() * 3000)).then(() => {
            currAddress.loading = false;

            delay(Math.round(Math.random() * 2000)).then(() => {
                setAddresses([...demoAddresses]);
            });
        });
    }
}

function demoGetAddress(addressType, addressIndex) {
    const chainCode = Buffer.from([
        11, 165, 153, 169, 197, 186, 209, 16, 96, 101, 234, 180, 123, 72, 239, 160, 112, 244, 179,
        30, 150, 57, 201, 208, 150, 247, 117, 107, 36, 138, 111, 244,
    ]);
    const compressedPublicKey = Buffer.from([
        3, 90, 25, 171, 24, 66, 175, 67, 29, 59, 79, 168, 138, 21, 177, 254, 125, 124, 63, 110, 38,
        232, 8, 18, 74, 16, 220, 5, 35, 53, 45, 70, 45,
    ]);

    const bip32 = new KaspaBIP32(compressedPublicKey, chainCode);

    return bip32.getAddress(addressType, addressIndex);
}

function delay(ms = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default function Dashboard(props) {
    const [addresses, setAddresses] = useState([]);
    const [rawAddresses, setRawAddresses] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [activeTab, setActiveTab] = useState('addresses');
    const [isTransportInitialized, setTransportInitialized] = useState(false);

    const [lastReceiveIndex, setLastReceiveIndex] = useLocalStorage({
        // TODO: Make keynames distinct
        key: 'kasvault:last-receive-index',
        defaultValue: 0,
    });

    async function generateNewAddress() {
        const newReceiveAddressIndex = lastReceiveIndex + 1;

        const derivationPath = `44'/111111'/0'/0/${newReceiveAddressIndex}`;
        const { address } =
            deviceType === 'demo'
                ? { address: demoGetAddress(0, newReceiveAddressIndex) }
                : await getAddress(derivationPath);
        const rawAddress = {
            key: address,
            derivationPath,
            address,
            addressType: 0,
            addressIndex: newReceiveAddressIndex,
            balance: 0,
            loading: true,
        };

        setRawAddresses([...rawAddresses, rawAddress]);
        setAddresses([...rawAddresses, rawAddress]);
        setLastReceiveIndex(newReceiveAddressIndex);

        if (deviceType === 'demo') {
            rawAddress.balance = Math.round(Math.random() * 10000);
            await delay(Math.round(Math.random() * 3000)).then(() => {
                rawAddress.loading = false;
            });
        } else {
            await loadAddressDetails(rawAddress);
        }

        setRawAddresses([...rawAddresses, rawAddress]);
        setAddresses([...rawAddresses, rawAddress]);
    }

    const searchParams = useSearchParams();

    const deviceType = searchParams.get('deviceType');

    useEffect(() => {
        if (isTransportInitialized) {
            return;
        }

        if (deviceType === 'demo') {
            setTransportInitialized(true);
            return;
        }

        initTransport(deviceType)
            .then(() => {
                setTransportInitialized(true);
            })
            .catch((e) => {
                console.error(e);
            });
    }, [isTransportInitialized, deviceType]);

    useEffect(() => {
        // If not yet initialized, don't do anything yet
        if (!isTransportInitialized) {
            return;
        }

        if (deviceType === 'usb') {
            loadAddressBatch(setAddresses, setRawAddresses, lastReceiveIndex);
        } else if (deviceType === 'demo') {
            demoLoadAddress(setAddresses, setRawAddresses, lastReceiveIndex);
        }
    }, [isTransportInitialized, deviceType]);

    useEffect(() => {
        // Blank it out first, then load the info for the address
        setTransactions([]);
        loadAddressTransactions(selectedAddress, setTransactions);
    }, [selectedAddress]);

    const breadcrumbs = [
        <Anchor key='home' href={'/'}>
            Home
        </Anchor>,
    ];

    if (selectedAddress) {
        breadcrumbs.push(
            <Anchor
                key='selectedAddress'
                href={'#'}
                onClick={() => {
                    setSelectedAddress(null);
                    setActiveTab('addresses');
                }}
            >
                <IconCircleX />
            </Anchor>,
        );
    }

    return (
        <Stack className={styles.main}>
            <Header>
                <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
            </Header>

            <Tabs value={activeTab} onChange={setActiveTab} className={styles.tabs}>
                <Tabs.List>
                    <Tabs.Tab value='addresses'>Addresses</Tabs.Tab>
                    <Tabs.Tab value='overview' disabled={!selectedAddress}>
                        Overview
                    </Tabs.Tab>
                    <Tabs.Tab value='transactions' disabled={!selectedAddress}>
                        Transactions
                    </Tabs.Tab>
                    <Tabs.Tab value='message' disabled={!selectedAddress}>
                        Message
                    </Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value='addresses'>
                    <AddressesTab
                        addresses={addresses}
                        selectedAddress={selectedAddress}
                        setAddresses={setAddresses}
                        setSelectedAddress={setSelectedAddress}
                        setActiveTab={setActiveTab}
                    />

                    <Center>
                        <Button onClick={generateNewAddress}>Generate New Address</Button>
                    </Center>
                </Tabs.Panel>

                <Tabs.Panel value='overview'>
                    <OverviewTab
                        addresses={addresses}
                        selectedAddress={selectedAddress}
                        setSelectedAddress={setSelectedAddress}
                        setAddresses={setAddresses}
                    />
                </Tabs.Panel>

                <Tabs.Panel value='transactions'>
                    <TransactionsTab
                        transactions={transactions}
                        selectedAddress={selectedAddress}
                        setSelectedAddress={setSelectedAddress}
                    />
                </Tabs.Panel>

                <Tabs.Panel value='message'>
                    <MessageTab selectedAddress={selectedAddress} />
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
}
