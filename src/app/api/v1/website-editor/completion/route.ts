import { vertex } from "@ai-sdk/google-vertex";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request): Promise<Response> {
  const { prompt }: { prompt: string } = await req.json();

  const result = streamText({
    model: vertex("gemini-1.5-pro"),
    prompt,
  });

  return result.toDataStreamResponse();
}
