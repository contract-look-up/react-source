import Web3 from "web3";
import "antd/dist/antd.css";
import { useState, useEffect } from "react";
import { Form, Input, Modal, Select } from 'antd';
import { CompiledContract } from "../../components";

const { Option } = Select;
const templates: Array<CompiledContract> = [
    require('../../assets/contract-templates/build/contracts/ERC20TemplateToken.json'),
]

const CreateInstanceByTemplate = (props: {
    onSuccess: (contract: CompiledContract) => void,
    onCancel: () => void,
    visible: boolean,
}) => {
    const web3 = new Web3((window as any).ethereum);

    const [form] = Form.useForm();
    const [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        return function cleanup() {
            form.resetFields();
            setConfirmLoading(false);
        }
    })

    const handleCancel = (e: any) => {
        props.onCancel();
    };

    const handleOk = (e: any) => {

        const formData = form.getFieldsValue();

        if (
            formData.template_index === undefined ||
            formData.contract_address === undefined ||
            !/^0x([0-9]|[a-z]|[A-Z]){40}$/.test(formData.contract_address)
        ) {
            return;
        }

        setConfirmLoading(true)

        const template = JSON.parse(JSON.stringify(templates[formData.template_index]))

        setTimeout(() => {
            web3.eth.getCode(formData.contract_address)
                .then((codes) => {
                    if (codes.length >= 10) {
                        return web3.eth.net.getId();
                    }
                })
                .then((networkid) => {

                    if (networkid === undefined) {
                        throw new Error("无法获取网络ID");
                    }

                    template.contractName = formData.contract_name;
                    template.networks = {}
                    template.networks[networkid.toString()] = {
                        address: formData.contract_address
                    }

                    props.onSuccess(template);
                })
                .catch(e => {
                    console.log(e);
                })
                .finally(() => {
                    setConfirmLoading(false);
                })
        }, 1000);
    };

    return (
        <Modal
            width="60%"
            title="通过模版ABI创建"
            visible={props.visible}
            okText="Check And Create"
            confirmLoading={confirmLoading}
            maskClosable={false}
            centered={true}
            destroyOnClose={true}
            onOk={handleOk}
            onCancel={handleCancel}
            okButtonProps={{
                htmlType: "submit",
                type: "primary",
                size: "middle"
            }}
        >
            <Form form={form}>
                <Form.Item
                    label="模板"
                    name="template_index"
                    rules={[{ required: true, message: 'Please input your username!' }]}
                    style={{
                        marginTop: '20px',
                        width: '100%',
                    }}
                    labelAlign={"right"}
                >
                    <Select placeholder="--请选择模板--">
                        {
                            templates.map((item, index) =>
                                <Option value={index} key={index}>{item.contractName}</Option>
                            )
                        }
                    </Select>
                </Form.Item>
                <Form.Item
                    label="名称"
                    name="contract_name"
                    required
                    labelAlign={"right"}
                >
                    <Input allowClear />
                </Form.Item>
                <Form.Item
                    label="地址"
                    name="contract_address"
                    rules={[{ pattern: new RegExp('^0x([0-9]|[a-z]|[A-Z]){40}$'), required: true, message: '请输入一个正确的十六进制地址，已0x开头' }]}
                    labelAlign={"right"}
                >
                    <Input allowClear />
                </Form.Item>
            </Form>
        </Modal >
    );
}

export default CreateInstanceByTemplate;