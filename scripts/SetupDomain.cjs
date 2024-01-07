const { ethers } = require('hardhat');
const { namehash, normalize } = require('viem/ens');

async function main() {
    const [deployer] = await ethers.getSigners();
    const foreverSubdomainRegistrarAddress = '0x079C8149357Ac36A7ab44aEBAD23505dE4293aac';
    const fixedPricerAddress = '0x38d2C064808FB27B8aAE4dffa07d54ddbE0cdfc7';

    // Use Viem to get the ENS name hash.
    const domain = 'rowant.eth';
    const normalizedDomain = normalize(domain);
    const domainNamehash = namehash(normalizedDomain);

    // Setup the ForeverSubdomainRegistrar contract
    const ForeverSubdomainRegistrar = await ethers.getContractAt('ForeverSubdomainRegistrar', foreverSubdomainRegistrarAddress);
    
    // Call setupDomain() with the namehash
    const tx = await ForeverSubdomainRegistrar.setupDomain(domainNamehash, fixedPricerAddress, deployer.address, true);
    await tx.wait();

    console.log(`Domain setup completed with namehash: ${domainNamehash}`);
}

main().catch((error) => {
    console.error("Error encountered:", error.message);
    console.error(error.stack);
    process.exitCode = 1;
});

