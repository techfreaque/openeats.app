import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  DollarSign,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DriversPage(): JSX.Element {
  return (
    <div className="flex-1">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Drive With OpenEats
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Earn competitive pay with flexible hours and keep 100% of your
                tips.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" asChild>
                <Link href="#apply">Apply Now</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#faq">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-3xl font-bold">Why Drive With Us?</h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-2">
                  <DollarSign className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Fair Compensation</h3>
                    <p className="text-muted-foreground">
                      Earn competitive base pay plus 100% of tips. No hidden
                      deductions or fees.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Flexible Hours</h3>
                    <p className="text-muted-foreground">
                      Work when you want. Set your own schedule and
                      availability.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Fast Payments</h3>
                    <p className="text-muted-foreground">
                      Get paid weekly, or cash out daily with instant pay
                      options.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Local Focus</h3>
                    <p className="text-muted-foreground">
                      Deliver in your community and support local businesses.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-lg">
              <Image
                src="/placeholder.svg?height=400&width=600"
                alt="Delivery driver"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  1
                </div>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Complete our simple application process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Fill out the application form with your basic information,
                  vehicle details, and availability. We'll review your
                  application and get back to you quickly.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  2
                </div>
                <CardTitle>Get Activated</CardTitle>
                <CardDescription>
                  Complete verification and training
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Once approved, complete our simple verification process and
                  brief training module to learn how our platform works and best
                  practices for delivery.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground mb-4">
                  3
                </div>
                <CardTitle>Start Delivering</CardTitle>
                <CardDescription>Accept orders and earn money</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Download our driver app, set your availability, and start
                  accepting delivery requests. Get paid weekly or cash out daily
                  with our instant pay option.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32" id="apply">
        <div className="container px-4 md:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-3xl font-bold">Requirements</h2>
              <ul className="mt-6 space-y-4">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Age Requirement</h3>
                    <p className="text-muted-foreground">
                      You must be at least 18 years old to deliver with
                      OpenEats.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Transportation</h3>
                    <p className="text-muted-foreground">
                      Car, scooter, motorcycle, or bicycle (depending on your
                      city).
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Smartphone</h3>
                    <p className="text-muted-foreground">
                      iPhone or Android smartphone compatible with our driver
                      app.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">Documentation</h3>
                    <p className="text-muted-foreground">
                      Valid driver's license, proof of insurance, and background
                      check.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Apply to Drive</CardTitle>
                  <CardDescription>
                    Fill out this form to get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor="first-name"
                          className="text-sm font-medium"
                        >
                          First Name
                        </label>
                        <input
                          id="first-name"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="John"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="last-name"
                          className="text-sm font-medium"
                        >
                          Last Name
                        </label>
                        <input
                          id="last-name"
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="(123) 456-7890"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="city" className="text-sm font-medium">
                        City
                      </label>
                      <input
                        id="city"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        placeholder="Your City"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="vehicle-type"
                        className="text-sm font-medium"
                      >
                        Vehicle Type
                      </label>
                      <select
                        id="vehicle-type"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="">Select Vehicle Type</option>
                        <option value="car">Car</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="scooter">Scooter</option>
                        <option value="bicycle">Bicycle</option>
                      </select>
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Submit Application</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted" id="faq">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              <h3 className="text-xl font-bold">How much can I earn?</h3>
              <p className="text-muted-foreground">
                Earnings vary based on your location, hours worked, and number
                of deliveries completed. On average, drivers earn $15-25 per
                hour including tips. You keep 100% of your tips.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">When do I get paid?</h3>
              <p className="text-muted-foreground">
                We process payments weekly, with direct deposit to your bank
                account. We also offer an instant pay option that allows you to
                cash out your earnings daily (small fee applies).
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Can I work part-time?</h3>
              <p className="text-muted-foreground">
                You set your own schedule and can work as much or as little as
                you want. Many of our drivers work part-time to supplement their
                income.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">What areas do you serve?</h3>
              <p className="text-muted-foreground">
                We currently operate in over 50 cities across the United States,
                with plans to expand to more locations soon. Check our
                application form to see if your city is supported.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Do I need insurance?</h3>
              <p className="text-muted-foreground">
                Yes, you need to have valid insurance for your vehicle. We also
                provide additional coverage while you're actively delivering on
                our platform.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-bold">
                How long does application take?
              </h3>
              <p className="text-muted-foreground">
                The application process typically takes 1-3 business days,
                including background check. Once approved, you can start
                delivering right away.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold">Ready to Start Earning?</h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Join thousands of drivers already delivering with OpenEats.
              </p>
            </div>
            <Button size="lg" className="gap-2" asChild>
              <Link href="#apply">
                Apply Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
