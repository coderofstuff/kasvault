'use client';

import styles from './page.module.css';
import {
    getAddress,
    fetchAddressDetails,
    fetchTransactions,
    initTransport,
} from '../../lib/ledger.js';
import { useState, useEffect } from 'react';
import { Box, Stack, Tabs, Breadcrumbs, Anchor, Button, Center } from '@mantine/core';
import Header from '../../components/header';
import AddressesTab from './addresses-tab';
import OverviewTab from './overview-tab';
import TransactionsTab from './transactions-tab';
import { useSearchParams } from 'next/navigation';
import { IconCircleX } from '@tabler/icons-react';
import { format } from 'date-fns';
import sha256 from 'crypto-js/sha256';

import KaspaBIP32 from '../../lib/bip32';
import { delay } from '@/lib/util';

import { useElementSize } from '@mantine/hooks';

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

async function loadAddressBatch(bip32, callback, callbackSetRawAddresses, lastReceiveIndex) {
    if (loadingAddressBatch || addressInitialized) {
        return;
    }

    loadingAddressBatch = true;

    try {
        let rawAddresses = [];

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

async function demoLoadAddress(bip32, setAddresses, setRawAddresses, lastReceiveIndex) {
    const demoAddresses = [];

    for (let i = 0; i <= lastReceiveIndex; i++) {
        const currAddress = {
            key: i,
            address: bip32.getAddress(0, i),
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

async function getXPubFromLedger() {
    const { chainCode, compressedPublicKey } = await getAddress("44'/111111'/0'");
    return { chainCode, compressedPublicKey };
}

function getDemoXPub() {
    const chainCode = Buffer.from([
        11, 165, 153, 169, 197, 186, 209, 16, 96, 101, 234, 180, 123, 72, 239, 160, 112, 244, 179,
        30, 150, 57, 201, 208, 150, 247, 117, 107, 36, 138, 111, 244,
    ]);
    const compressedPublicKey = Buffer.from([
        3, 90, 25, 171, 24, 66, 175, 67, 29, 59, 79, 168, 138, 21, 177, 254, 125, 124, 63, 110, 38,
        232, 8, 18, 74, 16, 220, 5, 35, 53, 45, 70, 45,
    ]);

    return {
        compressedPublicKey,
        chainCode,
    };
}

class SettingsStore {
    constructor(storageKey) {
        this.storageKey = `kasvault:${storageKey}`;
        this.settings = localStorage.getItem(this.storageKey);

        if (this.settings) {
            this.settings = JSON.parse(this.settings);
        } else {
            this.settings = {
                receiveAddresses: {},
                lastReceiveIndex: 0,
                changeAddresses: {},
                lastChangeIndex: -1,
                version: 0,
            };
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        }
    }

    setSetting(property, value) {
        this.settings[property] = value;
        localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    }

    getSetting(property) {
        return this.settings[property];
    }
}

export default function Dashboard(props) {
    const [addresses, setAddresses] = useState([]);
    const [rawAddresses, setRawAddresses] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [activeTab, setActiveTab] = useState('addresses');
    const [isTransportInitialized, setTransportInitialized] = useState(false);
    const [bip32base, setBIP32Base] = useState();
    const [userSettings, setUserSettings] = useState();

    const { ref: containerRef, width: containerWidth, height: containerHeight } = useElementSize();

    async function generateNewAddress() {
        const newReceiveAddressIndex = userSettings.getSetting('lastReceiveIndex') + 1;

        const derivationPath = `44'/111111'/0'/0/${newReceiveAddressIndex}`;
        const { address } =
            deviceType === 'demo'
                ? { address: bip32base.getAddress(0, newReceiveAddressIndex) }
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
        userSettings.setSetting('lastReceiveIndex', newReceiveAddressIndex);

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
            const xpub = getDemoXPub();
            setBIP32Base(new KaspaBIP32(xpub.compressedPublicKey, xpub.chainCode));
            return;
        }

        initTransport(deviceType)
            .then(() => {
                setTransportInitialized(true);

                return getXPubFromLedger().then((xpub) =>
                    setBIP32Base(new KaspaBIP32(xpub.compressedPublicKey, xpub.chainCode)),
                );
            })
            .catch((e) => {
                setTransportInitialized(false);
                console.error(e);
            });
    }, [isTransportInitialized, deviceType, bip32base]);

    useEffect(() => {
        if (!bip32base) {
            return;
        }

        // We need to somehow differentiate between different devices
        // This gives us a unique key we can use
        const storageKey = sha256(bip32base.rootNode.publicKey.toString('hex')).toString();

        setUserSettings(new SettingsStore(storageKey));
    }, [bip32base, deviceType]);

    useEffect(() => {
        if (!userSettings) {
            return;
        }
        // If not yet initialized, don't do anything yet
        if (!bip32base) {
            setAddresses([]);
            setRawAddresses([]);
            return;
        }

        if (deviceType === 'usb') {
            loadAddressBatch(
                bip32base,
                setAddresses,
                setRawAddresses,
                userSettings.getSetting('lastReceiveIndex'),
            );
        } else if (deviceType === 'demo') {
            demoLoadAddress(
                bip32base,
                setAddresses,
                setRawAddresses,
                userSettings.getSetting('lastReceiveIndex'),
            );
        }
    }, [bip32base, userSettings, deviceType]);

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

    return (
        <Stack className={styles.main}>
            <Header>
                <Breadcrumbs>{breadcrumbs}</Breadcrumbs>
            </Header>

            <Center>
                <Tabs
                    value={activeTab}
                    onChange={setActiveTab}
                    className={styles.tabs}
                    maw={1080}
                    ref={containerRef}
                >
                    <Tabs.List>
                        <Tabs.Tab value='addresses'>Addresses</Tabs.Tab>
                        <Tabs.Tab value='overview' disabled={!selectedAddress}>
                            Overview
                        </Tabs.Tab>
                        <Tabs.Tab value='transactions' disabled={!selectedAddress}>
                            Transactions
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
                            containerWidth={containerWidth}
                            containerHeight={containerHeight}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value='transactions'>
                        <TransactionsTab
                            transactions={transactions}
                            selectedAddress={selectedAddress}
                            setSelectedAddress={setSelectedAddress}
                            containerWidth={containerWidth}
                            containerHeight={containerHeight}
                        />
                    </Tabs.Panel>
                </Tabs>
            </Center>
        </Stack>
    );
}
