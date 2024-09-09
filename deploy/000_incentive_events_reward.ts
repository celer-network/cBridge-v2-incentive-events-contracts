import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('deployer:', deployer);

  const incentiveEventsReward = await deploy('IncentiveEventsReward', {
    from: deployer,
    log: true
  });
  await hre.run('verify:verify', { address: incentiveEventsReward.address });
};

deployFunc.tags = ['IncentiveEventsReward'];
deployFunc.dependencies = [];
export default deployFunc;
