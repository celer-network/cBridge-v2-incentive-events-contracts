import * as dotenv from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

dotenv.config();

const deployFunc: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log('deployer:', deployer);

  // const incentiveEventsReward = await deploy('IncentiveEventsReward', {
  //   from: deployer,
  //   log: true
  // });
  const incentiveEventsReward = { address: '0xf6C5d7DA1654d9BbDe0D25A5fd6776B37a2aD881' };
  await hre.run('verify:verify', { address: incentiveEventsReward.address });
};

deployFunc.tags = ['IncentiveEventsReward'];
deployFunc.dependencies = [];
export default deployFunc;
