
const hre = require("hardhat");

async function deploy() {

  // Get the Signers.
  const [owner, admin, reserve, beneficiery, otherDude] = await hre.ethers.getSigners();

  // We get the contract to deploy.
  const TestToken_Contract = await hre.ethers.getContractFactory("TestToken");
  const TestTokenTwo_Contract = await hre.ethers.getContractFactory("TestTokenTwo");
  const TrustFund_Contract = await hre.ethers.getContractFactory("ERC20TimeLockedTrustfund");
  
  // Deploy the contracts.
  const TestToken_Instance = await TestToken_Contract.deploy();
  const TestTokenTwo_Instance = await TestTokenTwo_Contract.deploy();
  const TrustFund_Instance = await TrustFund_Contract.deploy(
    beneficiery.address,
    admin.address,
    reserve.address
  );

  await TestToken_Instance.deployed();
  await TestTokenTwo_Instance.deployed();
  await TrustFund_Instance.deployed();

  // Get the totalsupply of TestToken.
  const totalSupply = await TestToken_Instance.totalSupply();
  const totalSupplyTwo = await TestTokenTwo_Instance.totalSupply();

  // Get the balance of each account.
  const adminBalance = await TestToken_Instance.balanceOf(admin.address);
  const reserveBalance = await TestToken_Instance.balanceOf(reserve.address);
  const beneficiaryBalance = await TestToken_Instance.balanceOf(beneficiery.address);
  
  // Transfer 100.000 TestTokens from Owner's account to otherDude's account.
  await TestToken_Instance.connect(owner).transfer(otherDude.address, 100000*10**2)
  await TestTokenTwo_Instance.connect(owner).transfer(otherDude.address, 100000*10**2)
  

  // Get the balance after transaction.
  const ownerBalance = await TestToken_Instance.balanceOf(owner.address);
  const otherDudeBalance = await TestToken_Instance.balanceOf(otherDude.address);
  const otherDudeBalanceTwo = await TestTokenTwo_Instance.balanceOf(otherDude.address);
  
  console.log(`

    CONTRACTS DEPLOYED SUCCESSFULLY & 100.000 TestTokens transfered to OtherDude:
    
    TestToken address       :       ${TestToken_Instance.address},
    TestToken Name          :       ${await TestToken_Instance.name()},
    TestToken TotalSupply   :       ${totalSupply},
    TestToken Decimals      :       ${await TestToken_Instance.decimals()}

    TestTokenTwo address    :       ${TestTokenTwo_Instance.address},
    TestTokenTwo Name       :       ${await TestTokenTwo_Instance.name()},
    TestTokenTwo TotalSupply:       ${totalSupplyTwo},
    TestTokenTwo Decimals   :       ${await TestTokenTwo_Instance.decimals()}

    TrustFund address       :       ${TrustFund_Instance.address}

    Owner address           :       ${owner.address},
    Owner balance           :       ${ownerBalance}

    Admin address           :       ${admin.address},
    Admin balance           :       ${adminBalance}
    
    Reserve address         :       ${reserve.address},
    Reserve balance         :       ${reserveBalance}

    Beneficiary address     :       ${beneficiery.address},
    Beneficiary balance     :       ${beneficiaryBalance}

    OtherDude address       :       ${otherDude.address},
    OtherDude balance       :       ${otherDudeBalance},
    OtherDude balance Two   :       ${otherDudeBalanceTwo}

  `);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
deploy()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
