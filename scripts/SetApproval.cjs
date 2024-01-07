const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
    const foreverSubdomainRegistrarAddress = '0x079C8149357Ac36A7ab44aEBAD23505dE4293aac';
    const nameWrapperAddress = '0x0635513f179D50A207757E05759CbD106d7dFcE8'; // Revise to mainnet for production
 // Mainnet wrapper address: 0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401

    // Setup the NameWrapper contract
    const NameWrapper = await ethers.getContractAt('NameWrapper', nameWrapperAddress);

    // Call setApprovalForAll()
    const tx = await NameWrapper.setApprovalForAll(foreverSubdomainRegistrarAddress, true);
    await tx.wait();

    console.log(`Approval set for ForeverSubdomainRegistrar`);
}

main().catch((error) => {
    console.error("Error encountered:", error.message);
    console.error(error.stack);
    process.exitCode = 1;
});

