// SPDX-License-Identifier: MIT
pragma solidity >=0.8.1;

import "./IMetalifeToken.sol";

/**
 * @title Metalife Aware
 *
 * @notice Helper smart contract to be inherited by other smart contracts requiring to
 *      be linked to verified Metalife Token instance and performing some basic tasks on it
 */
abstract contract MetalifeAware  {
  /// @dev Link to MLC ERC20 Token Metalife Token instance
  address public immutable mlc;

  /**
   * @dev Creates MetalifeAware instance, requiring to supply deployed Metalife Token instance address
   *
   * @param _mlc deployed Metalife Token instance address
   */
  constructor(address _mlc) {
    // verify MLC address is set and is correct
    require(_mlc != address(0), "MLC address not set");

    // write MLC address
    mlc = _mlc;
  }

  /**
   * @dev Executes MetalifeToken.safeTransferFrom(address(this), _to, _value, "")
   *      on the bound Metalife Token instance
   *
   * @dev Reentrancy safe due to the Metalife Token design
   */
  function transferMtl(address _to, uint256 _value) internal {
    // just delegate call to the target
    transferMtlFrom(address(this), _to, _value);
  }

  /**
   * @dev Executes MetalifeToken.transferFrom(_from, _to, _value)
   *      on the bound MetalifeToken instance
   *
   * @dev Reentrancy safe due to the MetalifeToken design
   */
  function transferMtlFrom(address _from, address _to, uint256 _value) internal {
    // just delegate call to the target
    IMetalifeToken(mlc).transferFrom(_from, _to, _value);
  }

  /**
   * @dev Executes MetalifeToken.mint(_to, _values)
   *      on the bound MetalifeToken instance
   *
   * @dev Reentrancy safe due to the MetalifeToken design
   */
  function mintMtc(address _to, uint256 _value) internal {
    // just delegate call to the target
    IMetalifeToken(mlc).mint(_to, _value);
  }

  /**
   * @dev Executes MetalifeToken.burn(_values)
   *      on the bound MetalifeToken instance
   *
   * @dev Reentrancy safe due to the MetalifeToken design
   */
  function burnMtc(uint256 _value) internal {
    // just delegate call to the target
    IMetalifeToken(mlc).burn(_value);
  }
}