// SPDX-License-Identifier: MIT
pragma solidity >=0.8.1;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/IAccessControl.sol";

interface IMetalifeToken is IERC20, IAccessControl {
    function mint(address _to, uint256 _value) external;
    function burn(uint256 _value) external;
}