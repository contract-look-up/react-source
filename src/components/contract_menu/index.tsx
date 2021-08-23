import Web3 from "web3";
import { useState } from 'react';
import { AbiItem } from 'web3-utils';
import { Layout, Menu, Button } from 'antd';

import {
    ProfileFilled,
    AreaChartOutlined,
    BarChartOutlined,
    UserOutlined,
    UploadOutlined
} from '@ant-design/icons';

import * as utils from '../../utils'
import { CompiledContract } from '../compile_contract'

import './index.scss'

type OnSelectedABIHandleCallBack = (contract?: CompiledContract, abi?: AbiItem) => void

function ContractMenu(props: {
    contracts: CompiledContract[],
    onSelectedABI: OnSelectedABIHandleCallBack
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
            > {
                    ownerAddress === undefined
                        ? 'Connect Failed'
                        : ownerAddress.length <= 0
                            ? 'Connectioning' :
                            `${ownerAddress.slice(0, 10)}...${ownerAddress.slice(ownerAddress.length - 10, ownerAddress.length)}`
                }
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
                                <Menu.SubMenu
                                    key={`${contractObject.contractName}-FunctionMenu`}
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
                                                    key={`${contractObject.contractName}-FunctionMenu-${abi.name}-${index}`}
                                                    onClick={(_) => { props.onSelectedABI(contractObject, abi); }}
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
                                    key={`${contractObject.contractName}-EventMenu`}
                                    title="事件查询"
                                    icon={<BarChartOutlined />}
                                >
                                    {
                                        contractObject.abi.filter((abiFun) => {
                                            return abiFun.type === 'event'
                                        }).map((abi, index) => {
                                            return (
                                                <Menu.Item
                                                    key={`${contractObject.contractName}-EventMenu-${abi.name}-${index}`}
                                                    onClick={(_) => {
                                                        props.onSelectedABI(contractObject, abi);
                                                    }}>
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
                        key='Upload'
                        icon={<UploadOutlined />}
                        onClick={() => {
                            props.onSelectedABI(undefined, undefined);
                        }}
                    >
                        Upload Contract
                    </Menu.Item>
                }
            </Menu>
        </Layout.Sider>
    );
}

export default ContractMenu;