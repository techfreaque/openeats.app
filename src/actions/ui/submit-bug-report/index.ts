"use server";

import { z } from "zod";

import { prisma } from "@/next-portal/db";
import { errorLogger } from "@/next-portal/utils/logger";

const bugReportSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
  reportType: z.string().max(100, "Title is too long"),
  severity: z.string().max(100, "Title is too long"),
  steps: z.string().max(500, "Title is too long").optional(),
});

type BugReportInput = z.infer<typeof bugReportSchema>;

export async function submitBugReport(
  input: BugReportInput,
  userId: string | null,
): Promise<
  | {
      success: boolean;
      error: string;
      data?: undefined;
    }
  | {
      success: boolean;
      data: {
        title: string;
        description: string;
        reportType: string;
        severity: string;
        steps: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
      };
      error?: undefined;
    }
> {
  try {
    if (!userId) {
      return {
        success: false,
        error: "You must be logged in to submit a bug report.",
      };
    }

    const validatedInput = bugReportSchema.parse(input);

    const bugReport = await prisma.bugReport.create({
      data: {
        title: validatedInput.title,
        description: validatedInput.description,
        reportType: validatedInput.reportType,
        severity: validatedInput.severity,
        steps: validatedInput.steps,
        userId: userId,
      },
    });

    return { success: true, data: bugReport };
  } catch (error) {
    errorLogger("Error in submitBugReport:", error);
    throw error;
  }
}
