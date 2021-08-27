import "antd/dist/antd.css";
import { Row, Button, Modal } from 'antd';
import Dragger from "antd/lib/upload/Dragger";
import './index.scss';

import {
    ImportOutlined,
    PlusCircleOutlined,
    UploadOutlined,
    SubnodeOutlined
} from '@ant-design/icons';



export function ContractImport(params: {
    onDropContractFile: (e: any) => void
}) {
    const { onDropContractFile } = params;
    return (
        <Dragger
            className="dragger"
            itemRender={() => {
                return null
            }}
            openFileDialogOnClick={false}
            onDrop={onDropContractFile}
            directory
        >
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">点击上传或者拖动文件至本区域</p>
            <p className="ant-upload-hint">
                仅支持标准的Compiled Contract 格式，比如truffle compile输出的文件，请注意确保是已部署的实例，请检查其中必须包含，abi，networks，字段。
            </p>
            <Row className="action-button-group">
                <Button ghost disabled className="action" type="primary" size="large" icon={<PlusCircleOutlined />} >通过模版ABI创建(暂未实现)</Button>
                <Button ghost disabled className="action" type="primary" size="large" icon={<ImportOutlined />}>通过URL导入(暂未实现)</Button>
                <Button className="action" type="primary" size="large" icon={<SubnodeOutlined />}>根据模版创部署新合约实例</Button>
            </Row>
        </Dragger>
    )
}