import {expect} from "chai";
import {ethers} from "hardhat";
import {keccak256, pack} from '@ethersproject/solidity';

describe("IncentiveEventsReward", function () {
    it("Should return the new greeting once it's changed", async function () {
        const IncentiveEventsReward = await ethers.getContractFactory("IncentiveEventsReward");
        const contract = await IncentiveEventsReward.deploy("Hello, world!");
        await contract.deployed();

        expect(await contract.deployed()).to.equal("Hello, world!");

        const data = pack(['address', 'uint256', 'uint256'], ["ssssss", 1, 100]);
        const hash = keccak256(['bytes'], [data]);
        // const sigs = await calculateSignatures(currSigners, hex2Bytes(hash));
        const setGreetingTx = await contract.claimReward("fffff", 1, 100, "sss");

        // wait until the transaction is mined
        await setGreetingTx.wait();
    });
});
