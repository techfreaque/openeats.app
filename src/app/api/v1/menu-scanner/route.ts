import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

import type { MenuItemCreateType } from "@/client-package/schema/schemas";
import { menuItemCreateSchema } from "@/client-package/schema/schemas";
import { env } from "@/lib/env/env";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Parse the form data from the request
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;
    const restaurantId = formData.get("restaurantId") as string;

    // Validate request
    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 },
      );
    }

    // Convert image to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");

    // Call OpenAI API to analyze the menu image
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Extract all menu items from this restaurant menu image. For each item, provide the following information in a valid JSON array format:
              - name: The name of the dish
              - description: A description of the dish
              - price: The price as a number (without currency symbol)
              - category: The category the dish belongs to
              
              Return ONLY a valid JSON array containing the menu items.`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
    });

    // Extract the response text
    const content = response.choices[0].message.content;

    if (!content) {
      return NextResponse.json(
        { error: "Failed to extract menu items" },
        { status: 500 },
      );
    }

    // Parse the JSON from the response
    // Find JSON array in the response (in case there's additional text)
    const jsonMatch = content.match(/\[.*\]/s);
    let extractedItems = [];

    if (jsonMatch) {
      extractedItems = JSON.parse(jsonMatch[0]);
    } else {
      // Try parsing the whole response as JSON
      try {
        extractedItems = JSON.parse(content);
      } catch (e) {
        // TODO retry up to three times with the conversation history + the error message
        return NextResponse.json(
          { error: "Invalid response format from AI", raw: content },
          { status: 500 },
        );
      }
    }

    // Transform to MenuItem type
    const menuItems: MenuItemCreateType[] = [];
    const validationErrors: { item: any; errors: z.ZodError }[] = [];

    for (const item of extractedItems) {
      try {
        // Create a menu item object
        const menuItem = {
          id: crypto.randomUUID(),
          name: item.name || "Unknown Item",
          createdAt: new Date(),
          updatedAt: new Date(),
          description: item.description || "",
          restaurantId: restaurantId,
          price: parseFloat(item.price) || 0,
          category: item.category || "Uncategorized",
          isAvailable: true,
        };

        // Validate using the schema
        const validatedItem = menuItemCreateSchema.parse(menuItem);
        menuItems.push(validatedItem);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          validationErrors.push({ item, errors: validationError });
        }
      }
    }

    // If there are validation errors but some items were valid
    if (validationErrors.length > 0 && menuItems.length > 0) {
      return NextResponse.json({
        menuItems,
        warning: "Some items failed validation and were omitted",
        validationErrors: validationErrors.map((ve) => ({
          item: ve.item,
          errors: ve.errors.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        })),
      });
    }

    // If all items failed validation
    if (validationErrors.length > 0 && menuItems.length === 0) {
      return NextResponse.json(
        {
          error: "All extracted items failed validation",
          validationErrors: validationErrors.map((ve) => ({
            item: ve.item,
            errors: ve.errors.errors.map((e) => ({
              path: e.path.join("."),
              message: e.message,
            })),
          })),
        },
        { status: 422 },
      );
    }

    return NextResponse.json({ menuItems });
  } catch (error) {
    console.error("Error scanning menu:", error);
    return NextResponse.json(
      { error: "Failed to scan menu", details: (error as Error).message },
      { status: 500 },
    );
  }
}
