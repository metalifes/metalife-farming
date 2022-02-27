// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.8.1;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20, Ownable {

    constructor(
    ) ERC20("MOCK", "M") {
        _mint(msg.sender, 7_000_000e18);
    }

    function burn(uint256 value) external {
        super._burn(msg.sender, value);
    }
}
