import { Button } from "@/components/ui/button"
import { useAccount } from "wagmi"
import { useReadContracts } from 'wagmi'
import abi from "@/configs/abi"

function Navigation() {
  const account = useAccount()

  const myContract={
    abi,
    address: '0xafaC7C3A1641bba718B8A092B8E527D855D46708' as `0x${string}`
  }


  const result = useReadContracts({
    contracts: [
      {
        ...myContract,
        functionName: 'owner',
      },
      {
        ...myContract,
        functionName:'userRoles',
        args:[account.address]
      }
    ],
  })
  console.log(result)

  const owner: any = result.data?.[0] ?? {};
  const userRoles: any = result.data?.[1] ?? {};

  



  if(account.address===undefined){
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
    )
  }





  return (
  <>
    <div className="flex flex-row justify-center gap-5 m-10">
      <div className="flex flex-col justify-center gap-5">
      {account.address===owner.result && <Button>Assign Role</Button>}
      {userRoles===1 &&<Button>Create Batch</Button>}
      <Button>Apply for Role</Button>
      {account.address===owner.result && <Button>Check All Batches</Button>}
      <Button>Transfer Batch</Button>
      <Button>Check Transactions</Button>
      <Button>Check Batch Details (QR) </Button>
      </div>
    </div>
    </>
  
  )
}

export default Navigation
