// import { useAccount, useReadContract } from "wagmi";
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Table,
//   TableBody,
//   TableCaption,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Skeleton } from "@/components/ui/skeleton";
// import { QrCode, RefreshCw, Share } from "lucide-react";
// import abi from "@/configs/abi";

// interface ProductData {
//   ProductName: string;
//   Description: string;
//   ManufacturingDate: string;
//   ExpiryDate: string;
//   ManufacturerName: string;
//   SupplierName: string;
//   UnitPrice: string;
//   StorageConditions: string;
//   Certification: string;
//   CountryOfOrigin: string;
//   DeliveryDate: string;
// }

// interface Batch {
//   id: number;
//   quantity: number;
//   productName?: string;
//   productData?: ProductData;
// }

// function UserBatches() {
//   const [batches, setBatches] = useState<Batch[]>([]);
//   const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
//   const address=useAccount()
//   const navigate = useNavigate();
  
//   const contractAddr = import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`;

//   const { 
//     data: userBatchesData, 
//     isLoading: isLoadingUserBatches, 
//     refetch: refetchUserBatches,
//     isError,
//     error
//   } = useReadContract({
//     address: contractAddr,
//     abi: abi,
//     functionName: "getBatchesByAddress",
//     args: [address.address],
//   });

//   const { data: allBatchesData, isLoading: isLoadingAllBatches } = useReadContract({
//     address: contractAddr,
//     abi: abi,
//     functionName: "getAllBatches",
//   });

//   useEffect(() => {
//     if (userBatchesData && allBatchesData) {
//       const [batchIds, quantities] = userBatchesData as [bigint[], bigint[]];
//       const [allIds, productDatas] = allBatchesData as [bigint[], string[], any, any, any, any];
      
//       const batchObjects = batchIds.map((id, index) => {
//         const batchId = Number(id);
//         let productName;
//         let productData: ProductData | undefined;
        
//         try {
//           const allBatchIndex = allIds.findIndex(bId => Number(bId) === batchId);
          
//           if (allBatchIndex !== -1 && productDatas[allBatchIndex]) {
//             const jsonString = JSON.parse(productDatas[allBatchIndex]);
//             productData = JSON.parse(jsonString);
//             productName = productData?.ProductName;
//           }
//         } catch (e) {
//           console.error("Error parsing product data for batch:", batchId, e);
//         }
        
//         return {
//           id: batchId,
//           quantity: Number(quantities[index]),
//           productName,
//           productData
//         };
//       });
      
//       setBatches(batchObjects);
//     }
//   }, [userBatchesData, allBatchesData]);

//   const handleBatchClick = (batchId: number) => {
//     navigate(`/verify-batch?id=${batchId}`);
//   };

//   const getQuantityStatus = (quantity: number) => {
//     if (quantity <= 0) return { label: "Depleted", variant: "destructive" };
//     if (quantity < 10) return { label: "Low Stock", variant: "secondary" };
//     return { label: "Available", variant: "default" };
//   };

//   const generateQRContent = (batch: Batch): string => {
//     const baseUrl = window.location.origin;
//     // const batchInfo = {
//     //   id: batch.id,
//     //   ...(batch.productData || {}),
//     //   quantity: batch.quantity
//     // };

//     return `${baseUrl}/verify-batch?id=${batch.id}`;
//   };

//   const copyToClipboard = (content: string): void => {
//     navigator.clipboard
//       .writeText(content)
//       .then(() => {
//         alert("Batch verification link copied to clipboard!");
//       })
//       .catch((err) => {
//         console.error("Could not copy text: ", err);
//       });
//   };

//   const generateQRCodeSVG = (content: string): string => {
//     return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
//       content
//     )}`;
//   };

//   return (
//     <Card className="w-full">
//       <CardHeader>
//         <div className="flex items-center justify-between">
//           <div>
//             <CardTitle>Your Product Batches</CardTitle>
//             <CardDescription>
//               Manage and track the batches associated with your account
//             </CardDescription>
//           </div>
//           <Button 
//             variant="outline" 
//             size="sm" 
//             onClick={() => refetchUserBatches()}
//             disabled={isLoadingUserBatches}
//           >
//             <RefreshCw size={16} className={isLoadingUserBatches ? "animate-spin mr-2" : "mr-2"} />
//             Refresh
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         {isLoadingUserBatches || isLoadingAllBatches ? (
//           <div className="space-y-2">
//             <Skeleton className="h-8 w-full" />
//             <Skeleton className="h-8 w-full" />
//             <Skeleton className="h-8 w-full" />
//           </div>
//         ) : isError ? (
//           <div className="text-red-500 p-4 rounded-md bg-red-50">
//             Error: {(error as Error)?.message || "Failed to load your batches"}
//           </div>
//         ) : (
//           <Table>
//             <TableCaption>A list of all product batches associated with your account</TableCaption>
//             <TableHeader>
//               <TableRow>
//                 <TableHead className="text-center">Batch ID</TableHead>
//                 <TableHead className="text-center">Product Name</TableHead>
//                 <TableHead className="text-center">Quantity</TableHead>
//                 <TableHead className="text-center">Status</TableHead>
//                 <TableHead className="text-center">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {batches.length > 0 ? (
//                 batches.map((batch) => {
//                   const status = getQuantityStatus(batch.quantity);
                  
//                   return (
//                     <TableRow key={batch.id} className="hover:bg-gray-50">
//                       <TableCell className="text-center font-medium">
//                         {batch.id}
//                       </TableCell>
//                       <TableCell className="text-center">
//                         {batch.productName || `Batch #${batch.id}`}
//                       </TableCell>
//                       <TableCell className="text-center">
//                         {batch.quantity}
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <Badge variant={status.variant as any}>
//                           {status.label}
//                         </Badge>
//                       </TableCell>
//                       <TableCell className="text-center">
//                         <div className="flex justify-center gap-2">
//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() => handleBatchClick(batch.id)}
//                           >
//                             Verify
//                           </Button>
                          
//                           <Dialog>
//                             <DialogTrigger asChild>
//                               <Button
//                                 variant="outline"
//                                 size="sm"
//                                 onClick={() => setSelectedBatch(batch)}
//                               >
//                                 <QrCode size={16} />
//                               </Button>
//                             </DialogTrigger>
//                             <DialogContent className="sm:max-w-md">
//                               <DialogHeader>
//                                 <DialogTitle>Batch QR Code</DialogTitle>
//                                 <DialogDescription>
//                                   Scan this QR code to verify batch information
//                                 </DialogDescription>
//                               </DialogHeader>
//                               {selectedBatch && (
//                                 <div className="flex flex-col items-center justify-center gap-4 py-4">
//                                   <div className="text-center mb-2">
//                                     <h3 className="font-bold text-lg">
//                                       {selectedBatch.productName || `Batch #${selectedBatch.id}`}
//                                     </h3>
//                                     <p className="text-sm text-gray-500">
//                                       Batch #{selectedBatch.id}
//                                     </p>
//                                   </div>

//                                   <div className="border p-4 rounded-lg bg-white">
//                                     <img
//                                       src={generateQRCodeSVG(
//                                         generateQRContent(selectedBatch)
//                                       )}
//                                       alt="QR Code"
//                                       className="w-48 h-48"
//                                     />
//                                   </div>

//                                   <div className="flex gap-2 w-full justify-center">
//                                     <Button
//                                       variant="outline"
//                                       size="sm"
//                                       onClick={() =>
//                                         copyToClipboard(
//                                           generateQRContent(selectedBatch)
//                                         )
//                                       }
//                                       className="flex items-center gap-2"
//                                     >
//                                       <Share size={14} /> Copy Link
//                                     </Button>
//                                     <Button
//                                       variant="outline"
//                                       size="sm"
//                                       onClick={() => {
//                                         const link = document.createElement("a");
//                                         link.download = `batch-${selectedBatch.id}-qr.png`;
//                                         link.href = generateQRCodeSVG(
//                                           generateQRContent(selectedBatch)
//                                         );
//                                         link.click();
//                                       }}
//                                       className="flex items-center gap-2"
//                                     >
//                                       Download
//                                     </Button>
//                                   </div>
//                                 </div>
//                               )}
//                             </DialogContent>
//                           </Dialog>
//                         </div>
//                       </TableCell>
//                     </TableRow>
//                   );
//                 })
//               ) : (
//                 <TableRow>
//                   <TableCell colSpan={5} className="text-center py-8">
//                     <div className="flex flex-col items-center justify-center space-y-3">
//                       <div className="text-gray-500">
//                         No batches found for this account
//                       </div>
//                       <Button 
//                         variant="outline" 
//                         size="sm" 
//                         onClick={() => refetchUserBatches()}
//                       >
//                         Refresh Data
//                       </Button>
//                     </div>
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// export default UserBatches;

// import React from 'react'

function Test2() {
  return (
    <div>Test2</div>
  )
}

export default Test2