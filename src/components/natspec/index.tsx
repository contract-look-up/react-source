import { AbiItem, toWei, fromWei, Unit } from 'web3-utils'
import moment from 'moment';

export interface DevMethodDoc {
    details?: string,
    params?: any,
    returns?: any
}

export interface UserMethodDoc {
    notice?: string,
}

export interface UserDocs {
    kind?: string,
    methods?: any,
    version?: number
}

export interface DeveloperDocs {
    kind?: string,
    events?: any,
    methods?: any,
    version?: number,
    stateVariables?: any[],
}

export interface NatspecDocs {
    userdoc: UserDocs,
    devdoc: DeveloperDocs
}

export type SecondaryType =
    '$amount:ether' |
    '$amount:szabo' |
    '$amount:mwei' |
    '$number' |
    '$timestemp'

export interface ExtDescription {
    content: string,
    // 次要类型缺失时，按照主类型处理即可，比如address类型
    type?: SecondaryType
}

// 获取在注释中定义的类型信息,如 $number, $timestemp 等
export function matchingTypeDescription(content?: string): ExtDescription | undefined {
    if (content === undefined) {
        return undefined;
    }

    const reg = /\s?\$[a-z]+(:[a-z]+)?\s?/gi;
    const matchGroup = reg.exec(content)

    return {
        content: content.replaceAll(reg, ""),
        type: matchGroup == null ? undefined : matchGroup[0].trim() as SecondaryType,
    };
}

// 由于有一些配置了次要类型的字段，需要就行转换此处需要根据次要类型列表生产实际的最终交易参数，
// 特别是处理的amount类型的次要类型,参数的字段需要严格按照input的顺序输入
export function bindInputs(abi: AbiItem, fromData: any[], doc?: DevMethodDoc): any[] {

    // 没有定义Doc的情况，直接返回原值
    if (doc?.params === undefined) {
        return abi.inputs?.map((_, index) => fromData[index])!
    }

    // 参数的类型列表
    const binded: Array<any> = [];

    console.log(fromData);

    abi.inputs?.forEach((input, index) => {
        // 获取函数的extDesc对象
        const secondaryType = matchingTypeDescription(doc.params[input.name])?.type;
        const typeEncode = input.type + (secondaryType ? secondaryType : '');

        if (input.type.endsWith('[]')) {
            // 只需要转换$amount类型
            if (typeEncode.includes('$amount:')) {
                const splited = typeEncode.split(':');
                if (splited.length !== 2) {
                    throw Error(`无效的次要类型定义"${typeEncode}"在"${input.name}"中，请检查源代码natspec风格注释的[次要类型定义符](在不确定类型的情况下发送交易会导致严重的数据问题).`);
                }

                binded.push(
                    (fromData[index] as string).split('\n').map((value) => toWei(value, splited[1] as Unit))
                )
            }
            else {
                binded.push((fromData[index] as string).split('\n'))
            }
        } else {
            // 只需要转换$amount类型
            if (typeEncode.includes('$amount:')) {
                const splited = typeEncode.split(':');
                if (splited.length !== 2) {
                    throw Error(`无效的次要类型定义"${typeEncode}"在"${input.name}"中，请检查源代码natspec风格注释的[次要类型定义符](在不确定类型的情况下发送交易会导致严重的数据问题).`);
                }

                binded.push(toWei(fromData[index], splited[1] as Unit))
            }
            // 处理bool类型
            else if (input.type === "bool") {
                binded.push((fromData[index] as string).toLowerCase() === 'true' ? true : false)
            }
            else {
                binded.push(fromData[index])
            }
        }
    });

    return binded;
}

export function bindLogs(abi: AbiItem, fromData: { [key: string]: any }, doc?: DevMethodDoc): { [key: string]: any } {
    // 没有定义Doc的情况，直接返回原值
    if (doc === undefined) {
        return fromData;
    }

    // 参数的类型列表
    const encodeObject: any = { }

    abi.inputs?.forEach((input, index) => {
        // 获取函数的extDesc对象
        const secondaryType = matchingTypeDescription(doc.params[input.name])?.type;
        const typeEncode = input.type + (secondaryType ? secondaryType : '');
        const value = fromData[index];

        // 只需要转换$amount类型
        if (typeEncode.includes('$amount:')) {
            const splited = typeEncode.split(':');
            if (splited.length !== 2) {
                throw Error(`无效的次要类型定义"${typeEncode}"在"${input.name}"，请检查源代码natspec风格注释的[次要类型定义符](在不确定类型的情况下发送交易会导致严重的数据问题).`);
            }

            if (input.type.endsWith('[]')) {
                encodeObject[input.name] =
                    (fromData[index] as string[]).map((value) => parseFloat(
                        fromWei(
                            value,
                            splited[1] as Unit
                        )
                    ).toFixed(8) + ` ${splited[1].toUpperCase()}`)


            } else {
                encodeObject[input.name] = parseFloat(fromWei(fromData[index], splited[1] as Unit)).toString() + ` ${splited[1].toUpperCase()}`
            }
        } else if (typeEncode.includes('$timestemp')) {
            encodeObject[input.name] = moment.unix(value).format('YYYY-MM-DD HH:mm:ss')
        } else {
            encodeObject[input.name] = value;
        }
    });

    return encodeObject;
}

export function bindOutputs(abi: AbiItem, fromData: { [key: string]: any }, doc?: DevMethodDoc): { [key: string]: any } {
    // 没有定义Doc的情况，直接返回原值
    if (doc?.returns === undefined) {
        return fromData;
    }

    // 参数的类型列表
    const binded: Array<any> = [];

    abi.outputs?.forEach((output, index) => {
        // 获取函数的extDesc对象
        const secondaryType = matchingTypeDescription(doc.returns[output.name])?.type;
        const typeEncode = output.type + (secondaryType ? secondaryType : '');

        // 只需要转换$amount类型
        if (typeEncode.includes('$amount:')) {
            const splited = typeEncode.split(':');
            if (splited.length !== 2) {
                throw Error(`无效的次要类型定义"${typeEncode}"在"${output.name}"，请检查源代码natspec风格注释的[次要类型定义符](在不确定类型的情况下发送交易会导致严重的数据问题).`);
            }

            if (output.type.endsWith('[]')) {
                binded.push(
                    (fromData[index] as string[]).map((value) => parseFloat(
                        fromWei(
                            value,
                            splited[1] as Unit
                        )
                    ).toFixed(8) + ` ${splited[1].toUpperCase()}`)
                )
            } else {
                binded.push(parseFloat(fromWei(fromData[index], splited[1] as Unit)).toString() + ` ${splited[1].toUpperCase()}`)
            }
        } else if (typeEncode.includes('$timestemp')) {
            const timestempUnix = parseInt(fromData[index]);

            binded.push(
                timestempUnix > 0
                    ? moment.unix(timestempUnix).format('YYYY-MM-DD HH:mm:ss')
                    : "无"
            )
        }
        else {
            binded.push(fromData[index])
        }
    });

    return binded;
}