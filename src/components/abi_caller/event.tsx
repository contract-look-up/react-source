import Web3 from 'web3';
import { EventData } from 'web3-eth-contract';
import { useState } from 'react';
import { AbiItem } from 'web3-utils';
import { Form, Button, Card } from 'antd';
import * as NatspecExt from '../natspec'
import { LogsDisplay } from './response'
import CreationInputElement from './inputs';

import './index.scss'
import './inputs'

function ABIEventCallerView(props: {
    web3: Web3,
    abi: AbiItem,
    contractAddress: string,
    devdoc?: NatspecExt.DevMethodDoc,
    userdoc?: NatspecExt.UserMethodDoc,
    style?: React.CSSProperties,
    className?: string
}) {
    const { web3 } = props;
    const [form] = Form.useForm();
    const [originAbi, setOriginAbi] = useState<AbiItem>();
    const [waitingResponse, setWaitingResponse] = useState(false);
    const [logsData, setLogsData] = useState<EventData[]>();

    if (originAbi !== props.abi) {
        form.resetFields();
        setOriginAbi(props.abi);
        setWaitingResponse(false);
        setLogsData([])
    }

    function doFetchLogs(values: any) {
        setWaitingResponse(true);

        const filter: any = {}

        props.abi.inputs?.filter(input => input.indexed)
            .forEach((input, i) => {
                filter[input.name] = values[i]
            });

        // 使用Contract对象请求Logs，因为不想写topics的填充算法
        const contract = new web3.eth.Contract([props.abi], props.contractAddress);
        contract.getPastEvents(props.abi.name!, {
            filter: filter,
            fromBlock: values.fromBlock,
            toBlock: values.toBlock
        }).then((logs) => {
            setLogsData(logs);
            setWaitingResponse(false);
        }).catch(reason => {
            setWaitingResponse(false);
        })
    }

    return (
        <div style={props.style} className={props.className}>
            <Card title="Filter" style={{
                width: "100%",
                padding: "0px",
                margin: "0px",
                marginTop: "20px",
            }}>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={doFetchLogs}
                >
                    {
                        CreationInputElement(
                            {
                                name: 'fromBlock',
                                type: 'string',
                            },
                            `fromBlock`,
                            `起始查询区块高度 $number`
                        )
                    }
                    {
                        CreationInputElement(
                            {
                                name: 'toBlock',
                                type: 'string',
                            },
                            `toBlock`,
                            `结束查询区块高度 $number`
                        )
                    }
                    {
                        props.abi.inputs === undefined || props.abi.inputs?.length <= 0
                            ? null
                            : props.abi.inputs?.filter((input) => input.indexed).map((arg, index) =>
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
                        <Button
                            type="primary"
                            size="large"
                            htmlType="submit"
                            loading={waitingResponse}
                            style={{
                                width: "100%",
                            }}
                        >
                            {waitingResponse ? 'Fetching' : 'Fetch'}
                        </Button>
                    </Form.Item>
                    {
                        <LogsDisplay
                            web3={props.web3}
                            abi={props.abi}
                            data={logsData}
                            devdoc={props.devdoc}
                        />
                    }
                </Form>
            </Card>
        </div>
    )
}

export default ABIEventCallerView