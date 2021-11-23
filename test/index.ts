import {expect} from "chai";
import {ethers, getChainId} from "hardhat";

export const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

describe("IncentiveEventsReward", function () {
    it("sign", async function () {
        const [owner, signer, winner] = await ethers.getSigners();
        const contractFactory = await ethers.getContractFactory("IncentiveEventsReward", owner);
        const contract = await contractFactory.deploy(process.env.CELR!);
        await contract.deployed();
        const chainId = await getChainId();
        console.log("contract addr:", contract.address, ", chainId:", chainId)

        console.log("owner:", owner.address)
        console.log("signer:", signer.address)
        console.log("winner:", winner.address)
        console.log("contract reward signer addr before is:", await contract.rewardSigner())
        await expect(contract.connect(signer).setSigner(signer.address)).to.be.revertedWith("Ownable: caller is not the owner");
        await contract.connect(owner).setSigner(signer.address);
        console.log("contract reward signer addr is now:", await contract.rewardSigner())
        expect(await contract.rewardSigner()).to.equal(signer.address)
        await contract.connect(owner).setClaimDeadline(1, 1638184622);

        // expect(await contract.signer.getAddress()).to.equal(signer.address)


        const hash = ethers.utils.solidityKeccak256(["uint256", "address", "string", "address", "uint256", "uint256"],
            [chainId, contract.address, "IncentiveRewardClaim", winner.address, "1", "10000"]);
        const sig = await signer.signMessage(hash);
        console.log("sig:", sig)
        const recoverAddress = ethers.utils.verifyMessage(hash, sig);
        console.log("recoverAddress:", recoverAddress)

        await contract.claimReward(winner.address, 1, 10000, sig);
    });
});
