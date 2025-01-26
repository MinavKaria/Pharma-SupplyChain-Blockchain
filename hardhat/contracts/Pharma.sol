// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AdvancedSupplyChain {
    enum Status { 
        Created, 
        SupplierToManufacturer, 
        ManufacturerToDistributor, 
        DistributorToRetailer,
        Delivered 
    }

    enum Role { 
        Supplier, 
        Manufacturer, 
        Distributor, 
        Retailer 
    }

    struct ProductBatch {
        uint256 id;
        string qrCode;
        address creator;
        uint256 quantity;
        address[] chainOfCustody;
        Status status;
        mapping(address => bool) allowedTransferees;
    }

    ProductBatch[] public batches;
    mapping(address => Role) public userRoles;
    mapping(address => bool) public isRegistered;
    mapping(uint256 => mapping(address => uint256)) public batchQuantities; 

    event BatchCreated(uint256 indexed batchId, string qrCode, uint256 quantity);
    event BatchTransferred(
        uint256 indexed batchId, 
        address indexed from, 
        address indexed to, 
        uint256 quantityTransferred,
        Status newStatus
    );
    event RoleAssigned(address indexed user, Role role);

    modifier onlyAdmin() {
        require(msg.sender == owner, "Only admin can perform this action");
        _;
    }

    address public owner;

    constructor() {
        owner = msg.sender;
        userRoles[msg.sender] = Role.Supplier;
        isRegistered[msg.sender] = true;
    }

    function assignRole(address _user, Role _role) external onlyAdmin {
        require(!isRegistered[_user], "User already registered");
        userRoles[_user] = _role;
        isRegistered[_user] = true;
        emit RoleAssigned(_user, _role);
    }

    function createBatch(
        string memory _qrCode, 
        uint256 _quantity
    ) external returns (uint256) {
        require(
            userRoles[msg.sender] == Role.Supplier, 
            "Only suppliers can create batches"
        );

        uint256 batchId = batches.length;
        
        // Using storage to create batch with dynamic mapping
        ProductBatch storage newBatch = batches.push();
        newBatch.id = batchId;
        newBatch.qrCode = _qrCode;
        newBatch.creator = msg.sender;
        newBatch.quantity = _quantity;
        newBatch.status = Status.Created;

        emit BatchCreated(batchId, _qrCode, _quantity);
        return batchId;
    }

    function transferBatch(
        uint256 _batchId, 
        address _recipient,
        uint256 _quantity
    ) external {
        require(_batchId < batches.length, "Invalid batch");
        require(_quantity > 0, "Quantity should be positive");
        
        ProductBatch storage batch = batches[_batchId];
        require(batch.quantity >= _quantity, "Insufficient quantity");

        batch.quantity -= _quantity;
        batchQuantities[_batchId][_recipient] += _quantity;
        
        require(
            (userRoles[msg.sender] == Role.Supplier && 
             batch.status == Status.Created) ||
            (userRoles[msg.sender] == Role.Manufacturer && 
             batch.status == Status.SupplierToManufacturer) ||
            (userRoles[msg.sender] == Role.Distributor && 
             batch.status == Status.ManufacturerToDistributor) ||
            (userRoles[msg.sender] == Role.Retailer && 
             batch.status == Status.DistributorToRetailer),
            "Unauthorized transfer"
        );
        
        batch.chainOfCustody.push(msg.sender);
        batch.status = Status(uint256(batch.status) + 1);

        emit BatchTransferred(_batchId, msg.sender, _recipient, _quantity, batch.status);
    }

    function getBatchDetails(uint256 _batchId) external view returns (
        string memory qrCode,
        uint256 quantity,
        address creator,
        Status status,
        address[] memory chainOfCustody
    ) {
        require(_batchId < batches.length, "Invalid batch");
        ProductBatch storage batch = batches[_batchId];
        
        return (
            batch.qrCode,
            batch.quantity,
            batch.creator,
            batch.status,
            batch.chainOfCustody
        );
    }

    function getUserRole(address _user) external view returns (Role) {
        return userRoles[_user];
    }
}