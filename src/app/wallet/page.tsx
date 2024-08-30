'use client';

import styles from './page.module.css';
import {
    getAddress,
    fetchAddressDetails,
    initTransport,
    fetchAddressBalance,
} from '../../lib/ledger';
import { useState, useEffect } from 'react';
import { Stack, Tabs, Breadcrumbs, Anchor, Button, Center } from '@mantine/core';
import Header from '../../components/header';
import AddressesTab from './addresses-tab';
import OverviewTab from './overview-tab';
import TransactionsTab from './transactions-tab';
import { LockedDeviceError } from '@ledgerhq/errors';
import sha256 from 'crypto-js/sha256';

import KaspaBIP32 from '../../lib/bip32';
import { delay } from '../../lib/util';

import { useElementSize } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import SettingsStore from '../../lib/settings-store';
import { kasToSompi, sompiToKas, NETWORK_UTXO_LIMIT } from '../../lib/kaspa-util';

let loadingAddressBatch = false;
let addressInitialized = false;

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
        rawAddress.balance = sompiToKas(Number(addressDetails.balance));
        rawAddress.utxos = addressDetails.utxos;
        // rawAddress.txCount = addressDetails.txCount;
        rawAddress.loading = false;

        return rawAddress;
    });
}

async function loadOrScanAddressBatch(bip32, callback, callbackSetRawAddresses, userSettings) {
    if (loadingAddressBatch || addressInitialized) {
        return;
    }

    let lastReceiveIndex = userSettings.getSetting('lastReceiveIndex');

    loadingAddressBatch = true;

    try {
        let rawAddresses = [];

        // If receive address isn't initialized yet, scan for the last address with funds within a batch:
        if (lastReceiveIndex < 0) {
            const notifId = notifications.show({
                title: 'First-time load detected',
                message: 'Scanning for addresses with balance',
                loading: true,
            });
            console.info('Initial load detected. Scanning for addresses');
            let nonEmptyAddressFound = true;
            let scanIndexStart = 0;
            let latestWithFunds = 0;
            let addressesWithBalancesFound = 0;

            while (nonEmptyAddressFound) {
                if (scanIndexStart > 0) {
                    await delay(1000);
                }
                nonEmptyAddressFound = false;

                // scan for the next batch of 5 addresses to see which is the latest one with that had funds
                const batchSize = 5;
                console.info(
                    `Scanning receive address range ${scanIndexStart} - ${
                        scanIndexStart + batchSize - 1
                    }`,
                );

                let promises = [];
                for (
                    let addressIndex = scanIndexStart;
                    addressIndex < scanIndexStart + batchSize;
                    addressIndex++
                ) {
                    const addressType = 0; // Receive
                    const address = bip32.getAddress(addressType, addressIndex);

                    promises.push(
                        new Promise(async (resolve, reject) => {
                            try {
                                const balanceData = await fetchAddressBalance(address);

                                resolve({ balanceData, addressIndex });
                            } catch (e) {
                                reject(e);
                            }
                        }),
                    );
                }

                try {
                    const scanResults = await Promise.all(promises);

                    for (const result of scanResults) {
                        if (result.balanceData.balance > 0) {
                            if (result.addressIndex > latestWithFunds) {
                                latestWithFunds = result.addressIndex;
                            }
                            nonEmptyAddressFound = true;
                            addressesWithBalancesFound++;
                        }
                    }
                } catch (e) {
                    notifications.hide(notifId);
                    notifications.show({
                        title: 'Error',
                        message:
                            'Failed to scan for addresses with balance. Refresh the page to retry.',
                        autoClose: false,
                        color: 'red',
                    });
                    throw e;
                }

                scanIndexStart += 5;
            }

            lastReceiveIndex = latestWithFunds;
            userSettings.setSetting('lastReceiveIndex', lastReceiveIndex);
            console.info('Address scan complete. Last address index with funds', lastReceiveIndex);
            notifications.hide(notifId);
            notifications.show({
                title: 'Initial scan complete',
                message: `${addressesWithBalancesFound} ${
                    addressesWithBalancesFound <= 1 ? 'address' : 'addresses'
                } with balance found`,
            });
        }

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
                newTransactions: 0,
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

async function demoLoadAddress(bip32, setAddresses, setRawAddresses, lastReceiveIndex) {
    const demoAddresses = [];

    for (let i = 0; i <= lastReceiveIndex; i++) {
        const balance = Math.round(Math.random() * 10000);
        const currAddress = {
            key: i,
            address: bip32.getAddress(0, i),
            balance,
            derivationPath: `44'/111111'/0'/0/${i}`,
            utxos: [],
            loading: true,
        };

        currAddress.utxos.push({
            prevTxId: 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
            outpointIndex: 0,
            amount: kasToSompi(balance - (NETWORK_UTXO_LIMIT - 1)),
        });

        for (let j = 0; j < NETWORK_UTXO_LIMIT - 1; j++) {
            currAddress.utxos.push({
                prevTxId: 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF',
                outpointIndex: 0,
                amount: kasToSompi(1),
            });
        }

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

export default function Dashboard() {
    const [addresses, setAddresses] = useState([]);
    const [rawAddresses, setRawAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [activeTab, setActiveTab] = useState('addresses');
    const [isTransportInitialized, setTransportInitialized] = useState(false);
    const [bip32base, setBIP32Base] = useState<KaspaBIP32>();
    const [userSettings, setUserSettings] = useState<SettingsStore>();
    const [enableGenerate, setEnableGenerate] = useState(false);

    const { ref: containerRef, width: containerWidth, height: containerHeight } = useElementSize();

    async function generateNewAddress() {
        setEnableGenerate(false);
        try {
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

            try {
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
            } catch (e) {
                console.error(e);
                notifications.show({
                    title: 'Error',
                    message: 'Unable to load address details. Refresh the page to retry.',
                    autoClose: false,
                    color: 'red',
                });
            }
        } catch (e) {
            console.info(e);
            if (e instanceof LockedDeviceError) {
                notifications.show({
                    title: 'Error',
                    message: e.message,
                    autoClose: false,
                    color: 'red',
                });
            } else if (e.message) {
                notifications.show({
                    title: 'Error',
                    message: `Unable to generate new address: ${e.message}`,
                    autoClose: false,
                    color: 'red',
                });
            } else {
                console.error(e);
                notifications.show({
                    title: 'Error',
                    message: 'Unable to generate new address',
                    autoClose: false,
                    color: 'red',
                });
            }
        } finally {
            setEnableGenerate(true);
        }
    }

    const searchParams = new URLSearchParams(window.location.search);

    const deviceType = searchParams.get('deviceType');

    useEffect(() => {
        if (isTransportInitialized) {
            return () => {};
        }

        if (deviceType === 'demo') {
            setTransportInitialized(true);
            const xpub = getDemoXPub();
            setBIP32Base(new KaspaBIP32(xpub.compressedPublicKey, xpub.chainCode));
            return () => {};
        }

        let unloaded = false;

        initTransport(deviceType)
            .then(() => {
                if (!unloaded) {
                    setTransportInitialized(true);

                    return getXPubFromLedger().then((xpub) =>
                        setBIP32Base(new KaspaBIP32(xpub.compressedPublicKey, xpub.chainCode)),
                    );
                }

                return null;
            })
            .catch((e) => {
                notifications.show({
                    title: 'Error',
                    color: 'red',
                    message: 'Please make sure your device is unlocked and the Kaspa app is open',
                    autoClose: false,
                });
                console.error(e);
            });

        return () => {
            unloaded = true;
        };
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
            loadOrScanAddressBatch(bip32base, setAddresses, setRawAddresses, userSettings).finally(
                () => {
                    setEnableGenerate(true);
                },
            );
        } else if (deviceType === 'demo') {
            userSettings.setSetting('lastReceiveIndex', 0);
            demoLoadAddress(
                bip32base,
                setAddresses,
                setRawAddresses,
                userSettings.getSetting('lastReceiveIndex'),
            );
        }
    }, [bip32base, userSettings, deviceType]);

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
                            containerWidth={containerWidth}
                            containerHeight={containerHeight}
                        />

                        <Center>
                            <Button onClick={generateNewAddress} disabled={!enableGenerate}>
                                Generate New Address
                            </Button>
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
                            deviceType={deviceType}
                        />
                    </Tabs.Panel>

                    <Tabs.Panel value='transactions'>
                        <TransactionsTab
                            selectedAddress={selectedAddress}
                            setSelectedAddress={setSelectedAddress}
                            containerWidth={containerWidth}
                            containerHeight={containerHeight}
                            newTransactions={selectedAddress ? selectedAddress.newTransactions : 0}
                        />
                    </Tabs.Panel>
                </Tabs>
            </Center>
        </Stack>
    );
}
