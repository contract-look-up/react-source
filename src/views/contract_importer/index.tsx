import Web3 from "web3";
import "antd/dist/antd.css";
import { Layout, PageHeader, Table, Badge, Row, Col, Divider, Button } from 'antd';
import Dragger from "antd/lib/upload/Dragger";
import * as utils from "../../utils"
import { AbiItem } from 'web3-utils';
import { ABIFunctionCallerView, ABIEventCallerView } from "../../components/abi_caller";
import { CompiledContract } from '../../components/compile_contract'
import { SourceCodeCard } from "../../components/source_code";
import { Descriptions } from 'antd';
import moment from "moment";
import './index.scss';

import {
    ImportOutlined,
    PlusCircleOutlined,
    UploadOutlined
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
                <Button ghost disabled className="action" type="primary" size="large" icon={<PlusCircleOutlined />} >通过模版ABI创建</Button>
                <Button ghost disabled className="action" type="primary" size="large" icon={<ImportOutlined />}>通过URL导入</Button>
            </Row>
        </Dragger>
    )
}