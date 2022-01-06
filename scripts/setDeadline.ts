import {ethers} from "hardhat";


async function main() {
    const contractFactory = await ethers.getContractFactory("IncentiveEventsRewardNew");
    const contract = await contractFactory.attach("0x0b0e6cAC39Cd89569b8aff02026404d8f9E81C3d");
    await contract.setClaimDeadline(20000, 1643274563);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});