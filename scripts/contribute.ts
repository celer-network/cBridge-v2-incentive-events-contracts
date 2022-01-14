import {ethers} from "hardhat";


async function main() {
    const contractFactory = await ethers.getContractFactory("IncentiveEventsRewardNew");

    const contract = await contractFactory.attach("0x0b0e6cAC39Cd89569b8aff02026404d8f9E81C3d");
    const r = await contract.contributeToRewardPool("0x094616F0BdFB0b526bD735Bf66Eca0Ad254ca81F", "800000000000000000");
    console.log(r.hash)
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});