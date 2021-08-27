import Web3 from 'web3';
import { useState } from 'react';
import { AbiItem } from 'web3-utils';
import { Form, Button, Card } from 'antd';
import * as NatspecExt from '../natspec'
import { ResponseDisplay } from './response'
import './index.scss'
import './inputs'
import CreationInputElement from './inputs';
import { TxSendingState, RequestDisplay } from './request';
import { CompiledContract } from '../compile_contract';
import { template } from '@babel/core';


export function ABIDeployCallerView(props: {
    web3: Web3,
    compileContract: CompiledContract,
    style?: React.CSSProperties,
    className?: string
    onDeployed: (contract: CompiledContract) => void,
}) {
    const [form] = Form.useForm();
    const [originContact, setOriginContract] = useState<CompiledContract>();
    const [deployedContract, setDeployedContract] = useState<CompiledContract>();

    const [sendingState, setSendingState] = useState<TxSendingState>({
        waitingResponse: false,
        onHash: undefined,
        onReceipt: undefined,
        onError: undefined
    })

    const clearSendingState = () => {
        setSendingState({
            waitingResponse: false,
            onHash: undefined,
            onReceipt: undefined,
            onError: undefined
        })
    }

    if (originContact !== props.compileContract) {
        form.resetFields();
        setOriginContract(props.compileContract);
        setDeployedContract(undefined);
        clearSendingState();
    }

    const constructorABI = props.compileContract.abi.find(abi => abi.type === "constructor");
    if (constructorABI === undefined) {
        return null;
    }

    const constructorDevDoc = props.compileContract.devdoc.methods['constructor'];

    const contractDeployer = new props.web3.eth.Contract(props.compileContract.abi);

    function _send(fromData: any) {

        clearSendingState();

        setSendingState({ waitingResponse: true })

        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                try {
                    (props.web3.currentProvider as any).sendAsync({
                        method: "eth_requestAccounts"
                    }, async (error: Error, response: any) => {
                        if (error == null) {

                            const senderAddress = response.result[0];
                            let binedData = [];
                            if (constructorABI!.inputs !== undefined && constructorABI!.inputs.length > 0) {
                                binedData = NatspecExt.bindInputs(constructorABI!, fromData, constructorDevDoc);
                            }

                            let onHash: string;
                            contractDeployer.deploy({
                                data: props.compileContract.bytecode!,
                                arguments: binedData.map((value) => value),
                            })
                                .send({
                                    from: senderAddress,
                                })
                                .on("transactionHash", hash => {
                                    setSendingState({
                                        waitingResponse: true,
                                        onHash: hash,
                                    })
                                    onHash = hash;
                                })
                                .on("receipt", receipt => {
                                    setSendingState({
                                        waitingResponse: false,
                                        onHash: onHash,
                                        onReceipt: receipt,
                                    })

                                    props.web3.eth.net.getId().then(networkid => {
                                        const contractInstance = JSON.parse(JSON.stringify(props.compileContract)) as CompiledContract;
                                        contractInstance.contractName = props.compileContract.contractName;
                                        contractInstance.networks = { }
                                        contractInstance.networks[networkid.toString()] = {
                                            address: receipt.contractAddress!
                                        }

                                        setDeployedContract(contractInstance);
                                    })
                                })
                                .on("error", error => {
                                    setSendingState({
                                        waitingResponse: false,
                                        onError: error
                                    })
                                })
                        } else {
                            setSendingState({
                                waitingResponse: false,
                                onError: error,
                            });
                        }
                    })
                } catch (e) {
                    setSendingState({
                        waitingResponse: false,
                        onError: e as Error,
                        onReceipt: undefined,
                        onHash: undefined,
                    });
                }
            }, 500);
        })
    }

    return (
        <div style={props.style} className={props.className}>
            <Card title="Constructor Inputs" style={{
                width: "100%",
                padding: "0px",
                margin: "0px",
                marginTop: "20px",
            }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={_send}
                >
                    {
                        constructorABI.inputs === undefined || constructorABI.inputs?.length <= 0
                            ? null
                            : constructorABI.inputs?.map((arg, index) =>
                                CreationInputElement(
                                    arg,
                                    `${index}`,
                                    constructorDevDoc?.params !== undefined
                                        ? constructorDevDoc.params[arg.name]
                                        : undefined
                                )
                            )
                    }
                    <Form.Item>
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between"
                        }}>
                            <Button
                                type="primary"
                                danger={
                                    deployedContract === undefined
                                }
                                size="large"
                                htmlType="submit"
                                loading={sendingState.waitingResponse}
                                style={{
                                    width: "100%",
                                }}
                                onClick={() => {
                                    if (deployedContract !== undefined) {
                                        props.onDeployed(deployedContract);
                                    }
                                }}
                            >
                                {
                                    deployedContract === undefined ? "Deploy" : "Done"
                                }
                            </Button>
                        </div>
                    </Form.Item>
                </Form>
            </Card>
            <RequestDisplay state={sendingState} />
        </div>
    )
}