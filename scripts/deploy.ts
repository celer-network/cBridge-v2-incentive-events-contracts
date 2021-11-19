import * as dotenv from 'dotenv';
import {DeployFunction} from 'hardhat-deploy/types';
import {HardhatRuntimeEnvironment} from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const {deployments, getNamedAccounts} = hre;
    const {deploy} = deployments;
    const {deployer} = await getNamedAccounts();

    console.log("deployer:", deployer)
    console.log("CELR addr:", process.env.CELR)

    await deploy('IncentiveEventsReward', {
        from: deployer,
        log: true,
        args: [
            process.env.CELR
        ]
    });
};

deployFunc.tags = ['IncentiveEventsReward'];
deployFunc.dependencies = [];
export default deployFunc;
