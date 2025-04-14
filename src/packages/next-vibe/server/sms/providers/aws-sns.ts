import { createHash, createHmac } from "crypto";

import type { ResponseType } from "../../../shared/types/response.schema";
import { ErrorResponseTypes } from "../../../shared/types/response.schema";
import { debugLogger } from "../../../shared/utils/logger";
import { env } from "../../env";
import type {
  SendSmsParams,
  SmsProvider,
  SmsResult,
  SmsResultMetadata,
} from "../utils";
import { SmsProviders } from "../utils";

export enum AwsSnsAwsRegions {
  US_EAST_1 = "us-east-1",
  US_WEST_1 = "us-west-1",
  US_WEST_2 = "us-west-2",
  EU_WEST_1 = "eu-west-1",
  EU_CENTRAL_1 = "eu-central-1",
  AP_SOUTHEAST_1 = "ap-southeast-1",
  AP_SOUTHEAST_2 = "ap-southeast-2",
  AP_NORTHEAST_1 = "ap-northeast-1",
  AP_NORTHEAST_2 = "ap-northeast-2",
  AP_SOUTH_1 = "ap-south-1",
  AP_EAST_1 = "ap-east-1",
  CA_CENTRAL_1 = "ca-central-1",
  SA_EAST_1 = "sa-east-1",
  AF_SOUTH_1 = "af-south-1",
  EU_SOUTH_1 = "eu-south-1",
  ME_SOUTH_1 = "me-south-1",
  EU_NORTH_1 = "eu-north-1",
}

// Define specific interfaces
interface AwsSnsMessageAttribute {
  DataType: string;
  StringValue: string;
}

interface AwsSnsMessageAttributes {
  [key: string]: AwsSnsMessageAttribute;
}

/**
 * Creates an AWS SNS provider instance
 * Implements AWS Signature Version 4 for secure API authentication
 */
export function getAwsSnsProvider(): SmsProvider {
  const accessKeyId = env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = env.AWS_SECRET_ACCESS_KEY;
  const region = env.AWS_REGION;

  // Validate credentials at initialization time
  if (!accessKeyId) {
    throw new Error("Missing AWS_ACCESS_KEY_ID environment variable");
  }

  if (!region) {
    throw new Error("Missing AWS_REGION environment variable");
  }

  if (!secretAccessKey) {
    throw new Error("Missing AWS_SECRET_ACCESS_KEY environment variable");
  }

  return {
    name: SmsProviders.AWS_SNS,

    async sendSms(params: SendSmsParams): Promise<ResponseType<SmsResult>> {
      try {
        debugLogger("Sending SMS via AWS SNS", { to: params.to });

        // Validate required parameters
        if (!params.to) {
          return {
            success: false,
            errorType: ErrorResponseTypes.VALIDATION_ERROR,
            message: "Recipient phone number (to) is required",
          };
        }

        if (!params.message || params.message.trim() === "") {
          return {
            success: false,
            errorType: ErrorResponseTypes.VALIDATION_ERROR,
            message: "Message content cannot be empty",
          };
        }

        // Prepare AWS SNS request
        const host = `sns.${region}.amazonaws.com`;
        const endpoint = `https://${host}/`;
        const dateStamp = new Date()
          .toISOString()
          .replace(/[:-]|\.\d{3}/g, "")
          .substring(0, 8);
        const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");

        // Create the canonical request
        const method = "POST";
        const canonicalUri = "/";
        const service = "sns";

        // Type-safe message attributes
        const messageAttributes: AwsSnsMessageAttributes = {};

        // Add sender ID if provided
        if (params.from) {
          messageAttributes["AWS.SNS.SMS.SenderID"] = {
            DataType: "String",
            StringValue: params.from,
          };
        }

        // Type-safe options handling

        const options = params.options;

        // Additional SMS attributes
        if (options && typeof options === "object" && options.smsType) {
          messageAttributes["AWS.SNS.SMS.SMSType"] = {
            DataType: "String",
            StringValue: options.smsType,
          };
        }

        // Add custom attributes with proper typing
        if (options && typeof options === "object" && options.attributes) {
          Object.entries(options.attributes).forEach(([key, value]) => {
            let stringValue: string;
            let dataType: string;

            if (typeof value === "string") {
              dataType = "String";
              stringValue = value;
            } else if (typeof value === "number") {
              dataType = "Number";
              stringValue = value.toString();
            } else if (typeof value === "boolean") {
              dataType = "String";
              stringValue = value.toString();
            } else {
              return; // Skip invalid types
            }

            messageAttributes[key] = {
              DataType: dataType,
              StringValue: stringValue,
            };
          });
        }

        // Build query parameters
        const requestParams = new URLSearchParams({
          Action: "Publish",
          Version: "2010-03-31",
          PhoneNumber: params.to,
          Message: params.message,
        });

        // Add message attributes if any
        if (Object.keys(messageAttributes).length > 0) {
          requestParams.append(
            "MessageAttributes",
            JSON.stringify(messageAttributes),
          );
        }

        // Generate AWS signature for request authentication
        const payload = requestParams.toString();
        const contentHash = createHash("sha256").update(payload).digest("hex");

        const canonicalHeaders = `${[
          `content-type:application/x-www-form-urlencoded`,
          `host:${host}`,
          `x-amz-content-sha256:${contentHash}`,
          `x-amz-date:${amzDate}`,
        ].join("\n")}\n`;

        const signedHeaders =
          "content-type;host;x-amz-content-sha256;x-amz-date";

        const canonicalRequest = [
          method,
          canonicalUri,
          "", // canonicalQueryString (empty for POST)
          canonicalHeaders,
          signedHeaders,
          contentHash,
        ].join("\n");

        const algorithm = "AWS4-HMAC-SHA256";
        const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
        const stringToSign = [
          algorithm,
          amzDate,
          credentialScope,
          createHash("sha256").update(canonicalRequest).digest("hex"),
        ].join("\n");

        // Calculate the signature
        const getSignatureKey = (
          key: string,
          dateStamp: string,
          regionName: string,
          serviceName: string,
        ): Buffer => {
          const kDate = createHmac("sha256", `AWS4${key}`)
            .update(dateStamp)
            .digest();
          const kRegion = createHmac("sha256", kDate)
            .update(regionName)
            .digest();
          const kService = createHmac("sha256", kRegion)
            .update(serviceName)
            .digest();
          const kSigning = createHmac("sha256", kService)
            .update("aws4_request")
            .digest();
          return kSigning;
        };

        const signatureKey = getSignatureKey(
          secretAccessKey,
          dateStamp,
          region,
          service,
        );
        const signature = createHmac("sha256", signatureKey)
          .update(stringToSign)
          .digest("hex");

        const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

        // Make the request to AWS SNS
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Host": host,
            "X-Amz-Date": amzDate,
            "X-Amz-Content-Sha256": contentHash,
            "Authorization": authorizationHeader,
          },
          body: payload,
        });

        if (!response.ok) {
          const errorText = await response.text();

          // Extract error message from XML response
          const errorMatch = errorText.match(/<Message>(.*?)<\/Message>/);
          const errorMessage = errorMatch
            ? errorMatch[1]
            : "Unknown AWS SNS API error";

          return {
            success: false,
            errorType: ErrorResponseTypes.SMS_ERROR,
            message: `AWS SNS API error: ${errorMessage}`,
            errorCode: response.status,
          };
        }

        // Parse XML response with proper error handling
        const responseText = await response.text();
        const messageIdMatch = responseText.match(
          /<MessageId>(.*?)<\/MessageId>/,
        );
        const messageId = messageIdMatch?.[1] ?? `sns-${Date.now()}`;

        const requestIdMatch = responseText.match(
          /<RequestId>(.*?)<\/RequestId>/,
        );

        // Create metadata object using conditional properties to handle exactOptionalPropertyTypes
        const metadata: SmsResultMetadata = {
          region,
          ...(requestIdMatch?.[1] && { requestId: requestIdMatch[1] }),
        };

        // Build the response object
        const responseData: SmsResult = {
          messageId,
          provider: SmsProviders.AWS_SNS,
          timestamp: new Date().toISOString(),
          to: params.to,
          metadata,
        };

        return {
          success: true,
          data: responseData,
        };
      } catch (error) {
        return {
          success: false,
          errorType: ErrorResponseTypes.SMS_ERROR,
          message: `AWS SNS error: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    },
  };
}
