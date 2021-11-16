async function main() {
    const [ deployer ] = await ethers.getSigners();
    
    const beneficiary = '0xb3Dd6A862d7639a5922d7A6a277Cdc819E30f915';
    const admin = '0x6d300A0e146143f68F318ED045B80b06B0001639';
    const reserve = '0x8a6cFB9a0f636BcD42148Dc66BC5536585F19A6a';

    console.log("Deploying contracts with the account:", deployer.address);
  
    const Contract = await ethers.getContractFactory("ERC20TimeLockedTrustfund", deployer);
    console.log("contract");
    const trustfund = await Contract.deploy(beneficiary, admin, reserve);
    console.log("deployed");
  
    console.log(`
        ERC20 Timelocked TrustFund Contract:        ${trustfund.address}
        
        Owner Address:                              ${deployer.address},
        Beneficiary                                 ${beneficiary},
        Admin                                       ${admin},
        Reserve                                     ${reserve}
    `);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });