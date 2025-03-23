// "use client";
// import React, { useEffect, useRef, useState } from "react";
// import * as d3 from "d3";
// import abi from "@/configs/abi";
// import { useReadContract } from "wagmi";

// const BatchFlowTree = ({ batchData }) => {
//   const svgRef = useRef();
//   const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
//   const [selectedBatch, setSelectedBatch] = useState(null);

//   // console.log(batchData)

//   useEffect(() => {
//     const handleResize = () => {
//       const container = svgRef.current.parentElement;
//       setDimensions({
//         width: container.clientWidth || 1000,
//         height: Math.min(window.innerHeight * 0.7, 700)
//       });
//     };

//     window.addEventListener("resize", handleResize);
//     handleResize();

//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Group transfers by batch ID
//   const batchGroups = React.useMemo(() => {
//     if (!batchData || !batchData.length) return {};
    
//     return batchData.reduce((acc, transfer) => {
//       if (!acc[transfer.batchId]) {
//         acc[transfer.batchId] = [];
//       }
//       acc[transfer.batchId].push(transfer);
//       return acc;
//     }, {});
//   }, [batchData]);

//   // Get unique batch IDs
//   const batchIds = React.useMemo(() => {
//     return Object.keys(batchGroups).sort((a, b) => parseInt(a) - parseInt(b));
//   }, [batchGroups]);

//   // Effect to render the selected batch flow
//   useEffect(() => {
//     if (!selectedBatch) {
//       if (batchIds.length > 0) {
//         setSelectedBatch(batchIds[0]);
//       }
//       return;
//     }

//     const transfers = batchGroups[selectedBatch] || [];
//     if (transfers.length === 0) return;

//     const { width, height } = dimensions;

//     // Clear previous SVG content
//     d3.select(svgRef.current).selectAll("*").remove();

//     const svg = d3.select(svgRef.current)
//       .attr("width", width)
//       .attr("height", height)
//       .style("background", "#f9f9f9")
//       .style("border-radius", "8px");

//     // Create a group for zoom/pan
//     const g = svg.append("g")
//       .attr("class", "everything");

//     // Set up zoom behavior
//     const zoom = d3.zoom()
//       .scaleExtent([0.1, 3])
//       .on("zoom", (event) => {
//         g.attr("transform", event.transform);
//       });

//     svg.call(zoom);
    
//     // Initial zoom to fit content
//     svg.call(zoom.transform, d3.zoomIdentity.translate(width / 2, 50).scale(0.8));

//     // Function to build hierarchical tree structure
//     const buildHierarchy = (transfers) => {
//       // Find the manufacturer (root)
//       const firstTransfer = transfers.find(t => t.fromRole === "Manufacturer");
//       if (!firstTransfer) return null;

//       const root = {
//         id: firstTransfer.from,
//         role: "Manufacturer",
//         children: []
//       };

//       // Track processed nodes to avoid duplicates
//       const processedNodes = new Set([root.id]);
      
//       // Track all edges for later use
//       const edges = [];

//       // First pass: Build tree structure
//       const addChildren = (node, transfers) => {
//         // Find all transfers from this node
//         const outgoingTransfers = transfers.filter(t => t.from === node.id);
        
//         outgoingTransfers.forEach(transfer => {
//           // Check if we've already processed this target
//           if (!processedNodes.has(transfer.to)) {
//             const childNode = {
//               id: transfer.to,
//               role: transfer.toRole,
//               children: []
//             };
            
//             node.children.push(childNode);
//             processedNodes.add(transfer.to);
            
//             // Recursively add children
//             addChildren(childNode, transfers);
//           }
          
//           // Always add the edge
//           edges.push({
//             source: transfer.from,
//             target: transfer.to,
//             quantity: transfer.quantity,
//             batchId: transfer.batchId
//           });
//         });
//       };
      
//       addChildren(root, transfers);
      
//       return { root, edges };
//     };

//     const { root, edges } = buildHierarchy(transfers);
//     if (!root) return;

//     // Create tree layout
//     const treeLayout = d3.tree()
//       .nodeSize([80, 150])
//       .separation((a, b) => a.parent === b.parent ? 1.5 : 2);

//     // Convert to d3 hierarchy
//     const hierarchy = d3.hierarchy(root);
    
//     // Compute tree layout
//     const treeData = treeLayout(hierarchy);
    
//     // Define role-based colors
//     const roleColors = {
//       "Manufacturer": "#FF6B6B",
//       "Distributor": "#4ECDC4",
//       "Retailer": "#45B7D1",
//       "Customer": "#98D8AA",
//       "Unknown": "#808080"
//     };

//     // Create arrow markers for links
//     // svg.append("defs").selectAll("marker")
//     //   .data(["arrow"])
//     //   .enter().append("marker")
//     //   .attr("id", d => d)
//     //   .attr("viewBox", "0 -5 10 10")
//     //   .attr("refX", 25)
//     //   .attr("refY", 0)
//     //   .attr("markerWidth", 6)
//     //   .attr("markerHeight", 6)
//     //   .attr("orient", "auto")
//     //   .append("path")
//     //   .attr("d", "M0,-5L10,0L0,5")
//     //   .attr("fill", "#666");

//     // Get map of node positions
//     const nodePositions = {};
//     treeData.descendants().forEach(node => {
//       nodePositions[node.data.id] = { x: node.x, y: node.y };
//     });

//     // Helper function to truncate addresses
//     function truncateAddress(address) {
//       if (!address || address.length <= 8) return address;
//       return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
//     }

//     // Group edges by source-target pair
//     const edgeGroups = {};
//     edges.forEach(edge => {
//       const key = `${edge.source}-${edge.target}`;
//       if (!edgeGroups[key]) {
//         edgeGroups[key] = [];
//       }
//       edgeGroups[key].push(edge);
//     });

//     // Draw links with quantity labels
//     Object.values(edgeGroups).forEach(groupedEdges => {
//       const sourceId = groupedEdges[0].source;
//       const targetId = groupedEdges[0].target;
      
//       const sourcePos = nodePositions[sourceId];
//       const targetPos = nodePositions[targetId];
      
//       if (!sourcePos || !targetPos) return;
      
//       // Calculate the total quantity
//       const totalQuantity = groupedEdges.reduce((sum, edge) => sum + edge.quantity, 0);
      
//       // Create a link with the total quantity
//       const linkPath = g.append("path")
//         .attr("class", "link")
//         .attr("d", () => {
//           const dx = targetPos.y - sourcePos.y;
//           const dy = targetPos.x - sourcePos.x;
//           const dr = Math.sqrt(dx * dx + dy * dy);
//           return `M${sourcePos.y},${sourcePos.x}A${dr},${dr} 0 0,1 ${targetPos.y},${targetPos.x}`;
//         })
//         .attr("fill", "none")
//         .attr("stroke", "#666")
//         .attr("stroke-width", Math.sqrt(totalQuantity) / 2 + 1)
//         .attr("marker-end", "url(#arrow)")
//         .attr("stroke-opacity", 0.8);
      
//       // Add quantity label
//       const midpoint = {
//         x: (sourcePos.x + targetPos.x) / 2,
//         y: (sourcePos.y + targetPos.y) / 2
//       };
      
//       // Add an offset to the midpoint to place the label
//       const offset = groupedEdges.length > 1 ? 15 : 0;
      
//       g.append("rect")
//         .attr("x", midpoint.y - 25)
//         .attr("y", midpoint.x - 10)
//         .attr("width", 50)
//         .attr("height", 20)
//         .attr("fill", "white")
//         .attr("stroke", "#666")
//         .attr("stroke-width", 1)
//         .attr("rx", 5)
//         .attr("ry", 5);
      
//       g.append("text")
//         .attr("x", midpoint.y)
//         .attr("y", midpoint.x + 5)
//         .attr("text-anchor", "middle")
//         .attr("fill", "#333")
//         .attr("font-size", "12px")
//         .text(`Qty: ${totalQuantity}`);
      
//       // If there are multiple transfers, add a note
//       if (groupedEdges.length > 1) {
//         g.append("text")
//           .attr("x", midpoint.y)
//           .attr("y", midpoint.x + 20)
//           .attr("text-anchor", "middle")
//           .attr("fill", "#666")
//           .attr("font-size", "10px")
//           .text(`(${groupedEdges.length} transfers)`);
//       }
//     });

//     // Draw nodes
//     const nodes = g.selectAll(".node")
//       .data(treeData.descendants())
//       .enter().append("g")
//       .attr("class", "node")
//       .attr("transform", d => `translate(${d.y},${d.x})`);

//     // Add node circles
//     nodes.append("circle")
//       .attr("r", 25)
//       .attr("fill", d => roleColors[d.data.role] || roleColors.Unknown)
//       .attr("stroke", "#fff")
//       .attr("stroke-width", 2);

//     // Add address labels
//     nodes.append("text")
//       .text(d => truncateAddress(d.data.id))
//       .attr("dy", 5)
//       .attr("text-anchor", "middle")
//       .attr("fill", "#fff")
//       .attr("font-weight", "bold")
//       .attr("font-size", "10px");

//     // Add role labels
//     nodes.append("text")
//       .text(d => d.data.role)
//       .attr("dy", 40)
//       .attr("text-anchor", "middle")
//       .attr("fill", "#333")
//       .attr("font-size", "12px");

//     // Add batch ID title
//     svg.append("text")
//       .attr("x", width / 2)
//       .attr("y", 30)
//       .attr("text-anchor", "middle")
//       .attr("font-size", "18px")
//       .attr("font-weight", "bold")
//       .text(`Batch ID: ${selectedBatch}`);

//     // Add legend
//     const legend = svg.append("g")
//       .attr("class", "legend")
//       .attr("transform", `translate(20, 20)`);

//     const roleEntries = Object.entries(roleColors);
    
//     roleEntries.forEach(([role, color], i) => {
//       const legendRow = legend.append("g")
//         .attr("transform", `translate(0, ${i * 25})`);
        
//       legendRow.append("circle")
//         .attr("r", 10)
//         .attr("fill", color);
        
//       legendRow.append("text")
//         .attr("x", 20)
//         .attr("y", 5)
//         .text(role)
//         .style("font-size", "14px");
//     });

//   }, [selectedBatch, batchGroups, dimensions]);

//   return (
//     <div className="batch-flow-tree-container">
//       <div className="batch-selector mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">Select Batch:</label>
//         <div className="flex flex-wrap gap-2">
//           {batchIds.map(batchId => (
//             <button
//               key={batchId}
//               className={`px-4 py-2 rounded-full text-sm ${
//                 selectedBatch === batchId 
//                   ? 'bg-blue-600 text-white' 
//                   : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//               }`}
//               onClick={() => setSelectedBatch(batchId)}
//             >
//               Batch #{batchId}
//             </button>
//           ))}
//         </div>
//       </div>
//       <div className="tree-container" style={{ width: '100%', height: '700px', position: 'relative' }}>
//         <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
//       </div>
//     </div>
//   );
// };

// const SupplyChainDashboard = () => {
//   // Example data with multiple transfers between same entities
//   // const supplyChainData = [
//   //   // Batch 1
//   //   { batchId: "1", from: "0xA123F456", to: "0xB789C012", quantity: 100, fromRole: "Manufacturer", toRole: "Distributor" },
//   //   { batchId: "1", from: "0xA123F456", to: "0xB789C012", quantity: 100, fromRole: "Manufacturer", toRole: "Distributor" },
//   //   { batchId: "1", from: "0xA123F456", to: "0x789C012", quantity: 100, fromRole: "Manufacturer", toRole: "Distributor" },
//   //   { batchId: "1", from: "0xA123F456", to: "0xB789C014", quantity: 50, fromRole: "Manufacturer", toRole: "Distributor" }, // Second transfer to same entity
//   //   { batchId: "1", from: "0xB789C012", to: "0xD345E678", quantity: 80, fromRole: "Distributor", toRole: "Retailer" },
//   //   { batchId: "1", from: "0xB789C012", to: "0xE901F234", quantity: 70, fromRole: "Distributor", toRole: "Retailer" }, 
//   //   { batchId: "1", from: "0xB789C012", to: "0xE901F234", quantity: 70, fromRole: "Distributor", toRole: "Retailer" },
//   //   // Split to different retailer
//   //   { batchId: "1", from: "0xD345E678", to: "0xG567H890", quantity: 30, fromRole: "Retailer", toRole: "Customer" },
//   //   { batchId: "1", from: "0xD345E678", to: "0xI789J012", quantity: 50, fromRole: "Retailer", toRole: "Customer" }, // Split to different customer
//   //   { batchId: "1", from: "0xE901F234", to: "0xK123L456", quantity: 70, fromRole: "Retailer", toRole: "Customer" },
    
//   //   // Batch 2 (different flow pattern)
//   //   { batchId: "2", from: "0xA123F456", to: "0xM789N012", quantity: 200, fromRole: "Manufacturer", toRole: "Distributor" },
//   //   { batchId: "2", from: "0xM789N012", to: "0xO345P678", quantity: 75, fromRole: "Distributor", toRole: "Retailer" },
//   //   { batchId: "2", from: "0xM789N012", to: "0xQ901R234", quantity: 75, fromRole: "Distributor", toRole: "Retailer" },
//   //   { batchId: "2", from: "0xM789N012", to: "0xS567T890", quantity: 50, fromRole: "Distributor", toRole: "Retailer" },
//   //   { batchId: "2", from: "0xO345P678", to: "0xU789V012", quantity: 75, fromRole: "Retailer", toRole: "Customer" },
//   //   { batchId: "2", from: "0xQ901R234", to: "0xW123X456", quantity: 75, fromRole: "Retailer", toRole: "Customer" },
//   //   { batchId: "2", from: "0xS567T890", to: "0xY789Z012", quantity: 50, fromRole: "Retailer", toRole: "Customer" },
    
//   //   // Batch 3 (with multiple transfers between same entities)
//   //   { batchId: "3", from: "0xA123F456", to: "0xB789C012", quantity: 60, fromRole: "Manufacturer", toRole: "Distributor" },
//   //   { batchId: "3", from: "0xA123F456", to: "0xB789C012", quantity: 40, fromRole: "Manufacturer", toRole: "Distributor" },
//   //   { batchId: "3", from: "0xA123F456", to: "0xB789C012", quantity: 20, fromRole: "Manufacturer", toRole: "Distributor" },
//   //   { batchId: "3", from: "0xB789C012", to: "0xD345E678", quantity: 120, fromRole: "Distributor", toRole: "Retailer" },
//   //   { batchId: "3", from: "0xD345E678", to: "0xG567H890", quantity: 60, fromRole: "Retailer", toRole: "Customer" },
//   //   { batchId: "3", from: "0xD345E678", to: "0xI789J012", quantity: 60, fromRole: "Retailer", toRole: "Customer" }
//   // ];

//   const {data}=useReadContract({
//     abi:abi,
//     address: import.meta.env.VITE_CONTRACT_ADDRESS,
//     functionName: 'getBatchDetails',
//     args: [0],
//   })

//   var supplyChainData = []

//   const roles={
//     "0":"Manufacturer",
//     "1":"Distributor",
//     "2":"Retailer",
//     "3":"Customer"
//   }

//   if(data)
//   {
//     console.log(data)
//     // for(var i=0;i<data[4].length;i++)
//     // {
      
//     // }
//   }
  
//   // var supplyChainData = []



//   return (
//     <div className="container mx-auto px-4 py-8">
//       <header className="mb-8">
//         <h1 className="text-3xl font-bold mb-2">Supply Chain Flow Visualization</h1>
//         <p className="text-gray-600">Tree-based visualization of product movement through the supply chain</p>
//       </header>
      
//       <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
//         <h2 className="text-xl font-semibold mb-4">Batch Flow Tree</h2>
//         <BatchFlowTree batchData={supplyChainData} />
//         <div className="mt-4 text-sm text-gray-500">
//           <p>* Each batch is shown as a separate tree. Use the buttons to switch between batches.</p>
//           <p>* Multiple transfers between the same entities are combined with total quantity shown.</p>
//           <p>* Zoom and pan the visualization using mouse wheel and drag.</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default SupplyChainDashboard;

function hello()
{
  return(
    <>
    Hello
    </>
  )
}

export default hello