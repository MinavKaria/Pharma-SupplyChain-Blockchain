import React, { useState } from 'react';
import { useAccount, useContractRead, useContractWrite } from 'wagmi';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import abi from '@/configs/abi';

// Import contract ABI and address
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS // Replace with your deployed contract address

const contractABI =abi

const BatchTransferGraph = ({ batchId }) => {
  const { data, isLoading, isError } = useContractRead({
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
          <CardTitle>Supply Chain Flow</CardTitle>
          <CardDescription>Chain of custody and transfers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
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
            </div>

            <div>
              <h4 className="font-medium mb-2">Transfer History</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left bg-slate-100">
                      <th className="p-2 border">From</th>
                      <th className="p-2 border">To</th>
                      <th className="p-2 border">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfers.map((transfer, index) => (
                      <tr key={index}>
                        <td className="p-2 border">
                          <p className="text-xs font-mono truncate max-w-xs">{transfer.from}</p>
                        </td>
                        <td className="p-2 border">
                          <p className="text-xs font-mono truncate max-w-xs">{transfer.to}</p>
                        </td>
                        <td className="p-2 border">{transfer.quantity.toString()}</td>
                      </tr>
                    ))}
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

const BatchList = () => {
  const { data, isLoading, isError } = useContractRead({
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
  
  const { data, isLoading, isError } = useContractRead({
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

export default CheckTransactions;