import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink,
  Search,
  Check,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  chainOfCustody?: string[];
  transfers?: any[];
  expiryDate?: number;
  storageCondition?: number;
}

function VerifyBatch() {
  const [searchParams] = useSearchParams();
  const [batchId, setBatchId] = useState<string>("");
  const [batch, setBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState<boolean>(false);

  // Parse batch ID from URL parameters if present
  useEffect(() => {
    const id = searchParams.get("id");
    if (id) {
      try {
        // Handle possible JSON string or direct number
        const parsedId = isNaN(Number(id)) ? id : Number(id);
        setBatchId(parsedId.toString());
        verifyBatch(parsedId.toString());
      } catch (e) {
        setBatchId(id);
        verifyBatch(id);
      }
    }
  }, [searchParams]);

  const { data, refetch } = useReadContract({
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
    abi: abi,
    functionName: "getBatchDetails",
    args: [batchId && !isNaN(Number(batchId)) ? BigInt(batchId) : BigInt(0)],
  });

  console.log(data);

  const verifyBatch = async (id: string) => {
    if (!id) {
      setError("Please enter a batch ID");
      return;
    }

    setLoading(true);
    setError(null);
    setBatch(null);
    setVerified(false);

    try {
      const result = await refetch();

      if (result?.data) {
        const [
          productData,
          quantity,
          creator,
          chainOfCustody,
          transfers,
          expiryDate,
          storageCondition,
        ] = result.data as [
          string,
          bigint,
          string,
          string[],
          any[],
          bigint,
          number
        ];

        let parsedProductData: ProductData | undefined;
        try {
          const jsonString = JSON.parse(productData);
          parsedProductData = JSON.parse(jsonString);
        } catch (e) {
          console.error("Error parsing product data:", e);
        }

        const batchObj: Batch = {
          id: Number(id),
          productData,
          quantity: Number(quantity),
          creator,
          quantityTransferred: 0, // Will be calculated below
          remaining: 0, // Will be calculated below
          parsedProductData,
          chainOfCustody,
          transfers,
          expiryDate: Number(expiryDate),
          storageCondition,
        };

        // Calculate transferred quantity from transfers
        let totalTransferred = 0;
        if (transfers && transfers.length > 0) {
          for (const transfer of transfers) {
            if (transfer?.fromRole === 0) {
              totalTransferred += Number(transfer.quantity);
            }
          }
        }

        batchObj.quantityTransferred = totalTransferred;
        batchObj.remaining = batchObj.quantity - totalTransferred;

        setBatch(batchObj);
        setVerified(true);
      } else {
        setError("Batch not found or invalid ID");
      }
    } catch (err) {
      console.error("Error fetching batch:", err);
      setError("Failed to verify batch. Please check the ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const truncateAddress = (address: string): string => {
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const formatDate = (timestamp: number): string => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getStorageConditionText = (condition: number): string => {
    switch (condition) {
      case 0:
        return "Normal";
      case 1:
        return "Refrigerated";
      case 2:
        return "Frozen";
      default:
        return "Unknown";
    }
  };

  const isExpired = (timestamp: number): boolean => {
    if (!timestamp) return false;
    return Date.now() > timestamp * 1000;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Verify Product Batch</CardTitle>
          <CardDescription>
            Enter a batch ID or scan a QR code to verify product authenticity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="Enter Batch ID"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
            />
            <Button onClick={() => verifyBatch(batchId)} disabled={loading}>
              {loading ? (
                <Skeleton className="h-4 w-16" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Verify
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {verified && batch && (
            <div className="space-y-6">
              <Alert variant="default" className="bg-green-50 border-green-200">
                <Check className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-600">
                  Verification Successful
                </AlertTitle>
                <AlertDescription>
                  This batch has been verified on the blockchain
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold">
                      {batch.parsedProductData?.ProductName ||
                        `Batch #${batch.id}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {batch.parsedProductData?.Description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      batch.remaining === 0
                        ? "destructive"
                        : batch.remaining < batch.quantity / 4
                        ? "secondary"
                        : batch.expiryDate && isExpired(batch.expiryDate)
                        ? "outline"
                        : "default"
                    }
                  >
                    {batch.remaining === 0
                      ? "Depleted"
                      : batch.remaining < batch.quantity / 4
                      ? "Low Stock"
                      : batch.expiryDate && isExpired(batch.expiryDate)
                      ? "Expired"
                      : "Available"}
                  </Badge>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="font-semibold">Manufacturer:</div>
                  <div>
                    {batch.parsedProductData?.ManufacturerName || "N/A"}
                  </div>

                  <div className="font-semibold">Supplier:</div>
                  <div>{batch.parsedProductData?.SupplierName || "N/A"}</div>

                  <div className="font-semibold">Country of Origin:</div>
                  <div>{batch.parsedProductData?.CountryOfOrigin || "N/A"}</div>

                  <div className="font-semibold">Unit Price:</div>
                  <div>{batch.parsedProductData?.UnitPrice || "N/A"}</div>

                  <div className="font-semibold">Manufacturing Date:</div>
                  <div>
                    {batch.parsedProductData?.ManufacturingDate
                      ? new Date(
                          batch.parsedProductData.ManufacturingDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </div>

                  <div className="font-semibold">Expiry Date:</div>
                  <div
                    className={`${
                      batch.expiryDate && isExpired(batch.expiryDate)
                        ? "text-red-500 font-medium"
                        : ""
                    }`}
                  >
                    {batch.expiryDate
                      ? formatDate(batch.expiryDate)
                      : batch.parsedProductData?.ExpiryDate
                      ? new Date(
                          batch.parsedProductData.ExpiryDate
                        ).toLocaleDateString()
                      : "N/A"}
                  </div>

                  <div className="font-semibold">Storage Conditions:</div>
                  <div>
                    {batch.storageCondition !== undefined
                      ? getStorageConditionText(batch.storageCondition)
                      : batch.parsedProductData?.StorageConditions || "N/A"}
                  </div>

                  <div className="font-semibold">Certification:</div>
                  <div>{batch.parsedProductData?.Certification || "N/A"}</div>

                  <div className="font-semibold">Quantity:</div>
                  <div>{batch.quantity}</div>

                  <div className="font-semibold">Remaining:</div>
                  <div>{batch.remaining}</div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">Blockchain Information</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="font-semibold">Created By:</div>
                    <div className="flex items-center">
                      {truncateAddress(batch.creator)}
                      <a
                        href={`https://sepolia.etherscan.io/address/${batch.creator}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>

                    <div className="font-semibold">Chain of Custody:</div>
                    <div>{batch.chainOfCustody?.length || 0} transfers</div>
                  </div>
                </div>

                {batch.expiryDate && isExpired(batch.expiryDate) && (
                  <Alert variant="destructive" className="mt-4">
                    <Clock className="h-4 w-4" />
                    <AlertTitle>Expired Product</AlertTitle>
                    <AlertDescription>
                      This product has passed its expiration date of{" "}
                      {formatDate(batch.expiryDate)}.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-6">
          <p className="text-sm text-gray-500">
            Secured by blockchain technology
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

export default VerifyBatch;
