const { time } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const bnChai = require('bn-chai');
const expect = require('chai')
  .use(bnChai(web3.utils.BN))
  .expect;

const MetalifeCorePool = artifacts.require("MetalifeCorePool");
const MetalifePoolFactory = artifacts.require("MetalifePoolFactory");
const MetalifeToken = artifacts.require("MetalifeToken");
const MockToken = artifacts.require("MockToken");


contract('Stake', (accounts) => {
    const stakeAmount1 = web3.utils.toBN(10000000)
    const lockedDuration = 128*24*60*60

    it('LP: Transfer token', async () => {
        const owner = accounts[0]
        const user1 = accounts[1]

        const mockToken = await MockToken.deployed();

        await mockToken.transfer(user1, stakeAmount1, {from: owner})

        const userBalance = await mockToken.balanceOf.call(user1)
        expect(userBalance).to.eq.BN(stakeAmount1)
    })

    it('LP: Initialize checking', async () => {
        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const mockToken = await MockToken.deployed();
        const lpPoolAddress = await metalifePoolFactory.getPoolAddress.call(mockToken.address);
        const lpPool = await MetalifeCorePool.at(lpPoolAddress)

        const poolToken = await lpPool.poolToken.call()

        expect(poolToken).to.equal(mockToken.address)
    })

    it('LP: Stake', async () => {
        const user1 = accounts[1]

        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const mockToken = await MockToken.deployed();
        const lpPoolAddress = await metalifePoolFactory.getPoolAddress.call(mockToken.address);
        const lpPool = await MetalifeCorePool.at(lpPoolAddress)

        await mockToken.approve(lpPool.address, stakeAmount1, {from: user1})
        await lpPool.stake(stakeAmount1, 0, {from: user1});

        const userInfo = await lpPool.users.call(user1)
        expect(userInfo.tokenAmount).to.eq.BN(stakeAmount1)
    })

    it('LP: Unstake', async () => {
        const user1 = accounts[1]

        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const mockToken = await MockToken.deployed();
        const lpPoolAddress = await metalifePoolFactory.getPoolAddress.call(mockToken.address);
        const lpPool = await MetalifeCorePool.at(lpPoolAddress)

        let depositsLength = await lpPool.getDepositsLength.call(user1)
        expect(depositsLength.toNumber()).to.equal(1)

        await lpPool.unstake(0, stakeAmount1, {from: user1})

        const userBalance = await mockToken.balanceOf.call(user1)
        expect(userBalance).to.eq.BN(stakeAmount1)

        const metalifeToken = await MetalifeToken.deployed();

        const rewardBalance = await metalifeToken.balanceOf.call(user1)
        expect(rewardBalance.toNumber()).to.greaterThan(0)
    })

    // Game token
    it('Token: Transfer token', async () => {
        const owner = accounts[0]
        const user1 = accounts[1]

        const metalifeToken = await MetalifeToken.deployed();

        const beforeBalance = await metalifeToken.balanceOf.call(user1)

        await metalifeToken.transfer(user1, stakeAmount1, {from: owner})

        const userBalance = await metalifeToken.balanceOf.call(user1)
        expect(userBalance.sub(beforeBalance)).to.eq.BN(stakeAmount1)
    })

    it('Token: Initialize checking', async () => {
        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const metalifeToken = await MetalifeToken.deployed();
        const tokenPoolAddress = await metalifePoolFactory.getPoolAddress.call(metalifeToken.address);
        const tokenPool = await MetalifeCorePool.at(tokenPoolAddress)

        const poolToken = await tokenPool.poolToken.call()

        expect(poolToken).to.equal(metalifeToken.address)
    })

    it('Token: Stake', async () => {
        const user1 = accounts[1]

        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const metalifeToken = await MetalifeToken.deployed();
        const tokenPoolAddress = await metalifePoolFactory.getPoolAddress.call(metalifeToken.address);
        const tokenPool = await MetalifeCorePool.at(tokenPoolAddress)

        await metalifeToken.approve(tokenPool.address, stakeAmount1, {from: user1})
        await tokenPool.stake(stakeAmount1, 0, {from: user1});

        let depositsLength = await tokenPool.getDepositsLength.call(user1)
        expect(depositsLength.toNumber()).to.equal(1)

        const deposit = await tokenPool.getDeposit.call(user1, 0)
        expect(deposit.tokenAmount).to.eq.BN(stakeAmount1)
    })

    it('Token: Claim reward', async () => {
        const user1 = accounts[1]

        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const metalifeToken = await MetalifeToken.deployed();
        const tokenPoolAddress = await metalifePoolFactory.getPoolAddress.call(metalifeToken.address);
        const tokenPool = await MetalifeCorePool.at(tokenPoolAddress)

        let previousBalance = await metalifeToken.balanceOf.call(user1)

        await tokenPool.processRewards({from: user1})

        let userBalance = await metalifeToken.balanceOf.call(user1)
        expect(userBalance.sub(previousBalance).toNumber()).to.greaterThan(0)

        const user2 = accounts[2]
        previousBalance = await metalifeToken.balanceOf.call(user2)
        await tokenPool.processRewards({from: user2})
        userBalance = await metalifeToken.balanceOf.call(user2)
        expect(userBalance.sub(previousBalance).toNumber()).to.equal(0)
    })

    it('Token: Unstake', async () => {
        const user1 = accounts[1]

        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const metalifeToken = await MetalifeToken.deployed();
        const tokenPoolAddress = await metalifePoolFactory.getPoolAddress.call(metalifeToken.address);
        const tokenPool = await MetalifeCorePool.at(tokenPoolAddress)

        let depositsLength = await tokenPool.getDepositsLength.call(user1)
        expect(depositsLength.toNumber()).to.equal(1)

        /* for(let i = 0; i < depositsLength.toNumber(); i++) {
            const deposit = await tokenPool.getDeposit.call(user1, i)
            console.log(i, deposit);
        } */

        let previousBalance = await metalifeToken.balanceOf.call(user1)

        await tokenPool.unstake(0, stakeAmount1, {from: user1})

        let userBalance = await metalifeToken.balanceOf.call(user1)
        expect(userBalance.sub(previousBalance)).to.gt.BN(stakeAmount1)
    })

    it('Token: Stake(locked)', async () => {
        const user1 = accounts[1]

        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const metalifeToken = await MetalifeToken.deployed();
        const tokenPoolAddress = await metalifePoolFactory.getPoolAddress.call(metalifeToken.address);
        const tokenPool = await MetalifeCorePool.at(tokenPoolAddress)

        const block = await web3.eth.getBlock('latest')

        await metalifeToken.approve(tokenPool.address, stakeAmount1, {from: user1})
        await tokenPool.stake(stakeAmount1, block.timestamp + lockedDuration, {from: user1});

        let depositsLength = await tokenPool.getDepositsLength.call(user1)
        expect(depositsLength.toNumber()).to.equal(2)

        const deposit = await tokenPool.getDeposit.call(user1, 1)
        expect(deposit.tokenAmount).to.eq.BN(stakeAmount1)
    })

    it('Token: Fail unstake(locked)', async () => {
        const user1 = accounts[1]

        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const metalifeToken = await MetalifeToken.deployed();
        const tokenPoolAddress = await metalifePoolFactory.getPoolAddress.call(metalifeToken.address);
        const tokenPool = await MetalifeCorePool.at(tokenPoolAddress)

        time.increase(10)

        try {
            await tokenPool.unstake(1, stakeAmount1, {from: user1})

            assert.fail('Expected throw not received');
        }
        catch (error) {
            assert.ok(error.reason == "deposit not yet unlocked", 'Expected throw received');
        }
    })

    it('Token: Unstake(locked)', async () => {
        const user1 = accounts[1]

        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const metalifeToken = await MetalifeToken.deployed();
        const tokenPoolAddress = await metalifePoolFactory.getPoolAddress.call(metalifeToken.address);
        const tokenPool = await MetalifeCorePool.at(tokenPoolAddress)

        time.increase(lockedDuration)

        let previousBalance = await metalifeToken.balanceOf.call(user1)
        let unstakeAmount = stakeAmount1.div(web3.utils.toBN(2))
        await tokenPool.unstake(1, unstakeAmount, {from: user1})
        let userBalance = await metalifeToken.balanceOf.call(user1)
        expect(userBalance.sub(previousBalance)).to.gt.BN(unstakeAmount)

        previousBalance = await metalifeToken.balanceOf.call(user1)
        await tokenPool.unstake(1, unstakeAmount, {from: user1})
        userBalance = await metalifeToken.balanceOf.call(user1)
        expect(userBalance.sub(previousBalance)).to.gt.BN(unstakeAmount)

        try {
            await tokenPool.unstake(1, unstakeAmount, {from: user1})

            assert.fail('Expected throw not received');
        }
        catch (error) {
            assert.ok('Expected throw received');
        }
    })

    it('Token: Re-Stake(locked)', async () => {
        const user1 = accounts[1]

        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const metalifeToken = await MetalifeToken.deployed();
        const tokenPoolAddress = await metalifePoolFactory.getPoolAddress.call(metalifeToken.address);
        const tokenPool = await MetalifeCorePool.at(tokenPoolAddress)

        const block = await web3.eth.getBlock('latest')

        await metalifeToken.approve(tokenPool.address, stakeAmount1, {from: user1})
        await tokenPool.stake(stakeAmount1, block.timestamp + lockedDuration, {from: user1});

        const deposit = await tokenPool.getDeposit.call(user1, 2)
        expect(deposit.tokenAmount).to.eq.BN(stakeAmount1)
    })

    it('Token: Unstake immediately', async () => {
        const user1 = accounts[1]
        const treasury = accounts[2]

        const metalifePoolFactory = await MetalifePoolFactory.deployed()
        const metalifeToken = await MetalifeToken.deployed();
        const tokenPoolAddress = await metalifePoolFactory.getPoolAddress.call(metalifeToken.address);
        const tokenPool = await MetalifeCorePool.at(tokenPoolAddress)

        await tokenPool.setTreasury(treasury);

        let previousBalance = await metalifeToken.balanceOf.call(user1)
        const unstakeAmount = stakeAmount1.div(web3.utils.toBN(4))
        const treasuryAmount = unstakeAmount.div(web3.utils.toBN(20))
        const userAmount = unstakeAmount.sub(treasuryAmount).sub(treasuryAmount)

        let treasuryBalance = await metalifeToken.balanceOf.call(treasury)
        expect(treasuryBalance).to.eq.BN(treasuryBalance)

        // immediately
        await tokenPool.force_unstake(2, unstakeAmount, true, {from: user1})

        let userBalance = await metalifeToken.balanceOf.call(user1)
        expect(userBalance.sub(previousBalance)).to.eq.BN(userAmount)

        let deposit = await tokenPool.getDeposit.call(user1, 2)
        expect(deposit.tokenAmount).to.eq.BN(stakeAmount1.sub(unstakeAmount))

        // lock in 14 days
        previousBalance = await metalifeToken.balanceOf.call(user1)

        await tokenPool.force_unstake(2, unstakeAmount, false, {from: user1})

        userBalance = await metalifeToken.balanceOf.call(user1)
        expect(userBalance.sub(previousBalance).toNumber()).to.equal(0)

        deposit = await tokenPool.getDeposit.call(user1, 2)
        expect(deposit.tokenAmount).to.eq.BN(stakeAmount1.sub(unstakeAmount).sub(unstakeAmount))

        // still locked
        try {
            await tokenPool.withdraw(0, {from: user1})

            assert.fail('Expected throw not received');
        }
        catch (error) {
            assert.ok(error.reason == "deposit not yet unlocked", 'Expected throw received');
        }

        time.increase(14*24*60*60 + 1)

        // withdraw successfully
        previousBalance = await metalifeToken.balanceOf.call(user1)

        await tokenPool.withdraw(0, {from: user1})

        userBalance = await metalifeToken.balanceOf.call(user1)
        expect(userBalance.sub(previousBalance)).to.eq.BN(unstakeAmount)

        // user tries to withdraw
        try {
            await tokenPool.withdraw(0, {from: user1})

            assert.fail('Expected throw not received');
        }
        catch (error) {
            assert.ok(error.reason == "all tokens has been withdrawn", 'Expected throw received');
        }

        try {
            await tokenPool.unstake(2, stakeAmount1, {from: user1})

            assert.fail('Expected throw not received');
        }
        catch (error) {
            assert.ok('Expected throw received');
        }

        time.increase(lockedDuration)

        previousBalance = await metalifeToken.balanceOf.call(user1)
        await tokenPool.unstake(2, unstakeAmount, {from: user1})
        userBalance = await metalifeToken.balanceOf.call(user1)
        expect(userBalance.sub(previousBalance)).to.gt.BN(unstakeAmount)

        previousBalance = await metalifeToken.balanceOf.call(user1)
        await tokenPool.unstake(2, unstakeAmount, {from: user1})
        userBalance = await metalifeToken.balanceOf.call(user1)
        expect(userBalance.sub(previousBalance)).to.gt.BN(unstakeAmount)

        try {
            await tokenPool.unstake(2, unstakeAmount, {from: user1})

            assert.fail('Expected throw not received');
        }
        catch (error) {
            assert.ok(error.reason == "amount exceeds stake", 'Expected throw received');
        }
    })
})
