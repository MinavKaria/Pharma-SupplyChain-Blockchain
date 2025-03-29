import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useWriteContract } from "wagmi";
import abi from "@/configs/abi";
import { getNames } from "country-list";  
import UserBatches from "@/components/userBatch";

interface FormData {
  ProductName: string;
  Description: string;
  ManufacturingDate: string;
  ExpiryDate: string;
  ManufacturerName: string;
  SupplierName: string;
  UnitPrice: string;
  Certification: string;
  CountryOfOrigin: string;
  DeliveryDate: string;
}

enum StorageCondition {
  Ambient = 0,
  Refrigerated = 1,
  Frozen = 2,
}

export default function BatchCreation() {
  const [formData, setFormData] = useState<FormData>({
    ProductName: "",
    Description: "",
    ManufacturingDate: "",
    ExpiryDate: "",
    ManufacturerName: "",
    SupplierName: "",
    UnitPrice: "",
    Certification: "",
    CountryOfOrigin: "",
    DeliveryDate: "",
  });

  const [quantity, setQuantity] = useState("");
  const [storageCondition, setStorageCondition] = useState<StorageCondition>(
    StorageCondition.Ambient
  );

  const { writeContract, isPending, isSuccess, isError, error } = useWriteContract();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value);
  };

  const handleStorageConditionChange = (value: string) => {
    setStorageCondition(Number(value) as StorageCondition);
  };

  const handleCountryChange = (value: string) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      CountryOfOrigin: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const expiryDateObject = new Date(formData.ExpiryDate);
      const expiryDateTimestamp = Math.floor(expiryDateObject.getTime() / 1000);

      const productData = JSON.stringify(formData);

      writeContract({
        abi,
        address: import.meta.env.VITE_CONTRACT_ADDRESS,
        functionName: "createBatch",
        args: [
          JSON.stringify(productData),
          Number(quantity),
          expiryDateTimestamp,
          storageCondition,
        ],
      });

      console.log("Transaction submitted");
      console.log("Product Data:", productData);
      console.log("Quantity:", quantity);
      console.log("Expiry Date (timestamp):", expiryDateTimestamp);
      console.log("Storage Condition:", storageCondition);
    } catch (err) {
      console.error("Error submitting transaction:", err);
      toast({
        title: "Error",
        description: `Failed to create batch: ${
          err instanceof Error ? err.message : String(err)
        }`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast({
        title: "Batch Created",
        description: "Your batch has been successfully created and recorded on the blockchain.",
      });

      setFormData({
        ProductName: "",
        Description: "",
        ManufacturingDate: "",
        ExpiryDate: "",
        ManufacturerName: "",
        SupplierName: "",
        UnitPrice: "",
        Certification: "",
        CountryOfOrigin: "",
        DeliveryDate: "",
      });
      setQuantity("");
      setStorageCondition(StorageCondition.Ambient);
    }

    if (isError && error) {
      toast({
        title: "Transaction Failed",
        description: error.message || "There was an error creating the batch on the blockchain.",
        variant: "destructive",
      });
    }
  }, [isSuccess, isError, error]);

  const countries = getNames();

  return (
    <div className="max-w-4xl mx-auto p-4 mb-5">
      <CardHeader className="text-center mb-4">
        <CardTitle className="text-3xl font-bold">Create Batch</CardTitle>
        <CardDescription className="text-muted-foreground mt-2">
          Enter product details to create a new batch on the blockchain
        </CardDescription>
      </CardHeader>
      <Card className="shadow-lg rounded-lg overflow-hidden pt-4">
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            {Object.keys(formData).map((key, index) => (
              key !== "CountryOfOrigin" ? (
                <div
                  key={key}
                  className={`space-y-2 ${
                    (index + 1) % 3 !== 0 ? "border-r pr-4" : ""
                  }`}
                >
                  <Label htmlFor={key}>
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </Label>
                  <Input
                    id={key}
                    name={key}
                    type={key.includes("Date") ? "date" : "text"}
                    value={(formData as any)[key]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ) : (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>Country of Origin</Label>
                  <Select
                    value={formData.CountryOfOrigin}
                    onValueChange={handleCountryChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )
            ))}
            <div className="space-y-2">
              <Label htmlFor="Quantity">Quantity</Label>
              <Input
                id="Quantity"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min="1"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="StorageCondition">Storage Condition</Label>
              <Select
                value={storageCondition.toString()}
                onValueChange={handleStorageConditionChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select storage condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Ambient</SelectItem>
                  <SelectItem value="1">Refrigerated</SelectItem>
                  <SelectItem value="2">Frozen</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <div className="h-px w-11/12 bg-gray-300 mt-4 mb-5 mx-auto" />
              <div className="flex justify-center">
                <Button type="submit" className="w-52" disabled={isPending}>
                  {isPending ? "Creating Batch..." : "Create Batch"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="mt-8">
      <UserBatches/>
      </div>
    </div>
  );
}
