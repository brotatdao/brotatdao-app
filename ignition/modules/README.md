For FixedPricer.cjs ensure the registration fee is correct.  It uses parseEther to convert eth to wei. 
the erc20TokenAddress shoud be set to the treasury wallet for the app.

For ForeverSubdomainRegistrar.cjs remember to change the constructor arguments to reflect mainnet/testnet for the namewrapper address:

As of 1/6/24 the namewrapper is deployed at
Mainnet wrapper address: 0xd4416b13d2b3a9abae7acd5d6c2bbdbe25686401
Sepolia Testnet wrapper address: 0x0635513f179D50A207757E05759CbD106d7dFcE8


To deploy the smart contrats using hardhat ignition run the following commands:

npx hardhat ignition deploy ignition/modules/FixedPricer.cjs --network sepolia
npx hardhat ignition deploy ignition/modules/ForeverSubdomainRegistrar.cjs --network sepolia


Then run the verify command to verify with etherscan.
for FixedPricer run:  
    npx hardhat verify --network sepolia <deployed contract address> 10000000000000000 <treasury wallet address>

for ForeverSubdomainRegistrar run: 
     npx hardhat verify --network sepolia <deployed contract address> <namewrapper address>

     

