"use client"

import { useState } from "react"
import { useQuery, gql } from "@apollo/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { CheckCircle, XCircle, Search } from "lucide-react"

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
    }
  }
`

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
    }
  }
`

function AssignRole() {
  const { data: allUsers, loading: loadingUsers } = useQuery(GET_USERS)
  const { data: assignedUsers, loading: loadingAssigned } = useQuery(GET_ASSIGNED_USERS)
  const [searchTerm, setSearchTerm] = useState("")

  const filterUsers = (users:any) => {
    return users?.filter(
      (user:any) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.companyName.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">User Role Management</CardTitle>
          <p className="text-muted-foreground mt-2">Manage and assign roles to users in your organization</p>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>

        <TabsContent value="all-users">
          <Card className="shadow-lg rounded-lg overflow-hidden">
            <CardContent className="p-0">
              {loadingUsers ? <SkeletonTable /> : <UserTable users={filterUsers(allUsers?.users)} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned-users">
          <Card className="shadow-lg rounded-lg overflow-hidden">
            <CardContent className="p-0">
              {loadingAssigned ? (
                <SkeletonTable />
              ) : (
                <UserTable users={filterUsers(assignedUsers?.userAssigned)} assignedOnly />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
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

const UserTable = ({ users, assignedOnly = false }: { users: User[]; assignedOnly?: boolean }) => {
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
            {!assignedOnly && <TableHead className="font-bold">Status</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user:any) => (
            <TableRow key={user.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="truncate max-w-[150px]">{user.walletAddress}</TableCell>
              <TableCell>{user.companyName}</TableCell>
              <TableCell>{user.role}</TableCell>
              {!assignedOnly && (
                <TableCell>
                  {user.assigned ? (
                    <Badge variant="secondary" className="flex items-center space-x-2 bg-green-100 text-green-800">
                      <CheckCircle className="w-4 h-4" /> <span>Assigned</span>
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="flex items-center space-x-2 bg-red-100 text-red-800">
                      <XCircle className="w-4 h-4" /> <span>Unassigned</span>
                    </Badge>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

const SkeletonTable = () => (
  <div className="space-y-4 p-4">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-16 w-full" />
    ))}
  </div>
)

export default AssignRole

