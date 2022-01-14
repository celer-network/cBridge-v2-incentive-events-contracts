import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('deployer:', deployer);

  await deploy('IncentiveEventsRewardNew', {
    from: deployer,
    log: true
  });
};

deployFunc.tags = ['IncentiveEventsRewardNew'];
deployFunc.dependencies = [];
export default deployFunc;
