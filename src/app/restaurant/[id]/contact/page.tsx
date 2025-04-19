"use client";

import { Calendar, Clock, Facebook, Globe, Instagram, Mail, MapPin, Phone, Twitter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslation } from "next-vibe/i18n";
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger, Textarea, useToast } from "next-vibe-ui/ui";
import type React from "react";
import type { JSX } from "react";
import { useState } from "react";

import { useRestaurant } from "@/app/api/v1/restaurant/hooks";
import { LanguageSelector } from "@/app/app/components/language-selector";
import { useRestaurantConfig } from "@/app/app/components/restaurant-config-provider";

export default function RestaurantContactPage(): JSX.Element | null {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data: restaurant } = useRestaurant(id);
  const config = useRestaurantConfig();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Form state with more fields
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    reservationDate: "",
    reservationTime: "",
    partySize: "2",
  });
  const [activeTab, setActiveTab] = useState<"contact" | "reservation">("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Basic validation
    if (activeTab === "contact" && (!formData.name || !formData.email || !formData.message)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (activeTab === "reservation" && (!formData.name || !formData.email || !formData.reservationDate || !formData.reservationTime)) {
      toast({
        title: "Error",
        description: "Please fill in all required fields for your reservation",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    toast({
      title: activeTab === "contact" ? "Message sent" : "Reservation request sent",
      description: activeTab === "contact"
        ? "We'll get back to you as soon as possible"
        : "We'll confirm your reservation shortly",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
      reservationDate: "",
      reservationTime: "",
      partySize: "2",
    });
    setIsSubmitting(false);
  };

  if (!restaurant) {
    return null;
  }

  // Format opening times
  const formatOpeningTimes = () => {
    if (!restaurant.openingTimes || restaurant.openingTimes.length === 0) {
      return [
        { day: "Monday - Friday", hours: "11:00 AM - 10:00 PM" },
        { day: "Saturday - Sunday", hours: "10:00 AM - 11:00 PM" },
      ];
    }

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];

    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      return `${displayHours}:${mins.toString().padStart(2, "0")} ${period}`;
    };

    return restaurant.openingTimes
      .sort((a, b) => a.day - b.day)
      .map(time => ({
        day: days[time.day],
        hours: `${formatTime(time.open)} - ${formatTime(time.close)}`
      }));
  };

  const openingTimes = formatOpeningTimes();

  // Social media links - in a real app, these would come from the restaurant data
  const socialLinks = [
    { name: "Website", icon: <Globe className="h-5 w-5" />, url: restaurant.website || "#" },
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, url: "#" },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, url: "#" },
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, url: "#" },
  ];

  return (
    <div className="pb-20">
      {/* Hero section */}
      <div className="bg-muted py-8">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {restaurant.name} - {t("restaurant.contact.title", "Contact Us")}
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                {t("restaurant.contact.subtitle", "We'd love to hear from you. Send us a message or make a reservation.")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/restaurant/${id}`}>
                  {t("restaurant.contact.backToRestaurant", "Back to Restaurant")}
                </Link>
              </Button>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 md:px-6 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            {/* Restaurant Information Cards */}
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {t("restaurant.contact.address", "Address")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p>
                    {restaurant.street} {restaurant.streetNumber},<br />
                    {restaurant.zip} {restaurant.city},<br />
                    {t(`countries.${restaurant.countryId}`)}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://maps.google.com/?q=${restaurant.latitude},${restaurant.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("restaurant.contact.getDirections", "Get Directions")}
                    </a>
                  </Button>
                </CardFooter>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Phone className="h-5 w-5 text-primary" />
                      {t("restaurant.contact.phone", "Phone")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{restaurant.phone}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`tel:${restaurant.phone}`}>
                        {t("restaurant.contact.callNow", "Call Now")}
                      </a>
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      {t("restaurant.contact.email", "Email")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{restaurant.email}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${restaurant.email}`}>
                        {t("restaurant.contact.sendEmail", "Send Email")}
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Opening Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  {t("restaurant.contact.openingHours", "Opening Hours")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {openingTimes.map((time, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{time.day}</span>
                      <span>{time.hours}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {t("restaurant.contact.followUs", "Follow Us")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {socialLinks.map((link, index) => (
                    <Button key={index} variant="outline" size="sm" asChild>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                        {link.icon}
                        {link.name}
                      </a>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <div className="aspect-video relative rounded-lg overflow-hidden border">
              <Image
                src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-l+f00(${restaurant.longitude},${restaurant.latitude})/${restaurant.longitude},${restaurant.latitude},14,0/600x400?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`}
                alt="Restaurant location map"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("restaurant.contact.getInTouch", "Get in Touch")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="contact" value={activeTab} onValueChange={(value) => setActiveTab(value as "contact" | "reservation")}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="contact">
                      {t("restaurant.contact.sendMessage", "Send Message")}
                    </TabsTrigger>
                    <TabsTrigger value="reservation">
                      {t("restaurant.contact.makeReservation", "Make Reservation")}
                    </TabsTrigger>
                  </TabsList>

                  {/* Contact Form */}
                  <TabsContent value="contact" className="pt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t("restaurant.contact.yourName", "Your Name")}</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("restaurant.contact.emailAddress", "Email Address")}</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t("restaurant.contact.phoneNumber", "Phone Number")}</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="+1 (555) 123-4567"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="subject">{t("restaurant.contact.subject", "Subject")}</Label>
                          <Input
                            id="subject"
                            name="subject"
                            placeholder="Inquiry"
                            value={formData.subject}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">{t("restaurant.contact.message", "Message")}</Label>
                        <Textarea
                          id="message"
                          name="message"
                          rows={5}
                          placeholder="I would like to inquire about..."
                          value={formData.message}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? t("restaurant.contact.sending", "Sending...") : t("restaurant.contact.sendMessage", "Send Message")}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* Reservation Form */}
                  <TabsContent value="reservation" className="pt-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">{t("restaurant.contact.yourName", "Your Name")}</Label>
                          <Input
                            id="name"
                            name="name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t("restaurant.contact.emailAddress", "Email Address")}</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t("restaurant.contact.phoneNumber", "Phone Number")}</Label>
                          <Input
                            id="phone"
                            name="phone"
                            placeholder="+1 (555) 123-4567"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="partySize">{t("restaurant.contact.partySize", "Party Size")}</Label>
                          <select
                            id="partySize"
                            name="partySize"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.partySize}
                            onChange={handleChange}
                            required
                          >
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                              <option key={num} value={num}>
                                {num} {num === 1 ? "Person" : "People"}
                              </option>
                            ))}
                            <option value="more">More than 12</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="reservationDate">{t("restaurant.contact.date", "Date")}</Label>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <Input
                              id="reservationDate"
                              name="reservationDate"
                              type="date"
                              value={formData.reservationDate}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reservationTime">{t("restaurant.contact.time", "Time")}</Label>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <Input
                              id="reservationTime"
                              name="reservationTime"
                              type="time"
                              value={formData.reservationTime}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">{t("restaurant.contact.specialRequests", "Special Requests")}</Label>
                        <Textarea
                          id="message"
                          name="message"
                          rows={3}
                          placeholder="Any special requests or dietary requirements..."
                          value={formData.message}
                          onChange={handleChange}
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting
                          ? t("restaurant.contact.processing", "Processing...")
                          : t("restaurant.contact.requestReservation", "Request Reservation")}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
