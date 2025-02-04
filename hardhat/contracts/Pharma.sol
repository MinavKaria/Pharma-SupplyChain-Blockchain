// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AdvancedSupplyChain is Ownable(msg.sender){

    enum Role { 
        Customer,
        Supplier, 
        Manufacturer, 
        Distributor, 
        Retailer
    }

    struct Transfer {
        address from;
        address to;
        uint256 quantity;
    }

    struct ProductBatch {
        uint256 id;
        string productData;
        address creator;
        uint256 quantity;
        uint256 quantityTransferred;
        address[] chainOfCustody;
        Transfer[] transfers; 
    }

    ProductBatch[] public batches;
    mapping(address => Role) public userRoles;
    mapping(address => bool) public isRegistered;
    mapping(uint256 => mapping(address => uint256)) public batchQuantities;

    event BatchCreated(uint256 indexed batchId, string productData, uint256 quantity);
    event BatchTransferred(
        uint256 indexed batchId, 
        address indexed from, 
        address indexed to, 
        uint256 quantityTransferred
    );
    event RoleAssigned(address indexed user, Role role);

    constructor() payable {
        userRoles[msg.sender] = Role.Supplier;
        isRegistered[msg.sender] = true;
    }

    modifier onlyRole(Role _role) {
        require(userRoles[msg.sender] == _role, "Unauthorized: Incorrect role");
        _;
    }

    modifier validBatch(uint256 _batchId) {
        require(_batchId < batches.length, "Invalid batch ID");
        _;
    }

    function assignRole(address _user, Role _role) external onlyOwner {
        require(!isRegistered[_user], "User already registered");
        userRoles[_user] = _role;
        isRegistered[_user] = true;
        emit RoleAssigned(_user, _role);
    }


    function revokeRole(address _user) external onlyOwner {
        require(isRegistered[_user], "User is not registered");
        isRegistered[_user] = false;
        userRoles[_user]=Role.Customer;
    }

    function createBatch(
        string memory _productData, 
        uint256 _quantity
    ) external onlyRole(Role.Supplier) returns (uint256) {
        require(_quantity != 0, "Quantity must be greater than zero");

        uint256 batchId = batches.length; 

        batchQuantities[batchId][msg.sender]=_quantity;

        ProductBatch storage newBatch = batches.push(); 
        newBatch.id = batchId;
        newBatch.productData = _productData;
        newBatch.creator = msg.sender;
        newBatch.quantityTransferred=0;
        newBatch.quantity = _quantity;
        newBatch.chainOfCustody.push(msg.sender);

        emit BatchCreated(batchId, _productData, _quantity);
        return batchId;
    }

    function transferBatch(
        uint256 _batchId, 
        address _recipient,
        uint256 _quantity
    ) external validBatch(_batchId){
        require(isRegistered[msg.sender], "Sender not registered");
        require(_quantity != 0, "Quantity must be greater than zero");

        ProductBatch storage batch = batches[_batchId];
        require(batchQuantities[_batchId][msg.sender] >= _quantity, "Insufficient quantity in batch");
        
        Role senderRole = userRoles[msg.sender];
        Role recipientRole = userRoles[_recipient];
        require(
        (senderRole == Role.Supplier && recipientRole == Role.Manufacturer) ||
        (senderRole == Role.Manufacturer && recipientRole == Role.Distributor) ||
        (senderRole == Role.Distributor && recipientRole == Role.Retailer) ||
        (senderRole == Role.Retailer && (recipientRole!=Role.Manufacturer && recipientRole!=Role.Distributor && recipientRole!=Role.Supplier && recipientRole!=Role.Retailer)),
            "Unauthorized transfer"
        );

        batchQuantities[_batchId][msg.sender] -= _quantity;
        batchQuantities[_batchId][_recipient] += _quantity;

        if(senderRole==Role.Supplier)
            batch.quantityTransferred+=_quantity;

       
        batch.chainOfCustody.push(_recipient);

        batch.transfers.push(Transfer({
            from: msg.sender,
            to: _recipient,
            quantity: _quantity
        }));

        emit BatchTransferred(_batchId, msg.sender, _recipient, _quantity);
    }

    function getBatchDetails(uint256 _batchId) external view validBatch(_batchId) returns (
        string memory productData,
        uint256 quantity,
        address creator,
        address[] memory chainOfCustody,
        Transfer[] memory transfers
    ) {
        require(batches.length > _batchId , "Invalid batch ID");

        ProductBatch storage batch = batches[_batchId];
        return (
            batch.productData,
            batch.quantity,
            batch.creator,
            batch.chainOfCustody,
            batch.transfers
        );
    }

    function getUserRole(address _user) external view returns (Role) {
        require(isRegistered[_user], "User is not registered");
        return userRoles[_user];
    }

    function getAllBatches() external view returns (
        uint256[] memory, 
        string[] memory, 
        uint256[] memory, 
        address[] memory,
        uint256[] memory
    ) {
        uint256 length = batches.length;
        uint256[] memory ids = new uint256[](length);
        string[] memory productDatas = new string[](length);
        uint256[] memory quantities = new uint256[](length);
        address[] memory creators = new address[](length);
        uint256[] memory quantityTransferred= new uint256[](length);


        for (uint256 i = 0; i < length; ++i) {
            ProductBatch storage batch = batches[i];
            ids[i] = batch.id;
            productDatas[i] = batch.productData;
            quantities[i] = batch.quantity;
            creators[i] = batch.creator;
            quantityTransferred[i]=batch.quantityTransferred;
        }

        return (ids, productDatas, quantities, creators,quantityTransferred);
    }

    function getTransfersByAddress(address _user) external view returns (
        uint256[] memory batchIds,
        address[] memory fromAddresses,
        address[] memory toAddresses,
        uint256[] memory quantities
    ) {
        uint256 totalTransfers = 0;

        for (uint256 i = 0; i < batches.length; ++i) {
            for (uint256 j = 0; j < batches[i].transfers.length; ++j) {
                if (batches[i].transfers[j].from == _user || batches[i].transfers[j].to == _user) {
                    totalTransfers++;
                }
            }
        }

        batchIds = new uint256[](totalTransfers);
        fromAddresses = new address[](totalTransfers);
        toAddresses = new address[](totalTransfers);
        quantities = new uint256[](totalTransfers);

        uint256 index = 0;

        for (uint256 i = 0; i < batches.length; ++i) {
            for (uint256 j = 0; j < batches[i].transfers.length; ++j) {
                if (batches[i].transfers[j].from == _user || batches[i].transfers[j].to == _user) {
                    batchIds[index] = i;
                    fromAddresses[index] = batches[i].transfers[j].from;
                    toAddresses[index] = batches[i].transfers[j].to;
                    quantities[index] = batches[i].transfers[j].quantity;
                    index++;
                }
            }
        }

        return (batchIds, fromAddresses, toAddresses, quantities);
    }

   
}