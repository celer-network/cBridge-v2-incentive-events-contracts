// SPDX-License-Identifier: GPL-3.0-only

pragma solidity 0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract IncentiveEventsReward is Pausable, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // Address of the Celer Token
    IERC20 public immutable CELER_TOKEN;

    // The signer for reward claims
    address public signer;

    // eventId => recipient => CELR reward amount
    mapping(uint256 => mapping(address => uint256)) public claimedRewardAmounts;
    // eventId => timestamp
    mapping(uint256 => uint256) public claimDeadlines;

    event IncentiveRewardClaimed(address indexed recipient, uint256 reward);
    event IncentiveRewardContributed(address indexed contributor, uint256 contribution);

    /**
     * @notice IncentiveEventsReward constructor
     * @param _celerTokenAddress address of the Celer Token Contract
     */
    constructor(address _celerTokenAddress) {
        CELER_TOKEN = IERC20(_celerTokenAddress);
    }

    /**
     * @notice Claim reward, checking for signature from the signer
     * @dev recipient needs to claim all the reward by the deadline
     * @param _recipient recipient address
     * @param _eventId event id
     * @param _rewardAmount reward amount
     * @param _sig signature
     */
    function claimReward(
        address _recipient,
        uint256 _eventId,
        uint256 _rewardAmount,
        bytes calldata _sig
    ) external whenNotPaused {
        uint256 deadline = claimDeadlines[_eventId];
        require(deadline != 0, "Invalid eventId");
        require(block.timestamp <= deadline, "Claim expired");

        bytes32 hash = keccak256(abi.encodePacked(_recipient, _eventId, _rewardAmount)).toEthSignedMessageHash();
        address recoveredSigner = hash.recover(_sig);
        require(recoveredSigner == signer, "Invalid sig");

        uint256 newReward = _rewardAmount - claimedRewardAmounts[_eventId][_recipient];
        require(newReward > 0, "No new reward");
        claimedRewardAmounts[_eventId][_recipient] = _rewardAmount;
        CELER_TOKEN.safeTransfer(_recipient, newReward);
        emit IncentiveRewardClaimed(_recipient, newReward);
    }

    function setClaimDeadline(uint256 _eventId, uint256 _deadline) external onlyOwner {
        claimDeadlines[_eventId] = _deadline;
    }

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    /**
     * @notice Contribute CELR tokens to the reward pool
     * @param _amount the amount of CELR token to contribute
     */
    function contributeToRewardPool(uint256 _amount) external whenNotPaused {
        address contributor = msg.sender;
        IERC20(CELER_TOKEN).safeTransferFrom(contributor, address(this), _amount);
        emit IncentiveRewardContributed(contributor, _amount);
    }

    /**
     * @notice Owner drains CELR tokens when the contract is paused
     * @dev emergency use only
     * @param _amount drained CELR token amount
     */
    function drainToken(uint256 _amount) external whenPaused onlyOwner {
        IERC20(CELER_TOKEN).safeTransfer(msg.sender, _amount);
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
