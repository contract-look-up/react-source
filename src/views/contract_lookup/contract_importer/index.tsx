import React, { useCallback } from "react";
import "antd/dist/antd.css";
import { Row, Button } from 'antd';
import Dragger from "antd/lib/upload/Dragger";
import './index.scss';

import {
    ImportOutlined,
    UploadOutlined
} from '@ant-design/icons';
import TemplateURL from "./content-template";


export function ContractImport(params: {
    onDropContractFile: (e: any) => void
}) {
    const { onDropContractFile } = params;
     const oncheck= useCallback((address :string , index : number) :Boolean=> {
        console.log(address,index)
              return true
    },[]) 
    // const onSuccers= useCallback((address :string , index : number) :void=> {
    //     console.log(address,index)
    //           
    // },[])

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
            <TemplateURL oncheck={oncheck}  />
            <Row className="action-button-group">
               <Button ghost disabled className="action" type="primary" size="large" icon={<ImportOutlined />}>通过URL导入(暂未实现)</Button>
            </Row>
        </Dragger>
    )
}