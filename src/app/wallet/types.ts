import { UtxoInfo } from '../../lib/ledger';

export interface IAddressData {
    key: string;
    address: string;
    derivationPath: string;
    loading: boolean;
    balance: number;
    addressIndex: number;
    addressType: number;
    utxos: UtxoInfo[];
}

export interface ISelectedAddress {
    key: string;
    address: string;
    derivationPath: string;
    balance: number;
    utxos: UtxoInfo[];
}
