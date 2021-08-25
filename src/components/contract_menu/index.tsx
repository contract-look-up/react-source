import Web3 from "web3";
import { useState } from 'react';
import { Layout, Menu, Button } from 'antd';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';

import {
    ProfileFilled,
    AreaChartOutlined,
    BarChartOutlined,
    UserOutlined,
    UploadOutlined,
    SettingFilled,
} from '@ant-design/icons';

import * as utils from '../../utils'
import { CompiledContract } from '../compile_contract'

import './index.scss'

function ContractMenu(props: {
    contracts: CompiledContract[],
    onSelected: MenuClickEventHandler,
    onDropFile: (e: any) => void,
}) {
    const web3 = new Web3((window as any).ethereum);

    const [ownerAddress, setOwnerAddress] = useState<string | undefined>("");

    try {
        (web3.currentProvider as any).sendAsync({
            method: "eth_requestAccounts"
        }, (error: Error, response: any) => {
            if (error == null) {
                setOwnerAddress(response.result[0]);
                return;
            }
        })
    } catch (e) {
        setOwnerAddress(undefined)
    }

    function MenuHeader() {
        return (
            <Button
                style={{
                    width: '100%',
                    height: '50px',
                }}
                size="middle"
                type="primary"
                icon={<UserOutlined />}
                danger={ownerAddress !== undefined && ownerAddress.length <= 0}
            > 
            {/* {
                    ownerAddress === undefined
                        ? 'Connect Failed'
                        : ownerAddress.length <= 0
                            ? 'Connectioning' :
                            `${ownerAddress.slice(0, 10)}...${ownerAddress.slice(ownerAddress.length - 10, ownerAddress.length)}`
                } */}
            </Button>
        )
    }

    return (
        <Layout.Sider
            width='20vw'
            theme="light"
            style={{
                overflow: 'auto',
                height: '100vh',
                position: 'fixed',
                left: 0,
            }}
            
            breakpoint="md"
        >
            
            <MenuHeader />
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
                                    合约信息
                                </Menu.Item>
                                <Menu.SubMenu
                                    key={`${contractObject.contractName}-function`}
                                    title="函数调用"
                                    icon={<AreaChartOutlined />}
                                >
                                    {
                                        contractObject.abi.filter((abiFun) => {
                                            return abiFun.type === 'function'
                                        }).map((abi, index) => {
                                            const funSignFormat = utils.functionFormatStringFromABI(abi);
                                            return (
                                                <Menu.Item
                                                    key={web3.eth.abi.encodeFunctionSignature(abi)}
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
                                                    key={web3.eth.abi.encodeFunctionSignature(abi)}
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
                        onClick={props.onSelected}
                    >
                        Upload Contract
                    </Menu.Item>
                }

            </Menu>
        </Layout.Sider>


    );
}

export default ContractMenu;