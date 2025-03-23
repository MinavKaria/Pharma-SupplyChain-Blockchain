import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useReadContracts } from "wagmi";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import {
  UserPlus,
  Package,
  ClipboardList,
  Boxes,
  ArrowRightLeft,
  FileSearch,
  QrCode,
  Wallet
} from "lucide-react";
import abi from "@/configs/abi";

function Navigation() {
  const account = useAccount();
  const navigate = useNavigate();

  const myContract = {
    abi,
    address: import.meta.env.VITE_CONTRACT_ADDRESS as `0x${string}`,
  };

  const result = useReadContracts({
    contracts: [
      {
        ...myContract,
        functionName: "owner",
      },
      {
        ...myContract,
        functionName: "userRoles",
        args: [account.address],
      },
    ],
  });
  console.log(result);

  const owner: any = result.data?.[0] || {};
  const userRoles: any = result.data?.[1] || {};

  if (account.address === undefined) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 flex items-center justify-center py-12">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Wallet className="mx-auto h-12 w-12 text-primary" />
                <h2 className="text-2xl font-bold">Wallet Connection Required</h2>
                <p className="text-gray-500">
                  Please connect your wallet to access the application features
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-3xl mx-auto">
        <CardContent className="pt-6">
          <h1 className="text-2xl font-bold mb-6 text-center">Supply Chain Management</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {owner && account.address === owner.result && (
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-start gap-3 h-16"
                onClick={() => {
                  navigate("/assign");
                }}
              >
                <UserPlus className="h-5 w-5" />
                <span>Assign Role</span>
              </Button>
            )}
            
            {userRoles && userRoles.result === 1 && (
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-start gap-3 h-16"
                onClick={() => {
                  navigate("/create-batch");
                }}
              >
                <Package className="h-5 w-5" />
                <span>Create Batch</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              className="flex items-center justify-start gap-3 h-16"
              onClick={() => navigate("/apply")}
            >
              <ClipboardList className="h-5 w-5" />
              <span>Apply for Role</span>
            </Button>
            
            {account.address === owner.result && (
              <Button
                variant="outline"
                size="lg"
                className="flex items-center justify-start gap-3 h-16"
                onClick={() => {
                  navigate("/check-all-batches");
                }}
              >
                <Boxes className="h-5 w-5" />
                <span>Check All Batches</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="lg"
              className="flex items-center justify-start gap-3 h-16"
              onClick={() => {
                navigate("/transfer");
              }}
            >
              <ArrowRightLeft className="h-5 w-5" />
              <span>Transfer Batch</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="flex items-center justify-start gap-3 h-16"
              onClick={() => {
                navigate("/check-transaction");
              }}
            >
              <FileSearch className="h-5 w-5" />
              <span>Check Transactions</span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="flex items-center justify-start gap-3 h-16"
              onClick={() => {
                navigate("/verify-batch");
              }}
            >
              <QrCode className="h-5 w-5" />
              <span>Check Batch Details (QR)</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Navigation;