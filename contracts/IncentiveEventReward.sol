// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract StakingReward is Ownable {
    using SafeERC20 for IERC20;

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
     * @param _sigs list of validator signatures
     */
    function claimReward(address calldata _recipient, uint256 calldata _rewardAmount, bytes[] calldata _sigs) external {
        staking.verifySignatures(_rewardRequest, _sigs);

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