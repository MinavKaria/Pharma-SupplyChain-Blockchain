"use client";

import type React from "react";
import { useState } from "react";
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
import { toast } from "@/hooks/use-toast";

interface FormData {
  ProductName: string;
  BatchNumber: string;
  ManufacturingDate: string;
  ExpiryDate: string;
  ManufacturerName: string;
  SupplierName: string;
  UnitPrice: string;
  StorageConditions: string;
  Certification: string;
  CountryOfOrigin: string;
  DeliveryDate: string;
}

export default function BatchCreation() {
  const [formData, setFormData] = useState<FormData>({
    ProductName: "",
    BatchNumber: "",
    ManufacturingDate: "",
    ExpiryDate: "",
    ManufacturerName: "",
    SupplierName: "",
    UnitPrice: "",
    StorageConditions: "",
    Certification: "",
    CountryOfOrigin: "",
    DeliveryDate: "",
  });
  const [quantity, setQuantity] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const productData = JSON.stringify(formData);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      console.log("Product Data JSON:", formData);
      console.log("Stringified Product Data:", productData);
      console.log("Quantity:", quantity);

      // Code to send productData and quantity to the backend or smart contract
      // Example:
      // await fetch('/api/create-batch', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ formData, quantity }),
      // });

      // Or if interacting with a smart contract:
      // await contract.methods.createBatch(formData, quantity).send({ from: userAddress });

      toast({
        title: "Batch Created",
        description: "Your batch has been successfully created.",
      });

      setFormData({
        ProductName: "",
        BatchNumber: "",
        ManufacturingDate: "",
        ExpiryDate: "",
        ManufacturerName: "",
        SupplierName: "",
        UnitPrice: "",
        StorageConditions: "",
        Certification: "",
        CountryOfOrigin: "",
        DeliveryDate: "",
      });
      setQuantity("");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create batch.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 mb-5">
      <CardHeader className="text-center mb-4">
        <CardTitle className="text-3xl font-bold">Create Batch</CardTitle>
        <CardDescription className="text-muted-foreground mt-2">
          Enter product details to create a new batch
        </CardDescription>
      </CardHeader>
      <Card className="shadow-lg rounded-lg overflow-hidden pt-4">
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
            {Object.keys(formData).map((key, index) => (
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
            <div className="col-span-3">
              <div className="h-px w-11/12 bg-gray-300 mt-4 mb-5 mx-auto" />
              <div className="flex justify-center">
                <Button type="submit" className="w-52" disabled={isLoading}>
                  {isLoading ? "Creating Batch..." : "Create Batch"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
