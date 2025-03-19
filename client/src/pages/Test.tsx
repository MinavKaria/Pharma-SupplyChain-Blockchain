// import { useState, useEffect, useRef } from 'react';
// import { useAccount } from 'wagmi';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Label } from '@/components/ui/label';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import * as d3 from 'd3';
// import abi from '@/configs/abi';
// import { useReadContract } from 'wagmi';

// // Import contract address from environment variables
// const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
// const contractABI = abi;

// // Define role enum to match the Solidity contract
// const Role = {
//   CUSTOMER: 0,
//   MANUFACTURER: 1,
//   DISTRIBUTOR: 2,
//   RETAILER: 3
// };

// // Role mapping for visualization
// const roleMapping = {
//   0: "Customer",
//   1: "Manufacturer",
//   2: "Distributor", 
//   3: "Retailer"
// };

// // Color mapping for roles
// const roleColors = {
//   "Manufacturer": "#4338ca", // indigo
//   "Distributor": "#0369a1", // sky
//   "Retailer": "#15803d",    // green
//   "Customer": "#b45309"     // amber
// };

// interface Transfer {
//   from: string;
//   to: string;
//   quantity: number;
//   fromRole: number;
//   toRole: number;
// }

// interface SupplyChainTreeGraphProps {
//   chainOfCustody: string[];
//   transfers: Transfer[];
// }

// const SupplyChainTreeGraph: React.FC<SupplyChainTreeGraphProps> = ({ chainOfCustody, transfers }) => {
//   const svgRef = useRef(null);
  
//   useEffect(() => {
//     if (!transfers || transfers.length === 0) return;
    
//     // Clear previous visualization
//     d3.select(svgRef.current).selectAll("*").remove();
    
//     // Build a proper tree structure from transfers
//     const nodeMap = new Map();
    
//     // Add all addresses from transfers to nodeMap with accurate roles
//     transfers.forEach(transfer => {
//       const fromRole = roleMapping[transfer.fromRole];
//       const toRole = roleMapping[transfer.toRole];
      
//       if (!nodeMap.has(transfer.from)) {
//         nodeMap.set(transfer.from, {
//           id: transfer.from,
//           children: [],
//           childLinks: [],
//           role: fromRole
//         });
//       }
      
//       if (!nodeMap.has(transfer.to)) {
//         nodeMap.set(transfer.to, {
//           id: transfer.to,
//           children: [],
//           childLinks: [],
//           role: toRole
//         });
//       }
//     });
    
//     // Process transfers to build parent-child relationships
//     transfers.forEach(transfer => {
//       const fromNode = nodeMap.get(transfer.from);
      
//       // Check if this link already exists
//       const existingLinkIndex = fromNode.childLinks.findIndex(link => link.target === transfer.to);
      
//       if (existingLinkIndex >= 0) {
//         // Update the existing link with the new quantity
//         const oldQuantity = parseInt(fromNode.childLinks[existingLinkIndex].quantity);
//         const newQuantity = oldQuantity + transfer.quantity;
//         fromNode.childLinks[existingLinkIndex].quantity = newQuantity.toString();
//         fromNode.childLinks[existingLinkIndex].transfers = fromNode.childLinks[existingLinkIndex].transfers || [];
//         fromNode.childLinks[existingLinkIndex].transfers.push(transfer);
//       } else {
//         // Add a new link
//         fromNode.children.push(transfer.to);
//         fromNode.childLinks.push({
//           target: transfer.to,
//           quantity: transfer.quantity.toString(),
//           transfers: [transfer]
//         });
//       }
//     });
    
//     // Find the root node (manufacturer) - usually the first in chain of custody
//     let rootId = chainOfCustody[0];
    
//     // Create hierarchy for D3 tree layout
//     const createHierarchy = (nodeId) => {
//       const node = nodeMap.get(nodeId);
//       if (!node) return null;
      
//       return {
//         id: node.id,
//         role: node.role,
//         quantity: undefined,
//         children: node.children.map(childId => {
//           const child = createHierarchy(childId);
//           if (child) {
//             const link = node.childLinks.find(link => link.target === childId);
//             if (link) {
//               child.quantity = link.quantity;
//               child.transfers = link.transfers;
//             }
//           }
//           return child;
//         }).filter(Boolean)
//       };
//     };
    
//     const hierarchyData = createHierarchy(rootId);
    
//     // Set up dimensions for the tree layout
//     const width = 1000;
//     const height = 800; // Increased height for better spacing
//     const nodeRadius = 40;
//     const margin = { top: 80, right: 160, bottom: 80, left: 160 }; // Increased margins
    
//     // Create SVG
//     const svg = d3.select(svgRef.current)
//       .attr("viewBox", `0 0 ${width} ${height}`)
//       .attr("width", "100%")
//       .attr("height", "100%")
//       .attr("style", "max-height: 800px;");
    
//     // Create a group to contain the tree
//     const g = svg.append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);
    
//     // Create a tree layout with more spacing
//     const treeLayout = d3.tree()
//       .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
//       .separation((a, b) => (a.parent === b.parent ? 3 : 5)); // Increased separation
    
//     // Create the root hierarchy
//     const root = d3.hierarchy(hierarchyData);
    
//     // Assign positions to nodes
//     treeLayout(root);
    
//     // Create arrow markers for direction
//     svg.append("defs").selectAll("marker")
//       .data(["arrow"])
//       .enter().append("marker")
//       .attr("id", d => d)
//       .attr("viewBox", "0 -5 10 10")
//       .attr("refX", 20)
//       .attr("refY", 0)
//       .attr("markerWidth", 6)
//       .attr("markerHeight", 6)
//       .attr("orient", "auto")
//       .append("path")
//       .attr("d", "M0,-5L10,0L0,5")
//       .attr("fill", "#2563eb");
    
//     // Add links (edges)
//     const link = g.selectAll(".link")
//       .data(root.links())
//       .enter().append("path")
//       .attr("class", "link")
//       .attr("d", d3.linkHorizontal()
//         .x(d => d.y)
//         .y(d => d.x))
//       .attr("fill", "none")
//       .attr("stroke", "#2563eb")
//       .attr("stroke-width", 2)
//       .attr("marker-end", "url(#arrow)");
    
//     // Add quantity labels on links
//     g.selectAll(".quantity-label")
//       .data(root.links())
//       .enter().append("text")
//       .attr("class", "quantity-label")
//       .attr("x", d => (d.source.y + d.target.y) / 2)
//       .attr("y", d => (d.source.x + d.target.x) / 2 - 10)
//       .attr("text-anchor", "middle")
//       .attr("fill", "#4b5563")
//       .attr("font-size", "12px")
//       .text(d => {
//         if (d.target.data.transfers && d.target.data.transfers.length > 1) {
//           return `${d.target.data.quantity} units (${d.target.data.transfers.length} transfers)`;
//         }
//         return `Qty: ${d.target.data.quantity || "?"}`;
//       });
    
//     // Create node groups
//     const node = g.selectAll(".node")
//       .data(root.descendants())
//       .enter().append("g")
//       .attr("class", "node")
//       .attr("transform", d => `translate(${d.y},${d.x})`);
    
//     // Add circles for nodes
//     node.append("circle")
//       .attr("r", nodeRadius)
//       .attr("fill", d => roleColors[d.data.role] || "#b45309")
//       .attr("stroke", "#f8fafc")
//       .attr("stroke-width", 2);
    
//     // Add role labels
//     node.append("text")
//       .attr("text-anchor", "middle")
//       .attr("y", -5)
//       .attr("fill", "white")
//       .attr("font-size", "12px")
//       .attr("font-weight", "bold")
//       .text(d => d.data.role);
    
//     // Add address labels
//     node.append("text")
//       .attr("text-anchor", "middle")
//       .attr("y", 10)
//       .attr("fill", "white")
//       .attr("font-size", "10px")
//       .text(d => `${d.data.id.substring(0, 6)}...`);
    
//     // Add a legend
//     const legend = svg.append("g")
//       .attr("transform", "translate(20, 20)");
    
//     const legendData = [
//       { role: "Manufacturer", color: roleColors["Manufacturer"] },
//       { role: "Distributor", color: roleColors["Distributor"] },
//       { role: "Retailer", color: roleColors["Retailer"] },
//       { role: "Customer", color: roleColors["Customer"] }
//     ];
    
//     legendData.forEach((item, i) => {
//       const legendRow = legend.append("g")
//         .attr("transform", `translate(0, ${i * 20})`);
      
//       legendRow.append("rect")
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", item.color);
      
//       legendRow.append("text")
//         .attr("x", 20)
//         .attr("y", 12)
//         .attr("font-size", "12px")
//         .attr("fill", "#64748b")
//         .text(item.role);
//     });
    
//     // Add zoom capability
//     const zoom = d3.zoom()
//       .scaleExtent([0.5, 2])
//       .on("zoom", (event) => {
//         g.attr("transform", event.transform);
//       });
    
//     svg.call(zoom);
    
//   }, [chainOfCustody, transfers]);
  
//   return (
//     <div className="w-full overflow-x-auto pb-6">
//       <svg ref={svgRef} width="100%" height="800"></svg>
//     </div>
//   );
// };

// // Updated BatchTransferGraph component
// const BatchTransferGraph = ({ batchId }) => {
//   const { data, isLoading, isError } = useReadContract({
//     address: contractAddress,
//     abi: contractABI,
//     functionName: 'getBatchDetails',
//     args: [batchId],
//     enabled: batchId !== '',
//   });

//   if (isLoading) return <div className="text-center py-8">Loading batch details...</div>;
//   if (isError) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to fetch batch details</AlertDescription></Alert>;
//   if (!data) return null;

//   const [productData, quantity, creator, chainOfCustody, transfers, expiryDate, storageCondition] = data;
  
//   // Format expiry date
//   const formattedExpiryDate = new Date(Number(expiryDate) * 1000).toLocaleDateString();
  
//   // Map storage condition enum to readable string
//   const storageTypes = ['Normal', 'Refrigerated', 'Frozen'];
//   const storageType = storageTypes[storageCondition] || 'Unknown';

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Batch #{batchId} Details</CardTitle>
//           <CardDescription>Product and manufacturing information</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="grid gap-4">
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <Label>Product Data</Label>
//                 <p className="text-sm">{productData}</p>
//               </div>
//               <div>
//                 <Label>Total Quantity</Label>
//                 <p className="text-sm">{quantity.toString()}</p>
//               </div>
//             </div>
//             <div className="grid grid-cols-2 gap-2">
//               <div>
//                 <Label>Creator</Label>
//                 <p className="text-sm font-mono break-all">{creator}</p>
//               </div>
//               <div>
//                 <Label>Expiry Date</Label>
//                 <p className="text-sm">{formattedExpiryDate}</p>
//               </div>
//             </div>
//             <div>
//               <Label>Storage Condition</Label>
//               <p className="text-sm">{storageType}</p>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Supply Chain Flow Visualization</CardTitle>
//           <CardDescription>Visual representation of product movement (including multiple transfers and splits)</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <SupplyChainTreeGraph chainOfCustody={chainOfCustody} transfers={transfers} />
//           <div className="mt-4 px-4 py-2 bg-blue-50 border border-blue-200 rounded-md">
//             <p className="text-sm text-blue-700">
//               This visualization shows the complete supply chain journey including repeated transfers to the same recipient.
//               Each node is colored by role, and links show the total quantity transferred between entities.
//               Zoom and pan the diagram for a better view of complex supply chains.
//             </p>
//           </div>
//         </CardContent>
//       </Card>

//       <Card>
//         <CardHeader>
//           <CardTitle>Supply Chain Data</CardTitle>
//           <CardDescription>Detailed transfer history with role information</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-6">
//             <div>
//               <h4 className="font-medium mb-2">Transfer History</h4>
//               <div className="overflow-x-auto">
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="text-left bg-slate-100">
//                       <th className="p-2 border">From</th>
//                       <th className="p-2 border">To</th>
//                       <th className="p-2 border">Quantity</th>
//                       <th className="p-2 border">From Role</th>
//                       <th className="p-2 border">To Role</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {transfers.map((transfer, index) => (
//                       <tr key={index}>
//                         <td className="p-2 border">
//                           <p className="text-xs font-mono truncate max-w-xs">{transfer.from}</p>
//                         </td>
//                         <td className="p-2 border">
//                           <p className="text-xs font-mono truncate max-w-xs">{transfer.to}</p>
//                         </td>
//                         <td className="p-2 border">{transfer.quantity.toString()}</td>
//                         <td className="p-2 border">{roleMapping[transfer.fromRole]}</td>
//                         <td className="p-2 border">{roleMapping[transfer.toRole]}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// // The existing CheckTransactions component that uses BatchTransferGraph
// const CheckTransactions = () => {
//   const [batchId, setBatchId] = useState('');
//   const [activeTab, setActiveTab] = useState('batch-search');

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-2xl font-bold mb-6">Supply Chain Explorer</h1>
      
//       <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
//         <TabsList className="grid w-full grid-cols-3">
//           <TabsTrigger value="batch-search">Batch Search</TabsTrigger>
//           <TabsTrigger value="all-batches">All Batches</TabsTrigger>
//           <TabsTrigger value="user-transfers">My Transfers</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="batch-search" className="mt-6">
//           <Card>
//             <CardHeader>
//               <CardTitle>Search Batch</CardTitle>
//               <CardDescription>Enter a batch ID to view its transfer history</CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex gap-4">
//                 <div className="flex-1">
//                   <Label htmlFor="batch-id-input">Batch ID</Label>
//                   <Input 
//                     id="batch-id-input"
//                     type="number" 
//                     placeholder="Enter batch ID" 
//                     value={batchId} 
//                     onChange={(e) => setBatchId(e.target.value)}
//                   />
//                 </div>
//                 <div className="flex items-end">
//                   <Button disabled={!batchId}>Search</Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
          
//           {batchId && <div className="mt-6"><BatchTransferGraph batchId={batchId} /></div>}
//         </TabsContent>
        
//         <TabsContent value="all-batches" className="mt-6">
//           <BatchList />
//         </TabsContent>
        
//         <TabsContent value="user-transfers" className="mt-6">
//           <UserTransfers />
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// // BatchList component
// const BatchList = () => {
//   const { data, isLoading, isError } = useReadContract({
//     address: contractAddress,
//     abi: contractABI,
//     functionName: 'getAllBatches',
//   });

//   if (isLoading) return <div className="text-center py-8">Loading all batches...</div>;
//   if (isError) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to fetch batches</AlertDescription></Alert>;
//   if (!data) return null;

//   const [ids, productDatas, quantities, creators, quantityTransferred] = data;

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>All Batches</CardTitle>
//         <CardDescription>Overview of all product batches in the system</CardDescription>
//       </CardHeader>
//       <CardContent>
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="text-left bg-slate-100">
//                 <th className="p-2 border">Batch ID</th>
//                 <th className="p-2 border">Product</th>
//                 <th className="p-2 border">Total Quantity</th>
//                 <th className="p-2 border">Transferred</th>
//                 <th className="p-2 border">Creator</th>
//                 <th className="p-2 border">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {ids.map((id, index) => (
//                 <tr key={id.toString()}>
//                   <td className="p-2 border">{id.toString()}</td>
//                   <td className="p-2 border">{productDatas[index]}</td>
//                   <td className="p-2 border">{quantities[index].toString()}</td>
//                   <td className="p-2 border">{quantityTransferred[index].toString()}</td>
//                   <td className="p-2 border">
//                     <p className="text-xs font-mono truncate max-w-xs">{creators[index]}</p>
//                   </td>
//                   <td className="p-2 border">
//                     <Button 
//                       variant="outline" 
//                       size="sm" 
//                       onClick={() => {
//                         const input = document.getElementById('batch-id-input');
//                         if (input) {
//                           input.value = id.toString();
//                           document.getElementById('batch-id-input').dispatchEvent(new Event('input', { bubbles: true }));
//                         }
//                       }}
//                     >
//                       View Details
//                     </Button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// // UserTransfers component
// const UserTransfers = () => {
//   const { address } = useAccount();
  
//   const { data, isLoading, isError } = useReadContract({
//     address: contractAddress,
//     abi: contractABI,
//     functionName: 'getTransfersByAddress',
//     args: [address],
//     enabled: !!address,
//   });

//   if (!address) return <Alert><AlertTitle>Connect Wallet</AlertTitle><AlertDescription>Please connect your wallet to view your transfers</AlertDescription></Alert>;
//   if (isLoading) return <div className="text-center py-8">Loading your transfers...</div>;
//   if (isError) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to fetch your transfers</AlertDescription></Alert>;
//   if (!data) return null;

//   const [batchIds, fromAddresses, toAddresses, quantities] = data;
  
//   // Separate incoming and outgoing transfers
//   const incomingTransfers = [];
//   const outgoingTransfers = [];
  
//   for (let i = 0; i < batchIds.length; i++) {
//     const transfer = {
//       batchId: batchIds[i].toString(),
//       from: fromAddresses[i],
//       to: toAddresses[i],
//       quantity: quantities[i].toString()
//     };
    
//     if (toAddresses[i] === address) {
//       incomingTransfers.push(transfer);
//     } else {
//       outgoingTransfers.push(transfer);
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <Card>
//         <CardHeader>
//           <CardTitle>Your Account</CardTitle>
//           <CardDescription>Connected address: {address}</CardDescription>
//         </CardHeader>
//       </Card>
      
//       <Tabs defaultValue="incoming">
//         <TabsList className="grid w-full grid-cols-2">
//           <TabsTrigger value="incoming">Incoming Transfers</TabsTrigger>
//           <TabsTrigger value="outgoing">Outgoing Transfers</TabsTrigger>
//         </TabsList>
        
//         <TabsContent value="incoming" className="mt-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Incoming Transfers</CardTitle>
//               <CardDescription>Products transferred to you</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {incomingTransfers.length === 0 ? (
//                 <p className="text-center py-4 text-slate-500">No incoming transfers found</p>
//               ) : (
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="text-left bg-slate-100">
//                       <th className="p-2 border">Batch ID</th>
//                       <th className="p-2 border">From</th>
//                       <th className="p-2 border">Quantity</th>
//                       <th className="p-2 border">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {incomingTransfers.map((transfer, i) => (
//                       <tr key={i}>
//                         <td className="p-2 border">{transfer.batchId}</td>
//                         <td className="p-2 border">
//                           <p className="text-xs font-mono truncate max-w-xs">{transfer.from}</p>
//                         </td>
//                         <td className="p-2 border">{transfer.quantity}</td>
//                         <td className="p-2 border">
//                           <Button 
//                             variant="outline" 
//                             size="sm" 
//                             onClick={() => {
//                               const input = document.getElementById('batch-id-input');
//                               if (input) {
//                                 input.value = transfer.batchId;
//                                 document.getElementById('batch-id-input').dispatchEvent(new Event('input', { bubbles: true }));
//                               }
//                             }}
//                           >
//                             View Batch
//                           </Button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
        
//         <TabsContent value="outgoing" className="mt-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Outgoing Transfers</CardTitle>
//               <CardDescription>Products you've transferred to others</CardDescription>
//             </CardHeader>
//             <CardContent>
//               {outgoingTransfers.length === 0 ? (
//                 <p className="text-center py-4 text-slate-500">No outgoing transfers found</p>
//               ) : (
//                 <table className="w-full border-collapse">
//                   <thead>
//                     <tr className="text-left bg-slate-100">
//                       <th className="p-2 border">Batch ID</th>
//                       <th className="p-2 border">To</th>
//                       <th className="p-2 border">Quantity</th>
//                       <th className="p-2 border">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {outgoingTransfers.map((transfer, i) => (
//                       <tr key={i}>
//                         <td className="p-2 border">{transfer.batchId}</td>
//                         <td className="p-2 border">
//                           <p className="text-xs font-mono truncate max-w-xs">{transfer.to}</p>
//                         </td>
//                         <td className="p-2 border">{transfer.quantity}</td>
//                         <td className="p-2 border">
//                           <Button 
//                             variant="outline" 
//                             size="sm" 
//                             onClick={() => {
//                               const input = document.getElementById('batch-id-input');
//                               if (input) {
//                                 input.value = transfer.batchId;
//                                 document.getElementById('batch-id-input').dispatchEvent(new Event('input', { bubbles: true }));
//                               }
//                             }}
//                           >
//                             View Batch
//                           </Button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               )}
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// };

// export default CheckTransactions;

// import React from 'react'

function Test() {
  return (
    <div>Test</div>
  )
}

export default Test