import { AbiItem } from 'web3-utils';

export function functionFormatStringFromABI(abi: AbiItem): string {
    let inputFormat = abi.inputs?.map((abi) => {
        return abi.type
    }).join(',');

    return `${abi.name}(${inputFormat})`;
}

export function functionSourceCodeFormatFromABI(abi: AbiItem): string {

    let inputFormat = abi.inputs?.map((abi) => {
        if (abi.indexed) {
            return `\t${abi.type} indexed ${abi.name}`
        } else {
            return `\t${abi.type} ${abi.name}`
        }

    }).join(',\n');

    let outputFormat = abi.outputs?.map((abi) => {
        return "\t" + abi.type + (abi.name.length > 0 ? ` ${abi.name}` : "")
    }).join(',\n')

    let name = `${abi.type} ${abi.name}(${abi.inputs?.length === 0 ? "" : `\n${inputFormat}\n`})${abi.stateMutability === undefined ? '' : ' ' + abi.stateMutability}`

    if (abi.type === 'function') {
        if (outputFormat !== undefined && outputFormat?.length > 0) {
            name = name + ` returns (\n${outputFormat}\n)`
        }
    }

    return name + ";";
}