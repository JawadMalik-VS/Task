require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();


console.log("PRIVATEKEY",process.env.PRIVATE_KEY)
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {

      url: `https://ethereum-sepolia.rpc.subquery.network/public`, 
      accounts: [`0x${process.env.PRIVATE_KEY}`] 
    },
  },
};
