import "antd/dist/antd.css";
import Dragger from "antd/lib/upload/Dragger";
import './index.scss';
import {
    UploadOutlined
} from '@ant-design/icons';
import { CompiledContract } from "../../components";

export function ContractImport(params: {
    onDropFile: (e: any) => void,
    onCheckedCompiledContract: (contract: CompiledContract) => void,
}) {
    const { onDropFile } = params;
    return (
        <Dragger
            className="dragger"
            itemRender={() => {
                return null
            }}
            openFileDialogOnClick={false}
            onDrop={onDropFile}
            directory
        >
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">拖动文件至本区域</p>
        </Dragger >
    )
}