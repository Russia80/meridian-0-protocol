// scripts/grant_roles.js
const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const ruleNftAddress = "0x170a5AD6B886F26Cc182fBe28767F83b3F751494"; 
  
  const MeridianRuleNFT = await hre.ethers.getContractFactory("MeridianRuleNFT");
  const nft = await MeridianRuleNFT.attach(ruleNftAddress);

  console.log("Granting DEFAULT_ADMIN_ROLE to owner...");
  
  // Роль ADMINISTRATOR позволяет выдавать другие роли
  const tx = await nft.grantRole(
    ethers.constants.HashZero, // По стандарту OpenZeppelin нулевой хеш - это Admin Role
    owner.address
  );
  await tx.wait();
  
  console.log(`Admin role granted to ${owner.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
