import React from "react";
import Web3 from "web3";
import { Link } from "react-router-dom";
import { useState } from 'react';
import { Layout, Menu, Button, PageHeader } from 'antd';
import { MenuClickEventHandler } from 'rc-menu/lib/interface';

import {
    FileProtectOutlined,
    AppstoreAddOutlined,
} from '@ant-design/icons';

import * as utils from '../../../utils'
import { CompiledContract } from '../../../components'

export function ToolsMenu(props: {
    onSelected: MenuClickEventHandler,
    onBack: (e: any) => void,
}) {
    const web3 = new Web3((window as any).ethereum);

    const submenus = [
        {
            title: "部署代币合约",
            icon: <AppstoreAddOutlined />,
            children: [
                {
                    key: "ERC20",
                    title: "ERC20",
                    icon: <FileProtectOutlined />,
                },
                {
                    key: "ERC721",
                    title: "ERC721",
                    icon: <FileProtectOutlined />,
                }
            ]
        },
        {
            title: "部署代币合约",
            icon: <AppstoreAddOutlined />,
            children: [
                {
                    key: "ERC20-1",
                    title: "ERC20",
                    icon: <FileProtectOutlined />,
                },
                {
                    key: "ERC721-2",
                    title: "ERC721",
                    icon: <FileProtectOutlined />,
                }
            ]
        }
    ]

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
            <Menu
                mode="inline"
                theme="light"
                style={{ height: '100%', borderRight: 1 }}
            >
                <PageHeader
                    onBack={props.onBack}
                    title="实用工具"
                />
                {
                    submenus.map((items, index) =>
                        <Menu.SubMenu key={index} icon={items.icon} title={items.title}>
                            {
                                items.children.map((item) =>
                                    <Menu.Item
                                        key={item.key}
                                        icon={item.icon}>
                                        {item.title}
                                    </Menu.Item>
                                )
                            }
                        </Menu.SubMenu>
                    )
                }
            </Menu>
        </Layout.Sider>


    );
}

export default ToolsMenu;