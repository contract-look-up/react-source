// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20TemplateToken is ERC20 {
    /**
     * @param name_ 代币全称
     * @param symbol_ 代币符号，如（USDT)
     * @param totalSupply_ 总发行量 $amount:ether
     * @param genesisMinedReceiptor_ 代币接收地址
     */
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 totalSupply_,
        address genesisMinedReceiptor_
    ) public ERC20(name_, symbol_) {
        _mint(genesisMinedReceiptor_, totalSupply_);
    }
}
