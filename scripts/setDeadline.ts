import {ethers} from "hardhat";


async function main() {
    const contractFactory = await ethers.getContractFactory("IncentiveEventsReward");
    const contract = await contractFactory.attach("0x72ab37F482e3a91a7c599b4Da6293528e79E2b56");
    await contract.setClaimDeadline(1, 1638184622);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});