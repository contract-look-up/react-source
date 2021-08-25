import Web3 from "web3";
import "antd/dist/antd.css";
import { useState } from "react";
import { Layout, Result } from 'antd';
import { MenuInfo } from 'rc-menu/lib/interface';
import { FunctionContent } from "../content";
import { ContractSetting } from "../contract_setting";
import { CompiledContract } from "../../components/compile_contract";
import { ContractImport } from "../contract_importer";
import ContractMenu from "../../components/contract_menu";

import * as StateCreator from "./states";

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

function HomeView() {
    const web3 = new Web3((window as any).ethereum);

    const [contracts, setContracts] = useState<CompiledContract[]>([]);
    const [netWorkID, setNetWorkID] = useState<number>();
    const [contentState, setContetState] = useState<StateCreator.ContentViewState>(StateCreator.UploadState());

    web3.eth.net.getId().then((netID) => {
        setNetWorkID(netID);
    });

    // 主菜单点击
    function onMenuSelect(info: MenuInfo): void {

        const paths = info.keyPath
        if (paths.length <= 0) {
            return;
        }

        switch (paths.length) {
            case 1: {
                switch (paths[0]) {
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
                        const abi = contract.abi?.find((a) => (a.type === 'function' || a.type === 'event') && web3.eth.abi.encodeFunctionSignature(a) === paths[0])
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

        if (netWorkID === undefined) {
            return null
        }

        switch (contentState.type) {
            case 'method': {
                return (
                    <FunctionContent
                        contract={(contentState as StateCreator.ContractMethodState).contract!}
                        abi={(contentState as StateCreator.ContractMethodState).abi!}
                        networkID={netWorkID}
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

            case 'upload': {
                return <ContractImport onDropContractFile={
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
        netWorkID === undefined
            ? null
            : <Layout>
                <ContractMenu
                    contracts={contracts}
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
                        width='80%'
                        style={{
                            marginLeft: '20vw',
                            overflow: 'auto',
                            position: 'fixed',
                            width: '100%',
                            height: '100%',
                            left: 0,
                            flex:2
                        }}
                    >
                        <RenderContentView />
                    </Layout.Sider>
                </Layout>
            </Layout>
    )
}

export default HomeView;
