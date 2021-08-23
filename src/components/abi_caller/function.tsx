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

interface TxCallingState {
    waitingResponse: boolean,
    error?: Error,
    result?: any
}

function ABIFunctionCallerView(props: {
    web3: Web3,
    abi: AbiItem,
    contractAddress: string,
    devdoc?: NatspecExt.DevMethodDoc,
    userdoc?: NatspecExt.UserMethodDoc,
    style?: React.CSSProperties,
    className?: string
}) {
    const [form] = Form.useForm();
    const [originAbi, setOriginAbi] = useState<AbiItem>();
    const [callingState, setCallingState] = useState<TxCallingState>({
        waitingResponse: false,
    });

    const [sendingState, setSendingState] = useState<TxSendingState>({
        waitingResponse: false,
        onHash: undefined,
        onReceipt: undefined,
        onError: undefined
    })

    const clearCallingState = () => {
        setCallingState({
            waitingResponse: false,
            error: undefined,
            result: undefined
        })
    }
    const clearSendingState = () => {
        setSendingState({
            waitingResponse: false,
            onHash: undefined,
            onReceipt: undefined,
            onError: undefined
        })
    }

    let isSendCommit = false

    if (originAbi !== props.abi) {
        form.resetFields();
        setOriginAbi(props.abi);
        setCallingState({
            waitingResponse: false,
        });
        clearSendingState();
    }

    // 该方法是否需要Send
    const isWriteFunction = ['nonpayable', 'payable'].includes(props.abi.stateMutability!.toString())

    function _send(fromData: any) {
        clearSendingState();
        clearCallingState();

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
                            if (props.abi.inputs !== undefined && props.abi.inputs.length > 0) {
                                binedData = NatspecExt.bindInputs(props.abi, fromData, props.devdoc);
                            }

                            const transaction = {
                                from: senderAddress,
                                to: props.contractAddress,
                                data: props.web3.eth.abi.encodeFunctionCall(
                                    props.abi,
                                    binedData.map((value) => value)
                                )
                            }

                            let onHash: string;

                            props.web3.eth.sendTransaction(transaction)
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

    function _call(fromData: any) {

        clearSendingState();
        clearCallingState();

        setCallingState({
            waitingResponse: true,
        });

        return new Promise<void>((resolve, reject) => {
            setTimeout(() => {
                try {
                    (props.web3.currentProvider as any).sendAsync({
                        method: "eth_requestAccounts"
                    }, async (error: Error, response: any) => {
                        if (error == null) {

                            const senderAddress = response.result[0];
                            let binedData = [];
                            if (props.abi.inputs !== undefined && props.abi.inputs.length > 0) {
                                binedData = NatspecExt.bindInputs(props.abi, fromData, props.devdoc);
                            }

                            const transaction = {
                                from: senderAddress,
                                to: props.contractAddress,
                                data: props.web3.eth.abi.encodeFunctionCall(
                                    props.abi,
                                    binedData.map((value) => value)
                                )
                            }

                            props.web3.eth.call(transaction)
                                .then(outputRaw => {
                                    setCallingState({
                                        waitingResponse: false,
                                        result: outputRaw
                                    });
                                })
                                .catch(e => {
                                    setCallingState({
                                        waitingResponse: false,
                                        error: e as Error
                                    });
                                });

                        } else {
                            setCallingState({
                                waitingResponse: false,
                                error: error,
                            });
                        }
                    })
                } catch (e) {
                    setCallingState({
                        waitingResponse: false,
                        error: e as Error
                    });
                }
            }, 500);
        })
    }

    return (
        <div style={props.style} className={props.className}>
            <Card title="Inputs" style={{
                width: "100%",
                padding: "0px",
                margin: "0px",
                marginTop: "20px",
            }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(data) => {
                        isSendCommit
                            ? _send(data)
                            : _call(data)
                    }}
                >
                    {
                        props.abi.inputs === undefined || props.abi.inputs?.length <= 0
                            ? null
                            : props.abi.inputs?.map((arg, index) =>
                                CreationInputElement(
                                    arg,
                                    `${index}`,
                                    props.devdoc
                                        && props.devdoc.params
                                        && props.devdoc.params[arg.name]
                                        ? props.devdoc.params[arg.name]
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
                                size="large"
                                htmlType="submit"
                                loading={callingState.waitingResponse}
                                disabled={sendingState.waitingResponse}
                                style={{
                                    width: "100%",
                                    marginRight: isWriteFunction ? "20px" : "0px"
                                }}
                                onClick={() => {
                                    isSendCommit = false
                                }}
                            >
                                Call
                            </Button>
                            {
                                isWriteFunction
                                    ? <Button
                                        type="primary"
                                        danger
                                        size="large"
                                        htmlType="submit"
                                        loading={sendingState.waitingResponse}
                                        disabled={callingState.waitingResponse}
                                        style={{
                                            width: "100%",
                                            marginLeft: "20px"
                                        }}
                                        onClick={() => {
                                            isSendCommit = true
                                        }}
                                    >
                                        Send
                                    </Button>
                                    : null
                            }
                        </div>
                    </Form.Item>
                </Form>
            </Card>
            {
                callingState.result
                    ? <ResponseDisplay
                        web3={props.web3}
                        abi={props.abi}
                        data={callingState.result}
                        devdoc={props.devdoc}
                    />
                    : null
            }
            {
                callingState.error
                    ? <Card
                        className="errorMessage"
                        title="Error Infomation"
                    >
                        {callingState.error.message}
                    </Card>
                    : null
            }
            <RequestDisplay state={sendingState} />
        </div>
    )
}

export default ABIFunctionCallerView