"use client";

import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  Label,
  Textarea,
  useToast,
} from "next-vibe-ui/ui";
import type React from "react";
import { useState } from "react";

export function CreateRestaurantForm(): React.JSX.Element {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [deliveryOptions, setDeliveryOptions] = useState({
    delivery: true,
    pickup: true,
    dineIn: false,
  });

  // Available categories
  const availableCategories = [
    "American",
    "Asian",
    "Bakery",
    "Breakfast",
    "Burgers",
    "Chinese",
    "Coffee",
    "Dessert",
    "Fast Food",
    "Healthy",
    "Indian",
    "Italian",
    "Japanese",
    "Korean",
    "Mexican",
    "Pizza",
    "Salads",
    "Sandwiches",
    "Seafood",
    "Sushi",
    "Thai",
    "Vegan",
    "Vegetarian",
  ];

  const handleCategoryChange = (category: string): void => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!name || !description || !address || !categories.length) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // In a real app, this would be an API call to create the restaurant
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast({
        title: "Restaurant created",
        description: "Your restaurant has been successfully created",
      });

      // Redirect to the restaurant dashboard or home page
      router.push("/app");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create restaurant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create a Restaurant</CardTitle>
        <CardDescription>
          Fill out the form below to add your restaurant to our platform.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>

            <div className="grid gap-2">
              <Label htmlFor="name">Restaurant Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Categories *</h3>
            <p className="text-sm text-muted-foreground">
              Select at least one category that best describes your restaurant.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableCategories.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category}`}
                    checked={categories.includes(category)}
                    onCheckedChange={() => handleCategoryChange(category)}
                  />
                  <Label htmlFor={`category-${category}`}>{category}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Order Options</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="delivery"
                  checked={deliveryOptions.delivery}
                  onCheckedChange={(checked) =>
                    setDeliveryOptions((prev) => ({
                      ...prev,
                      delivery: !!checked,
                    }))
                  }
                />
                <Label htmlFor="delivery">Delivery</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="pickup"
                  checked={deliveryOptions.pickup}
                  onCheckedChange={(checked) =>
                    setDeliveryOptions((prev) => ({
                      ...prev,
                      pickup: !!checked,
                    }))
                  }
                />
                <Label htmlFor="pickup">Pickup</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="dineIn"
                  checked={deliveryOptions.dineIn}
                  onCheckedChange={(checked) =>
                    setDeliveryOptions((prev) => ({
                      ...prev,
                      dineIn: !!checked,
                    }))
                  }
                />
                <Label htmlFor="dineIn">Dine-In</Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Restaurant"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
