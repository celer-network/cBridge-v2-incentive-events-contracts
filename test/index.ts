import { expect } from 'chai';
import { Wallet } from 'ethers';
import { ethers, getChainId, waffle } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

export const ZERO_ADDR = '0x0000000000000000000000000000000000000000';

describe('IncentiveEventsRewardNew', function () {
  it('sign', async function () {
    const [contributor, winner] = waffle.provider.getWallets();
    const [owner, signer] = await ethers.getSigners();
    const contractFactory = await ethers.getContractFactory('IncentiveEventsRewardNew', owner);
    const contractFactory1 = await ethers.getContractFactory('TestERC20', owner);
    const celr = await contractFactory1.deploy();

    const contract = await contractFactory.deploy();
    await contract.deployed();
    const chainId = await getChainId();
    console.log('contract addr:', contract.address, ', chainId:', chainId);

    console.log('owner:', owner.address);
    console.log('signer:', signer.address);
    console.log('winner:', winner.address);

    console.log('contract reward signer addr before is:', await contract.rewardSigner());
    await expect(contract.connect(signer).setSigner(signer.address)).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );
    await contract.connect(owner).setSigner(signer.address);
    console.log('contract reward signer addr is now:', await contract.rewardSigner());
    expect(await contract.rewardSigner()).to.equal(signer.address);
    await contract.connect(owner).setClaimDeadline(1, Math.floor(Date.now() / 1000) + 100);
    console.log('contract balance before:', (await celr.balanceOf(contract.address)).toString());
    console.log('contributor balance before:', (await celr.balanceOf(contributor.address)).toString());
    await celr.connect(contributor).approve(contract.address, 100000);
    await contract.connect(contributor).contributeToRewardPool(celr.address, 100000);
    console.log('contract balance after add:', (await celr.balanceOf(contract.address)).toString());

    // const hash = ethers.utils.solidityKeccak256(["uint256", "address", "string", "address", "uint256", "uint256"],
    //     ["97", "0x72ab37F482e3a91a7c599b4Da6293528e79E2b56", "IncentiveRewardClaim", "0x6A8EEdE47266aF8E519F3B6c818c9c4122EC2626", "1", "600"]);
    // const message = ethers.utils.arrayify(hash);
    // const wallet = await Wallet.fromEncryptedJson(`{
    //   "address":"427ff189e06a6bd746717ca208c5b193e7496313",
    //   "crypto":{
    //     "cipher":"aes-128-ctr",
    //     "ciphertext":"e278185fb8d2f9c9e259fb2bd641a6b4c96d61046922ccc6fb074fec80f4a43d",
    //     "cipherparams":{
    //       "iv":"e9087cef7d956fec5a6b70e156c9f068"
    //     },
    //     "kdf":"scrypt",
    //     "kdfparams":{
    //       "dklen":32,
    //       "n":262144,
    //       "p":1,
    //       "r":8,
    //       "salt":"2300ac3d0e52684ffa4c64f6b9ab70bb20e509b7c93e6a406e07a9ea6f456407"
    //     },
    //     "mac":"125314347146f32c1a72ea3c23be6162118eb475008814903f7cd7a168c91fe7"
    //   },
    //   "id":"46c5722a-67dd-4833-bc11-053eff8ca609",
    //   "version":3
    // }`, "");
    // console.log("wallet addr:", wallet.address)
    // const sig = await wallet.signMessage(message);
    // console.log("hash:", hash)
    // console.log("sig:", sig)
    // console.log("message:", message)

    const hash = ethers.utils.solidityKeccak256(
      ['uint256', 'address', 'string', 'address', 'uint256', 'address[]', 'uint256[]'],
      [chainId, contract.address, 'IncentiveRewardClaim', winner.address, '1', [celr.address], ['10000']]
    );
    const message = ethers.utils.arrayify(hash);
    console.log('message:', message);
    const sig = await signer.signMessage(message);
    console.log('sig:', sig);
    const recoverAddress = ethers.utils.verifyMessage(message, sig);
    console.log('recoverAddress:', recoverAddress);

    console.log('winner balance before:', (await celr.balanceOf(winner.address)).toString());
    await contract.claimReward(winner.address, 1, [celr.address], [10000], sig);

    console.log('winner balance after:', (await celr.balanceOf(winner.address)).toString());
    console.log('contract balance after:', (await celr.balanceOf(contract.address)).toString());
  });
});
