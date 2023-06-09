import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import axios from 'axios';

import { publicKeyToAddress, addressToScriptPublicKey } from './kaspa-util';

import { Kaspa, TransactionInput, TransactionOutput, Transaction } from 'hw-app-kaspa';

let transportState = {
    /**
     * @type {Transport}
     */
    transport: null,
    type: null,
};

let addresses = null;

export function selectUtxos(amount, utxosInput, feeIncluded = false) {
    // Fee does not have to be accurate. It just has to be over the absolute minimum.
    // https://kaspa-mdbook.aspectron.com/transactions/constraints/fees.html
    // Fee = (total mass) x (min_relay_tx_fee) / 1000
    // Since min_relay_tx_fee == 1000, really it's just:
    // Fee = total mass
    // https://kaspa-mdbook.aspectron.com/transactions/constraints/size.html
    // 231 mass = 2 (version) + 8 (# inputs) + 8 (# outputs)
    //          + 8 (lock time) + 20 (subnetwork id) + 8 (gas)
    //          + 32 (payload hash) + 8 (payload len) + 32 (payload)
    //          + [
    //               8 (value) + 2 (out version) + 8 (script len) + 35 (script) // output1 = 53
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
    let fee = 231 + 690;
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

    if (transportState.transport) {
        await transportState.transport.close();
    }

    try {
        transportState.transport = await TransportWebHID.create();
    } catch (e) {
        console.error(e);
        transportState.transport = await TransportWebHID.openConnected();
    }
    transportState.type = type;

    return transportState.transport;
}

export async function fetchAddressDetails(address, derivationPath) {
    const { data: balanceData } = await axios.get(
        `https://api.kaspa.org/addresses/${address}/balance`,
    );
    const { data: utxoData } = await axios.get(`https://api.kaspa.org/addresses/${address}/utxos`);
    const { data: txCount } = await axios.get(
        `https://api.kaspa.org/addresses/${address}/transactions-count`,
    );

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
        txCount: Number(txCount.total),
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

    const { address } = await kaspa.getAddress(path, display);

    return publicKeyToAddress(Buffer.from(address.subarray(2, 34)), false);
}

export const sendTransaction = async (signedTx) => {
    const txJson = signedTx.toApiJSON();

    const { data } = await axios.post(`https://api.kaspa.org/transactions`, txJson);

    return data.transactionId;
};

export function createTransaction(
    amount,
    sendTo,
    utxosInput,
    derivationPath,
    address,
    feeIncluded,
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

    const inputs = utxos.map(
        (utxo) =>
            new TransactionInput({
                value: utxo.amount,
                prevTxId: utxo.prevTxId,
                outpointIndex: utxo.outpointIndex,
                addressType: Number(path[3]),
                addressIndex: Number(path[4]),
            }),
    );

    const outputs = [];

    const targetAmount = feeIncluded ? Number((amount - fee).toFixed(8)) : amount;

    const sendToOutput = new TransactionOutput({
        value: targetAmount,
        scriptPublicKey: addressToScriptPublicKey(sendTo),
    });

    outputs.push(sendToOutput);

    const changeAmount = totalUtxoAmount - targetAmount - fee;

    if (changeAmount > 0) {
        // Send remainder back to self:
        outputs.push(
            new TransactionOutput({
                value: Math.round(changeAmount),
                scriptPublicKey: addressToScriptPublicKey(address),
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

    return { tx, fee };
}

export async function sendAmount(tx, deviceType) {
    const transport = await initTransport(deviceType);
    const kaspa = new Kaspa(transport);
    await kaspa.signTransaction(tx);

    console.info('tx', tx);

    return await sendTransaction(tx);
}
