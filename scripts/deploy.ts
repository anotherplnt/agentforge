const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying AgentForge to Arc Testnet...");

  const AgentForge = await ethers.getContractFactory("AgentForge");
  const agentForge = await AgentForge.deploy();

  await agentForge.waitForDeployment();

  const address = await agentForge.getAddress();
  console.log(`AgentForge deployed to: ${address}`);
  console.log(`Explorer: https://testnet.arcscan.app/address/${address}`);
  console.log("");
  console.log("Update your .env.local:");
  console.log(`NEXT_PUBLIC_AGENTFORGE_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
