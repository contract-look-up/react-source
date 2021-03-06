import BN from 'bn.js';
import { Descriptions } from 'antd';
import { useEffect, useState } from "react";
import { TransferConfig } from "./config";

const ERC20ABI = require('../../../assets/contract-templates/build/contracts/ERC20.json').abi;

interface AccountInfo {
    address: string,
    balance: BN
}

export function InfomationDisplayer(params: {
    config: TransferConfig
}) {
    const { config } = params;
    const { hdweb3, hdprovider } = config;
    const [accountInfo, setAccountInfo] = useState<AccountInfo>();
    const [nodeBlockNumber, setNodeBlockNumber] = useState<number>(0);
    const [tokenBalance, setTokenBalance] = useState<string>("Loading...");

    let contract = new hdweb3.eth.Contract(ERC20ABI, config.tokenInfo!.tokenAddress);
    if (config.tokenType !== "BNB") {
        Promise.all([
            contract.methods.name().call(),
            contract.methods.symbol().call(),
            contract.methods.decimals().call(),
        ]).then(([name, symbol, decimals]) => {
            config.tokenInfo!.name = name;
            config.tokenInfo!.symbol = symbol;
            config.tokenInfo!.decimals = decimals;
        })
    }

    useEffect(() => {
        const fetchInfo = () => {
            hdweb3.eth.getBlockNumber().then(setNodeBlockNumber)
            hdweb3.eth.getBalance(hdprovider.getAddress())
                .then((balance) => {
                    setAccountInfo({
                        address: hdprovider.getAddress(),
                        balance: hdweb3.utils.toBN(balance)
                    })
                })

            if (config.tokenType !== "BNB" && contract) {
                contract.methods.balanceOf(hdprovider.getAddress())
                    .call()
                    .then((balance: string) => {
                        if (balance) {
                            let balanceBN = hdweb3.utils.toBN(balance);
                            balanceBN = balanceBN.div(
                                hdweb3.utils.toBN(10).pow(hdweb3.utils.toBN(config.tokenInfo.decimals! - 4))
                            )
                            let balanceFloat = parseFloat(balanceBN.toString()) / 1e4
                            setTokenBalance(balanceFloat.toString())
                        }
                    })
            }
        }

        fetchInfo()
        const timer = setInterval(fetchInfo, 5000)
        return () => clearInterval(timer)
    }, [])

    return (
        <>
            <Descriptions
                bordered
                style={{
                    marginLeft: '20px',
                    marginRight: '20px',
                }}
                column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            >
                {/* ???????????? */}
                <Descriptions.Item label="????????????">{config.tokenType}</Descriptions.Item>
                {accountInfo ? <Descriptions.Item label="????????????" span={2}>{accountInfo!.address}</Descriptions.Item> : undefined}
                {accountInfo ? <Descriptions.Item label="BNB??????">{parseFloat(hdweb3.utils.fromWei(accountInfo!.balance)).toFixed(8)}</Descriptions.Item> : undefined}
                {/* ???????????? */}
                <Descriptions.Item label="????????????" span={2}>{config.rpcurl}</Descriptions.Item>
                <Descriptions.Item label="????????????">{nodeBlockNumber}</Descriptions.Item>
            </Descriptions>
            {
                config.tokenType !== "BNB"
                    ?
                    <Descriptions
                        bordered
                        style={{
                            marginTop: '20px',
                            marginLeft: '20px',
                            marginRight: '20px',
                        }}
                        column={{ xxl: 4, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
                    >
                        <Descriptions.Item label="????????????">{config.tokenInfo.name}</Descriptions.Item>
                        <Descriptions.Item label="????????????">{config.tokenInfo.symbol}</Descriptions.Item>
                        <Descriptions.Item label="??????">{config.tokenInfo.decimals}</Descriptions.Item>
                        <Descriptions.Item label="????????????" span={2}>{config.tokenInfo!.tokenAddress}</Descriptions.Item>
                        <Descriptions.Item label="??????????????????" span={2}>{tokenBalance}</Descriptions.Item>
                    </Descriptions>
                    : undefined
            }
        </>

    )
}