import "antd/dist/antd.css";

import { Layout, PageHeader } from 'antd';
import { TransferGroup } from "../../../components/structs/TransferGroup";

import { useState } from "react";
import { ConfigInputer, TransferConfig } from "./config";
import { InfomationDisplayer } from "./infomation";
import { TransferTable } from "./table";

export function GroupTransfer(params: {
    group: TransferGroup
}) {
    const { group } = params;
    const [config, setConfig] = useState<TransferConfig>();

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
                title={`批量转账任务 - ${group.name}`}
            />
            {
                config
                    ? <InfomationDisplayer config={config} />
                    : <ConfigInputer onVerifiedConfig={(c) => { setConfig(c) }} />
            }
            {
                config
                    ? <TransferTable transferConfig={config} group={group} />
                    : undefined
            }

        </Layout.Content>
    )
}