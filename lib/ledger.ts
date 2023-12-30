import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import { publicKeyToAddress, addressToScriptPublicKey } from './kaspa-util';

import { TransactionInput, TransactionOutput, Transaction } from 'hw-app-kaspa';
import Kaspa from 'hw-app-kaspa';

axiosRetry(axios, { retries: 3 });

let transportState = {
    /**
     * @type {Transport}
     */
    transport: null,
    initPromise: null,
    type: null,
};

export async function fetchTransaction(transactionId) {
    const { data: txData } = await axios.get(`https://api.kaspa.org/transactions/${transactionId}`);

    return txData;
}

export function selectUtxos(amount: number, utxosInput: any, feeIncluded: boolean = false): [boolean, Array<any>, number, number] {
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
    let fee = 239 + 690;
    let total = 0;

    const selected = [];

    // UTXOs is sorted descending:
    for (const utxo of utxosInput) {
        fee += 1118; // 1118 is described here https://kaspa-mdbook.aspectron.com/transactions/constraints/mass.html#input-mass
        total += utxo.amount;

        selected.push(utxo);

        const targetAmount = feeIncluded ? Number((amount - fee).toFixed(8)) : amount;
        console.info({
            targetAmount,
            amount,
            fee,
            total,
        });

        if (total >= targetAmount + fee) {
            // We have enough
            break;
        }
    }

    // [has_enough, utxos, fee, total]
    const targetAmount = feeIncluded ? Number((amount - fee).toFixed(8)) : amount;
    return [total >= targetAmount + fee, selected, fee, total];
}

export async function initTransport(type = 'usb') {
    if (transportState.type == type && transportState.transport) {
        return transportState.transport;
    }

    if (transportState.initPromise) {
        return await transportState.initPromise;
    }

    transportState.initPromise = TransportWebHID.create();
    transportState.transport = await transportState.initPromise;
    transportState.type = type;

    return transportState.transport;
}

export async function fetchTransactionCount(address) {
    const { data: txCount } = await axios.get(
        `https://api.kaspa.org/addresses/${address}/transactions-count`,
    );

    return txCount.total || 0;
}

export async function fetchAddressDetails(address, derivationPath) {
    const { data: balanceData } = await axios.get(
        `https://api.kaspa.org/addresses/${address}/balance`,
    );
    const { data: utxoData } = await axios.get(`https://api.kaspa.org/addresses/${address}/utxos`);

    // UTXOs sorted by decreasing amount. Using the biggest UTXOs first minimizes number of utxos needed
    // in a transaction
    const utxos = utxoData
        .map((utxo) => {
            return {
                prevTxId: utxo.outpoint.transactionId,
                outpointIndex: utxo.outpoint.index,
                amount: Number(utxo.utxoEntry.amount),
            };
        })
        .sort((a, b) => b.amount - a.amount);

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

export const sendTransaction = async (signedTx) => {
    const txJson = signedTx.toApiJSON();

    const { data } = await axios.post(`https://api.kaspa.org/transactions`, txJson);

    return data.transactionId;
};

export function createTransaction(
    amount: number,
    sendTo: string,
    utxosInput: any,
    derivationPath: string,
    changeAddress: string,
    feeIncluded: boolean = false,
) {
    console.info('Amount:', amount);
    console.info('Send to:', sendTo);
    console.info('UTXOs:', utxosInput);
    console.info('Derivation Path:', derivationPath);

    const [hasEnough, utxos, fee, totalUtxoAmount] = selectUtxos(amount, utxosInput, feeIncluded);

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

export async function sendAmount(tx, deviceType) {
    const transport = await initTransport(deviceType);
    const kaspa = new Kaspa(transport);
    await kaspa.signTransaction(tx);

    console.info('tx', tx);

    return await sendTransaction(tx);
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
