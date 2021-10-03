const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TestToken & TrustFund contracts", function () {
  
  before(async () => {
    // Get the Signers.
    [owner, admin, reserve, beneficiary, otherDude] = await ethers.getSigners();
    
    // We get the contract to deploy.
    const TestToken_Contract = await hre.ethers.getContractFactory("TestToken");
    const TestTokenTwo_Contract = await hre.ethers.getContractFactory("TestTokenTwo");
    const TrustFund_Contract = await hre.ethers.getContractFactory("ERC20TimeLockedTrustfund");
    
    // Deploy the contracts.
    TestToken_Instance = await TestToken_Contract.deploy();
    TestTokenTwo_Instance = await TestTokenTwo_Contract.deploy();
    TrustFund_Instance = await TrustFund_Contract.deploy(
      beneficiary.address,
      admin.address,
      reserve.address
    );
  
    await TestToken_Instance.deployed();
    await TestTokenTwo_Instance.deployed();
    await TrustFund_Instance.deployed();

    console.log(`
    CONTRACT & SIGNERS ADDRESS:

      TestToken               :           ${TestToken_Instance.address},
      TestTokenTwo            :           ${TestTokenTwo_Instance.address},
      TimelockedTrustfund     :           ${TrustFund_Instance.address}

      Owner                   :           ${owner.address},
      Admin                   :           ${admin.address},
      Reserve                 :           ${reserve.address},
      OtherDude               :           ${otherDude.address},
      Beneficiary             :           ${beneficiary.address}

    `)
  });

  describe('TestToken & TestToken TWO', () => {
    it("TESTTOKEN: Should have a totalsupply of 1000000000000000000000000 TestTokens", async function () {
      // Get the totalsupply of TestToken.
      expect(await TestToken_Instance.totalSupply()).to.be.equal("1000000000000000000000000");  
    });
    it("TESTTOKEN: Should transfer 100.000 TestTokens to OtherDude´s account", async function () {
      // Transfer 100.000 TestTokens from Owner's account to otherDude's account.
      const transferTx = await TestToken_Instance.connect(owner).transfer(otherDude.address, "100000000000000000");
      await transferTx.wait();
        
      expect(await TestToken_Instance.balanceOf(otherDude.address)).to.be.equal("100000000000000000");
      expect(await TestToken_Instance.balanceOf(owner.address)).to.be.equal("999999900000000000000000");  
    });
    it("TESTTOKENTwo: transfer 100.000 TestTokenTwo to OD's account", async function () {
      // Transfer 100.000 TestTokens from Owner's account to otherDude's account.
      const transferTx = await TestTokenTwo_Instance.connect(owner).transfer(otherDude.address, "100000000000000000");
      await transferTx.wait();
        
      expect(await TestTokenTwo_Instance.balanceOf(otherDude.address)).to.be.equal("100000000000000000");
      expect(await TestTokenTwo_Instance.balanceOf(owner.address)).to.be.equal("999999900000000000000000");
    });
  });

  describe('Trustfund: deposit tokens to TrustFund contract.', () => {
    it("TRUSTFUND: Should let OtherDude deposit 1000.00000000000 TestTokens", async function () {
      // approve the TrustFund contract
      const approveTx = await TestToken_Instance.connect(otherDude).approve(TrustFund_Instance.address, "100000000000000000000");
      await approveTx.wait();
  
      const depositTx = await TrustFund_Instance.connect(otherDude).ERC20deposit(TestToken_Instance.address, "100000000000000");
      expect(await depositTx.wait());
  
      const TrustFundBalance = await TestToken_Instance.balanceOf(TrustFund_Instance.address);
      expect(TrustFundBalance.toString()).to.be.equal("100000000000000");
      
      const otherDudeBalance = await TestToken_Instance.balanceOf(otherDude.address);
      expect(otherDudeBalance.toString()).to.be.equal("99900000000000000");
    });
    it("TRUSTFUND: Should let OtherDude deposit 1000.00000000000 TestTokenTwo", async function () {
      // approve the TrustFund contract
      const approveTx = await TestTokenTwo_Instance.connect(otherDude).approve(TrustFund_Instance.address, "100000000000000000000");
      await approveTx.wait();
  
      const depositTx = await TrustFund_Instance.connect(otherDude).ERC20deposit(TestTokenTwo_Instance.address, "100000000000000");
      expect(await depositTx.wait());
  
      const TrustFundBalanceTwo = await TestTokenTwo_Instance.balanceOf(TrustFund_Instance.address);
      expect(TrustFundBalanceTwo.toString()).to.be.equal("100000000000000");
      
      const otherDudeBalanceTwo = await TestTokenTwo_Instance.balanceOf(otherDude.address);
      expect(otherDudeBalanceTwo.toString()).to.be.equal("99900000000000000");
    });
    it("TRUSTFUND: Should return the ERC20 tokens deposited", async function () {
      await TrustFund_Instance.getTokens();

    });
  });
  
  describe('Trustfund: withdraw tokens from TrustFund contract.', () => {
    it("Should let the admin approve Withdraw", async function () {
      expect(await TrustFund_Instance.isAdmin()).to.be.false;
      await TrustFund_Instance.connect(admin).approveWithdraw();
      expect(await TrustFund_Instance.isAdmin()).to.be.true;
    });
    it("Should let the reserve approve Withdraw", async function () {
      expect(await TrustFund_Instance.isReserve()).to.be.false;
      await TrustFund_Instance.connect(reserve).approveWithdraw();
    });
    it("Should check beneficiary balance", async function () {
      const tokenBalance = await TrustFund_Instance.getERC20Balance(TestToken_Instance.address);
      const tokenTwobalance = await TrustFund_Instance.getERC20Balance(TestTokenTwo_Instance.address);
      const beneficiaryTokenBalance = await TestToken_Instance.balanceOf(beneficiary.address);
      const beneficiaryTokenTwoBalance = await TestTokenTwo_Instance.balanceOf(beneficiary.address);  
      expect(await tokenBalance.toString()).to.be.equal('0');
      expect(await tokenTwobalance.toString()).to.be.equal('0');
      expect(await beneficiaryTokenBalance.toString()).to.be.equal('100000000000000');
      expect(await beneficiaryTokenTwoBalance.toString()).to.be.equal('100000000000000');
    });
  });
   
});
