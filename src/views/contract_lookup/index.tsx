import Web3 from 'web3';
import 'antd/dist/antd.css';
import { useCallback, useState } from 'react';
import { Layout, Result, notification } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { FunctionContent } from './content';
import { ContractSetting } from "./contract_setting";
import { CompiledContract } from '../../components';
import { TransferGroup } from '../../components/structs/TransferGroup';
import { ContractImport } from "../contract_importer";
import ContractMenu from "./contract_menu";
import * as xlsx from 'xlsx';

import * as StateCreator from "./states";
import { GroupTransfer } from './group_transfer';
const AbiCoder = require('web3-eth-abi');

function readContractAsync(file: any) {
    return new Promise<CompiledContract>((resolve, reject) => {
        const reader = new FileReader();

        reader.readAsText(file);
        reader.onload = () => {
            // 去除不需要的字段
            const longContract = JSON.parse(reader.result as string) as CompiledContract;
            const shotContract = {
                contractName: longContract.contractName,
                abi: longContract.abi,
                networks: longContract.networks,
                userdoc: longContract.userdoc,
                devdoc: longContract.devdoc,
                source: (longContract as any).source,
                updatedAt: (longContract as any).updatedAt,
                compiler: (longContract as any).compiler,
            }
            return resolve(shotContract);
        }
    })
}

const openNotificationError = (message: string) => {
    notification['error']({
        message: '数据校验错误',
        description: message
    });
};

function readExeclAsync(file: any) {
    return new Promise<TransferGroup>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const workbook = xlsx.read(event.target!.result, { type: 'binary' });

            let data: any[] = [];
            for (const sheet in workbook.Sheets) {
                if (workbook.Sheets.hasOwnProperty(sheet)) {
                    data = data.concat(xlsx.utils.sheet_to_json(workbook.Sheets[sheet]));
                }
                break;
            }

            let floatNumberRegex = /^[1-9]\d*\.\d*|0\.\d*[1-9]\d*$/
            data.forEach((row, rowIndex) => {
                let amount = row[Object.keys(row)[1]];
                if (typeof (amount) !== 'number' && !floatNumberRegex.test(amount.toString())) {
                    openNotificationError(`在校验文件"${file.name}"\n\r第"${rowIndex + 1}"行数据出，出现了无效的数值\n\r"${amount.toString()}"\n\r这会导致严重后果,请检查和纠正数据后在尝试进行任务.`)
                    return reject(undefined)
                }
            })

            return resolve({
                name: file.name as string,
                datas: data.map(function (row) {
                    return {
                        address: row[Object.keys(row)[0]] as string,
                        amount: row[Object.keys(row)[1]] as number
                    }
                })
            })
        }
        reader.readAsBinaryString(file);
    })
}

export default function ContractLookupPage() {
    const [transferGroups, setTransferGroups] = useState<TransferGroup[]>([]);
    const [contracts, setContracts] = useState<CompiledContract[]>([]);
    const [netWorkID, setNetWorkID] = useState<number>();
    const [contentState, setContetState] = useState<StateCreator.ContentViewState>(StateCreator.UploadState());

    const web3 = useCallback((): Web3 | undefined => {
        if ((window as any).web3) {
            return (window as any).web3 as Web3
        }

        if ((window as any).ethereum) {
            (window as any).web3 = new Web3((window as any).ethereum);
            (window as any).web3.eth.net.getId().then(setNetWorkID)
            return (window as any).web3 as Web3
        } else {
            return undefined
        }
    }, [])

    // 主菜单点击
    function onMenuSelect(info: MenuInfo): void {
        const paths = info.keyPath
        if (paths.length <= 0) {
            return;
        }

        // 打开了批量转账列表
        if (paths[0].toLocaleLowerCase().startsWith('trasnfer-groups-')) {
            let index = parseInt(paths[0].substring('trasnfer-groups-'.length));
            setContetState(StateCreator.TransferState(transferGroups[index]));
            return
        }

        switch (paths.length) {
            case 1: {
                switch (paths[0].toLowerCase()) {
                    case 'upload': {
                        setContetState(StateCreator.UploadState());
                        break;
                    }
                }
                break;
            }

            // 二级菜单点击
            case 2: {
                const contract = contracts.find((c) => c.contractName === paths[paths.length - 1]);
                if (contract !== undefined) {
                    if (paths.length === 2 && paths[0] === `${contract.contractName}-setting`) {
                        setContetState(StateCreator.SettingState(contract))
                    }
                }
                break;
            }

            // 三级菜单点击
            case 3: {
                const contract = contracts.find((c) => c.contractName === paths[paths.length - 1]);
                if (contract !== undefined) {
                    if (
                        paths.length === 3 &&
                        (
                            paths[1] === `${contract.contractName}-function` ||
                            paths[1] === `${contract.contractName}-event`
                        )
                    ) {
                        const abi = contract.abi?.find((a) => (a.type === 'function' || a.type === 'event') && AbiCoder.encodeFunctionSignature(a) === paths[0])
                        if (abi !== undefined) {
                            setContetState(StateCreator.ABIState(
                                contract,
                                abi
                            ))
                        }
                    }
                }
                break;
            }
        }
    }

    function RenderContentView() {
        switch (contentState.type) {
            case 'method': {
                return (
                    <FunctionContent
                        contract={(contentState as StateCreator.ContractMethodState).contract!}
                        abi={(contentState as StateCreator.ContractMethodState).abi!}
                        networkID={netWorkID}
                        web3={web3()}
                    />
                )
            }

            case 'setting': {
                return (
                    <ContractSetting
                        contract={(contentState as StateCreator.ContractSettingState).contract!}
                        networkID={netWorkID}
                    />
                )
            }

            case 'trasnfer': {
                return (
                    <GroupTransfer
                        group={(contentState as StateCreator.TransferGroupState).group!}
                    />
                )
            }

            case 'upload': {
                return <ContractImport
                    onCheckedCompiledContract={
                        contract => {
                            setContracts(contracts.concat(contract));
                        }
                    }
                    onDropFile={
                        (e) => {
                            let files = e.dataTransfer.files;
                            let jsonReaders = [];
                            let xlsxReaders = [];

                            for (let i = 0; i < files.length; i++) {
                                let fileName = (files[i].name as string)
                                if (fileName.endsWith("json")) {
                                    jsonReaders.push(readContractAsync(files[i]))
                                } else if (fileName.endsWith("xlsx")) {
                                    xlsxReaders.push(readExeclAsync(files[i]))
                                }
                            }

                            Promise.all(jsonReaders).then(dropedContract => {
                                setContracts(contracts.concat(dropedContract));
                            })

                            Promise.all(xlsxReaders).then(groups => {
                                setTransferGroups(transferGroups.concat(groups));
                            })
                        }
                    } />
            }

            default: {
                return (
                    <Layout.Content style={{
                        minHeight: '100%',
                        background: 'white',
                    }}>
                        <Result
                            status="404"
                            title="无效菜单路径"
                            subTitle="抱歉，你选择的菜单似乎没有找到对应的内容。"
                        />
                    </Layout.Content>
                )
            }
        }
    }

    return (
        <Layout>

            <ContractMenu
                contracts={contracts}
                transferGroups={transferGroups}
                onSelected={onMenuSelect}
                onDropFile={
                    (e) => {
                        let files = e.dataTransfer.files;
                        let readers = [];

                        for (let i = 0; i < files.length; i++) {
                            readers.push(readContractAsync(files[i]))
                        }

                        Promise.all(readers).then(dropedContract => {
                            setContracts(contracts.concat(dropedContract));
                        })
                    }
                }
            />
            <Layout className="site-layout">
                <Layout.Sider
                    width="80vw"
                    style={{
                        marginLeft: '20vw',
                        overflow: 'auto',
                        position: 'fixed',
                        width: '100%',
                        height: '100%',
                        left: 0,
                    }}
                >
                    <RenderContentView />
                </Layout.Sider>
            </Layout>
        </Layout>
    )
}
