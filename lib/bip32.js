import ecc from '@bitcoinerlab/secp256k1';
import BIP32Factory from 'bip32';
import { publicKeyToAddress } from './kaspa-util';

const bip32 = BIP32Factory(ecc);

export default class KaspaBIP32 {
    constructor(compressedPublicKey, chainCode) {
        this.rootNode = bip32.fromPublicKey(compressedPublicKey, chainCode);
    }

    getAddress(type = 0, index = 0) {
        const child = this.rootNode.derivePath(`${type}/${index}`);

        // child.publicKey is a compressed public key
        return publicKeyToAddress(child.publicKey.subarray(1, 33), false);
    }
}
