import React from 'react';
import { RouteChildrenProps } from 'react-router';
import { MenuInfo } from 'rc-menu/lib/interface';
import { Layout } from 'antd';
import { ToolsMenu } from './menu';
import { Deployer } from './deployer';
import { CompiledContract } from '../../components';

const TokensTemplates: Array<CompiledContract> = [
    require('../../assets/contract-templates/build/contracts/ERC20TemplateToken.json') as CompiledContract,
];

export default function TokenToolsPage(props: RouteChildrenProps) {

    // 主菜单点击
    function onMenuSelect(info: MenuInfo): void {
        const paths = info.keyPath
        if (paths.length <= 0) {
            return;
        }
    }

    return (
        <Layout>
            <ToolsMenu
                onSelected={onMenuSelect}
                onBack={() => {
                    props.history.replace("/")
                }}
            />
            <Layout className="site-layout">
                <Layout.Sider
                    width="80vw"
                    style={{
                        marginLeft: '20vw',
                        overflow: 'auto',
                        position: 'fixed',
                        width: '100%',
                        height: '100%',
                        left: 0,
                    }}
                >
                    <Deployer contract={TokensTemplates[0]} />
                </Layout.Sider>
            </Layout>
        </Layout>
    )
}