import { testEndpoint } from "@/packages/next-vibe/testing/test-endpoint";
import { expect } from "vitest";

import definitions from "../definition";
import { ChatMessageRole } from "../schema";

testEndpoint(definitions.POST, {
  customTests: {
    "should handle chat messages and return AI response": async (test) => {
      const response = await test.executeWith({
        data: {
          messages: [
            {
              role: ChatMessageRole.USER,
              content: "I'd like to provide my name and email",
            },
          ],
          formSchema: {
            name: "string",
            email: "string",
          },
          fieldDescriptions: {
            name: "Your full name",
            email: "Your email address",
          },
        },
        urlParams: undefined,
      });
      
      expect(response.success).toBe(true);
      if (response.data) {
        expect(response.data.message).toBeDefined();
        expect(response.data.message.role).toBe(ChatMessageRole.ASSISTANT);
        expect(typeof response.data.message.content).toBe("string");
        expect(response.data.message.timestamp).toBeGreaterThan(0);
        
        if (response.data.parsedFields) {
          expect(typeof response.data.parsedFields).toBe("object");
        }
      }
    },
    
    "should handle empty messages array": async (test) => {
      const response = await test.executeWith({
        data: {
          messages: [
            {
              role: ChatMessageRole.SYSTEM,
              content: "",
            },
          ],
          formSchema: {
            name: "string",
          },
        },
        urlParams: undefined,
      });
      
      expect(response.success).toBe(true);
      if (response.data) {
        expect(response.data.message).toBeDefined();
        expect(response.data.message.role).toBe(ChatMessageRole.ASSISTANT);
      }
    },
  },
});
