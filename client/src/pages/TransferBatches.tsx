import { useState, useEffect } from "react";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Check, Info, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import abi from "@/configs/abi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import UserTransfers from "@/components/Transactions";

interface BatchInput {
  batchId: string;
  quantity: string;
}

interface UserBatch {
  id: bigint;
  productData: string;
  availableQuantity: bigint;
  productName: string;
}

interface TransferBatchesProps {
  contractAddress?: `0x${string}`;
}

const TransferBatches: React.FC<TransferBatchesProps> = ({ contractAddress }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [recipient, setRecipient] = useState<string>("");
  const [batchInputs, setBatchInputs] = useState<BatchInput[]>([{ batchId: "", quantity: "" }]);
  const [userBatches, setUserBatches] = useState<UserBatch[]>([]);
  const [isFetchingBatches, setIsFetchingBatches] = useState<boolean>(false);

  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const { toast } = useToast();
  
  const contractAddr = contractAddress || (import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`);

  // Get all batches data for product information
  const { data: allBatchesData, isLoading: isLoadingAllBatches, refetch: refetchAllBatches } = useReadContract({
    address: contractAddr,
    abi: abi,
    functionName: "getAllBatches",
  });

  // Get the user's batches using getBatchesByAddress
  const { data: userBatchesData, isLoading: isLoadingUserBatches, refetch: refetchUserBatches } = useReadContract({
    address: contractAddr,
    abi: abi,
    functionName: "getBatchesByAddress",
    args: [address]
  });

  // Process user batches when data is available
  useEffect(() => {
    const processUserBatches = async () => {
      if (!userBatchesData || !allBatchesData || !address) return;
      
      // Extract data from the contract responses
      const [batchIds, quantities] = userBatchesData as [readonly bigint[], readonly bigint[]];
      const [allIds, allProductDatas] = allBatchesData as [
        readonly bigint[],
        readonly string[],
        readonly bigint[],
        readonly string[],
        readonly bigint[]
      ];
      
      // Create user batches from the data
      const userOwnedBatches: UserBatch[] = [];
      
      for (let i = 0; i < batchIds.length; i++) {
        const batchId = batchIds[i];
        const quantity = quantities[i];
        
        // Find the product data from the all batches data
        const batchIndex = allIds.findIndex(id => id === batchId);
        const productData = batchIndex !== -1 ? allProductDatas[batchIndex] : "Unknown Product";

        const productName=JSON.parse(JSON.parse(productData));
        console.log(productName)
   
        
        userOwnedBatches.push({
          id: batchId,
          productData: productData,
          availableQuantity: quantity,
          productName: productName.ProductName
        });
      }
      console.log(userOwnedBatches)

      
      
      setUserBatches(userOwnedBatches);
      setIsFetchingBatches(false);
    };
    
    setIsFetchingBatches(true);
    processUserBatches();
  }, [userBatchesData, allBatchesData, address]);

  // Load batches when drawer opens
  useEffect(() => {
    if (open && address) {
      refetchAllBatches();
      refetchUserBatches();
    }
  }, [open, address, refetchAllBatches, refetchUserBatches]);

  // Function to add a batch from the user's batches list
  const addBatchFromList = (batchId: bigint, availableQuantity: bigint) => {
    // Find an empty slot or append to the end
    const emptyIndex = batchInputs.findIndex(input => input.batchId === "");
    console.log(availableQuantity)
    if (emptyIndex !== -1) {
      const newBatchInputs = [...batchInputs];
      newBatchInputs[emptyIndex] = {
        batchId: batchId.toString(),
        quantity: "1" // Default to 1, user can adjust
      };
      setBatchInputs(newBatchInputs);
    } else {
      addBatchInput();
      // We need to use a setTimeout because the state update might not be immediate
      setTimeout(() => {
        setBatchInputs(prev => {
          const newInputs = [...prev];
          newInputs[newInputs.length - 1] = {
            batchId: batchId.toString(),
            quantity: "1"
          };
          return newInputs;
        });
      }, 0);
    }
  };

  // Function to add a new batch input field
  const addBatchInput = (): void => {
    setBatchInputs([...batchInputs, { batchId: "", quantity: "" }]);
  };

  // Function to remove a batch input field
  const removeBatchInput = (index: number): void => {
    const newBatchInputs = [...batchInputs];
    newBatchInputs.splice(index, 1);
    setBatchInputs(newBatchInputs);
  };

  // Function to update batch input fields
  const updateBatchInput = (index: number, field: keyof BatchInput, value: string): void => {
    const newBatchInputs = [...batchInputs];
    newBatchInputs[index][field] = value;
    setBatchInputs(newBatchInputs);
  };

  // Function to handle form submission
  const handleSubmit = async (): Promise<void> => {
    try {
      setIsSubmitting(true);
      
      // Validate inputs
      if (!recipient || recipient.trim() === "") {
        toast({
          title: "Error",
          description: "Please enter a recipient address",
          variant: "destructive",
        });
        return;
      }

      // Filter out empty batch inputs
      const filteredBatchInputs = batchInputs.filter(
        (input) => input.batchId && input.quantity
      );

      if (filteredBatchInputs.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one batch to transfer",
          variant: "destructive",
        });
        return;
      }

      // Additional validation: check if quantities are within available amounts
      for (const input of filteredBatchInputs) {
        const batchId = BigInt(input.batchId);
        const requestedQuantity = BigInt(input.quantity);
        
        const userBatch = userBatches.find(batch => batch.id === batchId);
        
        if (!userBatch) {
          toast({
            title: "Error",
            description: `Batch ID ${input.batchId} not found in your batches`,
            variant: "destructive",
          });
          return;
        }
        
        if (requestedQuantity > userBatch.availableQuantity) {
          toast({
            title: "Error",
            description: `You only have ${userBatch.availableQuantity.toString()} units available for Batch ID ${input.batchId}`,
            variant: "destructive",
          });
          return;
        }
      }

      // Prepare arrays for contract call
      const batchIds = filteredBatchInputs.map((input) => BigInt(input.batchId));
      const quantities = filteredBatchInputs.map((input) => BigInt(input.quantity));

      // Call the contract
      const tx = await writeContractAsync({
        address: contractAddr,
        abi: abi,
        functionName: "transferBatch",
        args: [batchIds, recipient as `0x${string}`, quantities],
      });

      toast({
        title: "Success",
        description: "Batches transferred successfully!",
      });

      console.log("Transaction submitted:", tx);

      setRecipient("");
      setBatchInputs([{ batchId: "", quantity: "" }]);
      
      refetchAllBatches();
      refetchUserBatches();
      
      setOpen(false);
    } catch (error) {
      console.error("Error transferring batches:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to transfer batches",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if a batch ID is already in the form
  const isBatchInForm = (batchId: bigint): boolean => {
    return batchInputs.some(input => input.batchId === batchId.toString() && input.batchId !== "");
  };

  // Determine if we're loading data
  const isLoading = isLoadingAllBatches || isLoadingUserBatches || isFetchingBatches;

  return (
    <>
    <div className="w-full max-w-2xl mx-auto">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
            <Button className="w-full md:w-4/5 lg:w-2/3 mx-auto bg-gradient-to-r from-black to-slate-700 hover:from-slate-600 hover:to-slate-700 text-white font-semibold py-4 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 text-lg my-6">
            <Plus className="h-6 w-6" />
            Transfer Batches
            </Button>
        </DrawerTrigger>
        <DrawerContent className="overflow-y-auto">
          <div className="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>Transfer Product Batches</DrawerTitle>
              <DrawerDescription>
                Transfer product batches to distributors, retailers, or customers
              </DrawerDescription>
            </DrawerHeader>
            
            <div className="p-4">
             
              <Card className="mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-md">Your Available Batches</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center py-6">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-muted-foreground">Loading your batches...</span>
                    </div>
                  ) : userBatches.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <p>You don't have any batches available to transfer.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Batch ID</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead className="w-20"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userBatches.map((batch) => (
                          <TableRow key={batch.id.toString()}>
                            <TableCell className="font-medium">{batch.id.toString()}</TableCell>
                            <TableCell>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center">
                                      {batch.productName}
                                      {/* {batch.productName.length > 20 
                                        ? `${batch.productName.slice(0, 20)}...` 
                                        : batch.productName} */}
                                      <Info className="h-4 w-4 ml-1 text-muted-foreground" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                  <TooltipContent>
                                    <div className="max-w-xs">
                                      {Object.entries(JSON.parse(JSON.parse(batch.productData))).map(([key, value]) => (
                                        <p key={key}>
                                          <strong>{key}:</strong> {String(value)}
                                        </p>
                                      ))}
                                    </div>
                                  </TooltipContent>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>{batch.availableQuantity.toString()}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => addBatchFromList(batch.id, batch.availableQuantity)}
                                disabled={isBatchInForm(batch.id) || isSubmitting}
                              >
                                {isBatchInForm(batch.id) ? "Added" : "Add"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
              
              {/* Transfer Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    placeholder="0x..."
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Batches to Transfer</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={addBatchInput}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Add Batch
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {batchInputs.map((input, index) => (
                      <Card key={index}>
                        <CardContent className="p-3">
                          <div className="flex justify-between items-start mb-2">
                            <Badge>Batch #{index + 1}</Badge>
                            {index > 0 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBatchInput(index)}
                                disabled={isSubmitting}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`batchId-${index}`} className="text-xs">
                                Batch ID
                              </Label>
                              <Input
                                id={`batchId-${index}`}
                                placeholder="Batch ID"
                                value={input.batchId}
                                onChange={(e) =>
                                  updateBatchInput(index, "batchId", e.target.value)
                                }
                                disabled={isSubmitting}
                                type="number"
                                min="0"
                              />
                              {input.batchId && (
                                <div className="mt-1">
                                  {userBatches.some(batch => batch.id.toString() === input.batchId) ? (
                                    <span className="text-xs text-green-600">
                                      Available: {
                                        userBatches.find(batch => batch.id.toString() === input.batchId)?.availableQuantity.toString()
                                      }
                                    </span>
                                  ) : (
                                    <span className="text-xs text-red-500">
                                      Not in your inventory
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div>
                              <Label htmlFor={`quantity-${index}`} className="text-xs">
                                Quantity
                              </Label>
                              <Input
                                id={`quantity-${index}`}
                                placeholder="Quantity"
                                value={input.quantity}
                                onChange={(e) =>
                                  updateBatchInput(index, "quantity", e.target.value)
                                }
                                disabled={isSubmitting}
                                type="number"
                                min="1"
                                max={
                                  input.batchId && userBatches.some(batch => batch.id.toString() === input.batchId)
                                    ? userBatches.find(batch => batch.id.toString() === input.batchId)?.availableQuantity.toString()
                                    : undefined
                                }
                              />
                              {input.batchId && input.quantity && (
                                <div className="mt-1">
                                  {userBatches.some(batch => batch.id.toString() === input.batchId) && 
                                   BigInt(input.quantity || "0") > (userBatches.find(batch => batch.id.toString() === input.batchId)?.availableQuantity || BigInt(0)) && (
                                    <span className="text-xs text-red-500">
                                      Exceeds available quantity
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" /> Transfer Batches
                  </>
                )}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" disabled={isSubmitting}>
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
    <UserTransfers/>
    </>
  );
};

export default TransferBatches;