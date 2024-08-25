/* tslint:disable */
/* eslint-disable */
/**
* Returns the version of the Rusty Kaspa framework.
* @category General
* @returns {string}
*/
export function version(): string;
/**
*Set the logger log level using a string representation.
*Available variants are: 'off', 'error', 'warn', 'info', 'debug', 'trace'
*@category General
* @param {"off" | "error" | "warn" | "info" | "debug" | "trace"} level
*/
export function setLogLevel(level: "off" | "error" | "warn" | "info" | "debug" | "trace"): void;
/**
* Configuration for the WASM32 bindings runtime interface.
* @see {@link IWASM32BindingsConfig}
* @category General
* @param {IWASM32BindingsConfig} config
*/
export function initWASM32Bindings(config: IWASM32BindingsConfig): void;
/**
* Initialize Rust panic handler in console mode.
*
* This will output additional debug information during a panic to the console.
* This function should be called right after loading WASM libraries.
* @category General
*/
export function initConsolePanicHook(): void;
/**
* Initialize Rust panic handler in browser mode.
*
* This will output additional debug information during a panic in the browser
* by creating a full-screen `DIV`. This is useful on mobile devices or where
* the user otherwise has no access to console/developer tools. Use
* {@link presentPanicHookLogs} to activate the panic logs in the
* browser environment.
* @see {@link presentPanicHookLogs}
* @category General
*/
export function initBrowserPanicHook(): void;
/**
* Present panic logs to the user in the browser.
*
* This function should be called after a panic has occurred and the
* browser-based panic hook has been activated. It will present the
* collected panic logs in a full-screen `DIV` in the browser.
* @see {@link initBrowserPanicHook}
* @category General
*/
export function presentPanicHookLogs(): void;
/**
*r" Deferred promise - an object that has `resolve()` and `reject()`
*r" functions that can be called outside of the promise body.
*r" WARNING: This function uses `eval` and can not be used in environments
*r" where dynamically-created code can not be executed such as web browser
*r" extensions.
*r" @category General
* @returns {Promise<any>}
*/
export function defer(): Promise<any>;
/**
* wRPC protocol encoding: `Borsh` or `JSON`
* @category Transport
*/
export enum Encoding {
  Borsh = 0,
  SerdeJson = 1,
}
/**
* @category Consensus
*/
export enum NetworkType {
  Mainnet = 0,
  Testnet = 1,
  Devnet = 2,
  Simnet = 3,
}
/**
*
*  Kaspa `Address` version (`PubKey`, `PubKey ECDSA`, `ScriptHash`)
*
* @category Address
*/
export enum AddressVersion {
/**
* PubKey addresses always have the version byte set to 0
*/
  PubKey = 0,
/**
* PubKey ECDSA addresses always have the version byte set to 1
*/
  PubKeyECDSA = 1,
/**
* ScriptHash addresses always have the version byte set to 8
*/
  ScriptHash = 8,
}
/**
* `ConnectionStrategy` specifies how the WebSocket `async fn connect()`
* function should behave during the first-time connectivity phase.
* @category WebSocket
*/
export enum ConnectStrategy {
/**
* Continuously attempt to connect to the server. This behavior will
* block `connect()` function until the connection is established.
*/
  Retry = 0,
/**
* Causes `connect()` to return immediately if the first-time connection
* has failed.
*/
  Fallback = 1,
}

/**
 * Interface defines the structure of a transaction outpoint (used by transaction input).
 * 
 * @category Consensus
 */
export interface ITransactionOutpoint {
    transactionId: HexString;
    index: number;
}



/**
 * Kaspa Transaction Script Opcodes
 * @see {@link ScriptBuilder}
 * @category Consensus
 */
export enum Opcode {
    OpData1 = 0x01,
    OpData2 = 0x02,
    OpData3 = 0x03,
    OpData4 = 0x04,
    OpData5 = 0x05,
    OpData6 = 0x06,
    OpData7 = 0x07,
    OpData8 = 0x08,
    OpData9 = 0x09,
    OpData10 = 0x0a,
    OpData11 = 0x0b,
    OpData12 = 0x0c,
    OpData13 = 0x0d,
    OpData14 = 0x0e,
    OpData15 = 0x0f,
    OpData16 = 0x10,
    OpData17 = 0x11,
    OpData18 = 0x12,
    OpData19 = 0x13,
    OpData20 = 0x14,
    OpData21 = 0x15,
    OpData22 = 0x16,
    OpData23 = 0x17,
    OpData24 = 0x18,
    OpData25 = 0x19,
    OpData26 = 0x1a,
    OpData27 = 0x1b,
    OpData28 = 0x1c,
    OpData29 = 0x1d,
    OpData30 = 0x1e,
    OpData31 = 0x1f,
    OpData32 = 0x20,
    OpData33 = 0x21,
    OpData34 = 0x22,
    OpData35 = 0x23,
    OpData36 = 0x24,
    OpData37 = 0x25,
    OpData38 = 0x26,
    OpData39 = 0x27,
    OpData40 = 0x28,
    OpData41 = 0x29,
    OpData42 = 0x2a,
    OpData43 = 0x2b,
    OpData44 = 0x2c,
    OpData45 = 0x2d,
    OpData46 = 0x2e,
    OpData47 = 0x2f,
    OpData48 = 0x30,
    OpData49 = 0x31,
    OpData50 = 0x32,
    OpData51 = 0x33,
    OpData52 = 0x34,
    OpData53 = 0x35,
    OpData54 = 0x36,
    OpData55 = 0x37,
    OpData56 = 0x38,
    OpData57 = 0x39,
    OpData58 = 0x3a,
    OpData59 = 0x3b,
    OpData60 = 0x3c,
    OpData61 = 0x3d,
    OpData62 = 0x3e,
    OpData63 = 0x3f,
    OpData64 = 0x40,
    OpData65 = 0x41,
    OpData66 = 0x42,
    OpData67 = 0x43,
    OpData68 = 0x44,
    OpData69 = 0x45,
    OpData70 = 0x46,
    OpData71 = 0x47,
    OpData72 = 0x48,
    OpData73 = 0x49,
    OpData74 = 0x4a,
    OpData75 = 0x4b,
    OpPushData1 = 0x4c,
    OpPushData2 = 0x4d,
    OpPushData4 = 0x4e,
    Op1Negate = 0x4f,
    /**
     * Reserved
     */
    OpReserved = 0x50,
    Op1 = 0x51,
    Op2 = 0x52,
    Op3 = 0x53,
    Op4 = 0x54,
    Op5 = 0x55,
    Op6 = 0x56,
    Op7 = 0x57,
    Op8 = 0x58,
    Op9 = 0x59,
    Op10 = 0x5a,
    Op11 = 0x5b,
    Op12 = 0x5c,
    Op13 = 0x5d,
    Op14 = 0x5e,
    Op15 = 0x5f,
    Op16 = 0x60,
    OpNop = 0x61,
    /**
     * Reserved
     */
    OpVer = 0x62,
    OpIf = 0x63,
    OpNotIf = 0x64,
    /**
     * Reserved
     */
    OpVerIf = 0x65,
    /**
     * Reserved
     */
    OpVerNotIf = 0x66,
    OpElse = 0x67,
    OpEndIf = 0x68,
    OpVerify = 0x69,
    OpReturn = 0x6a,
    OpToAltStack = 0x6b,
    OpFromAltStack = 0x6c,
    Op2Drop = 0x6d,
    Op2Dup = 0x6e,
    Op3Dup = 0x6f,
    Op2Over = 0x70,
    Op2Rot = 0x71,
    Op2Swap = 0x72,
    OpIfDup = 0x73,
    OpDepth = 0x74,
    OpDrop = 0x75,
    OpDup = 0x76,
    OpNip = 0x77,
    OpOver = 0x78,
    OpPick = 0x79,
    OpRoll = 0x7a,
    OpRot = 0x7b,
    OpSwap = 0x7c,
    OpTuck = 0x7d,
    /**
     * Disabled
     */
    OpCat = 0x7e,
    /**
     * Disabled
     */
    OpSubStr = 0x7f,
    /**
     * Disabled
     */
    OpLeft = 0x80,
    /**
     * Disabled
     */
    OpRight = 0x81,
    OpSize = 0x82,
    /**
     * Disabled
     */
    OpInvert = 0x83,
    /**
     * Disabled
     */
    OpAnd = 0x84,
    /**
     * Disabled
     */
    OpOr = 0x85,
    /**
     * Disabled
     */
    OpXor = 0x86,
    OpEqual = 0x87,
    OpEqualVerify = 0x88,
    OpReserved1 = 0x89,
    OpReserved2 = 0x8a,
    Op1Add = 0x8b,
    Op1Sub = 0x8c,
    /**
     * Disabled
     */
    Op2Mul = 0x8d,
    /**
     * Disabled
     */
    Op2Div = 0x8e,
    OpNegate = 0x8f,
    OpAbs = 0x90,
    OpNot = 0x91,
    Op0NotEqual = 0x92,
    OpAdd = 0x93,
    OpSub = 0x94,
    /**
     * Disabled
     */
    OpMul = 0x95,
    /**
     * Disabled
     */
    OpDiv = 0x96,
    /**
     * Disabled
     */
    OpMod = 0x97,
    /**
     * Disabled
     */
    OpLShift = 0x98,
    /**
     * Disabled
     */
    OpRShift = 0x99,
    OpBoolAnd = 0x9a,
    OpBoolOr = 0x9b,
    OpNumEqual = 0x9c,
    OpNumEqualVerify = 0x9d,
    OpNumNotEqual = 0x9e,
    OpLessThan = 0x9f,
    OpGreaterThan = 0xa0,
    OpLessThanOrEqual = 0xa1,
    OpGreaterThanOrEqual = 0xa2,
    OpMin = 0xa3,
    OpMax = 0xa4,
    OpWithin = 0xa5,
    OpUnknown166 = 0xa6,
    OpUnknown167 = 0xa7,
    OpSha256 = 0xa8,
    OpCheckMultiSigECDSA = 0xa9,
    OpBlake2b = 0xaa,
    OpCheckSigECDSA = 0xab,
    OpCheckSig = 0xac,
    OpCheckSigVerify = 0xad,
    OpCheckMultiSig = 0xae,
    OpCheckMultiSigVerify = 0xaf,
    OpCheckLockTimeVerify = 0xb0,
    OpCheckSequenceVerify = 0xb1,
    OpUnknown178 = 0xb2,
    OpUnknown179 = 0xb3,
    OpUnknown180 = 0xb4,
    OpUnknown181 = 0xb5,
    OpUnknown182 = 0xb6,
    OpUnknown183 = 0xb7,
    OpUnknown184 = 0xb8,
    OpUnknown185 = 0xb9,
    OpUnknown186 = 0xba,
    OpUnknown187 = 0xbb,
    OpUnknown188 = 0xbc,
    OpUnknown189 = 0xbd,
    OpUnknown190 = 0xbe,
    OpUnknown191 = 0xbf,
    OpUnknown192 = 0xc0,
    OpUnknown193 = 0xc1,
    OpUnknown194 = 0xc2,
    OpUnknown195 = 0xc3,
    OpUnknown196 = 0xc4,
    OpUnknown197 = 0xc5,
    OpUnknown198 = 0xc6,
    OpUnknown199 = 0xc7,
    OpUnknown200 = 0xc8,
    OpUnknown201 = 0xc9,
    OpUnknown202 = 0xca,
    OpUnknown203 = 0xcb,
    OpUnknown204 = 0xcc,
    OpUnknown205 = 0xcd,
    OpUnknown206 = 0xce,
    OpUnknown207 = 0xcf,
    OpUnknown208 = 0xd0,
    OpUnknown209 = 0xd1,
    OpUnknown210 = 0xd2,
    OpUnknown211 = 0xd3,
    OpUnknown212 = 0xd4,
    OpUnknown213 = 0xd5,
    OpUnknown214 = 0xd6,
    OpUnknown215 = 0xd7,
    OpUnknown216 = 0xd8,
    OpUnknown217 = 0xd9,
    OpUnknown218 = 0xda,
    OpUnknown219 = 0xdb,
    OpUnknown220 = 0xdc,
    OpUnknown221 = 0xdd,
    OpUnknown222 = 0xde,
    OpUnknown223 = 0xdf,
    OpUnknown224 = 0xe0,
    OpUnknown225 = 0xe1,
    OpUnknown226 = 0xe2,
    OpUnknown227 = 0xe3,
    OpUnknown228 = 0xe4,
    OpUnknown229 = 0xe5,
    OpUnknown230 = 0xe6,
    OpUnknown231 = 0xe7,
    OpUnknown232 = 0xe8,
    OpUnknown233 = 0xe9,
    OpUnknown234 = 0xea,
    OpUnknown235 = 0xeb,
    OpUnknown236 = 0xec,
    OpUnknown237 = 0xed,
    OpUnknown238 = 0xee,
    OpUnknown239 = 0xef,
    OpUnknown240 = 0xf0,
    OpUnknown241 = 0xf1,
    OpUnknown242 = 0xf2,
    OpUnknown243 = 0xf3,
    OpUnknown244 = 0xf4,
    OpUnknown245 = 0xf5,
    OpUnknown246 = 0xf6,
    OpUnknown247 = 0xf7,
    OpUnknown248 = 0xf8,
    OpUnknown249 = 0xf9,
    OpSmallInteger = 0xfa,
    OpPubKeys = 0xfb,
    OpUnknown252 = 0xfc,
    OpPubKeyHash = 0xfd,
    OpPubKey = 0xfe,
    OpInvalidOpCode = 0xff,
}




/**
 * Interface defining the structure of a block header.
 * 
 * @category Consensus
 */
export interface IHeader {
    hash: HexString;
    version: number;
    parentsByLevel: Array<Array<HexString>>;
    hashMerkleRoot: HexString;
    acceptedIdMerkleRoot: HexString;
    utxoCommitment: HexString;
    timestamp: bigint;
    bits: number;
    nonce: bigint;
    daaScore: bigint;
    blueWork: bigint | HexString;
    blueScore: bigint;
    pruningPoint: HexString;
}



/**
 * Interface defines the structure of a transaction input.
 * 
 * @category Consensus
 */
export interface ITransactionInput {
    previousOutpoint: ITransactionOutpoint;
    signatureScript: HexString;
    sequence: bigint;
    sigOpCount: number;
    utxo?: UtxoEntryReference;

    /** Optional verbose data provided by RPC */
    verboseData?: ITransactionInputVerboseData;
}

/**
 * Option transaction input verbose data.
 * 
 * @category Node RPC
 */
export interface ITransactionInputVerboseData { }




/**
 * Interface defines the structure of a UTXO entry.
 * 
 * @category Consensus
 */
export interface IUtxoEntry {
    /** @readonly */
    address?: Address;
    /** @readonly */
    outpoint: ITransactionOutpoint;
    /** @readonly */
    amount : bigint;
    /** @readonly */
    scriptPublicKey : IScriptPublicKey;
    /** @readonly */
    blockDaaScore: bigint;
    /** @readonly */
    isCoinbase: boolean;
}




/**
 * Interface defining the structure of a transaction.
 * 
 * @category Consensus
 */
export interface ITransaction {
    version: number;
    inputs: ITransactionInput[];
    outputs: ITransactionOutput[];
    lockTime: bigint;
    subnetworkId: HexString;
    gas: bigint;
    payload: HexString;

    /** Optional verbose data provided by RPC */
    verboseData?: ITransactionVerboseData;
}

/**
 * Optional transaction verbose data.
 * 
 * @category Node RPC
 */
export interface ITransactionVerboseData {
    transactionId : HexString;
    hash : HexString;
    mass : bigint;
    blockHash : HexString;
    blockTime : bigint;
}



/**
 * Interface defining the structure of a transaction output.
 * 
 * @category Consensus
 */
export interface ITransactionOutput {
    value: bigint;
    scriptPublicKey: IScriptPublicKey;

    /** Optional verbose data provided by RPC */
    verboseData?: ITransactionOutputVerboseData;
}

/**
 * TransactionOutput verbose data.
 * 
 * @category Node RPC
 */
export interface ITransactionOutputVerboseData {
    scriptPublicKeyType : string;
    scriptPublicKeyAddress : string;
}




/**
 * Interface defines the structure of a serializable UTXO entry.
 * 
 * @see {@link ISerializableTransactionInput}, {@link ISerializableTransaction}
 * @category Wallet SDK
 */
export interface ISerializableUtxoEntry {
    address?: Address;
    amount: bigint;
    scriptPublicKey: ScriptPublicKey;
    blockDaaScore: bigint;
    isCoinbase: boolean;
}

/**
 * Interface defines the structure of a serializable transaction input.
 * 
 * @see {@link ISerializableTransaction}
 * @category Wallet SDK
 */
export interface ISerializableTransactionInput {
    transactionId : HexString;
    index: number;
    sequence: bigint;
    sigOpCount: number;
    signatureScript: HexString;
    utxo: ISerializableUtxoEntry;
}

/**
 * Interface defines the structure of a serializable transaction output.
 * 
 * @see {@link ISerializableTransaction}
 * @category Wallet SDK
 */
export interface ISerializableTransactionOutput {
    value: bigint;
    scriptPublicKey: IScriptPublicKey;
}

/**
 * Interface defines the structure of a serializable transaction.
 * 
 * Serializable transactions can be produced using 
 * {@link Transaction.serializeToJSON},
 * {@link Transaction.serializeToSafeJSON} and 
 * {@link Transaction.serializeToObject} 
 * functions for processing (signing) in external systems.
 * 
 * Once the transaction is signed, it can be deserialized
 * into {@link Transaction} using {@link Transaction.deserializeFromJSON}
 * and {@link Transaction.deserializeFromSafeJSON} functions. 
 * 
 * @see {@link Transaction},
 * {@link ISerializableTransactionInput},
 * {@link ISerializableTransactionOutput},
 * {@link ISerializableUtxoEntry}
 * 
 * @category Wallet SDK
 */
export interface ISerializableTransaction {
    id? : HexString;
    version: number;
    inputs: ISerializableTransactionInput[];
    outputs: ISerializableTransactionOutput[];
    lockTime: bigint;
    subnetworkId: HexString;
    gas: bigint;
    payload: HexString;
}




/**
 * Interface defines the structure of a Script Public Key.
 * 
 * @category Consensus
 */
export interface IScriptPublicKey {
    script: HexString;
}



            /**
             * Mempool entry.
             * 
             * @category Node RPC
             */
            export interface IMempoolEntry {
                fee : bigint;
                transaction : ITransaction;
                isOrphan : boolean;
            }
        


/**
* Return interface for the {@link RpcClient.unban} RPC method.
*
*
* @category Node RPC
*/
    export interface IUnbanResponse { }
    


/**
* Argument interface for the {@link RpcClient.unban} RPC method.
*
*
* @category Node RPC
*/
    export interface IUnbanRequest {
/**
* IPv4 or IPv6 address to unban.
*/
        ip : string;
    }
    


/**
* Return interface for the {@link RpcClient.submitTransaction} RPC method.
*
*
* @category Node RPC
*/
    export interface ISubmitTransactionResponse {
        transactionId : HexString;
    }
    


/**
* Argument interface for the {@link RpcClient.submitTransaction} RPC method.
* Submit transaction to the node.
*
* @category Node RPC
*/
    export interface ISubmitTransactionRequest {
        transaction : Transaction,
        allowOrphan? : boolean
    }
    


/**
* Return interface for the {@link RpcClient.submitBlock} RPC method.
*
*
* @category Node RPC
*/
    export interface ISubmitBlockResponse {
        report : ISubmitBlockReport;
    }
    


    /**
     * 
     * @category Node RPC
     */
    export enum SubmitBlockRejectReason {
        /**
         * The block is invalid.
         */
        BlockInvalid = "BlockInvalid",
        /**
         * The node is not synced.
         */
        IsInIBD = "IsInIBD",
        /**
         * Route is full.
         */
        RouteIsFull = "RouteIsFull",
    }

    /**
     * 
     * @category Node RPC
     */
    export interface ISubmitBlockReport {
        type : "success" | "reject";
        reason? : SubmitBlockRejectReason;
    }



/**
* Argument interface for the {@link RpcClient.submitBlock} RPC method.
*
*
* @category Node RPC
*/
    export interface ISubmitBlockRequest {
        block : IBlock;
        allowNonDAABlocks: boolean;
    }
    


/**
* Return interface for the {@link RpcClient.resolveFinalityConflict} RPC method.
*
*
* @category Node RPC
*/
    export interface IResolveFinalityConflictResponse { }
    


/**
* Argument interface for the {@link RpcClient.resolveFinalityConflict} RPC method.
*
*
* @category Node RPC
*/
    export interface IResolveFinalityConflictRequest {
        finalityBlockHash: HexString;
    }
    


/**
* Return interface for the {@link RpcClient.getVirtualChainFromBlock} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetVirtualChainFromBlockResponse {
        removedChainBlockHashes : HexString[];
        addedChainBlockHashes : HexString[];
        acceptedTransactionIds : IAcceptedTransactionIds[];
    }
    


/**
* Argument interface for the {@link RpcClient.getVirtualChainFromBlock} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetVirtualChainFromBlockRequest {
        startHash : HexString;
        includeAcceptedTransactionIds: boolean;
    }
    


/**
* Return interface for the {@link RpcClient.getUtxosByAddresses} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetUtxosByAddressesResponse {
        entries : IUtxoEntry[];
    }
    


/**
* Argument interface for the {@link RpcClient.getUtxosByAddresses} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetUtxosByAddressesRequest { 
        addresses : Address[] | string[]
    }
    


/**
* Return interface for the {@link RpcClient.getSubnetwork} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetSubnetworkResponse {
        gasLimit : bigint;
    }
    


/**
* Argument interface for the {@link RpcClient.getSubnetwork} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetSubnetworkRequest {
        subnetworkId : HexString;
    }
    


/**
* Return interface for the {@link RpcClient.getMempoolEntry} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetMempoolEntryResponse {
        mempoolEntry : IMempoolEntry;
    }
    


/**
* Argument interface for the {@link RpcClient.getMempoolEntry} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetMempoolEntryRequest {
        transactionId : HexString;
        includeOrphanPool? : boolean;
        filterTransactionPool? : boolean;
    }
    


/**
* Return interface for the {@link RpcClient.getMempoolEntriesByAddresses} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetMempoolEntriesByAddressesResponse {
        entries : IMempoolEntry[];
    }
    


/**
* Argument interface for the {@link RpcClient.getMempoolEntriesByAddresses} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetMempoolEntriesByAddressesRequest {
        addresses : Address[] | string[];
        includeOrphanPool? : boolean;
        filterTransactionPool? : boolean;
    }
    


/**
* Return interface for the {@link RpcClient.getMempoolEntries} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetMempoolEntriesResponse {
        mempoolEntries : IMempoolEntry[];
    }
    


/**
* Argument interface for the {@link RpcClient.getMempoolEntries} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetMempoolEntriesRequest {
        includeOrphanPool? : boolean;
        filterTransactionPool? : boolean;
    }
    


/**
* Return interface for the {@link RpcClient.getHeaders} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetHeadersResponse {
        headers : IHeader[];
    }
    


/**
* Argument interface for the {@link RpcClient.getHeaders} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetHeadersRequest {
        startHash : HexString;
        limit : bigint;
        isAscending : boolean;
    }
    


/**
* Return interface for the {@link RpcClient.getCurrentNetwork} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetCurrentNetworkResponse {
        network : string;
    }
    


/**
* Argument interface for the {@link RpcClient.getCurrentNetwork} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetCurrentNetworkRequest { }
    


/**
* Return interface for the {@link RpcClient.getDaaScoreTimestampEstimate} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetDaaScoreTimestampEstimateResponse {
        timestamps : bigint[];
    }
    


/**
* Argument interface for the {@link RpcClient.getDaaScoreTimestampEstimate} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetDaaScoreTimestampEstimateRequest {
        daaScores : bigint[];
    }
    


/**
* Return interface for the {@link RpcClient.getBlockTemplate} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetBlockTemplateResponse {
        block : IBlock;
    }
    


/**
* Argument interface for the {@link RpcClient.getBlockTemplate} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetBlockTemplateRequest {
        payAddress : Address | string;
/**
* `extraData` can contain a user-supplied plain text or a byte array represented by `Uint8array`.
*/
        extraData? : string | Uint8Array;
    }
    


/**
* Return interface for the {@link RpcClient.getBlocks} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetBlocksResponse {
        blockHashes : HexString[];
        blocks : IBlock[];
    }
    


/**
* Argument interface for the {@link RpcClient.getBlocks} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetBlocksRequest {
        lowHash? : HexString;
        includeBlocks : boolean;
        includeTransactions : boolean;
    }
    


/**
* Return interface for the {@link RpcClient.getBlock} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetBlockResponse {
        block : IBlock;
    }
    


/**
* Argument interface for the {@link RpcClient.getBlock} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetBlockRequest {
        hash : HexString;
        includeTransactions : boolean;
    }
    


/**
* Return interface for the {@link RpcClient.getBalancesByAddresses} RPC method.
*
*
* @category Node RPC
*/
    export interface IBalancesByAddressesEntry {
        address : Address;
        balance : bigint;
    }
/**
*
*
* @category Node RPC
*/
    export interface IGetBalancesByAddressesResponse {
        entries : IBalancesByAddressesEntry[];
    }
    


/**
* Argument interface for the {@link RpcClient.getBalancesByAddresses} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetBalancesByAddressesRequest {
        addresses : Address[] | string[];
    }
    


/**
* Return interface for the {@link RpcClient.getBalanceByAddress} RPC method.
*
*
* @category Node RPC
*/
    export interface IGetBalanceByAddressResponse {
        balance : bigint;
    }
    


/**
* Argument interface for the {@link RpcClient.getBalanceByAddress} RPC method.
* @category Node RPC
*/
    export interface IGetBalanceByAddressRequest {
        address : Address | string;
    }
    


/**
* Return interface for the {@link RpcClient.estimateNetworkHashesPerSecond} RPC method.
* @category Node RPC
*/
    export interface IEstimateNetworkHashesPerSecondResponse {
        networkHashesPerSecond : bigint;
    }
    


/**
* Argument interface for the {@link RpcClient.estimateNetworkHashesPerSecond} RPC method.
* @category Node RPC
*/
    export interface IEstimateNetworkHashesPerSecondRequest {
        windowSize : number;
        startHash? : HexString;
    }
    


/**
* Return interface for the {@link RpcClient.ban} RPC method.
*
*
* @category Node RPC
*/
    export interface IBanResponse { }
    


/**
* Argument interface for the {@link RpcClient.ban} RPC method.
*
*
* @category Node RPC
*/
    export interface IBanRequest {
/**
* IPv4 or IPv6 address to ban.
*/
        ip : string;
    }
    


/**
* Return interface for the {@link RpcClient.addPeer} RPC method.
*
*
* @category Node RPC
*/
    export interface IAddPeerResponse { }
    


/**
* Argument interface for the {@link RpcClient.addPeer} RPC method.
*
*
* @category Node RPC
*/
    export interface IAddPeerRequest {
        peerAddress : INetworkAddress;
        isPermanent : boolean;
    }
    


/**
* Return interface for the {@link RpcClient.getSyncStatus} RPC method.
* @category Node RPC
*/
    export interface IGetSyncStatusResponse {
        isSynced : boolean;
    }
    


/**
* Argument interface for the {@link RpcClient.getSyncStatus} RPC method.
* @category Node RPC
*/
    export interface IGetSyncStatusRequest { }
    


/**
* Return interface for the {@link RpcClient.getServerInfo} RPC method.
* @category Node RPC
*/
    export interface IGetServerInfoResponse {
        rpcApiVersion : number[];
        serverVersion : string;
        networkId : string;
        hasUtxoIndex : boolean;
        isSynced : boolean;
        virtualDaaScore : bigint;
    }
    


/**
* Argument interface for the {@link RpcClient.getServerInfo} RPC method.
* @category Node RPC
*/
    export interface IGetServerInfoRequest { }
    


/**
* Return interface for the {@link RpcClient.shutdown} RPC method.
* @category Node RPC
*/
    export interface IShutdownResponse { }
    


/**
* Argument interface for the {@link RpcClient.shutdown} RPC method.
* @category Node RPC
*/
    export interface IShutdownRequest { }
    


/**
* Return interface for the {@link RpcClient.getSinkBlueScore} RPC method.
* @category Node RPC
*/
    export interface IGetSinkBlueScoreResponse {
        blueScore : bigint;
    }
    


/**
* Argument interface for the {@link RpcClient.getSinkBlueScore} RPC method.
* @category Node RPC
*/
    export interface IGetSinkBlueScoreRequest { }
    


/**
* Return interface for the {@link RpcClient.getSink} RPC method.
* @category Node RPC
*/
    export interface IGetSinkResponse {
        sink : HexString;
    }
    


/**
* Argument interface for the {@link RpcClient.getSink} RPC method.
* @category Node RPC
*/
    export interface IGetSinkRequest { }
    


/**
* Return interface for the {@link RpcClient.getMetrics} RPC method.
* @category Node RPC
*/
    export interface IGetMetricsResponse {
        [key: string]: any
    }
    


/**
* Argument interface for the {@link RpcClient.getMetrics} RPC method.
* @category Node RPC
*/
    export interface IGetMetricsRequest { }
    


/**
* Return interface for the {@link RpcClient.getPeerAddresses} RPC method.
* @category Node RPC
*/
    export interface IGetPeerAddressesResponse {
        [key: string]: any
    }
    


/**
* Argument interface for the {@link RpcClient.getPeerAddresses} RPC method.
* @category Node RPC
*/
    export interface IGetPeerAddressesRequest { }
    


/**
* Return interface for the {@link RpcClient.getInfo} RPC method.
* @category Node RPC
*/
    export interface IGetInfoResponse {
        p2pId : string;
        mempoolSize : bigint;
        serverVersion : string;
        isUtxoIndexed : boolean;
        isSynced : boolean;
/** GRPC ONLY */
        hasNotifyCommand : boolean;
/** GRPC ONLY */
        hasMessageId : boolean;
    }
    


/**
* Argument interface for the {@link RpcClient.getInfo} RPC method.
* @category Node RPC
*/
    export interface IGetInfoRequest { }
    


/**
* Return interface for the {@link RpcClient.getConnectedPeerInfo} RPC method.
* @category Node RPC
*/
    export interface IGetConnectedPeerInfoResponse {
        [key: string]: any
    }
    


/**
* Argument interface for the {@link RpcClient.getConnectedPeerInfo} RPC method.
* @category Node RPC
*/
    export interface IGetConnectedPeerInfoRequest { }
    


/**
* Return interface for the {@link RpcClient.getCoinSupply} RPC method.
* @category Node RPC
*/
    export interface IGetCoinSupplyResponse {
        maxSompi: bigint;
        circulatingSompi: bigint;
    }
    


/**
* Argument interface for the {@link RpcClient.getCoinSupply} RPC method.
* @category Node RPC
*/
    export interface IGetCoinSupplyRequest { }
    


/**
* Return interface for the {@link RpcClient.getBlockDagInfo} RPC method.
* @category Node RPC
*/
    export interface IGetBlockDagInfoResponse {
        network: string;
        blockCount: bigint;
        headerCount: bigint;
        tipHashes: HexString[];
        difficulty: number;
        pastMedianTime: bigint;
        virtualParentHashes: HexString[];
        pruningPointHash: HexString;
        virtualDaaScore: bigint;
        sink: HexString;
    }
    


/**
* Argument interface for the {@link RpcClient.getBlockDagInfo} RPC method.
* @category Node RPC
*/
    export interface IGetBlockDagInfoRequest { }
    


/**
* Return interface for the {@link RpcClient.getBlockCount} RPC method.
* @category Node RPC
*/
    export interface IGetBlockCountResponse {
        headerCount : bigint;
        blockCount : bigint;
    }
    


/**
* Argument interface for the {@link RpcClient.getBlockCount} RPC method.
* @category Node RPC
*/
    export interface IGetBlockCountRequest { }
    


/**
* Return interface for the {@link RpcClient.ping} RPC method.
* @category Node RPC
*/
    export interface IPingResponse {
        message?: string;
    }
    


/**
* Argument interface for the {@link RpcClient.ping} RPC method.
* @category Node RPC
*/
    export interface IPingRequest {
        message?: string;
    }
    


    /**
     * Accepted transaction IDs.
     * 
     * @category Node RPC
     */
    export interface IAcceptedTransactionIds {
        acceptingBlockHash : HexString;
        acceptedTransactionIds : HexString[];
    }



        /**
         * Interface defining the structure of a block.
         * 
         * @category Consensus
         */
        export interface IBlock {
            header: IHeader;
            transactions: ITransaction[];
            verboseData?: IBlockVerboseData;
        }

        /**
         * Interface defining the structure of a block verbose data.
         * 
         * @category Node RPC
         */
        export interface IBlockVerboseData {
            hash: HexString;
            difficulty: number;
            selectedParentHash: HexString;
            transactionIds: HexString[];
            isHeaderOnly: boolean;
            blueScore: number;
            childrenHashes: HexString[];
            mergeSetBluesHashes: HexString[];
            mergeSetRedsHashes: HexString[];
            isChainBlock: boolean;
        }
        


    /**
     * Generic network address representation.
     * 
     * @category General
     */
    export interface INetworkAddress {
        /**
         * IPv4 or IPv6 address.
         */
        ip: string;
        /**
         * Optional port number.
         */
        port?: number;
    }



/**
 * A string containing a hexadecimal representation of the data (typically representing for IDs or Hashes).
 * 
 * @category General
 */ 
export type HexString = string;



    /**
     * New block template notification event is produced when a new block
     * template is generated for mining in the Kaspa BlockDAG.
     * 
     * @category Node RPC
     */
    export interface INewBlockTemplate {
        [key: string]: any;
    }
    


    /**
     * Pruning point UTXO set override notification event is produced when the
     * UTXO set override for the pruning point changes in the Kaspa BlockDAG.
     * 
     * @category Node RPC
     */
    export interface IPruningPointUtxoSetOverride {
        [key: string]: any;
    }
    


    /**
     * Virtual DAA score changed notification event is produced when the virtual
     * Difficulty Adjustment Algorithm (DAA) score changes in the Kaspa BlockDAG.
     * 
     * @category Node RPC
     */
    export interface IVirtualDaaScoreChanged {
        [key: string]: any;
    }
    


    /**
     * Sink blue score changed notification event is produced when the blue
     * score of the sink block changes in the Kaspa BlockDAG.
     * 
     * @category Node RPC
     */
    export interface ISinkBlueScoreChanged {
        [key: string]: any;
    }
    


    /**
     * UTXOs changed notification event is produced when the set
     * of unspent transaction outputs (UTXOs) changes in the
     * Kaspa BlockDAG. The event notification is scoped to the
     * monitored list of addresses specified during the subscription.
     * 
     * @category Node RPC
     */
    export interface IUtxosChanged {
        [key: string]: any;
    }
    


    /**
     * Finality conflict resolved notification event is produced when a finality
     * conflict in the Kaspa BlockDAG is resolved.
     * 
     * @category Node RPC
     */
    export interface IFinalityConflictResolved {
        [key: string]: any;
    }
    


    /**
     * Finality conflict notification event is produced when a finality
     * conflict occurs in the Kaspa BlockDAG.
     * 
     * @category Node RPC
     */
    export interface IFinalityConflict {
        [key: string]: any;
    }
    


    /**
     * Virtual chain changed notification event is produced when the virtual
     * chain changes in the Kaspa BlockDAG.
     * 
     * @category Node RPC
     */
    export interface IVirtualChainChanged {
        [key: string]: any;
    }
    


    /**
     * Block added notification event is produced when a new
     * block is added to the Kaspa BlockDAG.
     * 
     * @category Node RPC
     */
    export interface IBlockAdded {
        [key: string]: any;
    }
    



/**
 * RPC notification events.
 * 
 * @see {RpcClient.addEventListener}, {RpcClient.removeEventListener}
 */
export enum RpcEventType {
    Connect = "connect",
    Disconnect = "disconnect",
    BlockAdded = "block-added",
    VirtualChainChanged = "virtual-chain-changed",
    FinalityConflict = "finality-conflict",
    FinalityConflictResolved = "finality-conflict-resolved",
    UtxosChanged = "utxos-changed",
    SinkBlueScoreChanged = "sink-blue-score-changed",
    VirtualDaaScoreChanged = "virtual-daa-score-changed",
    PruningPointUtxoSetOverride = "pruning-point-utxo-set-override",
    NewBlockTemplate = "new-block-template",
}

/**
 * RPC notification data payload.
 * 
 * @category Node RPC
 */
export type RpcEventData = IBlockAdded 
    | IVirtualChainChanged 
    | IFinalityConflict 
    | IFinalityConflictResolved 
    | IUtxosChanged 
    | ISinkBlueScoreChanged 
    | IVirtualDaaScoreChanged 
    | IPruningPointUtxoSetOverride 
    | INewBlockTemplate;

/**
 * RPC notification event data map.
 * 
 * @category Node RPC
 */
export type RpcEventMap = {
    "connect" : undefined,
    "disconnect" : undefined,
    "block-added" : IBlockAdded,
    "virtual-chain-changed" : IVirtualChainChanged,
    "finality-conflict" : IFinalityConflict,
    "finality-conflict-resolved" : IFinalityConflictResolved,
    "utxos-changed" : IUtxosChanged,
    "sink-blue-score-changed" : ISinkBlueScoreChanged,
    "virtual-daa-score-changed" : IVirtualDaaScoreChanged,
    "pruning-point-utxo-set-override" : IPruningPointUtxoSetOverride,
    "new-block-template" : INewBlockTemplate,
}

/**
 * RPC notification event.
 * 
 * @category Node RPC
 */
export type RpcEvent = {
    [K in keyof RpcEventMap]: { event: K, data: RpcEventMap[K] }
}[keyof RpcEventMap];

/**
 * RPC notification callback type.
 * 
 * This type is used to define the callback function that is called when an RPC notification is received.
 * 
 * @see {@link RpcClient.subscribeVirtualDaaScoreChanged},
 * {@link RpcClient.subscribeUtxosChanged}, 
 * {@link RpcClient.subscribeVirtualChainChanged},
 * {@link RpcClient.subscribeBlockAdded},
 * {@link RpcClient.subscribeFinalityConflict},
 * {@link RpcClient.subscribeFinalityConflictResolved},
 * {@link RpcClient.subscribeSinkBlueScoreChanged},
 * {@link RpcClient.subscribePruningPointUtxoSetOverride},
 * {@link RpcClient.subscribeNewBlockTemplate},
 * 
 * @category Node RPC
 */
export type RpcEventCallback = (event: RpcEvent) => void;




        interface RpcClient {
            /**
            * @param {RpcEventCallback} callback
            */
            addEventListener(callback:RpcEventCallback): void;
            /**
            * @param {RpcEventType} event
            * @param {RpcEventCallback} [callback]
            */
            addEventListener<M extends keyof RpcEventMap>(
                event: M,
                callback: (eventData: RpcEventMap[M]) => void
            )
        }


    /**
     * RPC client configuration options
     * 
     * @category Node RPC
     */
    export interface IRpcConfig {
        /**
         * An instance of the {@link Resolver} class to use for an automatic public node lookup.
         * If supplying a resolver, the `url` property is ignored.
         */
        resolver? : Resolver,
        /**
         * URL for wRPC node endpoint
         */
        url?: string;
        /**
         * RPC encoding: `borsh` or `json` (default is `borsh`)
         */
        encoding?: Encoding;
        /**
         * Network identifier: `mainnet`, `testnet-10` etc.
         * `networkId` is required when using a resolver.
         */
        networkId?: NetworkId | string;
    }
    


    /**
     * RPC Resolver connection options
     * 
     * @category Node RPC
     */
    export interface IResolverConnect {
        /**
         * RPC encoding: `borsh` (default) or `json`
         */
        encoding?: Encoding | string;
        /**
         * Network identifier: `mainnet` or `testnet-11` etc.
         */
        networkId?: NetworkId | string;
    }
    


    /**
     * RPC Resolver configuration options
     * 
     * @category Node RPC
     */
    export interface IResolverConfig {
        /**
         * Optional URLs for one or multiple resolvers.
         */
        urls?: string[];
    }
    


/**
 * Interface for configuring workflow-rs WASM32 bindings.
 * 
 * @category General
 */
export interface IWASM32BindingsConfig {
    /**
     * This option can be used to disable the validation of class names
     * for instances of classes exported by Rust WASM32 when passing
     * these classes to WASM32 functions.
     * 
     * This can be useful to programmatically disable checks when using
     * a bundler that mangles class symbol names.
     */
    validateClassNames : boolean;
}




        /**
         * `ConnectOptions` is used to configure the `WebSocket` connectivity behavior.
         * 
         * @category WebSocket
         */
        export interface IConnectOptions {
            /**
             * Indicates if the `async fn connect()` method should return immediately
             * or wait for connection to occur or fail before returning.
             * (default is `true`)
             */
            blockAsyncConnect? : boolean,
            /**
             * ConnectStrategy used to configure the retry or fallback behavior.
             * In retry mode, the WebSocket will continuously attempt to connect to the server.
             * (default is {link ConnectStrategy.Retry}).
             */
            strategy?: ConnectStrategy | string,
            /** 
             * A custom URL that will change the current URL of the WebSocket.
             * If supplied, the URL will override the use of resolver.
             */
            url?: string,
            /**
             * A custom connection timeout in milliseconds.
             */
            timeoutDuration?: number,
            /** 
             * A custom retry interval in milliseconds.
             */
            retryInterval?: number,
        }
        



        /**
         * `WebSocketConfig` is used to configure the `WebSocket`.
         * 
         * @category WebSocket
         */
        export interface IWebSocketConfig {
            /** Maximum size of the WebSocket message. */
            maxMessageSize: number,
            /** Maximum size of the WebSocket frame. */
            maxFrameSize: number,
        }
        

/**
*
* Abortable trigger wraps an `Arc<AtomicBool>`, which can be cloned
* to signal task terminating using an atomic bool.
*
* ```text
* let abortable = Abortable::default();
* let result = my_task(abortable).await?;
* // ... elsewhere
* abortable.abort();
* ```
*
* @category General
*/
export class Abortable {
  free(): void;
/**
*/
  constructor();
/**
* @returns {boolean}
*/
  isAborted(): boolean;
/**
*/
  abort(): void;
/**
*/
  check(): void;
/**
*/
  reset(): void;
}
/**
* Error emitted by [`Abortable`].
* @category General
*/
export class Aborted {
  free(): void;
}
/**
* Kaspa `Address` struct that serializes to and from an address format string: `kaspa:qz0s...t8cv`.
* @category Address
*/
export class Address {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {string} address
*/
  constructor(address: string);
/**
* @param {string} address
* @returns {boolean}
*/
  static validate(address: string): boolean;
/**
* Convert an address to a string.
* @returns {string}
*/
  toString(): string;
/**
* @param {number} n
* @returns {string}
*/
  short(n: number): string;
/**
*/
  readonly payload: string;
/**
*/
  readonly prefix: string;
/**
*/
  setPrefix: string;
/**
*/
  readonly version: string;
}
/**
* @category General
*/
export class Hash {
  free(): void;
/**
* @param {string} hex_str
*/
  constructor(hex_str: string);
/**
* @returns {string}
*/
  toString(): string;
}
/**
* @category Consensus
*/
export class Header {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {IHeader | Header} js_value
*/
  constructor(js_value: IHeader | Header);
/**
* Finalizes the header and recomputes (updates) the header hash
* @return { String } header hash
* @returns {string}
*/
  finalize(): string;
/**
* Obtain `JSON` representation of the header. JSON representation
* should be obtained using WASM, to ensure proper serialization of
* big integers.
* @returns {string}
*/
  asJSON(): string;
/**
* @returns {string}
*/
  getBlueWorkAsHex(): string;
/**
*/
  acceptedIdMerkleRoot: any;
/**
*/
  bits: number;
/**
*/
  blueScore: bigint;
/**
*/
  blueWork: any;
/**
*/
  daaScore: bigint;
/**
*/
  readonly hash: string;
/**
*/
  hashMerkleRoot: any;
/**
*/
  nonce: bigint;
/**
*/
  parentsByLevel: any;
/**
*/
  pruningPoint: any;
/**
*/
  timestamp: bigint;
/**
*/
  utxoCommitment: any;
/**
*/
  version: number;
}
/**
*
* NetworkId is a unique identifier for a kaspa network instance.
* It is composed of a network type and an optional suffix.
*
* @category Consensus
*/
export class NetworkId {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {any} value
*/
  constructor(value: any);
/**
* @returns {string}
*/
  toString(): string;
/**
* @returns {string}
*/
  addressPrefix(): string;
/**
*/
  readonly id: string;
/**
*/
  suffix?: number;
/**
*/
  type: NetworkType;
}
/**
*
* Data structure representing a Node connection endpoint
* as provided by the {@link Resolver}.
*
* @category Node RPC
*/
export class NodeDescriptor {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* The unique identifier of the node.
*/
  id: string;
/**
* Optional name of the node provider.
*/
  provider_name?: string;
/**
* Optional site URL of the node provider.
*/
  provider_url?: string;
/**
* The URL of the node WebSocket (wRPC URL).
*/
  url: string;
}
/**
*
* Resolver is a client for obtaining public Kaspa wRPC URL.
*
* Resolver queries a list of public Kaspa Resolver URLs using HTTP to fetch
* wRPC endpoints for the given encoding, network identifier and other
* parameters. It then provides this information to the {@link RpcClient}.
*
* Each time {@link RpcClient} disconnects, it will query the resolver
* to fetch a new wRPC URL.
*
* ```javascript
* // using integrated public URLs
* let rpc = RpcClient({
*     resolver: new Resolver(),
*     networkId : "mainnet"
* });
*
* // specifying custom resolver URLs
* let rpc = RpcClient({
*     resolver: new Resolver({urls: ["<resolver-url>",...]}),
*     networkId : "mainnet"
* });
* ```
*
* @see {@link IResolverConfig}, {@link IResolverConnect}, {@link RpcClient}
* @category Node RPC
*/
export class Resolver {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Fetches a public Kaspa wRPC endpoint for the given encoding and network identifier.
* @see {@link Encoding}, {@link NetworkId}, {@link Node}
* @param {Encoding} encoding
* @param {NetworkId | string} network_id
* @returns {Promise<NodeDescriptor>}
*/
  getNode(encoding: Encoding, network_id: NetworkId | string): Promise<NodeDescriptor>;
/**
* Fetches a public Kaspa wRPC endpoint URL for the given encoding and network identifier.
* @see {@link Encoding}, {@link NetworkId}
* @param {Encoding} encoding
* @param {NetworkId | string} network_id
* @returns {Promise<string>}
*/
  getUrl(encoding: Encoding, network_id: NetworkId | string): Promise<string>;
/**
* Connect to a public Kaspa wRPC endpoint for the given encoding and network identifier
* supplied via {@link IResolverConnect} interface.
* @see {@link IResolverConnect}, {@link RpcClient}
* @param {IResolverConnect | NetworkId | string} options
* @returns {Promise<RpcClient>}
*/
  connect(options: IResolverConnect | NetworkId | string): Promise<RpcClient>;
/**
* Creates a new Resolver client with the given
* configuration supplied as {@link IResolverConfig}
* interface. If not supplied, the default configuration
* containing a list of community-operated resolvers
* will be used.
* @param {IResolverConfig | string[] | undefined} [args]
*/
  constructor(args?: IResolverConfig | string[]);
/**
* List of public Kaspa Resolver URLs.
*/
  readonly urls: string[];
}
/**
*
*
* Kaspa RPC client uses ([wRPC](https://github.com/workflow-rs/workflow-rs/tree/master/rpc))
* interface to connect directly with Kaspa Node. wRPC supports
* two types of encodings: `borsh` (binary, default) and `json`.
*
* There are two ways to connect: Directly to any Kaspa Node or to a
* community-maintained public node infrastructure using the {@link Resolver} class.
*
* **Connecting to a public node using a resolver**
*
* ```javascript
* let rpc = new RpcClient({
*    resolver : new Resolver(),
*    networkId : "mainnet",
* });
*
* await rpc.connect();
* ```
*
* **Connecting to a Kaspa Node directly**
*
* ```javascript
* let rpc = new RpcClient({
*    // if port is not provided it will default
*    // to the default port for the networkId
*    url : "127.0.0.1",
*    networkId : "mainnet",
* });
* ```
*
* **Example usage**
*
* ```javascript
*
* // Create a new RPC client with a URL
* let rpc = new RpcClient({ url : "wss://<node-wrpc-address>" });
*
* // Create a new RPC client with a resolver
* // (networkId is required when using a resolver)
* let rpc = new RpcClient({
*     resolver : new Resolver(),
*     networkId : "mainnet",
* });
*
* rpc.addEventListener("connect", async (event) => {
*     console.log("Connected to", rpc.url);
*     await rpc.subscribeDaaScore();
* });
*
* rpc.addEventListener("disconnect", (event) => {
*     console.log("Disconnected from", rpc.url);
* });
*
* try {
*     await rpc.connect();
* } catch(err) {
*     console.log("Error connecting:", err);
* }
*
* ```
*
* You can register event listeners to receive notifications from the RPC client
* using {@link RpcClient.addEventListener} and {@link RpcClient.removeEventListener} functions.
*
* **IMPORTANT:** If RPC is disconnected, upon reconnection you do not need
* to re-register event listeners, but your have to re-subscribe for Kaspa node
* notifications:
*
* ```typescript
* rpc.addEventListener("connect", async (event) => {
*     console.log("Connected to", rpc.url);
*     // re-subscribe each time we connect
*     await rpc.subscribeDaaScore();
*     // ... perform wallet address subscriptions
* });
*
* ```
*
* If using NodeJS, it is important that {@link RpcClient.disconnect} is called before
* the process exits to ensure that the WebSocket connection is properly closed.
* Failure to do this will prevent the process from exiting.
*
* @category Node RPC
*/
export class RpcClient {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Retrieves the current number of blocks in the Kaspa BlockDAG.
* This is not a block count, not a "block height" and can not be
* used for transaction validation.
* Returned information: Current block count.
*@see {@link IGetBlockCountRequest}, {@link IGetBlockCountResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetBlockCountRequest | undefined} [request]
* @returns {Promise<IGetBlockCountResponse>}
*/
  getBlockCount(request?: IGetBlockCountRequest): Promise<IGetBlockCountResponse>;
/**
* Provides information about the Directed Acyclic Graph (DAG)
* structure of the Kaspa BlockDAG.
* Returned information: Number of blocks in the DAG,
* number of tips in the DAG, hash of the selected parent block,
* difficulty of the selected parent block, selected parent block
* blue score, selected parent block time.
*@see {@link IGetBlockDagInfoRequest}, {@link IGetBlockDagInfoResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetBlockDagInfoRequest | undefined} [request]
* @returns {Promise<IGetBlockDagInfoResponse>}
*/
  getBlockDagInfo(request?: IGetBlockDagInfoRequest): Promise<IGetBlockDagInfoResponse>;
/**
* Returns the total current coin supply of Kaspa network.
* Returned information: Total coin supply.
*@see {@link IGetCoinSupplyRequest}, {@link IGetCoinSupplyResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetCoinSupplyRequest | undefined} [request]
* @returns {Promise<IGetCoinSupplyResponse>}
*/
  getCoinSupply(request?: IGetCoinSupplyRequest): Promise<IGetCoinSupplyResponse>;
/**
* Retrieves information about the peers connected to the Kaspa node.
* Returned information: Peer ID, IP address and port, connection
* status, protocol version.
*@see {@link IGetConnectedPeerInfoRequest}, {@link IGetConnectedPeerInfoResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetConnectedPeerInfoRequest | undefined} [request]
* @returns {Promise<IGetConnectedPeerInfoResponse>}
*/
  getConnectedPeerInfo(request?: IGetConnectedPeerInfoRequest): Promise<IGetConnectedPeerInfoResponse>;
/**
* Retrieves general information about the Kaspa node.
* Returned information: Version of the Kaspa node, protocol
* version, network identifier.
* This call is primarily used by gRPC clients.
* For wRPC clients, use {@link RpcClient.getServerInfo}.
*@see {@link IGetInfoRequest}, {@link IGetInfoResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetInfoRequest | undefined} [request]
* @returns {Promise<IGetInfoResponse>}
*/
  getInfo(request?: IGetInfoRequest): Promise<IGetInfoResponse>;
/**
* Provides a list of addresses of known peers in the Kaspa
* network that the node can potentially connect to.
* Returned information: List of peer addresses.
*@see {@link IGetPeerAddressesRequest}, {@link IGetPeerAddressesResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetPeerAddressesRequest | undefined} [request]
* @returns {Promise<IGetPeerAddressesResponse>}
*/
  getPeerAddresses(request?: IGetPeerAddressesRequest): Promise<IGetPeerAddressesResponse>;
/**
* Retrieves various metrics and statistics related to the
* performance and status of the Kaspa node.
* Returned information: Memory usage, CPU usage, network activity.
*@see {@link IGetMetricsRequest}, {@link IGetMetricsResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetMetricsRequest | undefined} [request]
* @returns {Promise<IGetMetricsResponse>}
*/
  getMetrics(request?: IGetMetricsRequest): Promise<IGetMetricsResponse>;
/**
* Retrieves the current sink block, which is the block with
* the highest cumulative difficulty in the Kaspa BlockDAG.
* Returned information: Sink block hash, sink block height.
*@see {@link IGetSinkRequest}, {@link IGetSinkResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetSinkRequest | undefined} [request]
* @returns {Promise<IGetSinkResponse>}
*/
  getSink(request?: IGetSinkRequest): Promise<IGetSinkResponse>;
/**
* Returns the blue score of the current sink block, indicating
* the total amount of work that has been done on the main chain
* leading up to that block.
* Returned information: Blue score of the sink block.
*@see {@link IGetSinkBlueScoreRequest}, {@link IGetSinkBlueScoreResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetSinkBlueScoreRequest | undefined} [request]
* @returns {Promise<IGetSinkBlueScoreResponse>}
*/
  getSinkBlueScore(request?: IGetSinkBlueScoreRequest): Promise<IGetSinkBlueScoreResponse>;
/**
* Tests the connection and responsiveness of a Kaspa node.
* Returned information: None.
*@see {@link IPingRequest}, {@link IPingResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IPingRequest | undefined} [request]
* @returns {Promise<IPingResponse>}
*/
  ping(request?: IPingRequest): Promise<IPingResponse>;
/**
* Gracefully shuts down the Kaspa node.
* Returned information: None.
*@see {@link IShutdownRequest}, {@link IShutdownResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IShutdownRequest | undefined} [request]
* @returns {Promise<IShutdownResponse>}
*/
  shutdown(request?: IShutdownRequest): Promise<IShutdownResponse>;
/**
* Retrieves information about the Kaspa server.
* Returned information: Version of the Kaspa server, protocol
* version, network identifier.
*@see {@link IGetServerInfoRequest}, {@link IGetServerInfoResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetServerInfoRequest | undefined} [request]
* @returns {Promise<IGetServerInfoResponse>}
*/
  getServerInfo(request?: IGetServerInfoRequest): Promise<IGetServerInfoResponse>;
/**
* Obtains basic information about the synchronization status of the Kaspa node.
* Returned information: Syncing status.
*@see {@link IGetSyncStatusRequest}, {@link IGetSyncStatusResponse}
*@throws `string` on an RPC error or a server-side error.
* @param {IGetSyncStatusRequest | undefined} [request]
* @returns {Promise<IGetSyncStatusResponse>}
*/
  getSyncStatus(request?: IGetSyncStatusRequest): Promise<IGetSyncStatusResponse>;
/**
* Adds a peer to the Kaspa node's list of known peers.
* Returned information: None.
*@see {@link IAddPeerRequest}, {@link IAddPeerResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IAddPeerRequest} request
* @returns {Promise<IAddPeerResponse>}
*/
  addPeer(request: IAddPeerRequest): Promise<IAddPeerResponse>;
/**
* Bans a peer from connecting to the Kaspa node for a specified duration.
* Returned information: None.
*@see {@link IBanRequest}, {@link IBanResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IBanRequest} request
* @returns {Promise<IBanResponse>}
*/
  ban(request: IBanRequest): Promise<IBanResponse>;
/**
* Estimates the network's current hash rate in hashes per second.
* Returned information: Estimated network hashes per second.
*@see {@link IEstimateNetworkHashesPerSecondRequest}, {@link IEstimateNetworkHashesPerSecondResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IEstimateNetworkHashesPerSecondRequest} request
* @returns {Promise<IEstimateNetworkHashesPerSecondResponse>}
*/
  estimateNetworkHashesPerSecond(request: IEstimateNetworkHashesPerSecondRequest): Promise<IEstimateNetworkHashesPerSecondResponse>;
/**
* Retrieves the balance of a specific address in the Kaspa BlockDAG.
* Returned information: Balance of the address.
*@see {@link IGetBalanceByAddressRequest}, {@link IGetBalanceByAddressResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetBalanceByAddressRequest} request
* @returns {Promise<IGetBalanceByAddressResponse>}
*/
  getBalanceByAddress(request: IGetBalanceByAddressRequest): Promise<IGetBalanceByAddressResponse>;
/**
* Retrieves balances for multiple addresses in the Kaspa BlockDAG.
* Returned information: Balances of the addresses.
*@see {@link IGetBalancesByAddressesRequest}, {@link IGetBalancesByAddressesResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetBalancesByAddressesRequest | Address[] | string[]} request
* @returns {Promise<IGetBalancesByAddressesResponse>}
*/
  getBalancesByAddresses(request: IGetBalancesByAddressesRequest | Address[] | string[]): Promise<IGetBalancesByAddressesResponse>;
/**
* Retrieves a specific block from the Kaspa BlockDAG.
* Returned information: Block information.
*@see {@link IGetBlockRequest}, {@link IGetBlockResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetBlockRequest} request
* @returns {Promise<IGetBlockResponse>}
*/
  getBlock(request: IGetBlockRequest): Promise<IGetBlockResponse>;
/**
* Retrieves multiple blocks from the Kaspa BlockDAG.
* Returned information: List of block information.
*@see {@link IGetBlocksRequest}, {@link IGetBlocksResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetBlocksRequest} request
* @returns {Promise<IGetBlocksResponse>}
*/
  getBlocks(request: IGetBlocksRequest): Promise<IGetBlocksResponse>;
/**
* Generates a new block template for mining.
* Returned information: Block template information.
*@see {@link IGetBlockTemplateRequest}, {@link IGetBlockTemplateResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetBlockTemplateRequest} request
* @returns {Promise<IGetBlockTemplateResponse>}
*/
  getBlockTemplate(request: IGetBlockTemplateRequest): Promise<IGetBlockTemplateResponse>;
/**
* Retrieves the estimated DAA (Difficulty Adjustment Algorithm)
* score timestamp estimate.
* Returned information: DAA score timestamp estimate.
*@see {@link IGetDaaScoreTimestampEstimateRequest}, {@link IGetDaaScoreTimestampEstimateResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetDaaScoreTimestampEstimateRequest} request
* @returns {Promise<IGetDaaScoreTimestampEstimateResponse>}
*/
  getDaaScoreTimestampEstimate(request: IGetDaaScoreTimestampEstimateRequest): Promise<IGetDaaScoreTimestampEstimateResponse>;
/**
* Retrieves the current network configuration.
* Returned information: Current network configuration.
*@see {@link IGetCurrentNetworkRequest}, {@link IGetCurrentNetworkResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetCurrentNetworkRequest} request
* @returns {Promise<IGetCurrentNetworkResponse>}
*/
  getCurrentNetwork(request: IGetCurrentNetworkRequest): Promise<IGetCurrentNetworkResponse>;
/**
* Retrieves block headers from the Kaspa BlockDAG.
* Returned information: List of block headers.
*@see {@link IGetHeadersRequest}, {@link IGetHeadersResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetHeadersRequest} request
* @returns {Promise<IGetHeadersResponse>}
*/
  getHeaders(request: IGetHeadersRequest): Promise<IGetHeadersResponse>;
/**
* Retrieves mempool entries from the Kaspa node's mempool.
* Returned information: List of mempool entries.
*@see {@link IGetMempoolEntriesRequest}, {@link IGetMempoolEntriesResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetMempoolEntriesRequest} request
* @returns {Promise<IGetMempoolEntriesResponse>}
*/
  getMempoolEntries(request: IGetMempoolEntriesRequest): Promise<IGetMempoolEntriesResponse>;
/**
* Retrieves mempool entries associated with specific addresses.
* Returned information: List of mempool entries.
*@see {@link IGetMempoolEntriesByAddressesRequest}, {@link IGetMempoolEntriesByAddressesResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetMempoolEntriesByAddressesRequest} request
* @returns {Promise<IGetMempoolEntriesByAddressesResponse>}
*/
  getMempoolEntriesByAddresses(request: IGetMempoolEntriesByAddressesRequest): Promise<IGetMempoolEntriesByAddressesResponse>;
/**
* Retrieves a specific mempool entry by transaction ID.
* Returned information: Mempool entry information.
*@see {@link IGetMempoolEntryRequest}, {@link IGetMempoolEntryResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetMempoolEntryRequest} request
* @returns {Promise<IGetMempoolEntryResponse>}
*/
  getMempoolEntry(request: IGetMempoolEntryRequest): Promise<IGetMempoolEntryResponse>;
/**
* Retrieves information about a subnetwork in the Kaspa BlockDAG.
* Returned information: Subnetwork information.
*@see {@link IGetSubnetworkRequest}, {@link IGetSubnetworkResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetSubnetworkRequest} request
* @returns {Promise<IGetSubnetworkResponse>}
*/
  getSubnetwork(request: IGetSubnetworkRequest): Promise<IGetSubnetworkResponse>;
/**
* Retrieves unspent transaction outputs (UTXOs) associated with
* specific addresses.
* Returned information: List of UTXOs.
*@see {@link IGetUtxosByAddressesRequest}, {@link IGetUtxosByAddressesResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetUtxosByAddressesRequest | Address[] | string[]} request
* @returns {Promise<IGetUtxosByAddressesResponse>}
*/
  getUtxosByAddresses(request: IGetUtxosByAddressesRequest | Address[] | string[]): Promise<IGetUtxosByAddressesResponse>;
/**
* Retrieves the virtual chain corresponding to a specified block hash.
* Returned information: Virtual chain information.
*@see {@link IGetVirtualChainFromBlockRequest}, {@link IGetVirtualChainFromBlockResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IGetVirtualChainFromBlockRequest} request
* @returns {Promise<IGetVirtualChainFromBlockResponse>}
*/
  getVirtualChainFromBlock(request: IGetVirtualChainFromBlockRequest): Promise<IGetVirtualChainFromBlockResponse>;
/**
* Resolves a finality conflict in the Kaspa BlockDAG.
* Returned information: None.
*@see {@link IResolveFinalityConflictRequest}, {@link IResolveFinalityConflictResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IResolveFinalityConflictRequest} request
* @returns {Promise<IResolveFinalityConflictResponse>}
*/
  resolveFinalityConflict(request: IResolveFinalityConflictRequest): Promise<IResolveFinalityConflictResponse>;
/**
* Submits a block to the Kaspa network.
* Returned information: None.
*@see {@link ISubmitBlockRequest}, {@link ISubmitBlockResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {ISubmitBlockRequest} request
* @returns {Promise<ISubmitBlockResponse>}
*/
  submitBlock(request: ISubmitBlockRequest): Promise<ISubmitBlockResponse>;
/**
* Submits a transaction to the Kaspa network.
* Returned information: None.
*@see {@link ISubmitTransactionRequest}, {@link ISubmitTransactionResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {ISubmitTransactionRequest} request
* @returns {Promise<ISubmitTransactionResponse>}
*/
  submitTransaction(request: ISubmitTransactionRequest): Promise<ISubmitTransactionResponse>;
/**
* Unbans a previously banned peer, allowing it to connect
* to the Kaspa node again.
* Returned information: None.
*@see {@link IUnbanRequest}, {@link IUnbanResponse}
*@throws `string` on an RPC error, a server-side error or when supplying incorrect arguments.
* @param {IUnbanRequest} request
* @returns {Promise<IUnbanResponse>}
*/
  unban(request: IUnbanRequest): Promise<IUnbanResponse>;
/**
* Manage subscription for a block added notification event.
* Block added notification event is produced when a new
* block is added to the Kaspa BlockDAG.
* @returns {Promise<void>}
*/
  subscribeBlockAdded(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeBlockAdded(): Promise<void>;
/**
* Manage subscription for a finality conflict notification event.
* Finality conflict notification event is produced when a finality
* conflict occurs in the Kaspa BlockDAG.
* @returns {Promise<void>}
*/
  subscribeFinalityConflict(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeFinalityConflict(): Promise<void>;
/**
* Manage subscription for a finality conflict resolved notification event.
* Finality conflict resolved notification event is produced when a finality
* conflict in the Kaspa BlockDAG is resolved.
* @returns {Promise<void>}
*/
  subscribeFinalityConflictResolved(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeFinalityConflictResolved(): Promise<void>;
/**
* Manage subscription for a sink blue score changed notification event.
* Sink blue score changed notification event is produced when the blue
* score of the sink block changes in the Kaspa BlockDAG.
* @returns {Promise<void>}
*/
  subscribeSinkBlueScoreChanged(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeSinkBlueScoreChanged(): Promise<void>;
/**
* Manage subscription for a pruning point UTXO set override notification event.
* Pruning point UTXO set override notification event is produced when the
* UTXO set override for the pruning point changes in the Kaspa BlockDAG.
* @returns {Promise<void>}
*/
  subscribePruningPointUtxoSetOverride(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribePruningPointUtxoSetOverride(): Promise<void>;
/**
* Manage subscription for a new block template notification event.
* New block template notification event is produced when a new block
* template is generated for mining in the Kaspa BlockDAG.
* @returns {Promise<void>}
*/
  subscribeNewBlockTemplate(): Promise<void>;
/**
* @returns {Promise<void>}
*/
  unsubscribeNewBlockTemplate(): Promise<void>;
/**
* Manage subscription for a virtual DAA score changed notification event.
* Virtual DAA score changed notification event is produced when the virtual
* Difficulty Adjustment Algorithm (DAA) score changes in the Kaspa BlockDAG.
* @returns {Promise<void>}
*/
  subscribeVirtualDaaScoreChanged(): Promise<void>;
/**
* Manage subscription for a virtual DAA score changed notification event.
* Virtual DAA score changed notification event is produced when the virtual
* Difficulty Adjustment Algorithm (DAA) score changes in the Kaspa BlockDAG.
* @returns {Promise<void>}
*/
  unsubscribeVirtualDaaScoreChanged(): Promise<void>;
/**
* Subscribe for a UTXOs changed notification event.
* UTXOs changed notification event is produced when the set
* of unspent transaction outputs (UTXOs) changes in the
* Kaspa BlockDAG. The event notification will be scoped to the
* provided list of addresses.
* @param {(Address | string)[]} addresses
* @returns {Promise<void>}
*/
  subscribeUtxosChanged(addresses: (Address | string)[]): Promise<void>;
/**
* Unsubscribe from UTXOs changed notification event
* for a specific set of addresses.
* @param {(Address | string)[]} addresses
* @returns {Promise<void>}
*/
  unsubscribeUtxosChanged(addresses: (Address | string)[]): Promise<void>;
/**
* Manage subscription for a virtual chain changed notification event.
* Virtual chain changed notification event is produced when the virtual
* chain changes in the Kaspa BlockDAG.
* @param {boolean} include_accepted_transaction_ids
* @returns {Promise<void>}
*/
  subscribeVirtualChainChanged(include_accepted_transaction_ids: boolean): Promise<void>;
/**
* Manage subscription for a virtual chain changed notification event.
* Virtual chain changed notification event is produced when the virtual
* chain changes in the Kaspa BlockDAG.
* @param {boolean} include_accepted_transaction_ids
* @returns {Promise<void>}
*/
  unsubscribeVirtualChainChanged(include_accepted_transaction_ids: boolean): Promise<void>;
/**
* @param {Encoding} encoding
* @param {NetworkType | NetworkId | string} network
* @returns {number}
*/
  static defaultPort(encoding: Encoding, network: NetworkType | NetworkId | string): number;
/**
* Constructs an WebSocket RPC URL given the partial URL or an IP, RPC encoding
* and a network type.
*
* # Arguments
*
* * `url` - Partial URL or an IP address
* * `encoding` - RPC encoding
* * `network_type` - Network type
* @param {string} url
* @param {Encoding} encoding
* @param {NetworkId} network
* @returns {string}
*/
  static parseUrl(url: string, encoding: Encoding, network: NetworkId): string;
/**
*
* Create a new RPC client with optional {@link Encoding} and a `url`.
*
* @see {@link IRpcConfig} interface for more details.
* @param {IRpcConfig | undefined} [config]
*/
  constructor(config?: IRpcConfig);
/**
* Set the resolver for the RPC client.
* This setting will take effect on the next connection.
* @param {Resolver} resolver
*/
  setResolver(resolver: Resolver): void;
/**
* Set the network id for the RPC client.
* This setting will take effect on the next connection.
* @param {NetworkId} network_id
*/
  setNetworkId(network_id: NetworkId): void;
/**
* Connect to the Kaspa RPC server. This function starts a background
* task that connects and reconnects to the server if the connection
* is terminated.  Use [`disconnect()`](Self::disconnect()) to
* terminate the connection.
* @see {@link IConnectOptions} interface for more details.
* @param {IConnectOptions | undefined | undefined} [args]
* @returns {Promise<void>}
*/
  connect(args?: IConnectOptions | undefined): Promise<void>;
/**
* Disconnect from the Kaspa RPC server.
* @returns {Promise<void>}
*/
  disconnect(): Promise<void>;
/**
* Start background RPC services (automatically started when invoking {@link RpcClient.connect}).
* @returns {Promise<void>}
*/
  start(): Promise<void>;
/**
* Stop background RPC services (automatically stopped when invoking {@link RpcClient.disconnect}).
* @returns {Promise<void>}
*/
  stop(): Promise<void>;
/**
* Triggers a disconnection on the underlying WebSocket
* if the WebSocket is in connected state.
* This is intended for debug purposes only.
* Can be used to test application reconnection logic.
*/
  triggerAbort(): void;
/**
*
* Unregister an event listener.
* This function will remove the callback for the specified event.
* If the `callback` is not supplied, all callbacks will be
* removed for the specified event.
*
* @see {@link RpcClient.addEventListener}
* @param {RpcEventType | string} event
* @param {RpcEventCallback | undefined} [callback]
*/
  removeEventListener(event: RpcEventType | string, callback?: RpcEventCallback): void;
/**
*
* Unregister a single event listener callback from all events.
*
*
* @param {RpcEventCallback} callback
*/
  clearEventListener(callback: RpcEventCallback): void;
/**
*
* Unregister all notification callbacks for all events.
*/
  removeAllEventListeners(): void;
/**
* The current protocol encoding.
*/
  readonly encoding: string;
/**
* The current connection status of the RPC client.
*/
  readonly isConnected: boolean;
/**
* Optional: Resolver node id.
*/
  readonly nodeId: string | undefined;
/**
* Optional: public node provider name.
*/
  readonly providerName: string | undefined;
/**
* Optional: public node provider URL.
*/
  readonly providerUrl: string | undefined;
/**
* Current rpc resolver
*/
  readonly resolver: Resolver | undefined;
/**
* The current URL of the RPC client.
*/
  readonly url: string | undefined;
}
/**
*
*  ScriptBuilder provides a facility for building custom scripts. It allows
* you to push opcodes, ints, and data while respecting canonical encoding. In
* general it does not ensure the script will execute correctly, however any
* data pushes which would exceed the maximum allowed script engine limits and
* are therefore guaranteed not to execute will not be pushed and will result in
* the Script function returning an error.
*
* @see {@link Opcode}
* @category Consensus
*/
export class ScriptBuilder {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
*/
  constructor();
/**
* Get script bytes represented by a hex string.
* @returns {HexString}
*/
  script(): HexString;
/**
* Drains (empties) the script builder, returning the
* script bytes represented by a hex string.
* @returns {HexString}
*/
  drain(): HexString;
/**
* @param {HexString | Uint8Array} data
* @returns {number}
*/
  static canonicalDataSize(data: HexString | Uint8Array): number;
/**
* Pushes the passed opcode to the end of the script. The script will not
* be modified if pushing the opcode would cause the script to exceed the
* maximum allowed script engine size.
* @param {number} op
* @returns {ScriptBuilder}
*/
  addOp(op: number): ScriptBuilder;
/**
* Adds the passed opcodes to the end of the script.
* Supplied opcodes can be represented as a `Uint8Array` or a `HexString`.
* @param {any} opcodes
* @returns {ScriptBuilder}
*/
  addOps(opcodes: any): ScriptBuilder;
/**
* AddData pushes the passed data to the end of the script. It automatically
* chooses canonical opcodes depending on the length of the data.
*
* A zero length buffer will lead to a push of empty data onto the stack (Op0 = OpFalse)
* and any push of data greater than [`MAX_SCRIPT_ELEMENT_SIZE`](kaspa_txscript::MAX_SCRIPT_ELEMENT_SIZE) will not modify
* the script since that is not allowed by the script engine.
*
* Also, the script will not be modified if pushing the data would cause the script to
* exceed the maximum allowed script engine size [`MAX_SCRIPTS_SIZE`](kaspa_txscript::MAX_SCRIPTS_SIZE).
* @param {HexString | Uint8Array} data
* @returns {ScriptBuilder}
*/
  addData(data: HexString | Uint8Array): ScriptBuilder;
/**
* @param {bigint} value
* @returns {ScriptBuilder}
*/
  addI64(value: bigint): ScriptBuilder;
/**
* @param {bigint} lock_time
* @returns {ScriptBuilder}
*/
  addLockTime(lock_time: bigint): ScriptBuilder;
/**
* @param {bigint} sequence
* @returns {ScriptBuilder}
*/
  addSequence(sequence: bigint): ScriptBuilder;
/**
*/
  readonly data: HexString;
}
/**
* Represents a Kaspad ScriptPublicKey
* @category Consensus
*/
export class ScriptPublicKey {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {number} version
* @param {any} script
*/
  constructor(version: number, script: any);
/**
*/
  readonly script: string;
/**
*/
  version: number;
}
/**
*/
export class SigHashType {
  free(): void;
}
/**
* Represents a Kaspa transaction.
* This is an artificial construct that includes additional
* transaction-related data such as additional data from UTXOs
* used by transaction inputs.
* @category Consensus
*/
export class Transaction {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Serializes the transaction to a pure JavaScript Object.
* The schema of the JavaScript object is defined by {@link ISerializableTransaction}.
* @see {@link ISerializableTransaction}
* @returns {ITransaction}
*/
  serializeToObject(): ITransaction;
/**
* Serializes the transaction to a JSON string.
* The schema of the JSON is defined by {@link ISerializableTransaction}.
* @returns {string}
*/
  serializeToJSON(): string;
/**
* Serializes the transaction to a "Safe" JSON schema where it converts all `bigint` values to `string` to avoid potential client-side precision loss.
* @returns {string}
*/
  serializeToSafeJSON(): string;
/**
* Deserialize the {@link Transaction} Object from a pure JavaScript Object.
* @param {any} js_value
* @returns {Transaction}
*/
  static deserializeFromObject(js_value: any): Transaction;
/**
* Deserialize the {@link Transaction} Object from a JSON string.
* @param {string} json
* @returns {Transaction}
*/
  static deserializeFromJSON(json: string): Transaction;
/**
* Deserialize the {@link Transaction} Object from a "Safe" JSON schema where all `bigint` values are represented as `string`.
* @param {string} json
* @returns {Transaction}
*/
  static deserializeFromSafeJSON(json: string): Transaction;
/**
* Determines whether or not a transaction is a coinbase transaction. A coinbase
* transaction is a special transaction created by miners that distributes fees and block subsidy
* to the previous blocks' miners, and specifies the script_pub_key that will be used to pay the current
* miner in future blocks.
* @returns {boolean}
*/
  is_coinbase(): boolean;
/**
* Recompute and finalize the tx id based on updated tx fields
* @returns {Hash}
*/
  finalize(): Hash;
/**
* @param {ITransaction} js_value
*/
  constructor(js_value: ITransaction);
/**
* Returns a list of unique addresses used by transaction inputs.
* This method can be used to determine addresses used by transaction inputs
* in order to select private keys needed for transaction signing.
* @param {NetworkType | NetworkId | string} network_type
* @returns {Address[]}
*/
  addresses(network_type: NetworkType | NetworkId | string): Address[];
/**
*/
  gas: bigint;
/**
* Returns the transaction ID
*/
  readonly id: string;
/**
*/
  inputs: any;
/**
*/
  lock_time: bigint;
/**
*/
  outputs: any;
/**
*/
  payload: any;
/**
*/
  subnetworkId: any;
/**
*/
  version: number;
}
/**
* Represents a Kaspa transaction input
* @category Consensus
*/
export class TransactionInput {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {ITransactionInput} value
*/
  constructor(value: ITransactionInput);
/**
*/
  previousOutpoint: any;
/**
*/
  sequence: bigint;
/**
*/
  sigOpCount: number;
/**
*/
  signatureScript: any;
/**
*/
  readonly utxo: UtxoEntryReference | undefined;
}
/**
* Represents a Kaspa transaction outpoint.
* NOTE: This struct is immutable - to create a custom outpoint
* use the `TransactionOutpoint::new` constructor. (in JavaScript
* use `new TransactionOutpoint(transactionId, index)`).
* @category Consensus
*/
export class TransactionOutpoint {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @param {Hash} transaction_id
* @param {number} index
*/
  constructor(transaction_id: Hash, index: number);
/**
* @returns {string}
*/
  getId(): string;
/**
*/
  readonly index: number;
/**
*/
  readonly transactionId: string;
}
/**
* Represents a Kaspad transaction output
* @category Consensus
*/
export class TransactionOutput {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* TransactionOutput constructor
* @param {bigint} value
* @param {ScriptPublicKey} script_public_key
*/
  constructor(value: bigint, script_public_key: ScriptPublicKey);
/**
*/
  scriptPublicKey: ScriptPublicKey;
/**
*/
  value: bigint;
}
/**
* @category Wallet SDK
*/
export class TransactionSigningHash {
  free(): void;
/**
*/
  constructor();
/**
* @param {HexString | Uint8Array} data
*/
  update(data: HexString | Uint8Array): void;
/**
* @returns {string}
*/
  finalize(): string;
}
/**
* @category Wallet SDK
*/
export class TransactionSigningHashECDSA {
  free(): void;
/**
*/
  constructor();
/**
* @param {HexString | Uint8Array} data
*/
  update(data: HexString | Uint8Array): void;
/**
* @returns {string}
*/
  finalize(): string;
}
/**
* Holds details about an individual transaction output in a utxo
* set such as whether or not it was contained in a coinbase tx, the daa
* score of the block that accepts the tx, its public key script, and how
* much it pays.
* @category Consensus
*/
export class TransactionUtxoEntry {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
*/
  amount: bigint;
/**
*/
  blockDaaScore: bigint;
/**
*/
  isCoinbase: boolean;
/**
*/
  scriptPublicKey: ScriptPublicKey;
}
/**
* A simple collection of UTXO entries. This struct is used to
* retain a set of UTXO entries in the WASM memory for faster
* processing. This struct keeps a list of entries represented
* by `UtxoEntryReference` struct. This data structure is used
* internally by the framework, but is exposed for convenience.
* Please consider using `UtxoContext` instead.
* @category Wallet SDK
*/
export class UtxoEntries {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* Create a new `UtxoEntries` struct with a set of entries.
* @param {any} js_value
*/
  constructor(js_value: any);
/**
* Sort the contained entries by amount. Please note that
* this function is not intended for use with large UTXO sets
* as it duplicates the whole contained UTXO set while sorting.
*/
  sort(): void;
/**
* @returns {bigint}
*/
  amount(): bigint;
/**
*/
  items: any;
}
/**
* @category Wallet SDK
*/
export class UtxoEntry {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @returns {string}
*/
  toString(): string;
/**
*/
  address?: Address;
/**
*/
  amount: bigint;
/**
*/
  blockDaaScore: bigint;
/**
*/
  isCoinbase: boolean;
/**
*/
  outpoint: TransactionOutpoint;
/**
*/
  scriptPublicKey: ScriptPublicKey;
}
/**
* @category Wallet SDK
*/
export class UtxoEntryReference {
/**
** Return copy of self without private attributes.
*/
  toJSON(): Object;
/**
* Return stringified version of self.
*/
  toString(): string;
  free(): void;
/**
* @returns {string}
*/
  toString(): string;
/**
* @returns {string}
*/
  getTransactionId(): string;
/**
* @returns {string}
*/
  getId(): string;
/**
*/
  readonly amount: bigint;
/**
*/
  readonly blockDaaScore: bigint;
/**
*/
  readonly entry: UtxoEntry;
/**
*/
  readonly isCoinbase: boolean;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_address_free: (a: number) => void;
  readonly address_constructor: (a: number, b: number) => number;
  readonly address_validate: (a: number, b: number) => number;
  readonly address_toString: (a: number, b: number) => void;
  readonly address_version: (a: number, b: number) => void;
  readonly address_prefix: (a: number, b: number) => void;
  readonly address_set_setPrefix: (a: number, b: number, c: number) => void;
  readonly address_payload: (a: number, b: number) => void;
  readonly address_short: (a: number, b: number, c: number) => void;
  readonly __wbg_transactionoutpoint_free: (a: number) => void;
  readonly transactionoutpoint_ctor: (a: number, b: number) => number;
  readonly transactionoutpoint_getId: (a: number, b: number) => void;
  readonly transactionoutpoint_transactionId: (a: number, b: number) => void;
  readonly transactionoutpoint_index: (a: number) => number;
  readonly scriptbuilder_new: () => number;
  readonly scriptbuilder_data: (a: number) => number;
  readonly scriptbuilder_script: (a: number) => number;
  readonly scriptbuilder_drain: (a: number) => number;
  readonly scriptbuilder_canonicalDataSize: (a: number, b: number) => void;
  readonly scriptbuilder_addOp: (a: number, b: number, c: number) => void;
  readonly scriptbuilder_addOps: (a: number, b: number, c: number) => void;
  readonly scriptbuilder_addData: (a: number, b: number, c: number) => void;
  readonly scriptbuilder_addI64: (a: number, b: number, c: number) => void;
  readonly scriptbuilder_addLockTime: (a: number, b: number, c: number) => void;
  readonly __wbg_scriptbuilder_free: (a: number) => void;
  readonly header_constructor: (a: number, b: number) => void;
  readonly header_finalize: (a: number, b: number) => void;
  readonly header_asJSON: (a: number, b: number) => void;
  readonly header_get_version: (a: number) => number;
  readonly header_set_version: (a: number, b: number) => void;
  readonly header_get_timestamp: (a: number) => number;
  readonly header_set_timestamp: (a: number, b: number) => void;
  readonly header_bits: (a: number) => number;
  readonly header_set_bits: (a: number, b: number) => void;
  readonly header_nonce: (a: number) => number;
  readonly header_set_nonce: (a: number, b: number) => void;
  readonly header_daa_score: (a: number) => number;
  readonly header_set_daa_score: (a: number, b: number) => void;
  readonly header_blue_score: (a: number) => number;
  readonly header_set_blue_score: (a: number, b: number) => void;
  readonly header_get_hash_as_hex: (a: number, b: number) => void;
  readonly header_get_hash_merkle_root_as_hex: (a: number, b: number) => void;
  readonly header_set_hash_merkle_root_from_js_value: (a: number, b: number) => void;
  readonly header_get_accepted_id_merkle_root_as_hex: (a: number, b: number) => void;
  readonly header_set_accepted_id_merkle_root_from_js_value: (a: number, b: number) => void;
  readonly header_get_utxo_commitment_as_hex: (a: number, b: number) => void;
  readonly header_set_utxo_commitment_from_js_value: (a: number, b: number) => void;
  readonly header_get_pruning_point_as_hex: (a: number, b: number) => void;
  readonly header_set_pruning_point_from_js_value: (a: number, b: number) => void;
  readonly header_get_parents_by_level_as_js_value: (a: number) => number;
  readonly header_set_parents_by_level_from_js_value: (a: number, b: number) => void;
  readonly header_blue_work: (a: number) => number;
  readonly header_getBlueWorkAsHex: (a: number, b: number) => void;
  readonly header_set_blue_work_from_js_value: (a: number, b: number) => void;
  readonly __wbg_header_free: (a: number) => void;
  readonly scriptbuilder_addSequence: (a: number, b: number, c: number) => void;
  readonly transactioninput_constructor: (a: number, b: number) => void;
  readonly transactioninput_get_previous_outpoint: (a: number) => number;
  readonly transactioninput_set_previous_outpoint: (a: number, b: number, c: number) => void;
  readonly transactioninput_get_signature_script_as_hex: (a: number, b: number) => void;
  readonly transactioninput_set_signature_script_from_js_value: (a: number, b: number, c: number) => void;
  readonly transactioninput_get_sequence: (a: number) => number;
  readonly transactioninput_set_sequence: (a: number, b: number) => void;
  readonly transactioninput_get_sig_op_count: (a: number) => number;
  readonly transactioninput_set_sig_op_count: (a: number, b: number) => void;
  readonly transactioninput_get_utxo: (a: number) => number;
  readonly __wbg_transactioninput_free: (a: number) => void;
  readonly __wbg_utxoentry_free: (a: number) => void;
  readonly __wbg_get_utxoentry_address: (a: number) => number;
  readonly __wbg_set_utxoentry_address: (a: number, b: number) => void;
  readonly __wbg_get_utxoentry_outpoint: (a: number) => number;
  readonly __wbg_set_utxoentry_outpoint: (a: number, b: number) => void;
  readonly __wbg_get_utxoentry_amount: (a: number) => number;
  readonly __wbg_set_utxoentry_amount: (a: number, b: number) => void;
  readonly __wbg_get_utxoentry_scriptPublicKey: (a: number) => number;
  readonly __wbg_set_utxoentry_scriptPublicKey: (a: number, b: number) => void;
  readonly __wbg_get_utxoentry_blockDaaScore: (a: number) => number;
  readonly __wbg_set_utxoentry_blockDaaScore: (a: number, b: number) => void;
  readonly __wbg_get_utxoentry_isCoinbase: (a: number) => number;
  readonly __wbg_set_utxoentry_isCoinbase: (a: number, b: number) => void;
  readonly utxoentry_toString: (a: number, b: number) => void;
  readonly __wbg_utxoentryreference_free: (a: number) => void;
  readonly utxoentryreference_toString: (a: number, b: number) => void;
  readonly utxoentryreference_entry: (a: number) => number;
  readonly utxoentryreference_getTransactionId: (a: number, b: number) => void;
  readonly utxoentryreference_getId: (a: number, b: number) => void;
  readonly utxoentryreference_amount: (a: number) => number;
  readonly utxoentryreference_isCoinbase: (a: number) => number;
  readonly utxoentryreference_blockDaaScore: (a: number) => number;
  readonly __wbg_utxoentries_free: (a: number) => void;
  readonly utxoentries_js_ctor: (a: number, b: number) => void;
  readonly utxoentries_get_items_as_js_array: (a: number) => number;
  readonly utxoentries_set_items_from_js_array: (a: number, b: number) => void;
  readonly utxoentries_sort: (a: number) => void;
  readonly utxoentries_amount: (a: number) => number;
  readonly transaction_serializeToObject: (a: number, b: number) => void;
  readonly transaction_serializeToJSON: (a: number, b: number) => void;
  readonly transaction_serializeToSafeJSON: (a: number, b: number) => void;
  readonly transaction_deserializeFromObject: (a: number, b: number) => void;
  readonly transaction_deserializeFromJSON: (a: number, b: number, c: number) => void;
  readonly transaction_deserializeFromSafeJSON: (a: number, b: number, c: number) => void;
  readonly transaction_is_coinbase: (a: number) => number;
  readonly transaction_finalize: (a: number, b: number) => void;
  readonly transaction_id: (a: number, b: number) => void;
  readonly transaction_constructor: (a: number, b: number) => void;
  readonly transaction_get_inputs_as_js_array: (a: number) => number;
  readonly transaction_addresses: (a: number, b: number, c: number) => void;
  readonly transaction_set_inputs_from_js_array: (a: number, b: number) => void;
  readonly transaction_get_outputs_as_js_array: (a: number) => number;
  readonly transaction_set_outputs_from_js_array: (a: number, b: number) => void;
  readonly transaction_version: (a: number) => number;
  readonly transaction_set_version: (a: number, b: number) => void;
  readonly transaction_lock_time: (a: number) => number;
  readonly transaction_set_lock_time: (a: number, b: number) => void;
  readonly transaction_gas: (a: number) => number;
  readonly transaction_set_gas: (a: number, b: number) => void;
  readonly transaction_get_subnetwork_id_as_hex: (a: number, b: number) => void;
  readonly transaction_set_subnetwork_id_from_js_value: (a: number, b: number) => void;
  readonly transaction_get_payload_as_hex_string: (a: number, b: number) => void;
  readonly transaction_set_payload_from_js_value: (a: number, b: number) => void;
  readonly __wbg_transaction_free: (a: number) => void;
  readonly __wbg_transactionoutput_free: (a: number) => void;
  readonly transactionoutput_ctor: (a: number, b: number) => number;
  readonly transactionoutput_value: (a: number) => number;
  readonly transactionoutput_set_value: (a: number, b: number) => void;
  readonly transactionoutput_scriptPublicKey: (a: number) => number;
  readonly transactionoutput_set_scriptPublicKey: (a: number, b: number) => void;
  readonly transactionsigninghashecdsa_new: () => number;
  readonly transactionsigninghashecdsa_update: (a: number, b: number, c: number) => void;
  readonly transactionsigninghashecdsa_finalize: (a: number, b: number) => void;
  readonly __wbg_transactionsigninghashecdsa_free: (a: number) => void;
  readonly transactionsigninghash_new: () => number;
  readonly transactionsigninghash_update: (a: number, b: number, c: number) => void;
  readonly transactionsigninghash_finalize: (a: number, b: number) => void;
  readonly __wbg_transactionsigninghash_free: (a: number) => void;
  readonly __wbg_networkid_free: (a: number) => void;
  readonly __wbg_get_networkid_type: (a: number) => number;
  readonly __wbg_set_networkid_type: (a: number, b: number) => void;
  readonly __wbg_get_networkid_suffix: (a: number, b: number) => void;
  readonly __wbg_set_networkid_suffix: (a: number, b: number, c: number) => void;
  readonly networkid_ctor: (a: number, b: number) => void;
  readonly networkid_id: (a: number, b: number) => void;
  readonly networkid_addressPrefix: (a: number, b: number) => void;
  readonly networkid_toString: (a: number, b: number) => void;
  readonly __wbg_transactionutxoentry_free: (a: number) => void;
  readonly __wbg_get_transactionutxoentry_amount: (a: number) => number;
  readonly __wbg_set_transactionutxoentry_amount: (a: number, b: number) => void;
  readonly __wbg_get_transactionutxoentry_scriptPublicKey: (a: number) => number;
  readonly __wbg_set_transactionutxoentry_scriptPublicKey: (a: number, b: number) => void;
  readonly __wbg_get_transactionutxoentry_blockDaaScore: (a: number) => number;
  readonly __wbg_set_transactionutxoentry_blockDaaScore: (a: number, b: number) => void;
  readonly __wbg_get_transactionutxoentry_isCoinbase: (a: number) => number;
  readonly __wbg_set_transactionutxoentry_isCoinbase: (a: number, b: number) => void;
  readonly __wbg_sighashtype_free: (a: number) => void;
  readonly __wbg_scriptpublickey_free: (a: number) => void;
  readonly __wbg_get_scriptpublickey_version: (a: number) => number;
  readonly __wbg_set_scriptpublickey_version: (a: number, b: number) => void;
  readonly scriptpublickey_constructor: (a: number, b: number, c: number) => void;
  readonly scriptpublickey_script_as_hex: (a: number, b: number) => void;
  readonly __wbg_hash_free: (a: number) => void;
  readonly hash_constructor: (a: number, b: number) => number;
  readonly hash_toString: (a: number, b: number) => void;
  readonly version: (a: number) => void;
  readonly __wbg_nodedescriptor_free: (a: number) => void;
  readonly __wbg_get_nodedescriptor_id: (a: number, b: number) => void;
  readonly __wbg_set_nodedescriptor_id: (a: number, b: number, c: number) => void;
  readonly __wbg_get_nodedescriptor_url: (a: number, b: number) => void;
  readonly __wbg_set_nodedescriptor_url: (a: number, b: number, c: number) => void;
  readonly __wbg_get_nodedescriptor_provider_name: (a: number, b: number) => void;
  readonly __wbg_set_nodedescriptor_provider_name: (a: number, b: number, c: number) => void;
  readonly __wbg_get_nodedescriptor_provider_url: (a: number, b: number) => void;
  readonly __wbg_set_nodedescriptor_provider_url: (a: number, b: number, c: number) => void;
  readonly rpcclient_getBlockCount: (a: number, b: number) => number;
  readonly rpcclient_getBlockDagInfo: (a: number, b: number) => number;
  readonly rpcclient_getCoinSupply: (a: number, b: number) => number;
  readonly rpcclient_getConnectedPeerInfo: (a: number, b: number) => number;
  readonly rpcclient_getInfo: (a: number, b: number) => number;
  readonly rpcclient_getPeerAddresses: (a: number, b: number) => number;
  readonly rpcclient_getMetrics: (a: number, b: number) => number;
  readonly rpcclient_getSink: (a: number, b: number) => number;
  readonly rpcclient_getSinkBlueScore: (a: number, b: number) => number;
  readonly rpcclient_ping: (a: number, b: number) => number;
  readonly rpcclient_shutdown: (a: number, b: number) => number;
  readonly rpcclient_getServerInfo: (a: number, b: number) => number;
  readonly rpcclient_getSyncStatus: (a: number, b: number) => number;
  readonly rpcclient_addPeer: (a: number, b: number) => number;
  readonly rpcclient_ban: (a: number, b: number) => number;
  readonly rpcclient_estimateNetworkHashesPerSecond: (a: number, b: number) => number;
  readonly rpcclient_getBalanceByAddress: (a: number, b: number) => number;
  readonly rpcclient_getBalancesByAddresses: (a: number, b: number) => number;
  readonly rpcclient_getBlock: (a: number, b: number) => number;
  readonly rpcclient_getBlocks: (a: number, b: number) => number;
  readonly rpcclient_getBlockTemplate: (a: number, b: number) => number;
  readonly rpcclient_getDaaScoreTimestampEstimate: (a: number, b: number) => number;
  readonly rpcclient_getCurrentNetwork: (a: number, b: number) => number;
  readonly rpcclient_getHeaders: (a: number, b: number) => number;
  readonly rpcclient_getMempoolEntries: (a: number, b: number) => number;
  readonly rpcclient_getMempoolEntriesByAddresses: (a: number, b: number) => number;
  readonly rpcclient_getMempoolEntry: (a: number, b: number) => number;
  readonly rpcclient_getSubnetwork: (a: number, b: number) => number;
  readonly rpcclient_getUtxosByAddresses: (a: number, b: number) => number;
  readonly rpcclient_getVirtualChainFromBlock: (a: number, b: number) => number;
  readonly rpcclient_resolveFinalityConflict: (a: number, b: number) => number;
  readonly rpcclient_submitBlock: (a: number, b: number) => number;
  readonly rpcclient_submitTransaction: (a: number, b: number) => number;
  readonly rpcclient_unban: (a: number, b: number) => number;
  readonly rpcclient_subscribeBlockAdded: (a: number) => number;
  readonly rpcclient_unsubscribeBlockAdded: (a: number) => number;
  readonly rpcclient_subscribeFinalityConflict: (a: number) => number;
  readonly rpcclient_unsubscribeFinalityConflict: (a: number) => number;
  readonly rpcclient_subscribeFinalityConflictResolved: (a: number) => number;
  readonly rpcclient_unsubscribeFinalityConflictResolved: (a: number) => number;
  readonly rpcclient_subscribeSinkBlueScoreChanged: (a: number) => number;
  readonly rpcclient_unsubscribeSinkBlueScoreChanged: (a: number) => number;
  readonly rpcclient_subscribePruningPointUtxoSetOverride: (a: number) => number;
  readonly rpcclient_unsubscribePruningPointUtxoSetOverride: (a: number) => number;
  readonly rpcclient_subscribeNewBlockTemplate: (a: number) => number;
  readonly rpcclient_unsubscribeNewBlockTemplate: (a: number) => number;
  readonly rpcclient_subscribeVirtualDaaScoreChanged: (a: number) => number;
  readonly rpcclient_unsubscribeVirtualDaaScoreChanged: (a: number) => number;
  readonly rpcclient_subscribeUtxosChanged: (a: number, b: number) => number;
  readonly rpcclient_unsubscribeUtxosChanged: (a: number, b: number) => number;
  readonly rpcclient_subscribeVirtualChainChanged: (a: number, b: number) => number;
  readonly rpcclient_unsubscribeVirtualChainChanged: (a: number, b: number) => number;
  readonly rpcclient_defaultPort: (a: number, b: number, c: number) => void;
  readonly rpcclient_parseUrl: (a: number, b: number, c: number, d: number, e: number) => void;
  readonly rpcclient_ctor: (a: number, b: number) => void;
  readonly rpcclient_url: (a: number, b: number) => void;
  readonly rpcclient_resolver: (a: number) => number;
  readonly rpcclient_setResolver: (a: number, b: number, c: number) => void;
  readonly rpcclient_setNetworkId: (a: number, b: number, c: number) => void;
  readonly rpcclient_isConnected: (a: number) => number;
  readonly rpcclient_encoding: (a: number, b: number) => void;
  readonly rpcclient_nodeId: (a: number, b: number) => void;
  readonly rpcclient_providerName: (a: number, b: number) => void;
  readonly rpcclient_providerUrl: (a: number, b: number) => void;
  readonly rpcclient_connect: (a: number, b: number) => number;
  readonly rpcclient_disconnect: (a: number) => number;
  readonly rpcclient_start: (a: number) => number;
  readonly rpcclient_stop: (a: number) => number;
  readonly rpcclient_triggerAbort: (a: number) => void;
  readonly rpcclient_addEventListener: (a: number, b: number, c: number, d: number) => void;
  readonly rpcclient_removeEventListener: (a: number, b: number, c: number, d: number) => void;
  readonly rpcclient_clearEventListener: (a: number, b: number, c: number) => void;
  readonly rpcclient_removeAllEventListeners: (a: number, b: number) => void;
  readonly __wbg_rpcclient_free: (a: number) => void;
  readonly resolver_urls: (a: number) => number;
  readonly resolver_getNode: (a: number, b: number, c: number) => number;
  readonly resolver_getUrl: (a: number, b: number, c: number) => number;
  readonly resolver_connect: (a: number, b: number) => number;
  readonly resolver_ctor: (a: number, b: number) => void;
  readonly __wbg_resolver_free: (a: number) => void;
  readonly rustsecp256k1_v0_9_2_context_create: (a: number) => number;
  readonly rustsecp256k1_v0_9_2_context_destroy: (a: number) => void;
  readonly rustsecp256k1_v0_9_2_default_illegal_callback_fn: (a: number, b: number) => void;
  readonly rustsecp256k1_v0_9_2_default_error_callback_fn: (a: number, b: number) => void;
  readonly __wbg_abortable_free: (a: number) => void;
  readonly abortable_new: () => number;
  readonly abortable_isAborted: (a: number) => number;
  readonly abortable_abort: (a: number) => void;
  readonly abortable_check: (a: number, b: number) => void;
  readonly abortable_reset: (a: number) => void;
  readonly __wbg_aborted_free: (a: number) => void;
  readonly setLogLevel: (a: number) => void;
  readonly initWASM32Bindings: (a: number, b: number) => void;
  readonly defer: () => number;
  readonly presentPanicHookLogs: () => void;
  readonly initConsolePanicHook: () => void;
  readonly initBrowserPanicHook: () => void;
  readonly __wbindgen_export_0: (a: number, b: number) => number;
  readonly __wbindgen_export_1: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_4: (a: number, b: number) => void;
  readonly __wbindgen_export_5: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_6: (a: number, b: number) => void;
  readonly __wbindgen_export_7: (a: number, b: number, c: number) => void;
  readonly __wbindgen_export_8: (a: number, b: number) => void;
  readonly __wbindgen_export_9: (a: number) => void;
  readonly __wbindgen_export_10: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_export_11: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
