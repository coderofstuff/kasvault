'use client';

import styles from './page.module.css';
import {
    getAddress,
    fetchAddressDetails,
    fetchTransactions,
    initTransport,
} from '../../lib/ledger.js';
import { useState, useEffect } from 'react';
import { Stack, Tabs, Breadcrumbs, Anchor } from '@mantine/core';
import Header from '../../components/header';
import AddressesTab from './addresses-tab';
import OverviewTab from './overview-tab';
import TransactionsTab from './transactions-tab';
import MessageTab from './message-tab';
import { useSearchParams } from 'next/navigation';
import { IconCircleX } from '@tabler/icons-react';
import { format } from 'date-fns';

import KaspaBIP32 from '../../lib/bip32';

let loadingAddressBatch = false;
let addressInitialized = false;

function loadAddresses(
    bip32,
    addressType = 0,
    from = 0,
    to = from + 10
) {
    const addresses = [];

    for (let addressIndex = from; addressIndex < to; addressIndex++) {
        const derivationPath = `44'/111111'/0'/${addressType}/${addressIndex}`;
        const address = bip32.getAddress(addressType, addressIndex);

        addresses.push({
            derivationPath,
            address,
        });
    }

    return addresses;
}

const addressFilter = (addressData, index) => {
    return index == 0               // Always show the first address
        || isDisplayedPath(addressData.derivationPath) // Always show if we've "generated" this address
        || addressData.balance > 0  // Always show if balance is positive
        || addressData.txCount > 0; // Always show if address has any transactions (it has been used)
};

async function loadAddressBatch(callback, callbackSetRawAddresses) {
    if (loadingAddressBatch || addressInitialized) {
        return;
    }

    loadingAddressBatch = true;

    try {
        let rawAddresses = [];
        const loadAddressDetails = (rawAddress) => {
            const fetchAddressPromise = fetchAddressDetails(rawAddress.address, rawAddress.derivationPath);

            return fetchAddressPromise.then((addressDetails) => {
                rawAddress.balance = addressDetails.balance / 100000000;
                rawAddress.utxos = addressDetails.utxos;
                rawAddress.txCount = addressDetails.txCount;
                rawAddress.loading = false;

                return rawAddress;
            });
        };

        const PAGE_SIZE = 5;

        const { chainCode, compressedPublicKey } = await getAddress("44'/111111'/0'");

        const bip32 = new KaspaBIP32(compressedPublicKey, chainCode);

        for (let page = 0, foundWithBalance = true; foundWithBalance; page++) {
            foundWithBalance = false;

            const receiveAddresses = loadAddresses(bip32, 0, page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
            const changeAddresses = loadAddresses(bip32, 1, page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
            const allAddresses = [...receiveAddresses, ...changeAddresses];

            rawAddresses = [...rawAddresses, ...allAddresses.map(({ derivationPath, address }) => {
                return {
                    key: address,
                    address,
                    derivationPath,
                    balance: 0,
                    loading: true,
                };
            })];

            callbackSetRawAddresses(rawAddresses);
            callback(rawAddresses.filter(addressFilter));

            let promises = [];
            for (const rawAddress of rawAddresses) {
                promises.push(loadAddressDetails(rawAddress));

                if (promises.length >= 5) {
                    const allAddressData = await Promise.all(promises);
                    
                    for (const addressData of allAddressData) {
                        foundWithBalance = foundWithBalance || addressData.balance > 0 || addressData.txCount > 0;
                    }

                    callback(rawAddresses.filter(addressFilter));
                    promises = [];
                }
            }

            if (promises.length) {
                const allAddressData = await Promise.all(promises);
                
                for (const addressData of allAddressData) {
                    foundWithBalance = foundWithBalance || addressData.balance > 0 || addressData.txCount > 0;
                }

                callback(rawAddresses.filter(addressFilter));
                promises = [];
            }
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

// let demoAddressLoading = false;

async function demoLoadAddress(setAddresses, setRawAddresses) {
    const demoAddresses = [];

    for (let i = 0; i < 20; i++) {
        const currAddress = {
            key: i,
            address: 'kaspa:qzese5lc37m2a9np8k5gect4l2jj8svyqq392p7aa7mxsqarjg9sjgxr4wvru',
            balance: Math.round(Math.random() * 10000),
            derivationPath: "44'/111111'/0'/0/0",
            utxos: [],
            txCount: Math.round(Math.random() * 30),
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

function isDisplayedPath(derivationPath) {
    // TODO: Switch with actual paths stored in local storage
    return derivationPath === "44'/111111'/0'/0/0" ||
           derivationPath === "44'/111111'/0'/0/1" ||
           derivationPath === "44'/111111'/0'/1/0" ||
           derivationPath === "44'/111111'/0'/1/1";
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
            loadAddressBatch(setAddresses, setRawAddresses);
        } else if (deviceType === 'demo') {
            demoLoadAddress(setAddresses, setRawAddresses);
        }
    }, [isTransportInitialized, deviceType]);

    useEffect(() => {
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
