import {ethers} from "hardhat";


async function main() {
    const contractFactory = await ethers.getContractFactory("IncentiveEventsRewardNew");
    const contract = await contractFactory.attach("0x0b0e6cAC39Cd89569b8aff02026404d8f9E81C3d");
    await contract.setSigner("0x427ff189e06a6bd746717ca208c5b193e7496313");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});