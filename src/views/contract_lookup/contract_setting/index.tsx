import "antd/dist/antd.css";
import { Card, Layout, PageHeader, Table, Badge } from 'antd';
import { CompiledContract, SourceCodeCard } from '../../../components';
import { Descriptions } from 'antd';
import moment from "moment";

function NetWorkTable(params: {
    networks: Object[],
    networkID: number,
}) {
    const { networks, networkID } = params;

    const dataSource = [];

    for (var a in networks) {
        dataSource.push({
            connected: parseInt(a) === networkID,
            networkid: a,
            contractAddress: (networks[a] as any).address
        })
    }

    return (
        <Card
            bodyStyle={{ padding: 0 }}
            style={{
                marginTop: '20px',
                marginLeft: '20px',
                marginRight: '20px',
                padding: 0,
            }}
        >
            <Table
                columns={[
                    {
                        title: 'NetWork',
                        dataIndex: 'networkid',
                        key: 'networkid',
                        render: (text: string, row) =>
                            <span>
                                {
                                    row.connected ? <Badge status="success" /> : null
                                }
                                {
                                    text
                                }
                            </span>
                    },
                    {
                        title: 'Address',
                        dataIndex: 'contractAddress',
                        key: 'contractAddress',
                        render: (text: string) => <span>{text}</span>
                    },
                ]}
                pagination={false}
                dataSource={dataSource}
            >
            </Table>
        </Card>
    )
}


export function ContractSetting(params: {
    contract: CompiledContract,
    networkID: number,
}) {
    const { contract, networkID } = params;

    return (
        <Layout.Content style={{
            minHeight: '100%',
            background: 'white',
            borderLeftColor: '#EAEAEA',
            borderLeftWidth: '1px',
            borderLeftStyle: 'solid'
        }}>
            <PageHeader
                ghost={false}
                title={contract.contractName}
                onBack={() => { }}
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
                <Descriptions.Item label="UpdateTime">
                    {
                        contract.compiler?.version === undefined ? "None" : moment(contract.updatedAt).format('YYYY-MM-DD hh:mm:ss')
                    }
                </Descriptions.Item>
            </Descriptions>
            <NetWorkTable networks={contract.networks} networkID={networkID} />
            {
                contract.source !== undefined
                    ?
                    <Card style={{
                        marginLeft: '20px',
                        marginRight: '20px',
                    }}>
                        <SourceCodeCard sourceCode={contract.source} />
                    </Card>
                    : null
            }
        </Layout.Content>
    )
}