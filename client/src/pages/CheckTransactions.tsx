import { useState, useEffect, useRef } from 'react';
import { useAccount } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import * as d3 from 'd3';
import abi from '@/configs/abi';
import { useReadContract } from 'wagmi';

// Import contract address from environment variables
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
const contractABI = abi;

// Role mapping for visualization
// const roleMapping = {
//   0: "Customer",
//   1: "Manufacturer",
//   2: "Distributor", 
//   3: "Retailer"
// };

interface transfers {
  from: string;
  to: string;
  quantity: number;
}

interface Link {
  target: string;
  quantity: string;
}

interface SupplyChainTreeGraphProps {
  chainOfCustody: string[];
  transfers: transfers[];
}





const SupplyChainTreeGraph: React.FC<SupplyChainTreeGraphProps> = ({ chainOfCustody, transfers }) => {
  const svgRef = useRef(null);
  
  useEffect(() => {
    if (!transfers || transfers.length === 0) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll("*").remove();
    
    // Build a proper tree structure from transfers
    const nodeMap = new Map();
    const processedTransfers = new Map(); // To track processed transfer pairs
    
    // Add all addresses from transfers to nodeMap
    transfers.forEach(transfer => {
      if (!nodeMap.has(transfer.from)) {
        nodeMap.set(transfer.from, {
          id: transfer.from,
          children: [],
          childLinks: [], // Store links with quantities
          role: guessRole(transfer.from, chainOfCustody)
        });
      }
      
      if (!nodeMap.has(transfer.to)) {
        nodeMap.set(transfer.to, {
          id: transfer.to,
          children: [],
          childLinks: [],
          role: guessRole(transfer.to, chainOfCustody)
        });
      }
    });
    
    // Process transfers to build parent-child relationships
    transfers.forEach(transfer => {
      const key = `${transfer.from}-${transfer.to}`;
      if (!processedTransfers.has(key)) {
        const fromNode = nodeMap.get(transfer.from);
        
        if (!fromNode.children.includes(transfer.to)) {
          fromNode.children.push(transfer.to);
          fromNode.childLinks.push({
            target: transfer.to,
            quantity: transfer.quantity.toString()
          });
          processedTransfers.set(key, true);
        }
      }
    });
    
    // Find the root node (manufacturer)
    let rootId = chainOfCustody[0]; // Default to first in chain of custody
    
    // Create hierarchy for D3 tree layout
    const createHierarchy = (nodeId: string) => {
      const node = nodeMap.get(nodeId);
      if (!node) return null;
      
      return {
        id: node.id,
        role: node.role,
        quantity: undefined as string | undefined,
        children: node.children.map((childId:string) => {
          const child = createHierarchy(childId);
          // Add quantity information to the child
          if (child) {
            const link = node.childLinks.find((link: Link) => link.target === childId);
            if (link) {
              child.quantity = link.quantity;
            }
          }
          return child;
        }).filter(Boolean) 
      };
    };
    
    const hierarchyData = createHierarchy(rootId);
    
    // Set up dimensions for the tree layout
    const width = 1000;
    const height = 600;
    const nodeRadius = 40;
    const margin = { top: 50, right: 120, bottom: 50, left: 120 };
    
    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("style", "max-height: 600px;");
    
    // Create a group to contain the tree
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Create a tree layout
    const treeLayout = d3.tree()
      .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
      .separation((a, b) => (a.parent === b.parent ? 2 : 3));
    
    // Create the root hierarchy
    const root = d3.hierarchy(hierarchyData);
    
    // Assign positions to nodes
    treeLayout(root);
    
    // Create arrow markers for direction
    svg.append("defs").selectAll("marker")
      .data(["arrow"])
      .enter().append("marker")
      .attr("id", d => d)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#2563eb");
    
    // Add links (edges)
    const link = g.selectAll(".link")
      .data(root.links())
      .enter().append("path")
      .attr("class", "link")
      .attr("d", d3.linkHorizontal()
        .x(d => d.y)
        .y(d => d.x))
      .attr("fill", "none")
      .attr("stroke", "#2563eb")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");
    
    // Add quantity labels on links
    g.selectAll(".quantity-label")
      .data(root.links())
      .enter().append("text")
      .attr("class", "quantity-label")
      .attr("x", d => (d.source.y + d.target.y) / 2)
      .attr("y", d => (d.source.x + d.target.x) / 2 - 10)
      .attr("text-anchor", "middle")
      .attr("fill", "#4b5563")
      .attr("font-size", "12px")
      .text(d => `Qty: ${d.target.data.quantity || "?"}`);
    
    // Create node groups
    const node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);
    
    // Add circles for nodes
    node.append("circle")
      .attr("r", nodeRadius)
      .attr("fill", d => {
        if (d.data.role === "Manufacturer") return "#4338ca"; // indigo
        if (d.data.role === "Distributor") return "#0369a1"; // sky
        if (d.data.role === "Retailer") return "#15803d"; // green
        return "#b45309"; // amber (for customer)
      })
      .attr("stroke", "#f8fafc")
      .attr("stroke-width", 2);
    
    // Add role labels
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("y", -5)
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(d => d.data.role);
    
    // Add address labels
    node.append("text")
      .attr("text-anchor", "middle")
      .attr("y", 10)
      .attr("fill", "white")
      .attr("font-size", "10px")
      .text(d => `${d.data.id.substring(0, 6)}...`);
    
    // Add a legend
    const legend = svg.append("g")
      .attr("transform", "translate(20, 20)");
    
    const legendData = [
      { role: "Manufacturer", color: "#4338ca" },
      { role: "Distributor", color: "#0369a1" },
      { role: "Retailer", color: "#15803d" },
      { role: "Customer", color: "#b45309" }
    ];
    
    legendData.forEach((item, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", item.color);
      
      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("font-size", "12px")
        .attr("fill", "#64748b")
        .text(item.role);
    });
    
    // Add zoom capability
    const zoom = d3.zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom);
    
  }, [chainOfCustody, transfers]);
  
  // Helper function to guess role based on position in chain
  const guessRole = (address, chainOfCustody) => {
    const index = chainOfCustody.indexOf(address);
    
    if (index === 0) return "Manufacturer";
    
    // If it's not in chain of custody, determine based on transfers
    for (const transfer of transfers) {
      if (transfer.from === chainOfCustody[0] && transfer.to === address) {
        return "Distributor";
      } else if (transfer.from !== chainOfCustody[0] && transfer.to === address) {
        // Check if sender is a distributor
        for (const t of transfers) {
          if (t.from === chainOfCustody[0] && t.to === transfer.from) {
            return "Retailer";
          }
        }
        return "Customer";
      }
    }
    
    // Fallback logic
    if (index === 1) return "Distributor";
    if (index === 2) return "Retailer";
    return "Customer";
  };
  
  return (
    <div className="w-full overflow-x-auto pb-6">
      <svg ref={svgRef} width="100%" height="600"></svg>
    </div>
  );
};

// Updated BatchTransferGraph component to use the tree visualization
const BatchTransferGraph = ({ batchId }) => {
  const { data, isLoading, isError } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getBatchDetails',
    args: [batchId],
    enabled: batchId !== '',
  });

  if (isLoading) return <div className="text-center py-8">Loading batch details...</div>;
  if (isError) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to fetch batch details</AlertDescription></Alert>;
  if (!data) return null;

  const [productData, quantity, creator, chainOfCustody, transfers, expiryDate, storageCondition] = data;
  
  // Format expiry date
  const formattedExpiryDate = new Date(Number(expiryDate) * 1000).toLocaleDateString();
  
  // Map storage condition enum to readable string
  const storageTypes = ['Normal', 'Refrigerated', 'Frozen'];
  const storageType = storageTypes[storageCondition] || 'Unknown';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Batch #{batchId} Details</CardTitle>
          <CardDescription>Product and manufacturing information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Product Data</Label>
                <p className="text-sm">{productData}</p>
              </div>
              <div>
                <Label>Total Quantity</Label>
                <p className="text-sm">{quantity.toString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Creator</Label>
                <p className="text-sm font-mono break-all">{creator}</p>
              </div>
              <div>
                <Label>Expiry Date</Label>
                <p className="text-sm">{formattedExpiryDate}</p>
              </div>
            </div>
            <div>
              <Label>Storage Condition</Label>
              <p className="text-sm">{storageType}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Flow Visualization</CardTitle>
          <CardDescription>Visual representation of product movement (including splits)</CardDescription>
        </CardHeader>
        <CardContent>
          <SupplyChainTreeGraph chainOfCustody={chainOfCustody} transfers={transfers} />
          <div className="mt-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              This visualization shows the complete supply chain journey of the batch, including any splits where portions were sent to different recipients.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supply Chain Data</CardTitle>
          <CardDescription>Detailed chain of custody and transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* <div>
              <h4 className="font-medium mb-2">Chain of Custody</h4>
              <div className="flex overflow-x-auto">
                {chainOfCustody.map((address, index) => (
                  <div key={index} className="flex items-center min-w-max">
                    <div className="px-4 py-2 bg-slate-100 rounded border">
                      <p className="text-xs font-mono truncate max-w-xs">{address}</p>
                      <p className="text-xs text-slate-500">
                        {index === 0 ? 'Manufacturer' : 
                        index === chainOfCustody.length - 1 ? 'Current Holder' : 
                        index === 1 ? 'Distributor' : 
                        index === 2 ? 'Retailer' : `Holder ${index}`}
                      </p>
                    </div>
                    {index < chainOfCustody.length - 1 && (
                      <div className="px-2">→</div>
                    )}
                  </div>
                ))}
              </div>
            </div> */}

            <div>
              <h4 className="font-medium mb-2">Transfer History</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left bg-slate-100">
                      <th className="p-2 border">From</th>
                      <th className="p-2 border">To</th>
                      <th className="p-2 border">Quantity</th>
                      <th className="p-2 border">From Role</th>
                      <th className="p-2 border">To Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((transfer, index) => {
                      // Determine roles based on position in chain
                      const fromIndex = chainOfCustody.indexOf(transfer.from);
                      const toIndex = chainOfCustody.indexOf(transfer.to);
                      
                      let fromRole = "Unknown";
                      if (fromIndex === 0) fromRole = "Manufacturer";
                      else if (fromIndex === 1) fromRole = "Distributor";
                      else if (fromIndex === 2) fromRole = "Retailer";
                      
                      let toRole = "Unknown";
                      if (toIndex === 1) toRole = "Distributor";
                      else if (toIndex === 2) toRole = "Retailer";
                      else if (toIndex > 2) toRole = "Customer";
                      
                      return (
                        <tr key={index}>
                          <td className="p-2 border">
                            <p className="text-xs font-mono truncate max-w-xs">{transfer.from}</p>
                          </td>
                          <td className="p-2 border">
                            <p className="text-xs font-mono truncate max-w-xs">{transfer.to}</p>
                          </td>
                          <td className="p-2 border">{transfer.quantity.toString()}</td>
                          <td className="p-2 border">{fromRole}</td>
                          <td className="p-2 border">{toRole}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// The existing CheckTransactions component that uses BatchTransferGraph
const CheckTransactions = () => {
  const [batchId, setBatchId] = useState('');
  const [activeTab, setActiveTab] = useState('batch-search');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Supply Chain Explorer</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="batch-search">Batch Search</TabsTrigger>
          <TabsTrigger value="all-batches">All Batches</TabsTrigger>
          <TabsTrigger value="user-transfers">My Transfers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="batch-search" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Batch</CardTitle>
              <CardDescription>Enter a batch ID to view its transfer history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="batch-id-input">Batch ID</Label>
                  <Input 
                    id="batch-id-input"
                    type="number" 
                    placeholder="Enter batch ID" 
                    value={batchId} 
                    onChange={(e) => setBatchId(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button disabled={!batchId}>Search</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {batchId && <div className="mt-6"><BatchTransferGraph batchId={batchId} /></div>}
        </TabsContent>
        
        <TabsContent value="all-batches" className="mt-6">
          <BatchList />
        </TabsContent>
        
        <TabsContent value="user-transfers" className="mt-6">
          <UserTransfers />
        </TabsContent>
      </Tabs>
    </div>
  );
};



// Retain other existing components (BatchList, UserTransfers) as they were
const BatchList = () => {
  const { data, isLoading, isError } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getAllBatches',
  });

  if (isLoading) return <div className="text-center py-8">Loading all batches...</div>;
  if (isError) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to fetch batches</AlertDescription></Alert>;
  if (!data) return null;

  const [ids, productDatas, quantities, creators, quantityTransferred] = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Batches</CardTitle>
        <CardDescription>Overview of all product batches in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-slate-100">
                <th className="p-2 border">Batch ID</th>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Total Quantity</th>
                <th className="p-2 border">Transferred</th>
                <th className="p-2 border">Creator</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {ids.map((id, index) => (
                <tr key={id.toString()}>
                  <td className="p-2 border">{id.toString()}</td>
                  <td className="p-2 border">{productDatas[index]}</td>
                  <td className="p-2 border">{quantities[index].toString()}</td>
                  <td className="p-2 border">{quantityTransferred[index].toString()}</td>
                  <td className="p-2 border">
                    <p className="text-xs font-mono truncate max-w-xs">{creators[index]}</p>
                  </td>
                  <td className="p-2 border">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => document.getElementById('batch-id-input').value = id.toString()}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

const UserTransfers = () => {
  const { address } = useAccount();
  
  const { data, isLoading, isError } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getTransfersByAddress',
    args: [address],
    enabled: !!address,
  });

  if (!address) return <Alert><AlertTitle>Connect Wallet</AlertTitle><AlertDescription>Please connect your wallet to view your transfers</AlertDescription></Alert>;
  if (isLoading) return <div className="text-center py-8">Loading your transfers...</div>;
  if (isError) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to fetch your transfers</AlertDescription></Alert>;
  if (!data) return null;

  const [batchIds, fromAddresses, toAddresses, quantities] = data;
  
  // Separate incoming and outgoing transfers
  const incomingTransfers = [];
  const outgoingTransfers = [];
  
  for (let i = 0; i < batchIds.length; i++) {
    const transfer = {
      batchId: batchIds[i].toString(),
      from: fromAddresses[i],
      to: toAddresses[i],
      quantity: quantities[i].toString()
    };
    
    if (toAddresses[i] === address) {
      incomingTransfers.push(transfer);
    } else {
      outgoingTransfers.push(transfer);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Account</CardTitle>
          <CardDescription>Connected address: {address}</CardDescription>
        </CardHeader>
      </Card>
      
      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming">Incoming Transfers</TabsTrigger>
          <TabsTrigger value="outgoing">Outgoing Transfers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="incoming" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Transfers</CardTitle>
              <CardDescription>Products transferred to you</CardDescription>
            </CardHeader>
            <CardContent>
              {incomingTransfers.length === 0 ? (
                <p className="text-center py-4 text-slate-500">No incoming transfers found</p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left bg-slate-100">
                      <th className="p-2 border">Batch ID</th>
                      <th className="p-2 border">From</th>
                      <th className="p-2 border">Quantity</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingTransfers.map((transfer, i) => (
                      <tr key={i}>
                        <td className="p-2 border">{transfer.batchId}</td>
                        <td className="p-2 border">
                          <p className="text-xs font-mono truncate max-w-xs">{transfer.from}</p>
                        </td>
                        <td className="p-2 border">{transfer.quantity}</td>
                        <td className="p-2 border">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => document.getElementById('batch-id-input').value = transfer.batchId}
                          >
                            View Batch
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="outgoing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Outgoing Transfers</CardTitle>
              <CardDescription>Products you've transferred to others</CardDescription>
            </CardHeader>
            <CardContent>
              {outgoingTransfers.length === 0 ? (
                <p className="text-center py-4 text-slate-500">No outgoing transfers found</p>
              ) : (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left bg-slate-100">
                      <th className="p-2 border">Batch ID</th>
                      <th className="p-2 border">To</th>
                      <th className="p-2 border">Quantity</th>
                      <th className="p-2 border">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outgoingTransfers.map((transfer, i) => (
                      <tr key={i}>
                        <td className="p-2 border">{transfer.batchId}</td>
                        <td className="p-2 border">
                          <p className="text-xs font-mono truncate max-w-xs">{transfer.to}</p>
                        </td>
                        <td className="p-2 border">{transfer.quantity}</td>
                        <td className="p-2 border">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => document.getElementById('batch-id-input').value = transfer.batchId}
                          >
                            View Batch
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CheckTransactions;