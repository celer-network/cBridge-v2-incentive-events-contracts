import {expect} from "chai";
import {ethers} from "hardhat";
import {keccak256, pack} from '@ethersproject/solidity';

export const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

describe("IncentiveEventsReward", function () {
    it("sign", async function () {
        const [owner, addr1] = await ethers.getSigners();
        const contractFactory = await ethers.getContractFactory("IncentiveEventsReward", owner);
        const contract = await contractFactory.deploy(process.env.CELR!);
        await contract.deployed();

        console.log("owner:", owner.address)
        console.log("addr1:", addr1.address)
        await contract.signer.getAddress().then(value => {
            console.log("contract signer addr is now:", value)
        })
        await expect(contract.connect(addr1).setSigner(addr1.address)).to.be.revertedWith("Ownable: caller is not the owner");
        await contract.signer.getAddress().then(value => {
            console.log("contract signer addr is now:", value)
        })
        await contract.connect(owner).setSigner(addr1.address)
        await contract.signer.getAddress().then(value => {
            console.log("contract signer addr is now:", value)
            expect(value).to.equal(addr1.address)
        })


        const data = pack(['address', 'uint256', 'uint256'], ["ssssss", 1, 100]);
        const hash = keccak256(['bytes'], [data]);
        // const sigs = await calculateSignatures(currSigners, hex2Bytes(hash));
        const setGreetingTx = await contract.claimReward("fffff", 1, 100, "sss");

        // wait until the transaction is mined
        await setGreetingTx.wait();
    });
});
