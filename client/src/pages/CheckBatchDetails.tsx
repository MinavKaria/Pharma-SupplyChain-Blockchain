import { useState, useEffect, useRef } from "react";
import { useReadContract } from "wagmi";
import * as d3 from "d3";
import abi from "@/configs/abi";

// Define types for transfer data and hierarchy
interface Transfer {
  batchId: string;
  from: string;
  to: string;
  quantity: number;
  fromRole: string;
  toRole: string;
}

interface Edge {
  source: string;
  target: string;
  quantity: number;
  batchId: string;
}

interface HierarchyNode {
  id: string;
  role: string;
  children: HierarchyNode[];
}

interface HierarchyResult {
  root: HierarchyNode;
  edges: Edge[];
}

interface NodePosition {
  x: number;
  y: number;
}

interface ContractBatchTransfer {
  from: string;
  to: string;
  quantity: bigint;
  fromRole: bigint;
  toRole: bigint;
}

interface Dimensions {
  width: number;
  height: number;
}

const SupplyChainVisualizer = () => {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [batchIds, setBatchIds] = useState<number[]>([]);
  const [transferData, setTransferData] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showTable, setShowTable] = useState<boolean>(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 1000,
    height: 700,
  });

  // Contract ABI - only including the functions we need
  const contractAbi = abi;
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS as string;

  // Get all batches from the contract
  const { data: allBatchesData, isLoading: isLoadingBatches } = useReadContract(
    {
      address: contractAddress as `0x${string}`,
      abi: contractAbi,
      functionName: "getAllBatches",
    }
  ) as { data: [bigint[]] | undefined; isLoading: boolean };

  // Get batch details for the selected batch
  const { data: batchDetails, isLoading: isLoadingDetails } = useReadContract({
    address: contractAddress as `0x${string}`,
    abi: contractAbi,
    functionName: "getBatchDetails",
    args: selectedBatch !== null ? [selectedBatch] : undefined,
  }) as {
    data:
      | [string, bigint, bigint, boolean, ContractBatchTransfer[]]
      | undefined;
    isLoading: boolean;
  };

  useEffect(() => {
    if (allBatchesData && allBatchesData?.length > 0) {
      const ids = allBatchesData[0] as bigint[]; // First array contains batch IDs
      setBatchIds(ids.map((id) => Number(id)));

      // Auto-select the first batch if none is selected
      if (selectedBatch === null && ids.length > 0) {
        setSelectedBatch(Number(ids[0]));
      }
    }
  }, [allBatchesData, selectedBatch]);

  // Convert batch details to transfer data format the graph component expects
  useEffect(() => {
    if (batchDetails && selectedBatch !== null) {
      const transfers = batchDetails[4] as ContractBatchTransfer[];

      const roleMap: Record<number, string> = {
        0: "Customer",
        1: "Manufacturer",
        2: "Distributor",
        3: "Retailer",
      };

      // Transform contract data to the format needed by D3 visualization
      const formattedTransfers = transfers.map((transfer) => ({
        batchId: selectedBatch.toString(),
        from: transfer.from,
        to: transfer.to,
        quantity: Number(transfer.quantity),
        fromRole: roleMap[Number(transfer.fromRole)],
        toRole: roleMap[Number(transfer.toRole)],
      }));

      setTransferData(formattedTransfers);
      setLoading(false);
    }
  }, [batchDetails, selectedBatch]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          setDimensions({
            width: container.clientWidth || 1000,
            height: Math.min(window.innerHeight * 0.7, 700),
          });
        }
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Render the graph when transfer data or dimensions change
  useEffect(() => {
    if (!loading && transferData.length > 0 && svgRef.current) {
      renderGraph();
    }
  }, [transferData, dimensions, loading]);

  // Helper function to truncate addresses
  const truncateAddress = (address: string): string => {
    if (!address || address.length <= 8) return address;
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Toggle table visibility
  const toggleTable = () => {
    setShowTable(!showTable);
  };

  // Graph rendering function
  const renderGraph = () => {
    const { width, height } = dimensions;
    if (!svgRef.current) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f9f9f9")
      .style("border-radius", "8px");

    // Function to build hierarchical tree structure
    const buildHierarchy = (transfers: Transfer[]): HierarchyResult | null => {
      // Find the manufacturer (root)
      const firstTransfer = transfers.find(
        (t) => t.fromRole === "Manufacturer"
      );

      // If no manufacturer is found, try to find any transfer to use as root
      if (!firstTransfer && transfers.length > 0) {
        // Log this situation for debugging
        console.log(
          "No manufacturer found in transfers. Using first transfer as root."
        );

        // Use the first transfer's from address as root
        const root: HierarchyNode = {
          id: transfers[0].from,
          role: transfers[0].fromRole,
          children: [],
        };

        const edges: Edge[] = [];
        const processedNodes = new Set<string>([root.id]);

        // Add all transfers as edges
        transfers.forEach((transfer) => {
          // If we haven't processed the target yet, add it as a child
          if (!processedNodes.has(transfer.to)) {
            const childNode: HierarchyNode = {
              id: transfer.to,
              role: transfer.toRole,
              children: [],
            };

            root.children.push(childNode);
            processedNodes.add(transfer.to);
          }

          // Add the edge
          edges.push({
            source: transfer.from,
            target: transfer.to,
            quantity: transfer.quantity,
            batchId: transfer.batchId,
          });
        });

        return { root, edges };
      }

      // If no transfers at all, return a simplified structure
      if (!firstTransfer) {
        console.log("No transfers found in data");
        return null;
      }

      const root: HierarchyNode = {
        id: firstTransfer.from,
        role: "Manufacturer",
        children: [],
      };

      // Track processed nodes to avoid duplicates
      const processedNodes = new Set<string>([root.id]);

      // Track all edges for later use
      const edges: Edge[] = [];

      // First pass: Build tree structure
      const addChildren = (
        node: HierarchyNode,
        transfers: Transfer[]
      ): void => {
        // Find all transfers from this node
        const outgoingTransfers = transfers.filter((t) => t.from === node.id);

        outgoingTransfers.forEach((transfer) => {
          // Check if we've already processed this target
          if (!processedNodes.has(transfer.to)) {
            const childNode: HierarchyNode = {
              id: transfer.to,
              role: transfer.toRole,
              children: [],
            };

            node.children.push(childNode);
            processedNodes.add(transfer.to);

            // Recursively add children
            addChildren(childNode, transfers);
          }

          // Always add the edge
          edges.push({
            source: transfer.from,
            target: transfer.to,
            quantity: transfer.quantity,
            batchId: transfer.batchId,
          });
        });
      };

      addChildren(root, transfers);

      return { root, edges };
    };

    // Build the hierarchy
    const result = buildHierarchy(transferData);
    if (!result) {
      // If there's no hierarchy data, show a message in the SVG
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px")
        .text(`No manufacturer found in batch ${selectedBatch} transfers.`);

      // Add batch ID title
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "18px")
        .attr("font-weight", "bold")
        .text(`Batch ID: ${selectedBatch}`);

      return;
    }

    const { root, edges } = result;

    // Create a group for zoom/pan
    const g = svg.append("g").attr("class", "everything");

    // Set up zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform.toString());
      });

    svg.call(zoom);

    // Create tree layout
    const treeLayout = d3
      .tree<HierarchyNode>()
      .nodeSize([80, 150])
      .separation((a, b) => (a.parent === b.parent ? 1.5 : 2));

    // Convert to d3 hierarchy
    const hierarchy = d3.hierarchy(root);

    // Compute tree layout
    const treeData = treeLayout(hierarchy);

    // Define role-based colors
    const roleColors: Record<string, string> = {
      Manufacturer: "#FF6B6B",
      Distributor: "#4ECDC4",
      Retailer: "#45B7D1",
      Customer: "#98D8AA",
      Unknown: "#808080",
    };

    // Calculate bounds of the tree to center it
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    treeData.descendants().forEach((node) => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    });

    // Center the diagram based on its actual dimensions
    const centerX = (maxY + minY) / 2;
    const centerY = (maxX + minX) / 2;
    svg.call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2 - centerX, height / 2 - centerY)
        .scale(1)
    );

    const nodePositions: Record<string, NodePosition> = {};
    treeData.descendants().forEach((node) => {
      nodePositions[node.data.id] = { x: node.x, y: node.y };
    });

    // Group edges by source-target pair
    const edgeGroups: Record<string, Edge[]> = {};
    edges.forEach((edge) => {
      const key = `${edge.source}-${edge.target}`;
      if (!edgeGroups[key]) {
        edgeGroups[key] = [];
      }
      edgeGroups[key].push(edge);
    });

    // Draw links with quantity labels
    Object.values(edgeGroups).forEach((groupedEdges) => {
      const sourceId = groupedEdges[0].source;
      const targetId = groupedEdges[0].target;

      const sourcePos = nodePositions[sourceId];
      const targetPos = nodePositions[targetId];

      if (!sourcePos || !targetPos) return;

      // Calculate the total quantity
      const totalQuantity = groupedEdges.reduce(
        (sum, edge) => sum + edge.quantity,
        0
      );

      // Create a link with the total quantity
      g.append("path")
        .attr("class", "link")
        .attr("d", () => {
          const dx = targetPos.y - sourcePos.y;
          const dy = targetPos.x - sourcePos.x;
          const dr = Math.sqrt(dx * dx + dy * dy);
          return `M${sourcePos.y},${sourcePos.x}A${dr},${dr} 0 0,1 ${targetPos.y},${targetPos.x}`;
        })
        .attr("fill", "none")
        .attr("stroke", "#666")
        .attr("stroke-width", Math.sqrt(totalQuantity) / 2 + 1)
        .attr("stroke-opacity", 0.8);

      // Add quantity label
      const midpoint = {
        x: (sourcePos.x + targetPos.x) / 2,
        y: (sourcePos.y + targetPos.y) / 2,
      };

      g.append("rect")
        .attr("x", midpoint.y - 25)
        .attr("y", midpoint.x - 10)
        .attr("width", 50)
        .attr("height", 20)
        .attr("fill", "white")
        .attr("stroke", "#666")
        .attr("stroke-width", 1)
        .attr("rx", 5)
        .attr("ry", 5);

      g.append("text")
        .attr("x", midpoint.y)
        .attr("y", midpoint.x + 5)
        .attr("text-anchor", "middle")
        .attr("fill", "#333")
        .attr("font-size", "12px")
        .text(`Qty: ${totalQuantity}`);

      // If there are multiple transfers, add a note
      if (groupedEdges.length > 1) {
        g.append("text")
          .attr("x", midpoint.y)
          .attr("y", midpoint.x + 20)
          .attr("text-anchor", "middle")
          .attr("fill", "#666")
          .attr("font-size", "10px")
          .text(`(${groupedEdges.length} transfers)`);
      }
    });

    // Draw nodes
    const nodes = g
      .selectAll(".node")
      .data(treeData.descendants())
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", (d) => `translate(${d.y},${d.x})`);

    // Add node circles
    nodes
      .append("circle")
      .attr("r", 25)
      .attr("fill", (d) => roleColors[d.data.role] || roleColors.Unknown)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Add address labels
    nodes
      .append("text")
      .text((d) => truncateAddress(d.data.id))
      .attr("dy", 5)
      .attr("text-anchor", "middle")
      .attr("fill", "#fff")
      .attr("font-weight", "bold")
      .attr("font-size", "10px");

    // Add role labels
    nodes
      .append("text")
      .text((d) => d.data.role)
      .attr("dy", 40)
      .attr("text-anchor", "middle")
      .attr("fill", "#333")
      .attr("font-size", "12px");

    // Add batch ID title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .attr("font-weight", "bold")
      .text(`Batch ID: ${selectedBatch}`);

    // Add legend
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, 20)`);

    const roleEntries = Object.entries(roleColors);

    roleEntries.forEach(([role, color], i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 25})`);

      legendRow.append("circle").attr("r", 10).attr("fill", color);

      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 5)
        .text(role)
        .style("font-size", "14px");
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Supply Chain Flow Visualization
        </h1>
        <p className="text-gray-600">
          Blockchain-based visualization of product movement through the supply
          chain
        </p>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Batch Flow Tree</h2>

        {/* Batch Selector */}
        <div className="batch-selector mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Batch:
          </label>
          <div className="flex flex-wrap gap-2">
            {isLoadingBatches ? (
              <p>Loading batches...</p>
            ) : (
              batchIds.map((batchId) => (
                <button
                  key={batchId}
                  className={`px-4 py-2 rounded-full text-sm ${
                    selectedBatch === batchId
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => setSelectedBatch(batchId)}
                >
                  {/* Batch #{batchId} */}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Graph Container */}
        <div
          className="tree-container"
          style={{ width: "100%", height: "700px", position: "relative" }}
        >
          {loading || isLoadingDetails ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Loading batch data...</p>
            </div>
          ) : transferData.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">
                No transfer data available for this batch.
              </p>
            </div>
          ) : (
            <svg ref={svgRef} style={{ width: "100%", height: "100%" }}></svg>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>* Zoom and pan the visualization using mouse wheel and drag.</p>
          <p>* Colors represent different roles in the supply chain.</p>
          <p>* Line thickness indicates quantity transferred.</p>
        </div>
      </div>

      {/* Transfer Data Table */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transfer Data</h2>
          <button
            onClick={toggleTable}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center"
          >
            {showTable ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Hide Table
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                Show Table
              </>
            )}
          </button>
        </div>

        {showTable && (
          <div className="overflow-x-auto">
            {loading || isLoadingDetails ? (
              <p className="text-gray-500 py-4">Loading transfer data...</p>
            ) : transferData.length === 0 ? (
              <p className="text-gray-500 py-4">
                No transfer data available for this batch.
              </p>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      From
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      From Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      To
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      To Role
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Quantity
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transferData.map((transfer, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="tooltip" title={transfer.from}>
                          {truncateAddress(transfer.from)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            transfer.fromRole === "Manufacturer"
                              ? "bg-red-100 text-red-800"
                              : transfer.fromRole === "Distributor"
                              ? "bg-green-100 text-green-800"
                              : transfer.fromRole === "Retailer"
                              ? "bg-blue-100 text-blue-800"
                              : transfer.fromRole === "Customer"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {transfer.fromRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="tooltip" title={transfer.to}>
                          {truncateAddress(transfer.to)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            transfer.toRole === "Manufacturer"
                              ? "bg-red-100 text-red-800"
                              : transfer.toRole === "Distributor"
                              ? "bg-green-100 text-green-800"
                              : transfer.toRole === "Retailer"
                              ? "bg-blue-100 text-blue-800"
                              : transfer.toRole === "Customer"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {transfer.toRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-indigo-600 hover:text-indigo-900 focus:outline-none"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `From: ${transfer.from}\nTo: ${transfer.to}\nQuantity: ${transfer.quantity}`
                            );
                            alert("Transfer details copied to clipboard");
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {showTable && transferData.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            <p>* Click the copy icon to copy transfer details to clipboard.</p>
            <p>
              * Addresses are truncated for display purposes. Hover to see the
              full address.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main page component
interface SupplyChainPageProps {}

const SupplyChainPage: React.FC<SupplyChainPageProps> = () => {
  // const [contractAddress, setContractAddress] = useState<string>("");
  // const [isConnected, setIsConnected] = useState<boolean>(false);

  // const handleConnect = (address: string): void => {
  //   setContractAddress(address);
  //   setIsConnected(true);
  // };

  return (
    <div className="min-h-screen bg-gray-50">
      <SupplyChainVisualizer />
    </div>
  );
};

export default SupplyChainPage;
