import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText } from "lucide-react";
import { useAccount } from "wagmi";
import { pinata } from "@/configs/pinta";
import { gql, useMutation, useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";

const CREATE_USER = gql`
  mutation Mutation(
    $name: String!
    $walletAddress: String!
    $email: String!
    $companyName: String!
    $role: String!
    $ipfsHash: String!
  ) {
    user(
      name: $name
      walletAddress: $walletAddress
      email: $email
      companyName: $companyName
      role: $role
      ipfsHash: $ipfsHash
    ) {
      id
    }
  }
`;

const GET_IS_REGISTERED = gql`
  query Query($walletAddress: String!) {
    user(walletAddress: $walletAddress)
  }
`;

export default function RoleApplicationForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    walletAddress: "",
    email: "",
    companyName: "",
    role: "",
    ipfsHash: "",
  });

  const [isRegistered, setIsRegistered] = useState(true);
  const account = useAccount();
  const {
    loading: queryLoading,
    error: queryError,
    data: queryData,
    refetch,
  } = useQuery(GET_IS_REGISTERED, {
    variables: { walletAddress: account?.address || "" },
    skip: !account?.address,
  });

  useEffect(() => {
    if (account?.address) {
      refetch();
    }
  }, [account?.address, refetch]);

  useEffect(() => {
    if (account?.address) {
      setFormData((prev) => ({
        ...prev,
        walletAddress: account.address || "",
      }));
    }
  }, [account?.address]);

  useEffect(() => {
    console.log(account.address);
    console.log(queryData);
    if (queryError) {
      console.log(queryError);
    }

    if (!queryLoading && queryData!==undefined) {
      setIsRegistered(queryData.user);
      console.log(queryData.user);
    } 
    
  }, [queryLoading, queryData,account?.address]);

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [loading2, setLoading] = useState(false);
  const [ipfsHash, setIpfsHash] = useState("");
  const [uploaded, setUploaded] = useState(false);

  const { toast } = useToast();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      role: value,
    }));
  };

  const handleSubmission = async () => {
    try {
      setLoading(true);
      const upload = await pinata.upload.fileArray(uploadedFiles);
      console.log(upload);
      setIpfsHash(upload.IpfsHash);
      setFormData((prevState) => ({
        ...prevState,
        ipfsHash: upload.IpfsHash,
      }));
      setUploaded(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles(Array.from(event.target.files));
    }
  };

  const [addTodo, { loading, error }] = useMutation(CREATE_USER);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);

    if (
      formData.name === "" ||
      formData.walletAddress === "" ||
      formData.email === "" ||
      formData.companyName === "" ||
      formData.role === ""
    ) {
      toast({
        variant: "destructive",
        title: "All Fields Required",
        description:
          "Please fill in all the required fields before submitting the application.",
      });
      return;
    }

    if (formData.ipfsHash === "") {
      toast({
        title: "Upload Required Documents",
        description:
          "Please upload the required documents before submitting the application.",
      });
      return;
    }

    addTodo({
      variables: {
        name: formData.name,
        walletAddress: formData.walletAddress,
        email: formData.email,
        companyName: formData.companyName,
        role: formData.role,
        ipfsHash: formData.ipfsHash,
      },
    });
    setFormData({
      name: "",
      walletAddress: "",
      email: "",
      companyName: "",
      role: "",
      ipfsHash: "",
    });
    setUploadedFiles([]);
    await refetch();
    setIsRegistered(true);
    toast({
      title: "Application Submitted",
      description:
        "Your application has been submitted successfully and you will be sent a confirmation email soon.",
    });

    setTimeout(() => {
      navigate("/navigation");
    }, 3000);

    if (error) {
      console.log(error);
    }
  };

  if (account.address === undefined) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 py-12">
          <div className="container max-w-2xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">
              Apply for a Supply Chain Role
            </h1>
            <div className="space-y-6">
              <p className="text-center text-gray-500">
                Please connect your wallet to apply for a supply chain role.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 py-12">
          <div className="container max-w-2xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">
              Apply for a Supply Chain Role
            </h1>
            <div className="space-y-6">
              <p className="text-center text-gray-500">
                You have already applied for a supply chain role.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Apply for a Supply Chain Role
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Wallet Address</Label>
              <Input
                id="walletAddress"
                name="walletAddress"
                value={account && account.address}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <RadioGroup
                value={formData.role}
                onValueChange={handleRoleChange}
                required
              >

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manufacturer" id="manufacturer" />
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="distributor" id="distributor" />
                  <Label htmlFor="distributor">Distributor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retailer" id="retailer" />
                  <Label htmlFor="retailer">Retailer</Label>
                </div>
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="file-upload">Upload Required Documents</Label>
              <div className="mt-2">
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <div className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <Upload className="w-5 h-5 mr-2" />
                    <span>Upload files</span>
                  </div>
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {uploadedFiles.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-row gap-2">
                    <p className="text-sm text-gray-500">Uploaded files:</p>
                    {!loading2 && !uploaded && (
                      <button
                        className="text-sm text-blue-600"
                        onClick={handleSubmission}
                      >
                        Upload to IPFS
                      </button>
                    )}
                    {loading2 && (
                      <h1 className="text-sm text-gray-500">Loading...</h1>
                    )}
                    {uploaded && (
                      <a
                        className="text-sm text-green-500"
                        href={`https://ipfs.io/ipfs/${ipfsHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Uploaded to IPFS{" "}
                      </a>
                    )}
                  </div>
                  <ul className="list-disc list-inside">
                    {uploadedFiles.map((file, index) => (
                      <li
                        key={index}
                        className="text-sm text-gray-500 flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        {file.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
