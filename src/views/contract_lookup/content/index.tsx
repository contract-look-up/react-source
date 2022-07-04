import Web3 from "web3";
import "antd/dist/antd.css";
import { Card, Layout, PageHeader } from 'antd';
import * as utils from "../../../utils"
import { AbiItem } from 'web3-utils';
import { ABIEventCallerView, ABIFunctionCallerView, CompiledContract, SourceCodeCard } from "../../../components"

import './index.scss';

export function FunctionContent(props: {
    contract: CompiledContract,
    abi: AbiItem,
    networkID?: number,
    web3?: Web3
}) {
    const { contract, abi, networkID, web3 } = props

    const deployedAddress = contract.networks !== undefined && networkID && contract.networks[networkID] ? contract.networks[networkID].address : undefined;

    const fname = utils.functionFormatStringFromABI(abi)
    const devdoc = contract.devdoc && contract.devdoc.methods && contract.devdoc.methods[fname] ? contract.devdoc.methods[fname] : undefined
    const userdoc = contract.userdoc && contract.userdoc.methods && contract.userdoc.methods[fname] ? contract.userdoc.methods[fname] : undefined
    const eventDoc = contract.devdoc && contract.devdoc.events && contract.devdoc.events[fname] ? contract.devdoc.events[fname] : undefined

    function parsedTitle() {
        if (contract.userdoc !== undefined
            && contract.userdoc.methods !== undefined
            && contract.userdoc.methods[fname] !== undefined
            && contract.userdoc.methods[fname].notice !== undefined
        ) {
            return contract.userdoc.methods[fname].notice;
        } else {
            return ''
        }
    }

    function Details() {
        if (contract.devdoc !== undefined
            && contract.devdoc.methods !== undefined
            && contract.devdoc.methods[fname] !== undefined
            && contract.devdoc.methods[fname].details !== undefined
        ) {
            return <Card title="描述" className="marginCard">{contract.devdoc.methods[fname].details}</Card>
        } else {
            return null
        }
    }

    return (
        <Layout.Content title={abi.name} style={{
            minHeight: '100%',
            background: 'white',
            borderLeftColor: '#EAEAEA',
            borderLeftWidth: '1px',
            borderLeftStyle: 'solid'
        }}>
            <PageHeader
                ghost={false}
                title={abi.name}
                onBack={() => { }}
                subTitle={parsedTitle()}
            // extra={[
            //     <Button key="3">Operation</Button>,
            //     <Button key="2">Operation</Button>,
            //     <Button key="1" type="primary">
            //         Primary
            //     </Button>,
            // ]}
            />
            <Details />
            <Card title="原型" className="marginCard">
                <SourceCodeCard sourceCode={utils.functionSourceCodeFormatFromABI(abi)} />
            </Card>
            {
                abi.type === 'function' && web3
                    ? <ABIFunctionCallerView
                        className="marginCard"
                        style={{
                            // marginBottom: '50px'
                            paddingBottom: '50px'
                        }}
                        abi={abi}
                        web3={web3}
                        contractAddress={deployedAddress}
                        devdoc={devdoc}
                        userdoc={userdoc}
                    />
                    : null
            }
            {
                abi.type === 'event' && web3
                    ? <ABIEventCallerView
                        className="marginCard"
                        style={{
                            // marginBottom: '50px'
                            paddingBottom: '50px'
                        }}
                        abi={abi}
                        web3={web3}
                        contractAddress={deployedAddress}
                        devdoc={eventDoc}
                        userdoc={userdoc}
                    />
                    : null
            }
        </Layout.Content >
    )
}