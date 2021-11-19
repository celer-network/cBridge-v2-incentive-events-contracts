import {ethers} from "hardhat";


async function main() {
    const contractFactory = await ethers.getContractFactory("IncentiveEventsReward");
    const contract = await contractFactory.attach("0x80619B477D2b4Cb9204E7B161dC3Aa09BA732113");
    await contract.setSigner("0x427ff189e06a6bd746717ca208c5b193e7496313");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});