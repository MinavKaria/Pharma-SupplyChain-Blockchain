
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Upload, FileText } from "lucide-react"
import { useAccount } from 'wagmi'


export default function RoleApplicationForm() {
 
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    role: "",
    experience: "",
  })

  const account = useAccount()

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleRoleChange = (value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      role: value,
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles(Array.from(event.target.files))
    }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    toast({
      title: "Application Submitted",
      description: "We've received your application and will be in touch soon.",
    })
    setFormData({
      fullName: "",
      email: "",
      companyName: "",
      role: "",
      experience: "",
    })
  }

  if(account.address===undefined){
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 py-12">
          <div className="container max-w-2xl mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Apply for a Supply Chain Role</h1>
            <div className="space-y-6">
              <p className="text-center text-gray-500">
                Please connect your wallet to apply for a supply chain role.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
  
      <main className="flex-1 py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">Apply for a Supply Chain Role</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
         
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Wallet Address</Label>
              <Input id="walletAddress" name="walletAddress" value={(account && account.address)} disabled />
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
              <RadioGroup value={formData.role} onValueChange={handleRoleChange} required>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="supplier" id="supplier" />
                  <Label htmlFor="supplier">Supplier</Label>
                </div>
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
            <div className="space-y-2">
              <Label htmlFor="experience">Relevant Experience</Label>
              <Textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                required
              />
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
                  <Input id="file-upload" type="file" multiple onChange={handleFileUpload} className="hidden" />
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Uploaded files:</p>
                    <ul className="list-disc list-inside">
                      {uploadedFiles.map((file, index) => (
                        <li key={index} className="text-sm text-gray-500 flex items-center">
                          <FileText className="w-4 h-4 mr-2" />
                          {file.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            <Button type="submit" className="w-full">
              Submit Application
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}

