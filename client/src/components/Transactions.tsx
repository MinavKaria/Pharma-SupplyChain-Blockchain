import { useAccount, useReadContract } from "wagmi";
import abi from "@/configs/abi";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const UserTransfers = () => {
    const { address } = useAccount();

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

    const { data, isLoading, isError } = useReadContract({
      address: contractAddress,
      abi: abi,
      functionName: 'getTransfersByAddress',
      args: [address]
    });
  
    if (!address) return <Alert><AlertTitle>Connect Wallet</AlertTitle><AlertDescription>Please connect your wallet to view your transfers</AlertDescription></Alert>;
    if (isLoading) return <div className="text-center py-8">Loading your transfers...</div>;
    if (isError) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Failed to fetch your transfers</AlertDescription></Alert>;
    if (!data) return null;
  
    // Type assertion to make TypeScript happy with the array destructuring
    const transferData = data as [bigint[], string[], string[], bigint[]];
    const [batchIds, fromAddresses, toAddresses, quantities] = transferData;
    
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

    // Function to handle batch view
    const handleViewBatch = (batchId: string) => {
      const input = document.getElementById('batch-id-input') as HTMLInputElement | null;
      if (input) {
        input.value = batchId;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    };

    // Function to truncate address for display
    const truncateAddress = (addr: string) => {
      if (!addr) return '';
      return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };
  
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Account</CardTitle>
            <CardDescription className="break-all">
              <span className="hidden md:inline">Connected address: {address}</span>
              <span className="inline md:hidden">Connected: {truncateAddress(address || '')}</span>
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Tabs defaultValue="incoming">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming">Incoming</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
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
                  <div className="overflow-x-auto">
                    {/* Desktop view */}
                    <table className="w-full border-collapse hidden md:table">
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
                                onClick={() => handleViewBatch(transfer.batchId)}
                              >
                                View Batch
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile view */}
                    <div className="md:hidden space-y-4">
                      {incomingTransfers.map((transfer, i) => (
                        <Card key={i} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div>
                                <p className="text-xs text-slate-500">Batch ID</p>
                                <p className="font-medium">{transfer.batchId}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Quantity</p>
                                <p className="font-medium">{transfer.quantity}</p>
                              </div>
                            </div>
                            <div className="mb-3">
                              <p className="text-xs text-slate-500">From</p>
                              <p className="text-xs font-mono truncate">{truncateAddress(transfer.from)}</p>
                              <p className="text-xs font-mono truncate text-slate-500 mt-1">{transfer.from}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => handleViewBatch(transfer.batchId)}
                            >
                              View Batch
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
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
                  <div className="overflow-x-auto">
                    {/* Desktop view */}
                    <table className="w-full border-collapse hidden md:table">
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
                                onClick={() => handleViewBatch(transfer.batchId)}
                              >
                                View Batch
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile view */}
                    <div className="md:hidden space-y-4">
                      {outgoingTransfers.map((transfer, i) => (
                        <Card key={i} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div>
                                <p className="text-xs text-slate-500">Batch ID</p>
                                <p className="font-medium">{transfer.batchId}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500">Quantity</p>
                                <p className="font-medium">{transfer.quantity}</p>
                              </div>
                            </div>
                            <div className="mb-3">
                              <p className="text-xs text-slate-500">To</p>
                              <p className="text-xs font-mono truncate">{truncateAddress(transfer.to)}</p>
                              <p className="text-xs font-mono truncate text-slate-500 mt-1">{transfer.to}</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full mt-2"
                              onClick={() => handleViewBatch(transfer.batchId)}
                            >
                              View Batch
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  export default UserTransfers;