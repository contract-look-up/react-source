import "antd/dist/antd.css";
import { useState } from "react";
import { Table, Modal, Button, Space } from 'antd';
import { CompiledContract } from "../../components";
import { Deployer } from "../../components/deployer";

import './index.scss';

const templates: Array<CompiledContract> = [
    require('../../assets/contract-templates/build/contracts/ERC20TemplateToken.json'),
]

type deployStep = 'select_template' | 'deploy_infomation'

interface TemplateType {
    key: string,
    template_name: string,
    description: string
}

const DeployInstanceByTemplate = (props: {
    onSuccess: (contract: CompiledContract) => void,
    onCancel: () => void,
    visible: boolean,
}) => {

    const [step, setStep] = useState<deployStep>('select_template');

    const handleCancel = (e: any) => {
        props.onCancel();
    };

    const footer = () =>
        <Space className="footer-actions">
            {
                step === 'deploy_infomation'
                    ? null
                    : <Button className="action" size="middle" type="primary" onClick={_ => {
                        setStep('deploy_infomation')
                    }}>下一步</Button>
            }
        </Space>

    const handleOk = (e: any) => {
        if (step === 'select_template') {
            setStep('deploy_infomation')
        }
    };

    return (
        <Modal
            className="select-template"
            width={
                step === 'select_template' ? '60%' : '80%'
            }
            title="通过模版ABI创建"
            visible={props.visible}
            centered={step === 'select_template'}
            destroyOnClose={true}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={footer()}
        >
            {
                step === 'select_template'
                    ? <Table className="template-tables"
                        rowSelection={{
                            type: 'radio',
                            onChange: (selectedRowKeys: React.Key[], selectedRows: TemplateType[]) => {
                                console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
                            },
                            getCheckboxProps: (record: TemplateType) => ({
                                disabled: record.template_name === 'Disabled User', // Column configuration not to be checked
                                name: record.template_name,
                            }),
                        }}
                        pagination={false}
                        showHeader={false}
                        columns={[
                            {
                                title: '模版名称',
                                dataIndex: 'template_name',
                                key: 'template_name',
                                render: (text: string) => <span>{text}</span>
                            },
                            {
                                title: '描述',
                                dataIndex: 'description',
                                key: 'description',
                                render: (text: string) => <span>{text}</span>
                            }
                        ]}
                        dataSource={[
                            {
                                key: '1',
                                template_name: templates[0].contractName + '1',
                                description: "模版描述，模版描述，模版描述"
                            },
                            {
                                key: '2',
                                template_name: templates[0].contractName + '2',
                                description: "模版描述，模版描述，模版描述"
                            },
                            {
                                key: '3',
                                template_name: templates[0].contractName + '3',
                                description: "模版描述，模版描述，模版描述"
                            },
                            {
                                key: '4',
                                template_name: templates[0].contractName + '4',
                                description: "模版描述，模版描述，模版描述"
                            }
                        ]}
                    />
                    : null
            }
            {
                step === 'deploy_infomation'
                    ? <Deployer contract={templates[0]} onDeployed={contractInstance => {
                        props.onSuccess(contractInstance)
                    }} />
                    : null
            }
        </Modal >
    );
}

export default DeployInstanceByTemplate;