const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ForeverSubdomainRegistrar", (m) => {
 const nameWrapperAddress = "0x0635513f179D50A207757E05759CbD106d7dFcE8"; // Revise to mainnet for production
 // Mainnet wrapper address: 0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401

 const foreverSubdomainRegistrar = m.contract("ForeverSubdomainRegistrar", [nameWrapperAddress]);

 return { foreverSubdomainRegistrar };
});

