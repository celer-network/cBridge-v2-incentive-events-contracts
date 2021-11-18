import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const deployResult = await deploy('IncentiveEventsReward', {
    from: deployer,
    log: true
  });
  console.log("deploy to ", deployResult.address)
};

deployFunc.tags = ['IncentiveEventsReward'];
deployFunc.dependencies = [];
export default deployFunc;
