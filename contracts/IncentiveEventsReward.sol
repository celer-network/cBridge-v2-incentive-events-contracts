// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract IncentiveEventsReward is Pausable, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // The signer for reward claims
    address public rewardSigner;

    // eventId => recipient => token => reward amount
    mapping(uint256 => mapping(address => mapping(address => uint256))) public claimedRewardAmounts;
    // eventId => timestamp
    mapping(uint256 => uint256) public claimDeadlines;

    event IncentiveRewardClaimed(
        address indexed recipient,
        uint256 indexed eventId,
        address indexed token,
        uint256 reward
    );
    event IncentiveRewardContributed(address indexed contributor, address indexed token, uint256 contribution);

    /**
     * @notice Claim reward, checking for signature from the signer
     * @dev recipient needs to claim all the reward by the deadline
     * @param _recipient recipient address
     * @param _eventId event id
     * @param _tokens reward tokens
     * @param _rewardAmounts reward amounts
     * @param _sig signature
     */
    function claimReward(
        address _recipient,
        uint256 _eventId,
        address[] calldata _tokens,
        uint256[] calldata _rewardAmounts,
        bytes calldata _sig
    ) external whenNotPaused {
        uint256 deadline = claimDeadlines[_eventId];
        require(deadline != 0, "Invalid eventId");
        require(block.timestamp <= deadline, "Claim expired");
        require(_tokens.length == _rewardAmounts.length, "Mismatch reward info lengths");

        bytes32 hash = keccak256(
            abi.encodePacked(
                block.chainid,
                address(this),
                "IncentiveRewardClaim",
                _recipient,
                _eventId,
                _tokens,
                _rewardAmounts
            )
        ).toEthSignedMessageHash();
        address recoveredSigner = hash.recover(_sig);
        require(recoveredSigner == rewardSigner, "Invalid sig");

        bool hasNewReward;
        for (uint256 i = 0; i < _tokens.length; i++) {
            if (_claimOneReward(_recipient, _eventId, _tokens[i], _rewardAmounts[i]) > 0) {
                hasNewReward = true;
            }
        }
        require(hasNewReward, "No new reward");
    }

    function _claimOneReward(
        address _recipient,
        uint256 _eventId,
        address _token,
        uint256 _rewardAmount
    ) internal returns (uint256) {
        uint256 claimed = claimedRewardAmounts[_eventId][_recipient][_token];
        uint256 newReward = _rewardAmount - claimed;
        claimedRewardAmounts[_eventId][_recipient][_token] = _rewardAmount;
        IERC20(_token).safeTransfer(_recipient, newReward);
        emit IncentiveRewardClaimed(_recipient, _eventId, _token, newReward);
        return newReward;
    }

    function setClaimDeadline(uint256 _eventId, uint256 _deadline) external onlyOwner {
        claimDeadlines[_eventId] = _deadline;
    }

    function setSigner(address _signer) external onlyOwner {
        rewardSigner = _signer;
    }

    /**
     * @notice Contribute tokens to the reward pool
     * @param _token the token address
     * @param _amount the amount of token to contribute
     */
    function contributeToRewardPool(address _token, uint256 _amount) external whenNotPaused {
        address contributor = msg.sender;
        IERC20(_token).safeTransferFrom(contributor, address(this), _amount);
        emit IncentiveRewardContributed(contributor, _token, _amount);
    }

    /**
     * @notice Owner drains tokens when the contract is paused
     * @dev emergency use only
     * @param _token the token address
     * @param _amount drained token amount
     */
    function drainToken(address _token, uint256 _amount) external whenPaused onlyOwner {
        IERC20(_token).safeTransfer(msg.sender, _amount);
    }

    /**
     * @notice Owner pauses the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Owner unpauses the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }
}
