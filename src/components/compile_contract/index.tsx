/*
 * @Author: your name
 * @Date: 2021-08-21 17:48:02
 * @LastEditTime: 2021-08-21 17:51:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /learn-react/src/components/compile_contract/index.tsx
 */

import { AbiItem, AbiInput, AbiType } from 'web3-utils';
import { NatspecDocs } from '../natspec';

export interface CompiledContract extends NatspecDocs {
    contractName: string,
    abi: AbiItem[],
    networks: any,
}