import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import BluetoothTransport from '@ledgerhq/hw-transport-web-ble';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import { publicKeyToAddress, addressToScriptPublicKey } from './kaspa-util';

import { TransactionInput, TransactionOutput, Transaction } from 'hw-app-kaspa';
import Kaspa from 'hw-app-kaspa';

import * as kaspa from './kaspa-rpc';
import kaspaWasmUrl from './kaspa-rpc/kaspa_bg.wasm';

axiosRetry(axios, { retries: 3 });

let transportState = {
    /**
     * @type {Transport}
     */
    transport: null,
    initPromise: null,
    type: null,
    initialized: false,
};

const kaspaState = {
    rpc: null,
    sdk: new Promise((resolve, reject) => {
        kaspa
            .default(kaspaWasmUrl)
            .then(() => {
                console.info('SDK version', kaspa.version());
                resolve(kaspa);
            })
            .catch((e) => {
                console.error(e);
                reject(e);
            });
    }),
    addresses: new Set<string>(),
};

/**
 * Lazy initializes the RPC client
 * @returns Promise<kaspa.RpcClient>
 */
async function rpc(): Promise<kaspa.RpcClient> {
    if (!kaspaState.rpc) {
        kaspaState.rpc = new Promise(async (resolve) => {
            await kaspaState.sdk;

            const client = new kaspa.RpcClient({
                resolver: new kaspa.Resolver(),
                networkId: 'mainnet',
            });

            await client.connect();

            resolve(client);
        });
    }

    return kaspaState.rpc;
}

// export async function fetchTransaction(transactionId: string) {
//     const { data: txData } = await axios.get(`https://api.kaspa.org/transactions/${transactionId}`);

//     return txData;
// }

export type UtxoSelectionResult = {
    hasEnough: boolean;
    utxos: Array<any>;
    fee: number;
    total: number;
};

/**
 * Selects the UTXOs to fulfill the amount requested
 *
 * @param amount - the amount to select for, in SOMPI
 * @param utxosInput - the utxos array to select from
 * @param feeIncluded - whether or not fees are included in the amount passed
 * @param requiredFee - the minimum amount of fee to spend
 * @returns [has_enough, utxos, fee, total]
 */
export function selectUtxos(
    amount: number,
    utxosInput: UtxoInfo[],
    feeIncluded: boolean = false,
    requiredFee: number = 0,
): UtxoSelectionResult {
    // Fee does not have to be accurate. It just has to be over the absolute minimum.
    // https://kaspa-mdbook.aspectron.com/transactions/constraints/fees.html
    // Fee = (total mass) x (min_relay_tx_fee) / 1000
    // Since min_relay_tx_fee == 1000, really it's just:
    // Fee = total mass
    // https://kaspa-mdbook.aspectron.com/transactions/constraints/size.html
    // 239 mass = 2 (version) + 8 (# inputs) + 8 (# outputs)
    //          + 8 (lock time) + 20 (subnetwork id) + 8 (gas)
    //          + 32 (payload hash) + 8 (payload len) + 32 (payload)
    //          + [
    //               8 (value) + 2 (out version) + 8 (script len) + 35 (script) + 8 (if we're sending to multisig (2 sigops)) // output1 = 61
    //             + 8 (value) + 2 (out version) + 8 (script len) + 34 (script) // output2 = 52
    //            ]
    // https://kaspa-mdbook.aspectron.com/transactions/constraints/mass.html#transaction-mass-limits
    // 690 mass = [35 output1 script len + 34 output2 script len] x 10   // 10 = mass_per_script_pub_key_byte
    // If there is only one output, Fee calculation will be over by close to 0.00000500
    // Otherwise, it will only be off by about 0.00000020. These overages in both cases are tolerable
    // Assumptions that must remain true:
    // 1. There is at most 2 outputs
    // 2. The signature script len is 66 (always true schnorr addresses)
    // 3. Payload is zero hash payload
    // 4. We're at mainnet
    let minimumFee = 239 + 690;
    let fee = 0;
    let total = 0;

    const selected = [];

    // UTXOs is sorted descending:
    for (const utxo of utxosInput) {
        minimumFee += 1118; // 1118 is described here https://kaspa-mdbook.aspectron.com/transactions/constraints/mass.html#input-mass
        total += utxo.amount;

        fee = Math.max(minimumFee, requiredFee);

        selected.push(utxo);

        const targetAmount = feeIncluded ? amount - fee : amount;
        console.info({
            targetAmount,
            amount,
            fee,
            total,
        });

        const totalSpend = targetAmount + fee;
        // If we have change, we want to try to use at least 2 UTXOs
        if (total == totalSpend || (total > totalSpend && selected.length > 1)) {
            // We have enough
            break;
        }
    }

    // [has_enough, utxos, fee, total]
    const targetAmount = feeIncluded ? amount - fee : amount;
    return { hasEnough: total >= targetAmount + fee, utxos: selected, fee, total };
}

export async function initTransport(type = 'usb') {
    if (transportState.type == type && transportState.transport) {
        return transportState.transport;
    }

    if (transportState.initPromise) {
        return await transportState.initPromise;
    }

    if (type === 'usb') {
        transportState.initPromise = TransportWebHID.create();
    } else if (type === 'bluetooth') {
        transportState.initPromise = BluetoothTransport.create();
    } else {
        throw new Error('Unknown device type');
    }

    transportState.transport = await transportState.initPromise;
    transportState.type = type;
    transportState.initialized = true;

    return transportState.transport;
}

export function isLedgerTransportInitialized() {
    return transportState.initialized;
}

export async function fetchTransactionCount(address) {
    const { data: txCount } = await axios.get(
        `https://api.kaspa.org/addresses/${address}/transactions-count`,
    );

    return txCount.total || 0;
}

export type UtxoInfo = {
    prevTxId: string;
    outpointIndex: number;
    amount: number;
};

export async function fetchAddressBalance(address: string) {
    if (!address) {
        throw new Error('Address must be passed to fetch balance');
    }

    const client = await rpc();
    const result = await client.getBalanceByAddress({ address });

    return result;
}

export async function fetchAddressUtxos(address) {
    if (!address) {
        throw new Error('Address must be passed to fetch utxos');
    }

    const client = await rpc();
    const result = await client.getUtxosByAddresses({ addresses: [address] });

    return result.entries;
}

export async function fetchAddressDetails(address, derivationPath) {
    const [balanceData, utxoData] = await Promise.all([
        fetchAddressBalance(address),
        fetchAddressUtxos(address),
    ]);

    // UTXOs sorted by decreasing amount. Using the biggest UTXOs first minimizes number of utxos needed
    // in a transaction
    const utxos: UtxoInfo[] = utxoData
        .map((utxo) => {
            console.info('utxo', utxo.entry);
            return {
                prevTxId: utxo.entry.outpoint.transactionId,
                outpointIndex: utxo.entry.outpoint.index,
                amount: Number(utxo.entry.amount),
            };
        })
        .sort((a: UtxoInfo, b: UtxoInfo) => b.amount - a.amount);

    const path = derivationPath.split('/');

    return {
        address,
        derivationPath,
        balance: balanceData.balance,
        utxos: utxos,
        // txCount: Number(txCount.total),
        addressType: Number(path[3]),
        addressIndex: Number(path[4]),
    };
}

export async function fetchFeeRate() {
    const client = await rpc();
    return await client.getFeeEstimate({});
}

export async function fetchTransactions(address, offset = 0, limit = 100) {
    const { data: txsData } = await axios.get(
        `https://api.kaspa.org/addresses/${address}/full-transactions?offset=${offset}&limit=${limit}&resolve_previous_outpoints=light`,
    );

    return txsData;
}

/**
 * @param {Transport} transport
 */
export async function quitApp(transport) {
    await transport.send(0xb0, 0xa7, 0x00, 0x00);
}

/**
 *
 * @param {Transport} transport
 * @param {String} name
 */
export async function openApp(transport, name) {
    await transport.send(0xe0, 0xd8, 0x00, 0x00, Buffer.from(name, 'ascii'));
}

/**
 * @param {*} transport
 * @returns {Promise<{name: string, version: string, flags: number | Buffer}>}
 */
export async function getAppAndVersion(transport) {
    const r = await transport.send(0xb0, 0x01, 0x00, 0x00);
    let i = 0;
    const format = r[i++];

    if (format !== 1) {
        throw new Error('getAppAndVersion: format not supported');
    }

    const nameLength = r[i++];
    const name = r.slice(i, (i += nameLength)).toString('ascii');
    const versionLength = r[i++];
    const version = r.slice(i, (i += versionLength)).toString('ascii');
    const flagLength = r[i++];
    const flags = r.slice(i, (i += flagLength));
    return {
        name,
        version,
        flags,
    };
}

export async function getAddress(path = "44'/111111'/0'/0/0", display = false) {
    if (!transportState.transport) {
        throw new Error('Ledger not connected');
    }

    const kaspa = new Kaspa(transportState.transport);

    const publicKeyBuffer = await kaspa.getPublicKey(path, display);

    // Index 0 is always 0x41 = (65) the length of the following full public key
    const publicKey = Buffer.from(publicKeyBuffer.subarray(1, 66));
    // Index 66 is always 0x20 = (32) the length of the following chain code
    const chainCode = Buffer.from(publicKeyBuffer.subarray(67, 67 + 32));
    const yCoordParity = publicKeyBuffer[65] % 2; // x-coord is index [2, 34), y-coord is index [34, 66)

    return {
        address: publicKeyToAddress(Buffer.from(publicKeyBuffer.subarray(2, 34)), false),
        publicKey,
        fullPublicKey: Buffer.from(publicKeyBuffer.subarray(1, 1 + 65)),
        compressedPublicKey: Buffer.from([yCoordParity + 2, ...publicKeyBuffer.subarray(2, 34)]),
        chainCode,
    };
}

function toRpcTransaction(signedTx: Transaction): kaspa.Transaction {
    const inputs = signedTx.inputs.map((currInput: TransactionInput) => {
        return new kaspa.TransactionInput({
            signatureScript: `41${currInput.signature}01`,
            previousOutpoint: {
                index: currInput.outpointIndex,
                transactionId: currInput.prevTxId,
            },
            sequence: BigInt(0),
            sigOpCount: 1,
        });
    });

    const outputs = signedTx.outputs.map((currOutput: TransactionOutput) => {
        return new kaspa.TransactionOutput(
            BigInt(currOutput.value),
            new kaspa.ScriptPublicKey(0, currOutput.scriptPublicKey),
        );
    });

    return new kaspa.Transaction({
        inputs,
        outputs,
        gas: BigInt(0),
        lockTime: BigInt(0),
        subnetworkId: '0000000000000000000000000000000000000000',
        payload: '',
        version: 0,
    });
}

export const sendTransaction = async (
    signedTx: Transaction,
    txIdToReplace?: string,
): Promise<SendAmountResult> => {
    const client = await rpc();
    const wasmTx = toRpcTransaction(signedTx);
    const submitRequest: kaspa.ISubmitTransactionRequest = {
        transaction: wasmTx,
    };

    if (txIdToReplace == wasmTx.id) {
        throw new Error('Current transaction is the same as the one it is trying to replace');
    }

    let sendAmountResult = {
        transactionId: null,
        replacedTransactionId: null,
    };

    if (txIdToReplace) {
        const resp = await client.submitTransactionReplacement(submitRequest);
        sendAmountResult.transactionId = resp.transactionId.toString();
        sendAmountResult.replacedTransactionId = resp.replacedTransaction.id.toString();

        if (sendAmountResult.replacedTransactionId !== txIdToReplace) {
            throw new Error(
                `Replaced transaction ${sendAmountResult.replacedTransactionId} but expecting to replace ${txIdToReplace}`,
            );
        }
    } else {
        const resp = await client.submitTransaction(submitRequest);
        sendAmountResult.transactionId = resp.transactionId.toString();
    }

    console.info('sendTransaction::response', sendAmountResult);
    // if (sendAmountResult.transactionId != wasmTx.id) {
    //     console.info(
    //         `Unexpected transaction id. Expected ${wasmTx.id} but got ${sendAmountResult.transactionId}`,
    //     );
    //     throw new Error(
    //         `Unexpected transaction id. Expected ${wasmTx.id} but got ${sendAmountResult.transactionId}`,
    //     );
    // }

    return sendAmountResult;
};

export function createTransaction(
    amount: number,
    sendTo: string,
    utxosInput: any,
    derivationPath: string,
    changeAddress: string,
    feeIncluded: boolean = false,
    requiredFee: number = 0,
) {
    console.info('Amount:', amount);
    console.info('Send to:', sendTo);
    console.info('UTXOs:', utxosInput);
    console.info('Derivation Path:', derivationPath);
    console.info('Required Fee:', requiredFee);

    const {
        hasEnough,
        utxos,
        fee,
        total: totalUtxoAmount,
    } = selectUtxos(amount, utxosInput, feeIncluded, requiredFee);

    console.info('hasEnough', hasEnough);
    console.info(utxos);

    if (!hasEnough) {
        // Show error we don't have enough KAS
        throw new Error('Amount too high.');
    }

    const path = derivationPath.split('/');
    console.info('Split Path:', path);

    const inputs: TransactionInput[] = utxos.map(
        (utxo) =>
            new TransactionInput({
                value: utxo.amount,
                prevTxId: utxo.prevTxId,
                outpointIndex: utxo.outpointIndex,
                addressType: Number(path[3]),
                addressIndex: Number(path[4]),
            }),
    );

    const outputs: TransactionOutput[] = [];

    const targetAmount = feeIncluded ? Number((amount - fee).toFixed(8)) : amount;

    const sendToOutput = new TransactionOutput({
        value: targetAmount,
        scriptPublicKey: addressToScriptPublicKey(sendTo),
    });

    outputs.push(sendToOutput);

    const changeAmount = totalUtxoAmount - targetAmount - fee;

    // Any change smaller than 0.0001 is contributed to the fee to avoid dust
    if (changeAmount >= 10000) {
        // Send remainder back to self:
        outputs.push(
            new TransactionOutput({
                value: Math.round(changeAmount),
                scriptPublicKey: addressToScriptPublicKey(changeAddress),
            }),
        );
    } else {
        console.info(`Adding dust change ${changeAmount} sompi to fee`);
    }

    const tx = new Transaction({
        version: 0,
        inputs,
        outputs,
        // Make sure to send it back to myself
        // Path here must match the script public key passed
        changeAddressType: Number(path[3]),
        changeAddressIndex: Number(path[4]),
    });

    console.info('tx before sign', tx);

    return { tx, fee };
}

export interface SendAmountResult {
    transactionId: string;
    replacedTransactionId?: string;
}

export async function sendAmount(
    tx,
    deviceType,
    txIdToReplace?: string,
): Promise<SendAmountResult> {
    const transport = await initTransport(deviceType);
    const kaspa = new Kaspa(transport);
    await kaspa.signTransaction(tx);

    console.info('tx', tx);

    return await sendTransaction(tx, txIdToReplace);
}

/**
 *
 * @param {String} message - the message to sign. Max 120 for Nano S, 200 for others
 * @param {Integer} addressType - address type
 * @param {Integer} addressIndex - address index
 * @param {String} deviceType - `usb` or `bluetooth`
 * @returns {JSON} containing { signature, messageHash }
 */
export async function signMessage(message, addressType, addressIndex, deviceType) {
    const transport = await initTransport(deviceType);
    const kaspa = new Kaspa(transport);
    return await kaspa.signMessage(message, addressType, addressIndex);
}

export async function fetchServerInfo() {
    return await rpc().then(async (rpcClient) => {
        return await rpcClient.getServerInfo();
    });
}

export async function fetchBlock(
    hash: string,
    includeTransactions: boolean,
): Promise<kaspa.IGetBlockResponse> {
    const client = await rpc();
    return await client.getBlock({ hash, includeTransactions });
}

export async function confirmationsSinceDaaScore(daaScore: bigint) {
    const client = await rpc();
    const info = await client.getBlockDagInfo();

    return Math.max(0, Number(info.virtualDaaScore - daaScore));
}

export async function findTransactionsInMempool(addresses: string[]) {
    const client = await rpc();
    const transactions = await client.getMempoolEntriesByAddresses({
        addresses,
        filterTransactionPool: false,
        includeOrphanPool: false,
    });

    return transactions;
}

/**
 * Tracks a transactionId until we see a VSPC changed notification
 * that tells us the transactionId has been accepted
 * @param transactionId
 * @returns
 */
export async function trackUntilConfirmed(transactionId: string) {
    const client = await rpc();

    await client.subscribeVirtualChainChanged(true);

    return new Promise((resolve) => {
        const callback = async (event) => {
            if (event.type == 'virtual-chain-changed') {
                for (const acceptingBlock of event.data.acceptedTransactionIds) {
                    for (const acceptedTransactionId of acceptingBlock.acceptedTransactionIds) {
                        if (acceptedTransactionId == transactionId) {
                            client.unsubscribeVirtualChainChanged(true);
                            resolve(acceptingBlock);
                        }
                    }
                }
            }
        };

        client.addEventListener(callback);
    });
}
