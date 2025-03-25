export const supportedllm = [
  "glhf",
  "together",
  "mistral:pixtral",
  "groq",
  "google",
  "openai",
];

export const isModelSupported = (modelId: string): boolean => {
  return supportedllm.some((llm) =>
    modelId.toLowerCase().startsWith(llm.toLowerCase()),
  );
};
