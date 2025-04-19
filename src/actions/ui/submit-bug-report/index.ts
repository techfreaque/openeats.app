"use server";

import { db } from "next-vibe/server/db";
import { errorLogger } from "next-vibe/shared/utils/logger";
import { z } from "zod";

import { bugReports } from "@/app/api/v1/bug-reports/db";

const bugReportSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description is too long"),
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
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string | null;
        resolved: boolean;
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

    // Insert the bug report using Drizzle
    const [bugReport] = await db
      .insert(bugReports)
      .values({
        title: validatedInput.title,
        description: validatedInput.description,
        userId,
      })
      .returning();

    if (!bugReport) {
      return {
        success: false,
        error: "Failed to create bug report.",
      };
    }

    return {
      success: true,
      data: bugReport,
    };
  } catch (error) {
    errorLogger("Error in submitBugReport:", error);
    throw error;
  }
}
