import type { FullUI } from "openeats-client/types/website-editor";

export type SubPrompts = FullUI["subPrompts"];

type SubPromptsArray = SubPrompts[] | undefined;

export const isParent = (
  subId: string,
  subPrompts?: SubPromptsArray,
): boolean => {
  if (!subPrompts) {
    return false;
  }

  const flatSubPrompts = subPrompts.flat();

  return flatSubPrompts.some((subPrompt) => {
    const subPromptParts = subPrompt.SUBId.split("-");
    const subIdParts = subId.split("-");

    return (
      subPromptParts.length > subIdParts.length &&
      subPromptParts.slice(0, subIdParts.length).join("-") === subId
    );
  });
};
