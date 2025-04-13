import "server-only";

import type { SuccessResponseType } from "next-vibe/shared";
import type { LlmApiRequestType, LlmApiResponseType } from "../schema";
import { ChatMessageRole } from "../schema";

/**
 * Process chat messages and generate AI response
 * In a real implementation, this would call an actual LLM API
 */
export async function processChat(
  request: LlmApiRequestType,
): Promise<LlmApiResponseType> {
  const lastUserMessage = [...request.messages]
    .reverse()
    .find((m) => m.role === ChatMessageRole.USER);

  if (!lastUserMessage) {
    return {
      message: {
        role: ChatMessageRole.ASSISTANT,
        content:
          "Hello! I'm here to help you fill out this form. What information would you like to provide?",
        timestamp: Math.floor(new Date().getTime()),
      },
      parsedFields: {},
    };
  }

  const parsedFields: Record<string, unknown> = {};

  if (request.formSchema) {
    const fieldNames = Object.keys(request.formSchema);

    for (const fieldName of fieldNames) {
      const regex = new RegExp(`${fieldName}[:\\s=]+([^,\\.\\n]+)`, "i");
      const match = lastUserMessage.content.match(regex);

      if (match?.[1]) {
        parsedFields[fieldName] = match[1].trim();
      }
    }
  }

  let responseContent = "";

  const getFieldDescription = (field: string): string => {
    return request.fieldDescriptions?.[field] || field;
  };

  const getMissingFields = (): string[] => {
    if (!request.formSchema) {
      return [];
    }
    return Object.keys(request.formSchema).filter(
      (field) => !parsedFields[field],
    );
  };

  const getAllFields = (): string[] => {
    if (!request.formSchema) {
      return [];
    }
    return Object.keys(request.formSchema);
  };

  if (Object.keys(parsedFields).length > 0) {
    responseContent = "I've captured the following information:\n\n";

    for (const [field, value] of Object.entries(parsedFields)) {
      responseContent += `- ${getFieldDescription(field)}: ${value}\n`;
    }

    const missingFields = getMissingFields();

    if (missingFields.length > 0) {
      responseContent += "\nI still need the following information:\n\n";

      for (const field of missingFields) {
        responseContent += `- ${getFieldDescription(field)}\n`;
      }
    } else {
      responseContent +=
        "\nGreat! I have all the information needed for the form. You can review and submit when ready.";
    }
  } else {
    if (lastUserMessage.content.toLowerCase().includes("submit")) {
      const missingFields = getMissingFields();

      if (missingFields.length > 0) {
        responseContent =
          "I can't submit the form yet because some required information is missing:\n\n";

        for (const field of missingFields) {
          responseContent += `- ${getFieldDescription(field)}\n`;
        }
      } else {
        responseContent = "I'm submitting the form now...";
      }
    } else {
      responseContent =
        "I couldn't extract any specific information for the form fields. Could you please provide details in a format like 'field: value'?";

      const allFields = getAllFields();
      if (allFields.length > 0) {
        responseContent +=
          "\n\nHere are the fields I need information for:\n\n";

        for (const field of allFields) {
          responseContent += `- ${getFieldDescription(field)}\n`;
        }
      }
    }
  }

  return {
    message: {
      role: ChatMessageRole.ASSISTANT,
      content: responseContent,
      timestamp: Math.floor(new Date().getTime()),
    },
    parsedFields,
  };
}

/**
 * Handle POST request for AI chat
 */
export async function postChat({
  data: requestData,
  urlVariables: _urlVariables,
  user: _user,
}: {
  data: LlmApiRequestType;
  urlVariables: undefined;
  user: { id: string };
}): Promise<SuccessResponseType<LlmApiResponseType>> {
  const response = await processChat(requestData);
  return { success: true, data: response };
}
