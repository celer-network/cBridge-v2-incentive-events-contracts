import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-contract-sizer';
import 'hardhat-deploy';
import 'hardhat-gas-reporter';
import 'solidity-coverage';

import * as dotenv from 'dotenv';
import {HardhatUserConfig, task} from 'hardhat/config';

dotenv.config();

const DEFAULT_ENDPOINT = 'http://localhost:8545';
const DEFAULT_PRIVATE_KEY = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const bscTestEndpoint = process.env.BSC_TEST_ENDPOINT || DEFAULT_ENDPOINT;
const bscTestPrivateKey = process.env.BSC_TEST_PRIVATE_KEY || DEFAULT_PRIVATE_KEY;

const bscEndpoint = process.env.BSC_ENDPOINT || DEFAULT_ENDPOINT;
const bscPrivateKey = process.env.BSC_PRIVATE_KEY || DEFAULT_PRIVATE_KEY;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    defaultNetwork: 'hardhat',
    networks: {
        hardhat: {},
        localhost: {timeout: 600000},
        bscTest: {
            url: bscTestEndpoint,
            accounts: [`0x${bscTestPrivateKey}`]
        },
        bsc: {
            url: bscEndpoint,
            accounts: [`0x${bscPrivateKey}`]
        },
    },
    namedAccounts: {
        deployer: {
            default: 0
        }
    },
    solidity: {
        version: '0.8.10',
        settings: {
            optimizer: {
                enabled: true,
                runs: 800
            }
        }
    },
    contractSizer: {
        alphaSort: true,
        runOnCompile: false,
        disambiguatePaths: false
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS === 'true' ? true : false,
        noColors: true,
        outputFile: 'reports/gas_usage/summary.txt'
    },
    typechain: {
        outDir: 'typechain',
        target: 'ethers-v5'
    }
};

export default config;
