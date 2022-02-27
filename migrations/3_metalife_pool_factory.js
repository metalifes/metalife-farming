require('dotenv').config();
const MetalifePoolFactory = artifacts.require("MetalifePoolFactory");
const MetalifeToken = artifacts.require("MetalifeToken");

module.exports = async function (deployer) {
    const metalifeToken = await MetalifeToken.deployed();

    const mtlPerBlock = process.env.FACTORY_MTL_PER_BLOCK
    const blocksPerUpdate = process.env.FACTORY_BLOCKS_PER_UPDATE
    let initBlock = process.env.FACTORY_INIT_BLOCK
    let endBlock = process.env.FACTORY_END_BLOCK

    if(deployer.network === 'dev' || deployer.network === 'testnet') {
        const currentBlock = await web3.eth.getBlock('latest')
        initBlock = currentBlock.number
        endBlock = initBlock + 100
    }

    await deployer.deploy(
        MetalifePoolFactory,
        metalifeToken.address,
        mtlPerBlock,
        blocksPerUpdate,
        initBlock,
        endBlock
    );
    const metalifePoolFactory = await MetalifePoolFactory.deployed();
    if(metalifePoolFactory) {
        console.log("MetalifePoolFactory successfully deployed.")
        console.log(`MetalifePoolFactory address: ${metalifePoolFactory.address}`);

        await metalifeToken.grantRole(
            await metalifeToken.ROLE_TOKEN_MINTER.call(),
            metalifePoolFactory.address
        )
    }
};
