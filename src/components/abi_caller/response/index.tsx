import Web3 from 'web3';
import { EventData } from 'web3-eth-contract';
import { AbiItem } from 'web3-utils';
import { Table, Card } from 'antd';
import { DevMethodDoc } from '../../natspec'
import ReactJson from 'react-json-view';
import * as NatspecExt from '../../natspec'

export function LogsDisplay(props: {
    abi: AbiItem,
    data?: EventData[],
    web3: Web3,
    devdoc?: DevMethodDoc
}) {
    const { abi, data, web3, devdoc } = props;

    const columns =
        abi.inputs?.map(input => {
            const extDesc = devdoc && devdoc.params && devdoc.params[input.name]
                ? NatspecExt.matchingTypeDescription(devdoc.params[input.name])
                : undefined;
            return {
                title: extDesc !== undefined ? extDesc.content : input.name,
                dataIndex: input.name,
                key: input.name,
                render: (text: string) => <span>{text}</span>
            }
        });

    const dataSource = data?.map((log, index) => {
        const decoedLog = web3.eth.abi.decodeLog(abi.inputs!, log.raw.data, log.raw.topics.slice(1))
        return NatspecExt.bindLogs(abi, decoedLog, props.devdoc)
    })

    return (
        <Card title="Fethed Logs" bodyStyle={{ padding: 0 }}>
            <Table
                columns={columns}
                dataSource={dataSource}
                bordered
            // pagination={false}
            />
        </Card>
    )
}

export function ResponseDisplay(props: {
    abi: AbiItem,
    data: string,
    web3: Web3,
    devdoc?: DevMethodDoc
}) {
    const { abi, data, web3, devdoc } = props;

    const columns = [
        {
            title: '参数名',
            dataIndex: 'param',
            key: 'param',
            render: (text: string) => <span>{text}</span>
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (text: string) => <span>{text}</span>
        },
        {
            title: '描述',
            dataIndex: 'desc',
            key: 'desc',
            render: (text: string) => <span>{text}</span>
        },
        {
            title: '返回值',
            dataIndex: 'value',
            key: 'value',
            render: (text: any, record: any) => <span>
                {(record.type as string).endsWith('[]') ? (record.type as string).replaceAll('[]', `[${text.length}]`) : text}
            </span>,
        }
    ]

    const outputs = new Array<{
        key: number,
        param: string,
        type: string,
        value: string | Object,
        desc?: string,
    }>()

    if (abi.outputs !== undefined && abi.outputs.length > 0) {
        const values = web3.eth.abi.decodeParameters(
            abi.outputs,
            data
        )

        const binded = NatspecExt.bindOutputs(abi, values, props.devdoc)

        abi.outputs.forEach((output, index) => {
            const extDesc = devdoc && devdoc.returns && devdoc.returns[output.name]
                ? NatspecExt.matchingTypeDescription(devdoc.returns[output.name])
                : undefined;

            outputs.push({
                key: index,
                param: output.name !== undefined && output.name.length > 0 ? output.name : '未命名',
                type: output.type,
                value: typeof binded[index] === 'boolean' ? (binded[index] ? '是' : '否') : binded[index],
                desc: extDesc !== undefined ? extDesc.content : "无"
            })
        })
    }

    return (
        <Card title="Outputs" bodyStyle={{ padding: 0 }}>
            <Table
                columns={columns}
                dataSource={outputs}
                bordered
                pagination={false}
                expandable={{
                    expandedRowRender: (record) => {
                        return (
                            <ReactJson displayDataTypes={false} displayObjectSize={false} src={record.value as Object} />
                        )
                    },
                    rowExpandable: record => record.type.endsWith('[]')
                }}
            />
        </Card>
    )
}

