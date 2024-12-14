const { ethers } = require('hardhat');

async function main() {
    const [deployer] = await ethers.getSigners();
    const foreverSubdomainRegistrarAddress = '0x079C8149357Ac36A7ab44aEBAD23505dE4293aac';
    const fixedPricerAddress = '0x38d2C064808FB27B8aAE4dffa07d54ddbE0cdfc7';
    const domainNamehash = '0x622ab6cb794b5500b8a726b6c3ca080a0d23d005939b6247b2d7b1cb695522d3'; //change this to brotatdao

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

//0x622ab6cb794b5500b8a726b6c3ca080a0d23d005939b6247b2d7b1cb695522d3, 0x38d2C064808FB27B8aAE4dffa07d54ddbE0cdfc7, 0x7DBC94BFDeE135BC356926766FD81974118208f5, true

