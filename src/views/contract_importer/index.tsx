import { useState } from "react";
import "antd/dist/antd.css";
import { Row, Button, Modal } from 'antd';
import Dragger from "antd/lib/upload/Dragger";
import './index.scss';

import CreateInstanceByTemplate from "./create_by_template";
import DeployInstanceByTemplate from "./deploy_by_template";

import {
    ImportOutlined,
    PlusCircleOutlined,
    UploadOutlined,
    SubnodeOutlined
} from '@ant-design/icons';
import { CompiledContract } from "../../components";

type ImportModalTyps = 'create_by_template' | 'import_by_url' | 'deploy_by_template' | undefined;

export function ContractImport(params: {
    onDropContractFile: (e: any) => void,
    onCheckedCompiledContract: (contract: CompiledContract) => void,
}) {
    const { onDropContractFile, onCheckedCompiledContract } = params;

    const [modalState, setModalState] = useState<ImportModalTyps>(undefined);

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
            <CreateInstanceByTemplate
                visible={modalState === 'create_by_template'}
                onCancel={() => {
                    setModalState(undefined)
                }}
                onSuccess={(contract) => {
                    setModalState(undefined)
                    onCheckedCompiledContract(contract);
                }}
            />
            <DeployInstanceByTemplate
                visible={modalState === 'deploy_by_template'}
                onCancel={() => {
                    setModalState(undefined)
                }}
                onSuccess={(contract) => {
                    setModalState(undefined)
                    onCheckedCompiledContract(contract);
                }}
            />
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">点击上传或者拖动文件至本区域</p>
            <p className="ant-upload-hint">
                仅支持标准的Compiled Contract 格式，比如truffle compile输出的文件，请注意确保是已部署的实例，请检查其中必须包含，abi，networks，字段。
            </p>
            <Row className="action-button-group">
                {
                    [
                        {
                            ghost: false,
                            icon: <PlusCircleOutlined />,
                            labelText: '通过模版ABI创建',
                            modalType: 'create_by_template' as ImportModalTyps
                        },
                        {
                            ghost: false,
                            icon: <SubnodeOutlined />,
                            labelText: '根据模版创部署新合约实例',
                            modalType: 'deploy_by_template' as ImportModalTyps
                        },
                        {
                            ghost: true,
                            icon: <ImportOutlined />,
                            labelText: '通过URL导入(暂未实现)',
                            modalType: 'import_by_url' as ImportModalTyps
                        },
                    ].map(
                        (item) =>
                            <Button
                                ghost={item.ghost}
                                disabled={item.ghost}
                                className="action"
                                type="primary"
                                size="large"
                                icon={item.icon}
                                onClick={() => {
                                    setModalState(item.modalType)
                                }}
                                style={{
                                    marginBottom: "10px"
                                }}
                            >
                                {item.labelText}
                            </Button>
                    )
                }
            </Row>
        </Dragger>

    )
}