import { expect } from "chai";
import { ethers } from "hardhat";

describe("AdvancedSupplyChain Contract", function () {
  let supplyChain: any;
  let owner, supplier, manufacturer, distributor, retailer;
  let batchId;

  beforeEach(async function () {
    [owner, supplier, manufacturer, distributor, retailer] = await ethers.getSigners();

    const SupplyChain = await ethers.getContractFactory("AdvancedSupplyChain");
    supplyChain = await SupplyChain.deploy();
    console.log("Deploying contract...");
    await supplyChain.waitForDeployment(); 
    console.log(`AdvancedSupplyChain deployed to: ${supplyChain.target}`);

    supplyChain.connect();

    // console.log(supplier.address);

    // Add Roles
    await supplyChain.assignRole(supplier.address, 0);
    await supplyChain.assignRole(manufacturer.address, 1);
    await supplyChain.assignRole(distributor.address, 2);
    await supplyChain.assignRole(retailer.address, 3);
  });

  describe("Assigned the roles properly", function () {
    it("Should assign a supplier role", async function () {
        expect(await supplyChain.getUserRole(supplier.address)).to.equal(0);
    });
    it("Should assign a manufacturer role", async function () {
        expect(await supplyChain.getUserRole(manufacturer.address)).to.equal(1);
    });

    it("Should assign a retailer role", async function () {
        expect(await supplyChain.getUserRole(retailer.address)).to.equal(3);
    });
    it("Should assign a distributor role", async function () {
        expect(await supplyChain.getUserRole(distributor.address)).to.equal(2);
    });

  });

  describe("Add a batch of medicine",async function () {
    const qr={
      name: "Paracetamol",
    }
    const qrCode=JSON.stringify(qr);
    const id= supplyChain.createBatch(qrCode,100);
    console.log(id);
  });

  
});
