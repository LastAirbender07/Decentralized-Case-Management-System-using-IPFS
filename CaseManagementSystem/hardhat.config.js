require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();

/** @type import('hardhat/config').HardhatUserConfig */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_URL = process.env.SEPOLIA_URL;

module.exports = {
  solidity: "0.8.24",
  networks:{
    sepolia:{
      url: SEPOLIA_URL,
      accounts:[PRIVATE_KEY],
    },
  },
};


// sepolia contract addr: 0x48865604dA943a71CDAC288440243365Ce2dbe37