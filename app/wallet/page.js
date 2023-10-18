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

async function loadAddresses(
    addressType = 0,
    from = 0,
    to = from + 10,
    onPartialSuccess = () => {},
) {
    const addresses = [];

    const { chainCode, compressedPublicKey } = await getAddress("44'/111111'/0'");

    const bip32 = new KaspaBIP32(compressedPublicKey, chainCode);

    for (let addressIndex = from; addressIndex < to; addressIndex++) {
        const derivationPath = `44'/111111'/0'/${addressType}/${addressIndex}`;
        const address = bip32.getAddress(addressType, addressIndex);

        onPartialSuccess({
            derivationPath,
            address,
        });

        addresses.push({
            derivationPath,
            address,
        });
    }

    console.info(addresses);

    return addresses;
}

const addressFilter = (addressData, index) => {
    return true;
    // return index == 0               // Always show the first address
    //     || addressData.balance > 0  // Always show if balance is positive
    //     || addressData.txCount > 0; // Always show if address has any transactions (it has been used)
};

async function loadAddressBatch(callback) {
    if (loadingAddressBatch || addressInitialized) {
        return;
    }

    loadingAddressBatch = true;

    try {
        const detailPromises = [];
        const rawAddresses = [];
        const receiveAddresses = await loadAddresses(0, 0, 10, ({ derivationPath, address }) => {
            const addressData = {
                key: address,
                address,
                derivationPath,
                balance: 0,
                loading: true,
            };
            rawAddresses.push(addressData);

            callback(rawAddresses.filter(addressFilter));

            const fetchAddressPromise = fetchAddressDetails(address, derivationPath);
            detailPromises.push(fetchAddressPromise);

            fetchAddressPromise.then((addressDetails) => {
                addressData.balance = addressDetails.balance / 100000000;
                addressData.utxos = addressDetails.utxos;
                addressData.txCount = addressDetails.txCount;
                addressData.loading = false;

                callback(rawAddresses.filter(addressFilter));
            });
        });
        // FIXME: Handle rate limiting
        // const changeAddresses = [];

        // const addresses = [...receiveAddresses, ...changeAddresses];

        const processedAddresses = await Promise.all(detailPromises);
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

async function demoLoadAddress(setAddresses) {
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

        setAddresses([...demoAddresses]);

        delay(Math.round(Math.random() * 3000)).then(() => {
            currAddress.loading = false;

            delay(Math.round(Math.random() * 2000)).then(() => {
                setAddresses([...demoAddresses]);
            });
        });
    }
}

function delay(ms = 0) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

export default function Dashboard(props) {
    const [addresses, setAddresses] = useState([]);
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
            loadAddressBatch(setAddresses);
        } else if (deviceType === 'demo') {
            demoLoadAddress(setAddresses);
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
