require('dotenv').config();

const MetalifeToken = artifacts.require("MetalifeToken");

module.exports = async function(deployer) {
    await deployer.deploy(MetalifeToken, process.env.INIT_HOLDER);
    const metalifeToken = await MetalifeToken.deployed();
    if(metalifeToken) {
        console.log("MetalifeToken successfully deployed.")
        console.log(`MetalifeToken address: ${metalifeToken.address}`);
    }
};
