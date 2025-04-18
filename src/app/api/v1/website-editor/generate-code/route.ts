import { generateText } from "ai";
import { z } from "zod";

import { trimCode } from "@/lib/website-editor/code";
import { llm } from "@/lib/website-editor/llm";
import { getGenerationPrompt } from "@/lib/website-editor/prompt";
import { UiType } from "@/lib/website-editor/types";
import { errorLogger } from "@/packages/next-vibe/shared/utils/logger";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  codeDescription: z.string().min(1, "Code description is required"),
  modelId: z.string(),
  uiType: z.nativeEnum(UiType),
});

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { codeDescription, modelId, uiType } = inputSchema.parse(body);

    const result = await generateText({
      model: llm(modelId),
      messages: [
        {
          role: "system",
          content: getGenerationPrompt(uiType),
        },
        {
          role: "user",
          content: `Now generate React code for this: ${codeDescription} `,
        },
      ],
    });

    const { text } = result;

    //TODO revert 'fixed' to 'absolute' after fixing the bug in iframe
    const code = trimCode(
      text
        .replace(/```/g, "")
        .replace(/typescript|javascript|jsx|tsx|ts|js/g, "")
        .replace("asChild", " ")
        .replace("fixed", "absolute")
        .trim(),
    );

    return new Response(JSON.stringify(code), {
      headers: {
        "content-type": "application/json",
      },
    });
  } catch (error) {
    errorLogger("Error in API route:", error);
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid input", details: error.errors }),
        {
          status: 400,
          headers: { "content-type": "application/json" },
        },
      );
    }
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
