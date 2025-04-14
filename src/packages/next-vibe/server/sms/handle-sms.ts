import { performance } from "perf_hooks";

import type { UndefinedType } from "../../shared/types/common.schema";
import type { ResponseType } from "../../shared/types/response.schema";
import { ErrorResponseTypes } from "../../shared/types/response.schema";
import { debugLogger, errorLogger } from "../../shared/utils/logger";
import type { JwtPayloadType } from "../endpoints/auth/jwt";
import { env } from "../env";
import { batchSendSms, sendSms } from "./send-sms";
import type {
  SendSmsParams,
  SmsFunctionType,
  SmsHandlerOptions,
} from "./utils";

/**
 * Processes and handles SMS messages triggered by API responses
 */
export async function handleSms<TRequest, TResponse, TUrlVariables>({
  sms,
  user,
  responseData,
  urlVariables,
  requestData,
  options,
}: {
  sms:
    | {
        afterHandlerSms?: {
          ignoreErrors?: boolean;
          render: SmsFunctionType<TRequest, TResponse, TUrlVariables>;
        }[];
      }
    | undefined;
  user: JwtPayloadType;
  responseData: TResponse;
  urlVariables: TUrlVariables;
  requestData: TRequest;
  options?: SmsHandlerOptions;
}): Promise<ResponseType<UndefinedType>> {
  const startTime = options?.logPerformance ? performance.now() : null;
  const errors: string[] = [];
  let processedCount = 0;
  const maxMessageLength =
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    options?.maxMessageLength || parseInt(env.SMS_MAX_LENGTH || "160", 10);

  if (!sms?.afterHandlerSms || sms.afterHandlerSms.length === 0) {
    return { success: true, data: undefined };
  }

  debugLogger(`Processing ${sms.afterHandlerSms.length} SMS handlers`);

  try {
    await Promise.all(
      sms.afterHandlerSms.map(async (smsData) => {
        try {
          const renderResult = await smsData.render({
            user,
            urlVariables,
            requestData,
            responseData,
          });

          if (!renderResult.success) {
            if (!smsData.ignoreErrors) {
              errors.push(renderResult.message);
            }
            return;
          }

          // Handle both single messages and batch messages
          if (Array.isArray(renderResult.data)) {
            const messages: SendSmsParams[] = renderResult.data.map((msg) => {
              // Create a properly typed SMS params object with conditional properties
              const smsParams: SendSmsParams = {
                to: msg.to,
                message:
                  options?.enableTruncation &&
                  msg.message.length > maxMessageLength
                    ? `${msg.message.substring(0, maxMessageLength - 3)}...`
                    : msg.message,
                // Only include 'from' if it exists
                ...(msg.from && { from: msg.from }),
              };

              // Only include options if there are any to include
              if (msg.options) {
                // Build options object with only defined properties
                const optionsObj: Record<string, unknown> = {};

                if (msg.options.provider) {
                  optionsObj["provider"] = msg.options.provider;
                }
                if (msg.options.type) {
                  optionsObj["type"] = msg.options.type;
                }
                if (msg.options.datacoding) {
                  optionsObj["datacoding"] = msg.options.datacoding;
                }

                smsParams.options = optionsObj;
              }

              return smsParams;
            });

            const batchResult = await batchSendSms(messages);
            processedCount += messages.length;

            if (!batchResult.success && !smsData.ignoreErrors) {
              errors.push(batchResult.message);
            }
          } else {
            const _smsData: SendSmsParams = {
              ...renderResult.data,
              message:
                options?.enableTruncation &&
                renderResult.data.message.length > maxMessageLength
                  ? `${renderResult.data.message.substring(
                      0,
                      maxMessageLength - 3,
                    )}...`
                  : renderResult.data.message,
            };

            const smsResponse = await sendSms(_smsData);
            processedCount++;

            if (!smsData.ignoreErrors && !smsResponse.success) {
              errors.push(smsResponse.message);
            }
          }
        } catch (error) {
          const errorMessage = `Error processing SMS renderer: ${
            error instanceof Error ? error.message : "Unknown error"
          }`;
          errorLogger(errorMessage, error);

          if (!smsData.ignoreErrors) {
            errors.push(errorMessage);
          }
        }
      }),
    );
  } catch (error) {
    const errorMessage = `Error sending SMS: ${
      error instanceof Error ? error.message : "Unknown error"
    }`;
    errorLogger(errorMessage, error);
    errors.push(errorMessage);
  }

  if (startTime !== null) {
    const duration = performance.now() - startTime;
    debugLogger(
      `SMS processing completed in ${duration.toFixed(2)}ms. Processed: ${processedCount}, Errors: ${errors.length}`,
    );
  }

  if (errors.length) {
    return {
      success: false,
      message: errors.join(", "),
      errorType: ErrorResponseTypes.SMS_ERROR,
    };
  }

  return { success: true, data: undefined };
}
