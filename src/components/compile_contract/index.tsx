import { AbiItem } from 'web3-utils';
import { NatspecDocs } from '../natspec';

export interface CompiledContract extends NatspecDocs {
    contractName: string,
    abi: AbiItem[],
    networks: any,
    source?: any,
    updatedAt?: string,
    compiler?: any,
}