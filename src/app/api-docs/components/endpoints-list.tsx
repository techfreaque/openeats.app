"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import type { ApiEndpoint } from "next-query-portal/client/endpoint";
import type {
  ApiSection,
  Methods,
} from "next-query-portal/shared/types/endpoint";
import { errorLogger } from "next-query-portal/shared/utils/logger";
import type { JSX } from "react";
import { useState } from "react";

interface EndpointsListProps {
  endpoints: ApiSection;
  activeEndpoint: ApiEndpoint<unknown, unknown, unknown, unknown>;
  onEndpointChange: (path: string[], method: Methods) => void;
  compact?: boolean;
}

export function EndpointsList({
  endpoints,
  activeEndpoint,
  onEndpointChange,
  compact = false,
}: EndpointsListProps): JSX.Element {
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    auth: true, // Default expanded sections
  });

  // Toggle section expansion
  const toggleSection = (section: string): void => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Helper to check if a string is an HTTP method
  const isHttpMethod = (str: string): boolean => {
    return ["GET", "POST", "PUT", "DELETE", "PATCH"].includes(
      str.toUpperCase(),
    );
  };

  // Helper to get the current section from the nested structure
  const getCurrentSection = (
    data: ApiSection,
    path: string[],
  ): ApiSection | ApiEndpoint<unknown, unknown, unknown, unknown> | null => {
    let current: ApiSection | ApiEndpoint<unknown, unknown, unknown, unknown> =
      data;
    for (const segment of path) {
      const currentSegment = current[segment] as ApiSection;
      if (!currentSegment) {
        return null;
      }
      current = currentSegment;
    }
    return current;
  };

  // Check if a section is part of the active path
  const isActiveSection = (sectionPath: string[]): boolean => {
    if (sectionPath.length > activeEndpoint.path.length) {
      return false;
    }

    for (let i = 0; i < sectionPath.length; i++) {
      if (sectionPath[i] !== activeEndpoint.path[i]) {
        return false;
      }
    }

    return true;
  };

  // Format section name for display
  const formatSectionName = (name: string): string => {
    return (
      name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")
    );
  };

  // Get endpoint description
  const getEndpointDescription = (path: string[], method: string): string => {
    try {
      const sectionData = getCurrentSection(endpoints, path);
      if (
        sectionData &&
        typeof sectionData === "object" &&
        method in sectionData
      ) {
        const methodData = (sectionData as ApiSection)[method] as ApiEndpoint<
          unknown,
          unknown,
          unknown,
          unknown
        >;
        return methodData.description || path.join("/");
      }
      return path.join("/");
    } catch (e) {
      errorLogger("Error getting endpoint description", e);
      return path.join("/");
    }
  };

  // Get color based on HTTP method
  const getMethodColor = (method: string): string => {
    switch (method.toUpperCase()) {
      case "GET":
        return "text-green-600";
      case "POST":
        return "text-blue-600";
      case "PUT":
        return "text-yellow-600";
      case "DELETE":
        return "text-red-600";
      case "PATCH":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  // Render a specific endpoint (HTTP method)
  const renderEndpoint = (
    method: Methods,
    path: string[],
  ): JSX.Element | null => {
    const isSameMethod = method === activeEndpoint.method;
    const isSamePath = activeEndpoint.path.join("/") === path.join("/");
    const isActive = (isSameMethod && isSamePath) || false;

    return (
      <div
        key={`${path.join("-")}-${method}`}
        className={`py-1 px-2 text-xs cursor-pointer rounded ${
          isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-50"
        }`}
        onClick={() => onEndpointChange(path, method)}
      >
        <div className="flex items-center">
          <span className={`font-mono ${getMethodColor(method)}`}>
            {method}
          </span>
          <span className="ml-2">{getEndpointDescription(path, method)}</span>
        </div>
      </div>
    );
  };

  // Render a section with its endpoints
  const renderSection = (
    section: string,
    path: string[] = [],
  ): JSX.Element | null => {
    const currentPath = [...path, section];
    const currentSection = getCurrentSection(endpoints, currentPath);

    if (!currentSection) {
      return null;
    }

    const isEndpointGroup = !isHttpMethod(section);
    const isExpanded = expandedSections[section] ?? false;

    // Check if this is a leaf endpoint or a group
    const isLeaf =
      isHttpMethod(section) || Object.keys(currentSection).some(isHttpMethod);

    if (isLeaf && !isHttpMethod(section)) {
      // This is a leaf section with HTTP methods
      return (
        <div key={section} className="mb-2">
          <div
            className={`flex items-center justify-between py-2 px-2 text-sm cursor-pointer ${
              currentPath.join("/") === activeEndpoint.path.join("/")
                ? "bg-gray-100 rounded"
                : ""
            }`}
            onClick={() => toggleSection(section)}
          >
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              <span className="ml-1 font-medium">
                {formatSectionName(section)}
              </span>
            </div>
          </div>

          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {Object.keys(currentSection)
                .filter(isHttpMethod)
                .map((method) =>
                  renderEndpoint(method as Methods, [...currentPath]),
                )}
            </div>
          )}
        </div>
      );
    }

    if (isEndpointGroup) {
      // This is a group of endpoints or nested groups
      return (
        <div key={section} className="mb-2">
          <div
            className={`flex items-center justify-between py-2 px-2 text-sm cursor-pointer ${
              isActiveSection(currentPath) ? "bg-gray-100 rounded" : ""
            }`}
            onClick={() => toggleSection(section)}
          >
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              )}
              <span className="ml-1 font-medium">
                {formatSectionName(section)}
              </span>
            </div>
          </div>

          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {Object.keys(currentSection).map((subSection) => {
                return isHttpMethod(subSection)
                  ? renderEndpoint(subSection as Methods, currentPath)
                  : renderSection(subSection, currentPath);
              })}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // Get root sections to render
  const rootSections = Object.keys(endpoints).filter((section) => {
    // If in compact mode, only show sections that have the active endpoint
    if (compact) {
      return section === activeEndpoint.path[0];
    }
    return true;
  });

  return (
    <div className="border rounded-lg p-4">
      <h3 className="font-medium text-sm mb-4">API Endpoints</h3>
      <div className="space-y-1">
        {rootSections.map((section) => renderSection(section))}
      </div>
    </div>
  );
}
