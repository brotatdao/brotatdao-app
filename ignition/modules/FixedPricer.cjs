const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");
const { parseEther } = require("ethers");

module.exports = buildModule("FixedPricer", (m) => {
 const registrationFee =  parseEther("0.01"); // 0.01 ETH in wei
 const erc20TokenAddress = "0x7DBC94BFDeE135BC356926766FD81974118208f5"; // Revise to Treasury for production

 const fixedPricer = m.contract("FixedPricer", [registrationFee, erc20TokenAddress]);

 return { fixedPricer };
});
