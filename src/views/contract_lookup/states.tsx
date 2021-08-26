import { AbiItem } from 'web3-utils';
import { CompiledContract } from "../../components/compile_contract";

export type Types = 'setting' | 'upload' | 'method';

// 抽象
export interface ContentViewState {
    type: Types
}

// 设置页面
export interface ContractSettingState extends ContentViewState {
    contract: CompiledContract
}

// abi页面包含function和event
export interface ContractMethodState extends ContentViewState {
    contract: CompiledContract,
    abi: AbiItem
}

export const SettingState = (contract: CompiledContract): ContractSettingState => {
    return {
        type: 'setting',
        contract: contract
    }
}

export const ABIState = (contract: CompiledContract, abi: AbiItem): ContractMethodState => {
    return {
        type: 'method',
        contract: contract,
        abi: abi,
    }
}

export const UploadState = (): ContentViewState => { return { type: 'upload' } }