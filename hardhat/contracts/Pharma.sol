// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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

    struct Transfer {
        address from;
        address to;
        uint256 quantity;
        uint256 timestamp;
    }

    struct ProductBatch {
        uint256 id;
        string qrCode;
        address creator;
        uint256 totalQuantity;
        uint256 quantity;
        address[] chainOfCustody;
        Transfer[] transfers; 
        Status status;
        mapping(address => bool) allowedTransferees;
    }

    ProductBatch[] public batches;
    mapping(address => Role) public userRoles;
    mapping(address => bool) public isRegistered;
    mapping(uint256 => mapping(address => uint256)) public batchQuantities; 
    mapping(uint256 => bool) private usedBatchIds; 

    event BatchCreated(uint256 indexed batchId, string qrCode, uint256 quantity);
    event BatchTransferred(
        uint256 indexed batchId, 
        address indexed from, 
        address indexed to, 
        uint256 quantityTransferred,
        Status newStatus
    );
    event RoleAssigned(address indexed user, Role role);
    event BatchStatusUpdated(uint256 indexed batchId, Status newStatus);

    address public owner;

    constructor() {
        owner = msg.sender;
        userRoles[msg.sender] = Role.Supplier;
        isRegistered[msg.sender] = true;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner, "Only admin can perform this action");
        _;
    }

    modifier onlyRole(Role _role) {
        require(userRoles[msg.sender] == _role, "Unauthorized: Incorrect role");
        _;
    }

    modifier validBatch(uint256 _batchId) {
        require(_batchId < batches.length, "Invalid batch ID");
        _;
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
    ) external onlyRole(Role.Supplier) returns (uint256) {
        require(_quantity > 0, "Quantity must be greater than zero");

        uint256 batchId = batches.length; 
        require(!usedBatchIds[batchId], "Batch ID already in use");
        usedBatchIds[batchId] = true; // Mark the ID as used

        ProductBatch storage newBatch = batches.push(); 
        newBatch.id = batchId;
        newBatch.qrCode = _qrCode;
        newBatch.creator = msg.sender;
        newBatch.totalQuantity=_quantity;
        newBatch.quantity = _quantity;
        newBatch.status = Status.Created;
        newBatch.chainOfCustody.push(msg.sender);

        emit BatchCreated(batchId, _qrCode, _quantity);
        return batchId;
    }

    function transferBatch(
        uint256 _batchId, 
        address _recipient,
        uint256 _quantity
    ) external validBatch(_batchId) {
        require(_quantity > 0, "Quantity must be greater than zero");
        require(isRegistered[_recipient], "Recipient is not registered");

        ProductBatch storage batch = batches[_batchId];
        require(batch.quantity >= _quantity, "Insufficient quantity in batch");
        
        Role senderRole = userRoles[msg.sender];
        require(
            (senderRole == Role.Supplier && batch.status == Status.Created) ||
            (senderRole == Role.Manufacturer && batch.status == Status.SupplierToManufacturer) ||
            (senderRole == Role.Distributor && batch.status == Status.ManufacturerToDistributor) ||
            (senderRole == Role.Retailer && batch.status == Status.DistributorToRetailer),
            "Unauthorized transfer"
        );

        batch.quantity -= _quantity;
        batchQuantities[_batchId][_recipient] += _quantity;

        batch.chainOfCustody.push(_recipient);

        batch.transfers.push(Transfer({
            from: msg.sender,
            to: _recipient,
            quantity: _quantity,
            timestamp: block.timestamp
        }));

        batch.status = Status(uint256(batch.status) + 1);

        emit BatchTransferred(_batchId, msg.sender, _recipient, _quantity, batch.status);
        emit BatchStatusUpdated(_batchId, batch.status);
    }

    function getBatchDetails(uint256 _batchId) external view validBatch(_batchId) returns (
        string memory qrCode,
        uint256 quantity,
        uint256 totalQuantity,
        address creator,
        Status status,
        address[] memory chainOfCustody,
        Transfer[] memory transfers
    ) {
        ProductBatch storage batch = batches[_batchId];
        return (
            batch.qrCode,
            batch.quantity,
            batch.totalQuantity,
            batch.creator,
            batch.status,
            batch.chainOfCustody,
            batch.transfers
        );
    }

    function getUserRole(address _user) external view returns (Role) {
        require(isRegistered[_user], "User is not registered");
        return userRoles[_user];
    }

    function verifyUser(address _user) external view returns (bool) {
        return isRegistered[_user];
    }

    function updateBatchStatus(uint256 _batchId, Status _newStatus) external onlyAdmin validBatch(_batchId) {
        ProductBatch storage batch = batches[_batchId];
        require(uint256(_newStatus) > uint256(batch.status), "Invalid status update");
        batch.status = _newStatus;
        emit BatchStatusUpdated(_batchId, _newStatus);
    }
}