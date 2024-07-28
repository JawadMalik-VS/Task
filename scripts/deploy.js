const hre = require("hardhat");

async function main() {
  const DOLAToken = await hre.ethers.getContractFactory("DOLAToken");
  // Define the parameters for the constructor
  const name = "DOLATOKEN";
  const symbol = "DOLAT";
  const roiPriceFeed = "0xec70714Fb3cf41Ab01894786b9DCaf97b75F5635";
  const bdolaPriceFeed = "0xec70714Fb3cf41Ab01894786b9DCaf97b75F5635";
  const bdolaToken = "0x1456344614B45baf39f294c9e7306099327887A1";
  // Deploy the contract
  const dolaToken = await DOLAToken.deploy(
    name,
    symbol,
    roiPriceFeed,
    bdolaPriceFeed,
    bdolaToken
  );
  await dolaToken.getDeployedCode();
  let address = await dolaToken.getAddress();
  console.log("DOLAToken deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

//deployed address : 0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9
//deploy address 2:  0x5B259a79Aad05E94a025D5D812C0697c5B107C5d
