import hre from "hardhat";

async function main() {
  try {
    const contractName= "AdvancedSupplyChain";
    const SupplyChain = await hre.ethers.getContractFactory(contractName);

    const contract = await SupplyChain.deploy();

    console.log("Deploying contract...");
    await contract.waitForDeployment(); 
    console.log(`SimpleContract deployed to: ${contract.target}`);
    
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();