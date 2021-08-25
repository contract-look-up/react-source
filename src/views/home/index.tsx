import "antd/dist/antd.css";
import { useState } from "react";
import { Layout } from 'antd';

import {
    UploadOutlined
} from '@ant-design/icons';

import Web3 from "web3";
import ContractMenu from "../../components/contract_menu";

import { AbiItem } from 'web3-utils';
import { FunctionContent } from "../content";
import { CompiledContract } from "../../components/compile_contract";
import Dragger from "antd/lib/upload/Dragger";

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
                devdoc: longContract.devdoc
            }
            return resolve(shotContract);
        }
    })
}


function HomeView() {
    const web3 = new Web3((window as any).ethereum);

    const [contracts, setContracts] = useState<CompiledContract[]>([]);
    const [netWorkID, setNetWorkID] = useState<number>();
    const [selectedABI, setSelectedABI] = useState<{
        contract?: CompiledContract,
        abi?: AbiItem
    }>();

    web3.eth.net.getId().then((netID) => {
        setNetWorkID(netID);
    });

    return (
        netWorkID === undefined
            ? null
            : <Layout>
                <ContractMenu
                    contracts={contracts}
                    onSelectedABI={
                        (contract, abi) => {
                            setSelectedABI({
                                contract: contract,
                                abi: abi
                            });
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
                        {
                            selectedABI !== undefined && selectedABI.contract !== undefined
                                ? <FunctionContent
                                    contract={selectedABI.contract!}
                                    abi={selectedABI.abi!}
                                    networkID={netWorkID}
                                />
                                : <Dragger
                                    itemRender={() => {
                                        return null
                                    }}
                                    onDrop={
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
                                >
                                    <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                                    <p className="ant-upload-text">点击上传或者拖动文件至本区域</p>
                                    <p className="ant-upload-hint">
                                        仅支持标准的Compiled Contract 格式，比如truffle compile输出的文件，请注意确保是已部署的实例，请检查其中必须包含，abi，networks，字段。
                                    </p>
                                </Dragger>

                        }
                    </Layout.Sider>
                </Layout>
            </Layout>
    )
}

export default HomeView;
