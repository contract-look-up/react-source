import "antd/dist/antd.css";
import React from "react";
import { Button, Modal, Row } from 'antd';
import {
    PlusCircleOutlined
} from '@ant-design/icons';

const TemplateURL = () => {
    const [visible, setVisible] = React.useState(false);
    const [confirmLoading, setConfirmLoading] = React.useState(false);
    const [modalText, setModalText] = React.useState('Content of the modal');

    const showModal = () => {
        setVisible(true);
    };

    const handleOk = () => {
        setModalText('The modal will be closed after two seconds');
        setConfirmLoading(true);
        setTimeout(() => {
            setVisible(false);
            setConfirmLoading(false);
        }, 2000);
    };

    const handleCancel = () => {
        console.log('Clicked cancel button');
        setVisible(false);
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
                title="Title"
                visible={visible}
                onOk={handleOk}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
            >
                <p>{modalText}</p>
            </Modal>

        </Row>
    );
}

export default TemplateURL;