import "antd/dist/antd.css";
import { useState } from "react";
import { Button, Form, Input, Modal, Row, Select } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';


const { Option } = Select;
const options = [
    'ERC20Token',
    'ERC21Token',
    'ERC22Token',
    'ERC23Token',
    'ERC24Token',
    'ERC25Token',
    'ERC26Token',
    'ERC27Token',
    'ERC28Token',
    'ERC29Token',
]

const TemplateURL = (props: any) => {
    const [form] = Form.useForm();
    const [visible, setVisible] = useState(false);
    const [confirmLoading] = useState(false);
    const [address,setAddress]=useState('');
    const [ercIndex,setErcIndex]=useState(-1)

    const showModal = () => {
        setVisible(true);
    };

    function handleChange(value: number) {
        setErcIndex(value)
    }
    const enterAddress = (e: any) => {
       
        setAddress( e.target.value)
    }
    const handleCancel = () => {
        setVisible(false);
    };

    const handleOk = (values: any) => {
        if(ercIndex >=0 && address.length >20){
            props.oncheck(address,ercIndex)
        }else{
            console.error(Error);
            
        }
       
    }; 
    return (

        <Row className="action-button-group">
            <Button
                type="primary"
                onClick={showModal}
                className="action"
                size="large"
                icon={<PlusCircleOutlined />}
            >
                通过模版ABI创建
            </Button>
            <Modal
                title="通过模版ABI创建"
                visible={visible}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                maskClosable={false}
                centered={true}
                destroyOnClose={true}
            >
                <Form>
                    <Form.Item
                        label="模板"
                        name="username"
                        rules={[{ required: true, message: 'Please input your username!' }]}
                        style={{
                            marginTop: '20px',
                            width: '90%',
                        }}
                        preserve={false}
                        labelAlign={"right"}
                    >
                        <Select
                            placeholder="--请选择模板--"
                            onSelect={handleChange}
                        >
                            {options.map((item, index) =>
                                <Option value={index} key={index}>{item}</Option>
                            )}
                        </Select>
                    </Form.Item>
                </Form>
                <Form form={form}
                    style={{
                        width: '90%',
                    }}
                    name="basic"
                >
                    <Form.Item
                        label="地址"
                        name="username"
                        rules={[{ pattern: new RegExp('^0x([0-9]|[a-z]|[A-Z]){40}$'), required: true, message: '请输入一个正确的十六进制地址，已0x开头' }]}
                        // hasFeedback 
                        labelAlign={"right"}
                    >
                        <Input allowClear  onChange={(e) => { enterAddress(e) }} />
                    </Form.Item>
                </Form>
            </Modal>
        </Row>
    );

}

export default TemplateURL;