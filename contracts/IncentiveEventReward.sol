// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract IncentiveEventReward is Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    IERC20 public immutable CELER_TOKEN;

    // recipient => CELR reward amount
    mapping(address => uint256) public claimedRewardAmounts;

    constructor(address _celerTokenAddress) {
        CELER_TOKEN = IERC20(_celerTokenAddress);
    }

    /**
     * @notice Claim reward
     * @dev every recipient only have one chance to claim all the reward
     * @param _recipient recipient address
     * @param _rewardAmount reward amount
     * @param _sig signature
     */
    function claimReward(address _recipient, uint256 _rewardAmount, bytes calldata _sig) external {
        bytes32 hash = keccak256(abi.encodePacked(_recipient, _rewardAmount)).toEthSignedMessageHash();
        address signer = hash.recover(_sig);
        require(signer == Ownable.owner(), "wrong sig");

        uint256 newReward = _rewardAmount - claimedRewardAmounts[_recipient];
        require(newReward > 0, "No new reward");
        claimedRewardAmounts[_recipient] = _rewardAmount;
        CELER_TOKEN.safeTransfer(_recipient, newReward);
    }

    /**
     * @notice Contribute CELR tokens to the reward pool
     * @param _amount the amount of CELR token to contribute
     */
    function contributeToRewardPool(uint256 _amount) external {
        address contributor = msg.sender;
        IERC20(CELER_TOKEN).safeTransferFrom(contributor, address(this), _amount);
    }

    /**
     * @notice Owner drains CELR tokens when the contract is paused
     * @dev emergency use only
     * @param _amount drained CELR token amount
     */
    function drainToken(uint256 _amount) external onlyOwner {
        IERC20(CELER_TOKEN).safeTransfer(msg.sender, _amount);
    }
}