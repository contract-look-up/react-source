export interface TransferInfo {
    address: string,
    amount: number,
    txHash?: string,
    doneBlockNumber?: string,
    txReceipt?: any
}

export interface TransferGroup {
    name: string,
    datas: TransferInfo[]
}