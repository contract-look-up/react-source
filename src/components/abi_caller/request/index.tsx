import { Card, Space, Spin } from 'antd';
import ReactJson from 'react-json-view';
import '../index'

export interface TxSendingState {
    waitingResponse: boolean;
    onHash?: string,
    onError?: any,
    onReceipt?: any,
}

function Title(props: { loading: boolean }) {
    return (
        <Space size="middle" >
            {props.loading ? 'Pending' : 'Result'}
            <Spin size="small" spinning={props.loading} />
        </Space>
    )
}

export function RequestDisplay(props: {
    state: TxSendingState
}) {
    return props.state.onError === undefined
        && props.state.onHash === undefined
        && props.state.onReceipt === undefined
        ? null
        : (
            <Card
                style={{
                    padding: 0,
                }}
                title={<Title loading={props.state.waitingResponse} />}>
                {props.state.onHash !== undefined ? <Card style={{ padding: 0 }} title="Hash">{props.state.onHash}</Card> : null}
                {
                    props.state.onReceipt !== undefined
                        ? <Card style={{ padding: 0 }} title="Receipt">
                            <ReactJson
                                style={{
                                    width: '100%',
                                    wordBreak: 'break-all',
                                    wordWrap: 'break-word',
                                }}
                                enableClipboard={false}
                                displayDataTypes={false}
                                displayObjectSize={false}
                                src={props.state.onReceipt as Object}
                            />
                        </Card>
                        : null
                }
                {props.state.onError !== undefined ? <Card style={{ padding: 0 }} title="Error" className="errorMessage">{props.state.onError.message}</Card> : null}
            </Card>
        )
}