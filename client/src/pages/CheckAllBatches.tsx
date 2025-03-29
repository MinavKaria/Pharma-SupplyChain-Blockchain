import { useReadContract } from "wagmi";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, Info, QrCode, Share } from "lucide-react";
import abi from "@/configs/abi";

interface ProductData {
  ProductName: string;
  Description: string;
  ManufacturingDate: string;
  ExpiryDate: string;
  ManufacturerName: string;
  SupplierName: string;
  UnitPrice: string;
  StorageConditions: string;
  Certification: string;
  CountryOfOrigin: string;
  DeliveryDate: string;
}

interface Batch {
  id: number;
  productData: string;
  quantity: number;
  creator: string;
  quantityTransferred: number;
  remaining: number;
  parsedProductData?: ProductData;
  storageCondition: string;
}


function CheckAllBatches(): JSX.Element {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const { data, isLoading, isError, error } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: abi,
    functionName: "getAllBatches",
  });

  const storageConditionMap: Record<number, string> ={
    0: "Ambient",
    1: "Refrigerated",
    2: "Frozen",
  }

  useEffect(() => {
    if (data) {
      const [ids, productDatas, quantities, creators, quantityTransferred, storageCondition] =

        data as [bigint[], string[], bigint[], string[], bigint[], number[]];

      const batchObjects = ids.map((id, index) => {
        let parsedProductData: ProductData | undefined;
        try {
          const jsonString = JSON.parse(productDatas[index]);
          parsedProductData = JSON.parse(jsonString);
        } catch (e) {
          console.error("Error parsing product data:", e);
        }

        console.log("Storage Condition:", storageCondition[index]);

        return {
          id: Number(id),
          productData: productDatas[index],
          quantity: Number(quantities[index]),
          creator: creators[index],
          quantityTransferred: Number(quantityTransferred[index]),
          remaining:
            Number(quantities[index]) - Number(quantityTransferred[index]),
          parsedProductData,
          storageCondition:storageConditionMap[storageCondition[index]]
        };
      });

      setBatches(batchObjects);
    }
  }, [data]);

  const truncateAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const generateQRContent = (batch: Batch): string => {
    const baseUrl = window.location.origin;
    const batchInfo = {
      id: batch.id,
      ...(batch.parsedProductData || {}),
      quantity: batch.quantity,
      remaining: batch.remaining,
      creator: batch.creator,
    };

    return `${baseUrl}/verify-batch?id=${encodeURIComponent(
      JSON.stringify(batchInfo.id)
    )}`;
  };

  const copyToClipboard = (content: string): void => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        alert("Batch verification link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Could not copy text: ", err);
      });
  };

  const generateQRCodeSVG = (content: string): string => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      content
    )}`;
  };

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>All Product Batches</CardTitle>
          <CardDescription>
            View all batches registered in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : isError ? (
            <div className="text-red-500">
              Error: {(error as Error)?.message || "Failed to load batches"}
            </div>
          ) : (
            <Table>
              <TableCaption>A list of all product batches</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">ID</TableHead>
                  <TableHead className="text-center">Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead className="text-center">Creator</TableHead>
                  <TableHead className="text-center">Transferred</TableHead>
                  <TableHead className="text-center">Remaining</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">QR Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.length > 0 ? (
                  batches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="text-center font-medium">
                        {batch.id}
                      </TableCell>
                      <TableCell className="flex justify-center">
                        {batch.parsedProductData ? (
                          <div className="flex items-center">
                            <span className="font-medium ">
                              {batch.parsedProductData.ProductName}
                            </span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="ml-2">
                                  <Info
                                    size={16}
                                    className="text-gray-400 hover:text-gray-600"
                                  />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent className="w-80 p-4">
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  {/* <div className="font-semibold">Batch Number:</div>
                                  <div>{batch.parsedProductData.BatchNumber}</div> */}

                                  <div className="font-semibold">
                                    Manufacturer:
                                  </div>
                                  <div>
                                    {batch.parsedProductData.ManufacturerName}
                                  </div>

                                  <div className="font-semibold">Supplier:</div>
                                  <div>
                                    {batch.parsedProductData.SupplierName}
                                  </div>

                                  <div className="font-semibold">Origin:</div>
                                  <div>
                                    {batch.parsedProductData.CountryOfOrigin}
                                  </div>

                                  <div className="font-semibold">
                                    Unit Price:
                                  </div>
                                  <div>{batch.parsedProductData.UnitPrice}</div>

                                  <div className="font-semibold">
                                    Manufacturing Date:
                                  </div>
                                  <div>
                                    {formatDate(
                                      batch.parsedProductData.ManufacturingDate
                                    )}
                                  </div>

                                  <div className="font-semibold">
                                    Expiry Date:
                                  </div>
                                  <div>
                                    {formatDate(
                                      batch.parsedProductData.ExpiryDate
                                    )}
                                  </div>

                                  <div className="font-semibold">
                                    Delivery Date:
                                  </div>
                                  <div>
                                    {formatDate(
                                      batch.parsedProductData.DeliveryDate
                                    )}
                                  </div>

                                  <div className="font-semibold">Storage:</div>
                                  <div>
                                    {batch.storageCondition}
                                  </div>

                                  <div className="font-semibold">
                                    Certification:
                                  </div>
                                  <div>
                                    {batch.parsedProductData.Certification}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            {batch.productData.length > 20
                              ? batch.productData.substring(0, 20) + "..."
                              : batch.productData}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {batch.quantity}
                      </TableCell>
                      <TableCell className="flex justify-center mt-2">
                        {truncateAddress(batch.creator)}
                        <a
                          href={`https://sepolia.etherscan.io/address/${batch.creator}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-1"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        {batch.quantityTransferred}
                      </TableCell>
                      <TableCell className="text-center">
                        {batch.remaining}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            batch.remaining === 0
                              ? "destructive"
                              : batch.remaining < batch.quantity / 4
                              ? "secondary"
                              : "default"
                          }
                        >
                          {batch.remaining === 0
                            ? "Depleted"
                            : batch.remaining < batch.quantity / 4
                            ? "Low Stock"
                            : "Available"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setSelectedBatch(batch)}
                            >
                              <QrCode size={16} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Batch QR Code</DialogTitle>
                              <DialogDescription>
                                Scan this QR code to verify batch information
                              </DialogDescription>
                            </DialogHeader>
                            {selectedBatch && (
                              <div className="flex flex-col items-center justify-center gap-4 py-4">
                                <div className="text-center mb-2">
                                  <h3 className="font-bold text-lg">
                                    {selectedBatch.parsedProductData
                                      ?.ProductName ||
                                      `Batch #${selectedBatch.id}`}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Batch #{selectedBatch.id}
                                  </p>
                                </div>

                                <div className="border p-4 rounded-lg bg-white">
                                  <img
                                    src={generateQRCodeSVG(
                                      generateQRContent(selectedBatch)
                                    )}
                                    alt="QR Code"
                                    className="w-48 h-48"
                                  />
                                </div>

                                <div className="flex gap-2 w-full justify-center">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(
                                        generateQRContent(selectedBatch)
                                      )
                                    }
                                    className="flex items-center gap-2"
                                  >
                                    <Share size={14} /> Copy Link
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const link = document.createElement("a");
                                      link.download = `batch-${selectedBatch.id}-qr.png`;
                                      link.href = generateQRCodeSVG(
                                        generateQRContent(selectedBatch)
                                      );
                                      link.click();
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    Download
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center">
                      No batches found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}

export default CheckAllBatches;
