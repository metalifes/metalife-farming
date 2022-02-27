// SPDX-License-Identifier: MIT
pragma solidity >=0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "./IMetalifeToken.sol";

contract MetalifeToken is ERC20, Ownable, AccessControl, IMetalifeToken {
    bytes32 public constant ROLE_TOKEN_MINTER = keccak256("ROLE_TOKEN_MINTER");

    constructor(address _initialHolder) ERC20("Metalife Coin", "MLC") {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());

        require(_initialHolder != address(0), "_initialHolder not set (zero address)");
        // mint initial supply
        _mint(_initialHolder, 7_000_000e18);
    }

    function mint(address _to, uint256 _value) external override {
        require(hasRole(ROLE_TOKEN_MINTER, msg.sender), "insufficient privileges (ROLE_TOKEN_MINTER required)");
        _mint(_to, _value);
    }

    function burn(uint256 _value) external override {
        _burn(msg.sender, _value);
    }
}
