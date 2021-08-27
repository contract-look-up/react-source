import Web3 from "web3";
import "antd/dist/antd.css";
import { Space, Layout, PageHeader, Descriptions, Collapse, message } from 'antd';
import { ABIDeployCallerView, CompiledContract, SourceCodeCard } from "../../../components"

import moment from "moment";
import copy from 'copy-to-clipboard';

import {
    CopyOutlined,
    SettingOutlined
} from '@ant-design/icons';

export function Deployer(props: {
    contract: CompiledContract,
}) {
    const { contract } = props;
    const matadata = (contract as any).metadata !== undefined ? JSON.parse((contract as any).metadata) : undefined;

    const web3 = new Web3((window as any).ethereum);

    return (
        <Layout.Content title="title" style={{
            minHeight: '100%',
            background: 'white',
            borderLeftColor: '#EAEAEA',
            borderLeftWidth: '1px',
            borderLeftStyle: 'solid'
        }}>
            <PageHeader
                ghost={false}
                title={contract.contractName}
            />
            <Descriptions
                title="Infomations"
                bordered
                style={{
                    marginLeft: '20px',
                    marginRight: '20px',
                }}
                column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="Name">{contract.contractName}</Descriptions.Item>
                <Descriptions.Item label="Compiler">
                    {
                        contract.compiler?.name === undefined ? "None" : contract.compiler?.name
                    }
                </Descriptions.Item>
                <Descriptions.Item label="CompilerVersion">
                    {
                        contract.compiler?.version === undefined ? "None" : contract.compiler?.version
                    }
                </Descriptions.Item>
                <Descriptions.Item label="EvmVersion">
                    {matadata!.settings.evmVersion}
                </Descriptions.Item>
                <Descriptions.Item label="Optimizer">
                    {matadata!.settings.optimizer.enabled.toString()}
                </Descriptions.Item>
                <Descriptions.Item label="Runs">
                    {matadata!.settings.optimizer.runs}
                </Descriptions.Item>
                <Descriptions.Item label="UpdateTime">
                    {
                        contract.compiler?.version === undefined ? "None" : moment(contract.updatedAt).format('YYYY-MM-DD HH:mm:ss')
                    }
                </Descriptions.Item>
            </Descriptions>
            <Collapse
                expandIconPosition="left"
                collapsible="header"
                style={{
                    marginLeft: '20px',
                    marginRight: '20px',
                    borderTopStyle: 'none',
                    borderColor: '#f0f0f0',
                }}>
                <Collapse.Panel
                    header="SourceCode"
                    key="1"
                    extra={
                        <Space onClick={
                            _ => {
                                copy(contract.source);
                                const key = '1'
                                message.loading({ content: 'Copying...', key });
                                setTimeout(() => {
                                    message.success({ content: 'Copied!', key, duration: 2 });
                                }, 1000);
                            }
                        } >
                            <CopyOutlined />
                            复制
                        </Space>
                    }>
                    <SourceCodeCard sourceCode={(contract.source as string).replaceAll(/\n\n\n/g, "")} />
                </Collapse.Panel>
            </Collapse>
            <ABIDeployCallerView
                web3={web3}
                compileContract={props.contract}
                className="marginCard"
                style={{
                    paddingBottom: '50px'
                }}
            />
        </Layout.Content >
    )
}