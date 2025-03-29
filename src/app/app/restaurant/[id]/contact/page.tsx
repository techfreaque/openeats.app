"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import type React from "react";
import type { JSX } from "react";
import { useState } from "react";

import { useRestaurants } from "@/app/app/components/hooks/use-restaurants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function RestaurantContactPage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { getRestaurantById } = useRestaurants();
  const { toast } = useToast();

  const restaurant = getRestaurantById(id);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!name || !email || !message) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: "Message sent",
      description: "We'll get back to you as soon as possible",
    });

    // Reset form
    setName("");
    setEmail("");
    setMessage("");
    setIsSubmitting(false);
  };

  if (!restaurant) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="container px-4 md:px-6">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="bg-muted rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold mb-4">Restaurant Information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Address</h3>
                    <p className="text-muted-foreground">
                      {restaurant.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Phone</h3>
                    <p className="text-muted-foreground">(555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Email</h3>
                    <p className="text-muted-foreground">
                      info@{restaurant.name.toLowerCase().replace(/\s+/g, "")}
                      .com
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Hours</h3>
                    <div className="text-muted-foreground">
                      <p>Monday - Friday: 11:00 AM - 10:00 PM</p>
                      <p>Saturday - Sunday: 10:00 AM - 11:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="aspect-video relative rounded-lg overflow-hidden">
              <Image
                src="/placeholder.svg?height=300&width=500&text=Map"
                alt="Restaurant location map"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
