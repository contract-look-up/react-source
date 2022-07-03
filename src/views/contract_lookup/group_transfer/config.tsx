import "antd/dist/antd.css";

import Web3 from "web3";
import HDWalletProvider from "@truffle/hdwallet-provider";

import { Button, Select, Form, Input, Card } from 'antd';

import { useState } from "react";

const { Option } = Select;

export type TokenTypes = 'BNB' | 'ERC20' | 'ERC1363';

export interface TokenInfo {
    name?: string,
    symbol?: string,
    decimals?: number,
    tokenAddress: string,
}

export interface TransferConfig {
    hdweb3: Web3,
    hdprovider: HDWalletProvider,
    rpcurl: string,
    tokenType: TokenTypes,
    tokenInfo: TokenInfo
}

export function ConfigInputer(params: {
    onVerifiedConfig: (config: TransferConfig) => void
}) {
    const { onVerifiedConfig } = params;
    const [form] = Form.useForm();
    const [isCustomRPC, setIsCustomRPC] = useState<boolean>(false);
    const [tokenType, setTokenType] = useState<TokenTypes>("BNB");
    const [inLoading, setInLoading] = useState<boolean>(false);

    const bscChainRPCS = [
        "http://localhost:8546",
        "https://bsc-dataseed.binance.org",
        "https://bsc-dataseed1.defibit.io",
        "https://bsc-dataseed1.ninicoin.io",
        "https://bsc.nodereal.io"
    ];

    const tokenTypes = [
        "BNB",
        "ERC20",
        "ERC1363"
    ];

    // BSC节点选择
    const onBSCHttpRPCChange = (value: string) => {
        if (value === "custom_rpc") {
            setIsCustomRPC(true)
            form.setFieldsValue({
                "rpcurl": ""
            })
        } else {
            form.setFieldsValue({
                "rpcurl": value
            })
        }
    };

    const checkConfig = async (fromValues: any) => {
        try {
            let provider = new HDWalletProvider({
                privateKeys: [fromValues.private_key],
                providerOrUrl: fromValues.rpcurl
            });

            let hdWeb3 = new Web3(provider);
            return {
                hdweb3: hdWeb3,
                hdprovider: provider,
                tokenType: fromValues.token_type,
                rpcurl: fromValues.rpcurl,
                tokenInfo: {
                    tokenAddress: fromValues.token_address
                }
            } as TransferConfig
        } catch (e) {
            return undefined;
        }
    };

    return (
        <Card title="基本配置" className="marginCard">
            <Form
                form={form}
                layout="vertical"
                onFinish={async (values) => {
                    setInLoading(true)

                    await checkConfig(values).then((config?: TransferConfig) => {
                        if (onVerifiedConfig && config !== undefined) {
                            onVerifiedConfig(config!)
                        }
                    })

                    setInLoading(false)
                }}
            >
                <Form.Item
                    label="交易节点"
                    name="rpcurl"
                    rules={[{ required: true }]}
                >
                    {
                        !isCustomRPC ?
                            <Select
                                placeholder="Select a option and change input text above"
                                onChange={onBSCHttpRPCChange}
                                allowClear
                            >
                                {
                                    bscChainRPCS.map(url => {
                                        return <Option value={url}>{url}</Option>
                                    })
                                }
                                <Option value="custom_rpc">自定义节点</Option>
                            </Select>
                            :
                            <Input placeholder="http://localhost:8545" defaultValue={"http://localhost:8545"} />
                    }
                </Form.Item>
                <Form.Item
                    label="代币协议类型"
                    name="token_type"
                    rules={[{ required: true, message: '请选择代币类型' }]}
                >
                    <Select
                        placeholder="Select a option and change input text above"
                        onChange={(v) => {
                            if (v) { setTokenType(v.toString() as TokenTypes) }
                        }}
                    >
                        {
                            tokenTypes.map(tname => {
                                return <Option value={tname}>{tname}</Option>
                            })
                        }
                    </Select>
                </Form.Item>
                {
                    tokenType !== "BNB"
                        ? <Form.Item label="代币合约地址" name="token_address"><Input /></Form.Item>
                        : undefined
                }
                <Form.Item
                    label="交易私钥"
                    name="private_key"
                    rules={[{ required: true, message: '请在此处粘贴私钥' }]}
                >
                    <Input.Password />
                </Form.Item>
                <Form.Item>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between"
                    }}>
                        <Button
                            type="primary"
                            size="large"
                            htmlType="submit"
                            style={{
                                width: "100%",
                            }}
                            loading={inLoading}
                        >
                            {inLoading ? "正在验证配置" : "下一步"}
                        </Button>
                    </div>
                </Form.Item>
            </Form>
        </Card>
    )
}