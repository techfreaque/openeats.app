"use client";

import { Camera, Edit2, Mail, User } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { FormEvent, JSX } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage(): JSX.Element | null {
  const router = useRouter();
  const { user, logout, userForm } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    router.push("/auth/public/login?redirect=/app/profile");
    return null;
  }

  const handleSignOut = (): void => {
    logout();
    router.push("/");
  };

  const handleSaveProfile = (event: FormEvent<HTMLFormElement>): void => {
    userForm.submitForm(event, {
      urlParamVariables: undefined,
      onSuccess: () => setIsEditing(false),
    });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-8">
        <div className="container px-4 md:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold">My Profile</h1>
              <Button variant="outline" onClick={() => router.push("/")}>
                Back to Home
              </Button>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-[1fr_3fr]">
              <div className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="relative h-32 w-32 overflow-hidden rounded-full">
                      <Image
                        src={
                          user.imageUrl ??
                          "/placeholder.svg?height=128&width=128"
                        }
                        alt={user.firstName}
                        width={128}
                        height={128}
                        className="object-cover"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    >
                      <Camera className="h-4 w-4" />
                      <span className="sr-only">Change profile picture</span>
                    </Button>
                  </div>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">{user.firstName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </Button>
                </div>

                <div>
                  <Tabs defaultValue="profile">
                    <TabsList className="w-full">
                      <TabsTrigger value="profile" className="flex-1">
                        Profile
                      </TabsTrigger>
                      <TabsTrigger value="preferences" className="flex-1">
                        Preferences
                      </TabsTrigger>
                      <TabsTrigger value="notifications" className="flex-1">
                        Notifications
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">
                          Personal Information
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          {isEditing ? "Cancel" : "Edit"}
                        </Button>
                      </div>

                      {userForm.errorMessage && (
                        <div className="p-4 text-sm text-white bg-red-500 rounded-md">
                          {userForm.errorMessage
                            .split("\n")
                            .map((message, index) => (
                              <div key={index}>{message}</div>
                            ))}
                        </div>
                      )}

                      {isEditing ? (
                        <Form {...userForm.form}>
                          <form
                            className="space-y-4"
                            onSubmit={handleSaveProfile}
                            noValidate
                          >
                            <FormField
                              control={userForm.form.control}
                              name="firstName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="firstName">
                                    Full Name
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      id="firstName"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={userForm.form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel htmlFor="email">Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      id="email"
                                      type="email"
                                      {...field}
                                      value={field.value || ""}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <Button
                              type="submit"
                              disabled={userForm.isSubmitting}
                            >
                              {userForm.isSubmitting
                                ? "Saving..."
                                : "Save Changes"}
                            </Button>
                          </form>
                        </Form>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Full Name</p>
                              <p className="text-sm text-muted-foreground">
                                {user.firstName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">Email</p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium">
                          Account Security
                        </h3>
                        <div className="mt-4 space-y-4">
                          <Button variant="outline">Change Password</Button>
                          <Button variant="outline">
                            Enable Two-Factor Authentication
                          </Button>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="preferences" className="mt-6 space-y-6">
                      <div>
                        <h3 className="text-lg font-medium">
                          Dietary Preferences
                        </h3>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="vegetarian"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="vegetarian">Vegetarian</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="vegan"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="vegan">Vegan</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="gluten-free"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="gluten-free">Gluten-Free</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="dairy-free"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="dairy-free">Dairy-Free</Label>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium">
                          Cuisine Preferences
                        </h3>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="italian"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="italian">Italian</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="mexican"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="mexican">Mexican</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="chinese"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="chinese">Chinese</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="japanese"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="japanese">Japanese</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="indian"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="indian">Indian</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="thai"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="thai">Thai</Label>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium">
                          Delivery Preferences
                        </h3>
                        <div className="mt-4 space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="default-delivery">
                              Default Delivery Address
                            </Label>
                            <Input
                              id="default-delivery"
                              defaultValue="123 Main St, Anytown, USA"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="delivery-instructions">
                              Default Delivery Instructions
                            </Label>
                            <Input
                              id="delivery-instructions"
                              placeholder="E.g., Leave at door, call upon arrival, etc."
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="notifications"
                      className="mt-6 space-y-6"
                    >
                      <div>
                        <h3 className="text-lg font-medium">
                          Email Notifications
                        </h3>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Order Updates</p>
                              <p className="text-sm text-muted-foreground">
                                Receive updates about your orders
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Promotions</p>
                              <p className="text-sm text-muted-foreground">
                                Receive promotions and discounts
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Restaurant Updates</p>
                              <p className="text-sm text-muted-foreground">
                                {"Updates from restaurants you've ordered from"}
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <h3 className="text-lg font-medium">
                          Push Notifications
                        </h3>
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Order Status</p>
                              <p className="text-sm text-muted-foreground">
                                Receive real-time updates about your orders
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Special Offers</p>
                              <p className="text-sm text-muted-foreground">
                                Get notified about special offers and deals
                              </p>
                            </div>
                            <input
                              type="checkbox"
                              defaultChecked
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
