"use client";

import Link from "next/link";
import { getEndpoints } from "next-query-portal/client/endpoints";
import { useApiForm } from "next-query-portal/client/hooks/form";
import { APP_NAME, ENDPOINT_DOMAINS } from "next-query-portal/shared/constants";
import type { Methods } from "next-query-portal/shared/types/endpoint";
import type { FormEvent, JSX } from "react";
import { useMemo, useState } from "react";

import { envClient } from "@/config/env-client";
import {
  type ApiEndpoint,
  getEndpointByPath,
} from "@/packages/next-query-portal/client/endpoint";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui";
import loginEndpoint from "../../api/v1/auth/public/login/definition";
import { DomainSelector } from "./domain-selector";
import { EndpointDetails } from "./endpoint-details";
import { EndpointsList } from "./endpoints-list";

export function ApiExplorer(): JSX.Element {
  const [responseData, setResponseData] = useState<string>("");
  const [selectedEnv, setSelectedEnv] = useState<keyof typeof ENDPOINT_DOMAINS>(
    envClient.NODE_ENV === "production" ? "prod" : "dev",
  );
  const selectedDomain = ENDPOINT_DOMAINS[selectedEnv];
  const [activeEndpoint, setActiveEndpoint] = useState<
    ApiEndpoint<unknown, unknown, unknown, string>
  >(loginEndpoint.POST as ApiEndpoint<unknown, unknown, unknown, string>);

  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const endpoints = getEndpoints();

  // Create a form using useApiForm
  const apiForm = useApiForm<unknown, unknown, unknown, unknown>(
    activeEndpoint,
    {},
    {
      onSuccess: ({ responseData }) => {
        // Add analytics tracking
        setResponseStatus(200);
        setResponseData(JSON.stringify(responseData, null, 2));
      },
      onError: ({ error }) => {
        // Use type guards to safely access properties
        const statusCode =
          typeof error === "object" && error !== null && "statusCode" in error
            ? Number(error.statusCode) || 500
            : 500;

        setResponseStatus(statusCode);
        setResponseData(
          JSON.stringify(
            {
              error: error instanceof Error ? error.message : "Unknown error",
              details:
                typeof error === "object" && error !== null
                  ? "details" in error
                    ? error.details
                    : null
                  : null,
            },
            null,
            2,
          ),
        );
      },
    },
  );

  // Get the current form data as JSON string for display
  const currentFormValues = apiForm.form.watch();
  const formattedFormValues = useMemo(() => {
    return JSON.stringify(currentFormValues, null, 2);
  }, [currentFormValues]);

  // Handlers
  const handleEndpointChange = (
    newEndpointPath: string[],
    newMethod: Methods,
  ): void => {
    const newEndpoint = getEndpointByPath(
      newEndpointPath,
      newMethod,
      endpoints,
    );
    setActiveEndpoint(newEndpoint);
    setResponseData("");
    setResponseStatus(null);

    // Reset form with default values from examples if available
    if (newEndpoint.examples.payloads["default"]) {
      apiForm.form.reset(newEndpoint.examples.payloads["default"]);
    } else {
      apiForm.form.reset({});
    }
  };

  // Fix the unused variable by implementing URL path variable handling in form submission
  const handleTryIt = (
    event: FormEvent<HTMLFormElement> | undefined,
    urlParamVariables: unknown,
  ): void => {
    apiForm.submitForm(event, { urlParamVariables });
  };

  return (
    <div className="mb-8 p-5 mx-auto max-w-[1900px]">
      {/* Download App Section */}

      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0 md:mr-8">
            <h2 className="text-2xl font-bold mb-3">
              Looking for the {APP_NAME} App?
            </h2>
            <p className="text-gray-700 mb-4">
              Get the best food delivery experience on any device. Order food,
              track deliveries in real-time, and enjoy exclusive offers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="text-base font-semibold">App Store</div>
                </div>
              </Link>
              <Link
                href="#"
                className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                >
                  <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                </svg>
                <div>
                  <div className="text-xs">GET IT ON</div>
                  <div className="text-base font-semibold">Google Play</div>
                </div>
              </Link>
              <Link
                href="https://app.openeats.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <div>
                  <div className="text-xs">USE IN</div>
                  <div className="text-base font-semibold">Web Browser</div>
                </div>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white p-1 rounded-2xl shadow-lg">
              <img
                src="/placeholder.svg"
                alt={`${APP_NAME} mobile app`}
                className="h-64 w-auto rounded-xl"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Explore our comprehensive API to integrate with the {APP_NAME}{" "}
            platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6">
            Our RESTful API allows you to integrate with our platform. You can
            browse restaurants, menus, create orders and track deliveries
            programmatically.
          </p>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
              <div className="bg-blue-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-blue-600"
                >
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Authentication</h3>
                <p className="text-sm text-gray-600">
                  JWT-based secure API auth
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
              <div className="bg-green-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-green-600"
                >
                  <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                  <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                  <line x1="6" y1="6" x2="6.01" y2="6" />
                  <line x1="6" y1="18" x2="6.01" y2="18" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">RESTful Endpoints</h3>
                <p className="text-sm text-gray-600">
                  Clean and consistent API design
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg">
              <div className="bg-amber-100 p-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-600"
                >
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
                  <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Webhooks</h3>
                <p className="text-sm text-gray-600">
                  Real-time event notifications
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center my-6">
            <h3 className="text-lg font-semibold">API Explorer</h3>
          </div>

          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">API Testing</h3>
              <DomainSelector
                selectedDomain={selectedEnv}
                onDomainChange={setSelectedEnv}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Left panel with endpoints */}
              <div className="lg:col-span-1 space-y-3">
                <EndpointsList
                  endpoints={endpoints}
                  activeEndpoint={activeEndpoint}
                  onEndpointChange={handleEndpointChange}
                />
              </div>

              {/* Right panel with request/response/schema */}
              <div className="lg:col-span-2">
                <EndpointDetails
                  endpoint={activeEndpoint}
                  requestData={formattedFormValues}
                  responseData={responseData}
                  responseStatus={responseStatus}
                  apiForm={apiForm}
                  selectedDomain={selectedDomain}
                  handleTryIt={handleTryIt}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
