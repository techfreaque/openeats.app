/**
 * Template API route handlers
 * This file contains the implementation of the API route handlers
 */

import type { ApiHandlerParams } from "next-vibe/server/endpoints/core/api-handler";
import { debugLogger } from "next-vibe/shared/utils/logger";

import type {
  TemplatePostRequestType,
  TemplatePostRequestUrlParamsType,
} from "./schema";
import { templateRepository } from "./template.repository";

/**
 * Create a new template
 */
export async function createTemplate({
  data,
  urlVariables,
  user,
}: ApiHandlerParams<
  TemplatePostRequestType,
  TemplatePostRequestUrlParamsType
>): Promise<{
  success: boolean;
  data?: {
    template?: unknown;
    someOutputValue: string;
  };
  message?: string;
  errorCode?: number;
}> {
  try {
    // Log request data for debugging
    debugLogger("Template create request", { data, urlVariables, user });

    // Create a new template using the repository
    const newTemplate = await templateRepository.create({
      someValue: data?.someInputValue ?? "",
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
export async function getTemplates({
  data,
  urlVariables,
  user,
}: ApiHandlerParams<
  TemplatePostRequestType,
  TemplatePostRequestUrlParamsType
>): Promise<{
  success: boolean;
  data?: {
    templates?: unknown[];
    someOutputValue: string;
  };
  message?: string;
  errorCode?: number;
}> {
  try {
    // Log request data for debugging
    debugLogger("Template get request", { data, urlVariables, user });

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
export async function updateTemplate({
  data,
  urlVariables,
  user,
}: ApiHandlerParams<
  TemplatePostRequestType,
  TemplatePostRequestUrlParamsType
>): Promise<{
  success: boolean;
  data?: {
    template?: unknown;
    someOutputValue: string;
  };
  message?: string;
  errorCode?: number;
}> {
  try {
    // Log request data for debugging
    debugLogger("Template update request", { data, urlVariables, user });

    // Update a template using the repository
    const updatedTemplate = await templateRepository.update(
      urlVariables?.someValueFromTheRouteUrl ?? "",
      {
        someValue: data?.someInputValue ?? "",
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
