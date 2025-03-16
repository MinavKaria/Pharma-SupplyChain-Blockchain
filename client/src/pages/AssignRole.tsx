import { useState, useEffect } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWriteContract } from "wagmi";
import abi from "@/configs/abi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const SET_ASSIGN_ROLE = gql`
  mutation Mutation($walletAddress: String!) {
    assignUser(walletAddress: $walletAddress) {
      id
    }
  }
`;

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      walletAddress
      email
      companyName
      role
      assigned
      ipfsHash
    }
  }
`;

const GET_ASSIGNED_USERS = gql`
  query GetAssignedUsers {
    userAssigned {
      id
      name
      walletAddress
      email
      companyName
      role
      assigned
      ipfsHash
    }
  }
`;

function AssignRole() {
  const { data: allUsers, loading: loadingUsers } = useQuery(GET_USERS);
  const { data: assignedUsers, loading: loadingAssigned } =
    useQuery(GET_ASSIGNED_USERS);
  const [searchTerm, setSearchTerm] = useState("");

  const filterUsers = (users: any) => {
    return users?.filter(
      (user: any) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            User Role Management
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Manage and assign roles to users in your organization
          </p>
        </CardHeader>
      </div>

      <Tabs defaultValue="all-users" className="w-full">
        <TabsList className="flex justify-center mb-6 bg-background">
          <TabsTrigger value="all-users" className="px-8 py-3 text-lg">
            All Users
          </TabsTrigger>
          <TabsTrigger value="assigned-users" className="px-8 py-3 text-lg">
            Assigned Users
          </TabsTrigger>
        </TabsList>

        <div className="mb-6 relative">
          <Input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>

        <TabsContent value="all-users">
          <Card className="shadow-lg rounded-lg overflow-hidden">
            <CardContent className="p-0">
              {loadingUsers ? (
                <SkeletonTable />
              ) : (
                <UserTable users={filterUsers(allUsers?.users)} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned-users">
          <Card className="shadow-lg rounded-lg overflow-hidden">
            <CardContent className="p-0">
              {loadingAssigned ? (
                <SkeletonTable />
              ) : (
                <UserTable
                  users={filterUsers(assignedUsers?.userAssigned)}
                  assignedOnly
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface User {
  id: string;
  name: string;
  walletAddress: string;
  email: string;
  companyName: string;
  role: string;
  assigned: boolean;
}

const UserTable = ({
  users,
  assignedOnly = false,
}: {
  users: User[];
  assignedOnly?: boolean;
}) => {
  const [assigningUser, setAssigningUser] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    writeContract,
    isError: isContractError,
    isPending: isContractPending,
    isSuccess: isContractSuccess,
    failureReason,
    reset: resetContract,
  } = useWriteContract();

  const [assignRole, { loading: assignLoading, error: assignError }] = 
    useMutation(SET_ASSIGN_ROLE, {
      refetchQueries: ["GetUsers", "GetAssignedUsers"],
    });

  // Handle the role assignment process
  const handleAssignRole = async (user: User) => {
    setAssigningUser(user.walletAddress);
    
    let role = 0;
    if (user.role === "manufacturer") {
      role = 1;
    } else if (user.role === "distributor") {
      role = 2;
    } else if (user.role === "retailer") {
      role = 3;
    }

    writeContract({
      abi,
      address: "0xB0d33bda0A19392F925fabF1A63c3D2eC3129D81",
      functionName: "assignRole",
      args: [user.walletAddress, role],
    });
  };

  // When contract write is successful, update the database
  // This effect runs when isContractSuccess changes
  useEffect(() => {
    if (isContractSuccess && assigningUser) {
      // Only now call the GraphQL mutation after successful blockchain transaction
      assignRole({
        variables: {
          walletAddress: assigningUser
        }
      });
      
      // Reset state
      setAssigningUser("");
      
      // Close dialog after successful assignment
      setIsDialogOpen(false);
      
      // Reset contract state
      resetContract();
    }
  }, [isContractSuccess, assigningUser, assignRole, resetContract]);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead className="font-bold">Name</TableHead>
            <TableHead className="font-bold">Email</TableHead>
            <TableHead className="font-bold">Wallet</TableHead>
            <TableHead className="font-bold">Company</TableHead>
            <TableHead className="font-bold">Role</TableHead>
            {!assignedOnly && (
              <TableHead className="font-bold">Status</TableHead>
            )}
            <TableHead className="font-bold">Documents</TableHead>
            {!assignedOnly && (
              <TableHead className="font-bold">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user: any) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="truncate max-w-[150px]">
                {user.walletAddress}
              </TableCell>
              <TableCell>{user.companyName}</TableCell>
              <TableCell>{user.role}</TableCell>
              {!assignedOnly && (
                <TableCell>
                  {user.assigned ? (
                    <Badge
                      variant="secondary"
                      className="flex items-center space-x-2 bg-green-100 text-green-800"
                    >
                      <CheckCircle className="w-4 h-4" /> <span>Assigned</span>
                    </Badge>
                  ) : (
                    <Badge
                      variant="destructive"
                      className="flex items-center space-x-2 bg-red-100 text-red-800"
                    >
                      <XCircle className="w-4 h-4" /> <span>Unassigned</span>
                    </Badge>
                  )}
                </TableCell>
              )}
              <TableCell>
                <a
                  href={`https://ipfs.io/ipfs/${user.ipfsHash}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Click to Open
                </a>
              </TableCell>
              {!assignedOnly && (
                <TableCell>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger>
                      <div
                        className={`${
                          !user.assigned ? "bg-black" : " bg-slate-300"
                        } text-white p-2 rounded-md`}
                      >
                        Assign Role
                      </div>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Role</DialogTitle>
                        <DialogDescription>
                          <div className="space-y-2 font-semibold py-2">
                            <div>Name: {user.name}</div>
                            <div>Email: {user.email}</div>
                            <div>Company: {user.companyName}</div>
                            <div>Role: {user.role}</div>
                            <div>Wallet Address: {user.walletAddress}</div>
                          </div>
                        </DialogDescription>
                        <Button
                          disabled={user.assigned || isContractPending || assignLoading}
                          onClick={() => handleAssignRole(user)}
                        >
                          {user.assigned
                            ? "Role Assigned"
                            : isContractPending
                            ? "Processing Blockchain..."
                            : assignLoading
                            ? "Updating Database..."
                            : isContractError
                            ? "Blockchain Error"
                            : assignError
                            ? "Database Error"
                            : "Assign Role"}
                        </Button>
                        {isContractError && (
                          <p className="text-red-500 text-sm mt-2">
                            Error: {failureReason?.message || "Transaction failed"}
                          </p>
                        )}
                        {assignError && (
                          <p className="text-red-500 text-sm mt-2">
                            Error updating database
                          </p>
                        )}
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const SkeletonTable = () => (
  <div className="space-y-4 p-4">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
);

export default AssignRole;