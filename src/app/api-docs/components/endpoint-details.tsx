"use client";

import type { ApiEndpoint } from "next-query-portal/client/endpoint";
import type { ApiFormReturn } from "next-query-portal/client/hooks/types";
import { Methods } from "next-query-portal/shared/types/endpoint";
import type { FieldValues } from "node_modules/react-hook-form/dist/types";
import type { FormEvent, JSX } from "react";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "../../../components/ui";
import { CodeExamples } from "./code-examples";
import { DynamicFormFields } from "./dynamic-form-fields";
import { SchemaViewer } from "./schema-viewer";

// Replace any types with proper interfaces
interface EndpointDetailsProps {
  endpoint: ApiEndpoint<unknown, unknown, unknown, unknown>;
  requestData: string;
  responseData: string;
  responseStatus: number | null;
  apiForm: ApiFormReturn<unknown, unknown, unknown>;
  selectedDomain: string;
  handleTryIt: (
    event: FormEvent<HTMLFormElement> | undefined,
    urlParamVariables: unknown,
  ) => void;
}

export function EndpointDetails({
  endpoint,
  requestData,
  responseData,
  responseStatus,
  apiForm,
  selectedDomain,
  handleTryIt,
}: EndpointDetailsProps): JSX.Element {
  const [activeTab, setActiveTab] = useState("try-it");
  const [viewMode, setViewMode] = useState<"form" | "json">("form");

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${
                endpoint.method === Methods.GET
                  ? "bg-green-100 text-green-700"
                  : endpoint.method === Methods.POST
                    ? "bg-blue-100 text-blue-700"
                    : endpoint.method === Methods.PUT
                      ? "bg-yellow-100 text-yellow-700"
                      : endpoint.method === Methods.DELETE
                        ? "bg-red-100 text-red-700"
                        : "bg-purple-100 text-purple-700"
              }`}
            >
              {endpoint.method}
            </span>
            <span className="font-mono text-sm">{endpoint.path.join("/")}</span>
          </div>
          {endpoint.requiresAuthentication() && (
            <span className="text-xs bg-gray-200 px-2 py-1 rounded">
              🔒 Auth Required
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600">{endpoint.description}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="try-it">Try It</TabsTrigger>
          <TabsTrigger value="examples">Code Examples</TabsTrigger>
          <TabsTrigger value="schema">Schema</TabsTrigger>
        </TabsList>

        <TabsContent value="try-it">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
            {/* Request panel */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Request</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === "form" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("form")}
                  >
                    Form
                  </Button>
                  <Button
                    variant={viewMode === "json" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("json")}
                  >
                    JSON
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-lg border p-4 mb-4 min-h-[250px]">
                {viewMode === "form" ? (
                  <DynamicFormFields
                    endpoint={endpoint}
                    apiForm={
                      apiForm as ApiFormReturn<FieldValues, unknown, unknown>
                    }
                  />
                ) : (
                  <div className="bg-gray-800 rounded-lg p-4 relative min-h-[200px]">
                    <div className="absolute top-2 right-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                      JSON
                    </div>
                    <pre className="text-green-400 font-mono text-sm overflow-auto h-[200px]">
                      {requestData}
                    </pre>
                  </div>
                )}
              </div>

              {apiForm.errorMessage && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
                  {apiForm.errorMessage}
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => handleTryIt(undefined, undefined)}
                disabled={apiForm.isSubmitting}
              >
                {apiForm.isSubmitting ? "Sending..." : "Try It"}
              </Button>
            </div>

            {/* Response panel */}
            <div>
              <div className="flex justify-between mb-2">
                <h3 className="text-sm font-medium">Response</h3>
                {responseStatus && (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      responseStatus >= 200 && responseStatus < 300
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {responseStatus}{" "}
                    {responseStatus >= 200 && responseStatus < 300
                      ? "OK"
                      : "Error"}
                  </span>
                )}
              </div>
              <div className="bg-gray-800 rounded-lg p-4 relative min-h-[250px]">
                <div className="absolute top-2 right-2 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">
                  JSON
                </div>
                <pre className="text-green-400 font-mono h-full overflow-auto max-h-[250px]">
                  {responseData || "// Response will appear here"}
                </pre>
              </div>
            </div>
          </div>
          <div className="p-4">
            <EndpointErrorCodes endpoint={endpoint} />
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <CodeExamples
            activeEndpoint={endpoint}
            selectedDomain={selectedDomain}
          />
        </TabsContent>

        <TabsContent value="schema">
          <div className="p-4">
            <h3 className="font-medium mb-4">Endpoint Schema</h3>
            <SchemaViewer endpoint={endpoint} />
            <EndpointErrorCodes endpoint={endpoint} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function EndpointErrorCodes({
  endpoint,
}: {
  endpoint: ApiEndpoint<unknown, unknown, unknown, unknown>;
}): JSX.Element {
  const errorCodes = endpoint.errorCodes;

  return Object.keys(errorCodes).length > 0 ? (
    <div className="mt-6">
      <h4 className="text-sm font-medium mb-2">Error Codes</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.entries(errorCodes).map(([code, description]) => (
          <div
            key={code}
            className="flex items-center border p-2 rounded-md bg-gray-50"
          >
            <span className="text-sm font-mono bg-red-100 text-red-700 px-2 py-1 rounded mr-2">
              {code}
            </span>
            <span className="text-sm text-gray-700">{description}</span>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <></>
  );
}
