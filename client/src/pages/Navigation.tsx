import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useReadContracts } from "wagmi";
import { useNavigate } from "react-router-dom";
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
        <main className="flex-1 py-12">
          <div className="container max-w-2xl mx-auto px-4">
            <div className="space-y-6">
              <p className="text-center text-gray-500">
                Please connect your wallet for transactions
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-row justify-center gap-5 m-10">
        <div className="flex flex-col justify-center gap-5">
          {owner && account.address === owner.result && (
            <Button
              onClick={() => {
                navigate("/assign");
              }}
            >
              Assign Role
            </Button>
          )}
          {userRoles && userRoles.result === 1 && (
            <Button
              onClick={() => {
                navigate("/create-batch");
              }}
            >
              Create Batch
            </Button>
          )}
          <Button onClick={() => [navigate("/apply")]}>Apply for Role</Button>
          {account.address === owner.result && (
            <Button
              onClick={() => {
                navigate("/check-all-batches");
              }}
            >
              Check All Batches
            </Button>
          )}
          <Button
            onClick={() => {
              navigate("/transfer");
            }}
          >
            Transfer Batch
          </Button>
          <Button
            onClick={() => {
              navigate("/check-transaction");
            }}
          >
            Check Transactions
          </Button>
          <Button
            onClick={() => {
              navigate("/check-batches");
            }}
          >
            Check Batch Details (QR){" "}
          </Button>
        </div>
      </div>
    </>
  );
}

export default Navigation;
