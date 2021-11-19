import {ethers} from "hardhat";


async function main() {
    const contractFactory = await ethers.getContractFactory("IncentiveEventsReward");
    const contract = await contractFactory.attach("0x80619B477D2b4Cb9204E7B161dC3Aa09BA732113");
    await contract.setSigner("0x9F9F4828f32e3797141ae2232d4f06bFF1915bCa");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});