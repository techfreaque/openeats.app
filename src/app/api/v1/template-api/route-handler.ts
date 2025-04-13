/**
 * Template API route handlers
 * This file contains the implementation of the API route handlers
 */

import type { ApiHandlerProps } from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger } from "next-vibe/shared/utils/logger";

import type { Template } from "./db";
import type {
  TemplatePostRequestType,
  TemplatePostRequestUrlParamsType,
} from "./schema";
import { templateRepository } from "./template.repository";

// Define the response type for success and error cases
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errorCode?: number;
}

// Define the template response data type
interface TemplateResponseData {
  template?: Template;
  someOutputValue: string;
}

// Define the templates response data type
interface TemplatesResponseData {
  templates?: Template[];
  someOutputValue: string;
}

/**
 * Create a new template
 */
export async function createTemplate(
  props: ApiHandlerProps<
    TemplatePostRequestType,
    TemplatePostRequestUrlParamsType
  >,
): Promise<ApiResponse<TemplateResponseData>> {
  try {
    const { data, urlVariables, user } = props;

    // Log request data for debugging
    debugLogger("Template create request", { data, urlVariables, user });

    // Validate input data
    if (!data || typeof data.someInputValue !== "string") {
      return {
        success: false,
        message: "Invalid input data",
        errorCode: 400,
      };
    }

    // Create a new template using the repository
    const newTemplate = await templateRepository.create({
      someValue: data.someInputValue,
    });

    // Return success response with the created template
    return {
      success: true,
      data: {
        template: newTemplate,
        someOutputValue: "Template created successfully",
      },
    };
  } catch (error) {
    // Log and return error
    debugLogger("Error creating template resource", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}

/**
 * Get templates
 */
export async function getTemplates(
  props: ApiHandlerProps<
    TemplatePostRequestType,
    TemplatePostRequestUrlParamsType
  >,
): Promise<ApiResponse<TemplatesResponseData>> {
  try {
    const { data, urlVariables, user } = props;

    // Log request data for debugging
    debugLogger("Template get request", { data, urlVariables, user });

    // Validate input data
    if (
      data?.someInputValue !== undefined &&
      typeof data.someInputValue !== "string"
    ) {
      return {
        success: false,
        message: "Invalid input data",
        errorCode: 400,
      };
    }

    // Fetch templates using the repository
    const templates = data?.someInputValue
      ? await templateRepository.findBySomeValue(data.someInputValue)
      : await templateRepository.findAll();

    // Return success response with the templates
    return {
      success: true,
      data: {
        templates,
        someOutputValue: "Templates retrieved successfully",
      },
    };
  } catch (error) {
    // Log and return error
    debugLogger("Error retrieving template resources", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}

/**
 * Update a template
 */
export async function updateTemplate(
  props: ApiHandlerProps<
    TemplatePostRequestType,
    TemplatePostRequestUrlParamsType
  >,
): Promise<ApiResponse<TemplateResponseData>> {
  try {
    const { data, urlVariables, user } = props;

    // Log request data for debugging
    debugLogger("Template update request", { data, urlVariables, user });

    // Validate input data
    if (!urlVariables?.someValueFromTheRouteUrl) {
      return {
        success: false,
        message: "Missing URL parameters",
        errorCode: 400,
      };
    }

    if (!data || typeof data.someInputValue !== "string") {
      return {
        success: false,
        message: "Invalid input data",
        errorCode: 400,
      };
    }

    // Update a template using the repository
    const updatedTemplate = await templateRepository.update(
      urlVariables.someValueFromTheRouteUrl,
      {
        someValue: data.someInputValue,
      },
    );

    // Check if the template was found and updated
    if (!updatedTemplate) {
      return {
        success: false,
        message: "Template not found",
        errorCode: 404,
      };
    }

    // Return success response with the updated template
    return {
      success: true,
      data: {
        template: updatedTemplate,
        someOutputValue: "Template updated successfully",
      },
    };
  } catch (error) {
    // Log and return error
    debugLogger("Error updating template resource", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      errorCode: 500,
    };
  }
}
