require('dotenv').config();
const MetalifeCorePool = artifacts.require("MetalifeCorePool");
const MetalifePoolFactory = artifacts.require("MetalifePoolFactory");
const MetalifeToken = artifacts.require("MetalifeToken");
const MockToken = artifacts.require("MockToken");

module.exports = async function (deployer) {
    const metalifeToken = await MetalifeToken.deployed();
    const metalifePoolFactory = await MetalifePoolFactory.deployed();

    // Game token pool
    let initBlock = process.env.POOL_TOKEN_INIT_BLOCK
    let weight = process.env.POOL_TOKEN_WEIGHT

    if(deployer.network === 'dev' || deployer.network === 'testnet') {
        const currentBlock = await web3.eth.getBlock('latest')
        initBlock = currentBlock.number
    }

    await deployer.deploy(MetalifeCorePool, metalifeToken.address, metalifePoolFactory.address, metalifeToken.address, initBlock, weight)
    const tokenPool = await MetalifeCorePool.deployed()
    await metalifePoolFactory.registerPool(tokenPool.address)
    console.log('Game Token Pool:', tokenPool.address);

    let lpToken = process.env.POOL_LP_TOKEN
    initBlock = process.env.POOL_LP_INIT_BLOCK
    weight = process.env.POOL_LP_WEIGHT

    if(deployer.network === 'dev' || deployer.network === 'testnet') {
        // LP Token
        await deployer.deploy(MockToken)
        const mockToken = await MockToken.deployed();
        lpToken = mockToken.address

        const currentBlock = await web3.eth.getBlock('latest')
        initBlock = currentBlock.number
    }

    await deployer.deploy(MetalifeCorePool, metalifeToken.address, metalifePoolFactory.address, lpToken, initBlock, weight)
    const lpPool = await MetalifeCorePool.deployed()
    await metalifePoolFactory.registerPool(lpPool.address)
    console.log('LP Token Pool:', lpPool.address)
};
