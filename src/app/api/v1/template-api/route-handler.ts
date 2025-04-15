/**
 * Template API route handlers
 * This file contains the implementation of the API route handlers
 */

import type { ApiHandlerFunction } from "next-vibe/server/endpoints/core/api-handler";
import { ErrorResponseTypes } from "next-vibe/shared";
import { debugLogger } from "next-vibe/shared/utils/logger";

import { templateRepository } from "./repository";
import type {
  TemplatePostRequestType,
  TemplatePostRequestUrlParamsType,
  TemplateResponseType,
} from "./schema";

/**
 * Create a new template
 */
export const createTemplate: ApiHandlerFunction<
  TemplatePostRequestType,
  TemplateResponseType,
  TemplatePostRequestUrlParamsType
> = async (props) => {
  try {
    const { data, urlVariables, user } = props;

    // Log request data for debugging
    debugLogger("Template create request", { data, urlVariables, user });

    // Validate input data
    if (!data || typeof data.someInputValue !== "string") {
      return {
        success: false,
        message: "Invalid input data",
        errorType: ErrorResponseTypes.VALIDATION_ERROR,
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
};

/**
 * Get templates
 */
export const getTemplate: ApiHandlerFunction<
  TemplatePostRequestType,
  TemplateResponseType,
  TemplatePostRequestUrlParamsType
> = async (props) => {
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
      errorType: ErrorResponseTypes.HTTP_ERROR,
      errorCode: 500,
    };
  }
};

/**
 * Update a template
 */
export const updateTemplate: ApiHandlerFunction<
  TemplatePostRequestType,
  TemplateResponseType,
  TemplatePostRequestUrlParamsType
> = async (props) => {
  try {
    const { data, urlVariables, user } = props;

    // Log request data for debugging
    debugLogger("Template update request", { data, urlVariables, user });

    // Validate input data
    if (!urlVariables?.someValueFromTheRouteUrl) {
      return {
        success: false,
        message: "Missing URL parameters",
        errorType: ErrorResponseTypes.VALIDATION_ERROR,
      };
    }

    if (!data || typeof data.someInputValue !== "string") {
      return {
        success: false,
        message: "Invalid input data",
        errorType: ErrorResponseTypes.VALIDATION_ERROR,
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
};
