import hre from "hardhat";

async function main() {
  try {
    const contractName = "AdvancedSupplyChain";
    const SupplyChain = await hre.ethers.getContractFactory(contractName);

    const contract = await SupplyChain.deploy();
    console.log("Deploying contract...");
    await contract.waitForDeployment();
    console.log(`Contract deployed to: ${contract.target}`);

    const [owner, supplier, manufacturer, distributor, retailer] = await hre.ethers.getSigners();

    // Assign roles
    await contract.assignRole(supplier.address, 0);
    await contract.assignRole(manufacturer.address, 1);
    await contract.assignRole(distributor.address, 2);
    await contract.assignRole(retailer.address, 3);

    // Create a QR code object
    const qr = {
      name: "Paracetamol",
    };
    const qrCode = JSON.stringify(qr);

    // Send transaction and wait for receipt
    const tx = await contract.createBatch(qrCode, 100);
    const receipt = await tx.wait(); // Wait for transaction to be mined

    // Extract Batch ID from event logs
    const event = receipt.logs.find(log => 
      log.fragment.name === "BatchCreated"
    );

    if (event) {
      const batchId = event.args[0].toString(); // Extract and convert to string
      console.log("Batch ID:", batchId);
      const data = await contract.getBatchDetails(batchId);
      console.log(data);
    } else {
      console.log("BatchCreated event not found");
    }

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();