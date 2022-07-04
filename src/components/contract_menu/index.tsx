import { Layout, Menu } from 'antd';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';

import {
    ProfileFilled,
    AreaChartOutlined,
    BarChartOutlined,
    UploadOutlined,
    SettingFilled,
} from '@ant-design/icons';

import * as utils from '../../utils'
import { CompiledContract } from '../compile_contract'

import './index.scss'

const AbiCoder = require('web3-eth-abi');

function ContractMenu(props: {
    contracts: CompiledContract[],
    onSelected: MenuClickEventHandler,
    onDropFile: (e: any) => void,
}) {
    return (
        <Layout.Sider
            width='20vw'
            theme="light"
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
                flex: 1
            }}
            breakpoint="md"
        >
            <Menu
                mode="inline"
                theme="light"
                style={{ height: '100%', borderRight: 1 }}
            >
                {
                    props.contracts.map((contractObject, contractIndex) => {
                        return (
                            <Menu.SubMenu
                                key={contractObject.contractName}
                                icon={<ProfileFilled />}
                                title={contractObject.contractName}>
                                <Menu.Item
                                    key={`${contractObject.contractName}-setting`}
                                    onClick={props.onSelected}
                                    icon={<SettingFilled />}
                                >
                                    合约信息
                                </Menu.Item>
                                <Menu.SubMenu
                                    key={`${contractObject.contractName}-function`}
                                    title="函数调用"
                                    icon={<AreaChartOutlined />}
                                >
                                    {
                                        contractObject.abi.filter((abiFun) => {
                                            return abiFun.type === 'function'
                                        }).map((abi) => {
                                            const funSignFormat = utils.functionFormatStringFromABI(abi);
                                            return (
                                                <Menu.Item
                                                    key={AbiCoder.encodeFunctionSignature(abi)}
                                                    onClick={props.onSelected}
                                                >
                                                    {
                                                        contractObject.userdoc !== undefined && contractObject.userdoc.methods[funSignFormat] !== undefined
                                                            ? contractObject.userdoc.methods[funSignFormat].notice
                                                            : abi.name
                                                    }
                                                </Menu.Item>
                                            )
                                        })
                                    }
                                </Menu.SubMenu>
                                <Menu.SubMenu
                                    key={`${contractObject.contractName}-event`}
                                    title="事件查询"
                                    icon={<BarChartOutlined />}
                                >
                                    {
                                        contractObject.abi.filter((abiFun) => {
                                            return abiFun.type === 'event'
                                        }).map((abi, index) => {
                                            return (
                                                <Menu.Item
                                                    // key={`${contractObject.contractName}-event-${index}`}
                                                    key={AbiCoder.encodeFunctionSignature(abi)}
                                                    onClick={props.onSelected}>
                                                    {
                                                        abi.name
                                                    }
                                                </Menu.Item>
                                            )
                                        })
                                    }
                                </Menu.SubMenu>
                            </Menu.SubMenu>
                        )
                    })
                }
                {
                    <Menu.Item
                        key='upload'
                        icon={<UploadOutlined />}
                        onClick={
                            props.onSelected
                        }
                    >
                        Connection Contract
                    </Menu.Item>
                }
            </Menu>
        </Layout.Sider>


    );
}

export default ContractMenu;