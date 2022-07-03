import "antd/dist/antd.css";

import type { ColumnsType } from 'antd/lib/table';
import { Button, PageHeader, Table, Tag, Space, Descriptions, Select } from 'antd';
import { TransferGroup, TransferInfo } from "../../../components/structs/TransferGroup";
import { useEffect, useMemo, useState } from "react";
import { TransferConfig } from "./config";
import BN from 'bn.js';
import {
    CaretRightOutlined,
    StopOutlined,
    BugOutlined
} from '@ant-design/icons';

const { Option } = Select;
const ERC20ABI = require('../../../assets/contract-templates/build/contracts/ERC20.json').abi;

type TxState = "Ready" | "Pending" | "Queue" | "Confirmation" | "Success" | "Error";
type TaskState = "Start" | "Stop" | "Running" | "Stoping" | "HasNext" | "RetryError";

interface DataType extends TransferInfo {
    state?: TxState
    error?: string
}

export function TransferTable(params: {
    transferConfig?: TransferConfig,
    group: TransferGroup,
}) {
    const { group, transferConfig } = params;
    const [gasPrice, setGasPrice] = useState<number>(6)
    const [groupSize, setGroupSize] = useState<number>(30)
    const [taskState, setTaskState] = useState<TaskState>()
    const [needStoping, setNeedStoping] = useState<boolean>(false);
    const [dataSource, setDataSource] = useState<DataType[]>(
        group.datas.map(info => {
            return {
                ...info,
                state: "Ready",
                selected: true
            } as DataType
        })
    )
    const columns: ColumnsType<DataType> = [
        { title: '接收地址', dataIndex: 'address', key: 'address', },
        { title: '数量', dataIndex: 'amount', key: 'amount', },
        {
            title: '交易状态', dataIndex: 'state', key: 'state',
            render: (_, { state, error }) => {
                let color;
                switch (state) {
                    case "Pending": color = "geekblue"; break;
                    case "Queue": color = "processing"; break;
                    case "Success": color = "success"; break;
                    case "Error": color = "red"; break;
                    case "Ready": color = "default"; break;
                    default: color = "red";
                }
                return (state ? <Tag color={color}>{state === "Error" ? error : state}</Tag> : undefined)
            }
        },
        { title: 'Hash', dataIndex: 'txHash', key: 'txHash' },
    ]

    useEffect(() => {
        if (taskState === "RetryError") {
            dataSource.forEach(row => {
                if (row.state === "Error") {
                    row.state = "Queue"
                }
            })
            setTaskState("Running")
            setNeedStoping(false)
        }
        else if (taskState === "Start") {
            dataSource.forEach(row => {
                if (row.state === "Ready") {
                    row.state = "Queue"
                }
            })
            setTaskState("Running")
            setNeedStoping(false)
        } else if (taskState === "Running") {
            if (transferConfig?.tokenType === "BNB") {
                doTransferGroupBNB(groupSize).then((hasPending: boolean) => {
                    if (hasPending) {
                        setTaskState("HasNext")
                    } else {
                        setTaskState("Stop")
                    }
                })
            } else {
                doTransferGroupToken(groupSize).then((hasPending: boolean) => {
                    if (hasPending) {
                        setTaskState("HasNext")
                    } else {
                        setTaskState("Stop")
                    }
                })
            }
        }
        else if (taskState === "HasNext") {
            setTaskState(needStoping ? "Stop" : "Running")
        }
        else if (taskState === "Stoping") {
            setNeedStoping(true)
        }
        else if (taskState === "Stop") {
            dataSource.forEach(row => {
                if (row.state === "Queue") {
                    row.state = "Ready"
                }
            })
            setDataSource(dataSource.slice())
        }
    }, [taskState])

    let totalSentAmount = useMemo(() => {
        if (!transferConfig) {
            return new BN(0);
        }
        let sentAmount = 0;
        dataSource.forEach(row => {
            sentAmount += row.amount;
        })
        return sentAmount.toFixed(6);
    }, [dataSource, transferConfig])

    const sleep = (ms: number) => new Promise<void>((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, ms);
    })

    const doTransferGroupBNB = async (maxLimit: number) => {
        if (transferConfig!.tokenType !== "BNB") {
            return false;
        }

        let web3 = transferConfig!.hdweb3;
        let provider = transferConfig!.hdprovider;
        let accountNonce = await web3.eth.getTransactionCount(provider.getAddress());
        let balance = web3.utils.toBN(await web3.eth.getBalance(provider.getAddress()));
        let pendingTxPromise = [];

        for (let i = 0; i < dataSource.length && pendingTxPromise.length < maxLimit; i++) {
            if (dataSource[i].state === "Queue") {
                let sentAmount = web3.utils.toBN(web3.utils.toWei(dataSource[i].amount.toString()));
                let fee = web3.utils.toBN(gasPrice).muln(21000)
                if (sentAmount.add(fee).gt(balance)) {
                    dataSource[i].state = "Error"
                    dataSource[i].error = "Insufficient Balance"
                    setDataSource(dataSource.slice())
                    setTaskState("Stoping")
                    break;
                }
                balance = balance.sub(sentAmount.add(fee))
                pendingTxPromise.push(
                    web3.eth.sendTransaction({
                        from: provider.getAddress(),
                        to: dataSource[i].address,
                        value: web3.utils.toWei(dataSource[i].amount.toString()),
                        nonce: accountNonce++
                    }).once("error", function (error) {
                        dataSource[i].state = "Error"
                        dataSource[i].error = "Error"
                        setDataSource(dataSource.slice())
                    }).once("transactionHash", function (txHash) {
                        dataSource[i].txHash = txHash
                        dataSource[i].state = "Pending"
                        setDataSource(dataSource.slice())
                    }).once("receipt", function (receipt) {
                        dataSource[i].state = "Success"
                        setDataSource(dataSource.slice())
                    })
                )
                await sleep(100)
            }
        }

        await Promise.all(pendingTxPromise);
        return dataSource.filter(row => row.state === "Queue").length > 0
    }

    const doTransferGroupToken = async (maxLimit: number) => {
        let web3 = transferConfig!.hdweb3;
        let provider = transferConfig!.hdprovider;
        let accountNonce = await web3.eth.getTransactionCount(provider.getAddress());
        let tokenContract = new web3.eth.Contract(ERC20ABI, transferConfig!.tokenInfo!.tokenAddress);
        let pendingTxPromise = [];

        let balanceToken = web3.utils.toBN(await web3.eth.getBalance(provider.getAddress()));
        let balanceBNB = web3.utils.toBN(await web3.eth.getBalance(provider.getAddress()));
        let feeBNBMin = web3.utils.toBN(web3.utils.toWei("0.01"));

        if (balanceBNB.lt(feeBNBMin)) {
            setTaskState("Stoping");
            return false;
        }

        for (let i = 0; i < dataSource.length && pendingTxPromise.length < maxLimit; i++) {
            if (dataSource[i].state === "Queue") {
                let decimals = transferConfig!.tokenInfo!.decimals!;
                let decimalsPowSub4 = web3.utils.toBN(10).pow(web3.utils.toBN(decimals - 4))
                let sentAmount = web3.utils.toBN(Math.floor(dataSource[i].amount * 10000)).mul(decimalsPowSub4)

                if (balanceToken.lt(sentAmount)) {
                    dataSource[i].state = "Error"
                    dataSource[i].error = "Insufficient Balance"
                    setDataSource(dataSource.slice())
                    setTaskState("Stoping")
                    break;
                }
                balanceToken = balanceToken.sub(sentAmount)
                let txSender = tokenContract!.methods.transfer(
                    dataSource[i].address,
                    sentAmount
                );

                pendingTxPromise.push(
                    txSender.send({
                        from: provider.getAddress(),
                        nonce: accountNonce++
                    }).once("transactionHash", (txHash: any) => {
                        dataSource[i].txHash = txHash
                        dataSource[i].state = "Pending"
                        setDataSource(dataSource.slice())
                    }).then(() => {
                        dataSource[i].state = "Success"
                        setDataSource(dataSource.slice())
                    }).catch((e: any) => {
                        dataSource[i].state = "Error"
                        setDataSource(dataSource.slice())
                    })
                )
                await sleep(100)
            }
        }

        await Promise.all(pendingTxPromise);
        return dataSource.filter(row => row.state === "Queue").length > 0
    }

    return (
        <>
            <PageHeader ghost={true} title={`转出列表`} />
            <Descriptions
                bordered
                style={{
                    marginLeft: '20px',
                    marginRight: '20px',
                    marginBottom: '20px'
                }}
                column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
                <Descriptions.Item label="每批发送交易数量" span={1}>
                    <Select
                        style={{
                            "height": "100%",
                            "width": "100%",
                        }}
                        disabled={taskState === "Running"}
                        defaultValue={"30"}
                        onChange={(v) => {
                            setGroupSize(parseInt(v?.toString()))
                        }}>
                        <Option value="1">1</Option>
                        <Option value="5">5</Option>
                        <Option value="30">30</Option>
                        <Option value="40">40</Option>
                        <Option value="50">50</Option>
                    </Select>
                </Descriptions.Item>
                <Descriptions.Item label="Gas Price" span={1}>
                    <Select
                        style={{
                            "height": "100%",
                            "width": "100%",
                        }}
                        disabled={taskState === "Running"}
                        defaultValue="6"
                        onChange={(v) => {
                            setGasPrice(parseFloat(v?.toString()))
                        }}>
                        <Option value="5">5 Gwei</Option>
                        <Option value="6">6 Gwei</Option>
                        <Option value="7">7 Gwei</Option>
                        <Option value="8">8 Gwei</Option>
                    </Select>
                </Descriptions.Item>
                <Descriptions.Item label={`转出数量-${transferConfig?.tokenType === "BNB" ? "BNB" : transferConfig!.tokenInfo.symbol}`} span={1}>
                    {totalSentAmount}
                </Descriptions.Item>
            </Descriptions>
            <Space style={{
                width: '100%',
                marginLeft: '20px',
                marginRight: '20px',
                marginBottom: '20px',
            }}>
                <Button
                    type="primary"
                    icon={<CaretRightOutlined />}
                    loading={taskState === "Running"}
                    disabled={
                        (
                            taskState &&
                            taskState !== "Stop"
                        ) ||
                        dataSource.filter(row => row.state !== "Success").length === 0
                    }
                    onClick={async () => {
                        setTaskState("Start");
                    }}
                >
                    {
                        taskState === "Running"
                            ? `正在执行 ${dataSource.filter(row => row.state === "Success").length}/${dataSource.length}`
                            : taskState
                                ? `继续 ${dataSource.filter(row => row.state === "Success").length}/${dataSource.length}`
                                : "开始"
                    }
                </Button>
                <Button
                    danger
                    type="primary"
                    icon={<StopOutlined />}
                    loading={taskState === "Stoping"}
                    disabled={taskState !== "Running"}
                    onClick={() => {
                        setTaskState("Stoping")
                    }}
                >
                    {taskState === "Stoping" ? "正在停止任务" : "停止"}
                </Button>
                {
                    dataSource.filter(row => row.state === "Error").length > 0 && taskState === "Stop"
                        ?
                        <Button
                            danger
                            type="primary"
                            icon={<BugOutlined />}
                            onClick={() => {
                                dataSource.forEach(row => {
                                    if (row.state === "Error") {
                                        row.state = "Ready"
                                    }
                                })
                                setDataSource(dataSource.slice())
                            }}
                        >
                            重置错误交易
                        </Button>
                        : undefined
                }

            </Space>
            <Table
                style={{
                    marginLeft: '20px',
                    marginRight: '20px',
                }}
                bordered
                size={'middle'}
                dataSource={dataSource}
                columns={columns}
                pagination={
                    {
                        // pageSize: groupSize === 1 ? 50 : groupSize * 2
                        pageSize: 20
                    }
                }
            />
        </>

    )
}