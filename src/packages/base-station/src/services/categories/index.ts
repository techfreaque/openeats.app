import { v4 as uuidv4 } from "uuid";

import { db } from "../../db";
import logger, { logError } from "../../logging";
import type { PrinterCategory } from "../../types";

class PrinterCategoryService {
  // Create a new printer category
  async createCategory(category: Omit<PrinterCategory, "id">): Promise<string> {
    try {
      const database = await db;

      const id = uuidv4();
      const now = new Date().toISOString();

      await database.run(
        `INSERT INTO printer_categories (
          id, name, description, created_at, updated_at, default_options
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          id,
          category.name,
          category.description || null,
          now,
          now,
          JSON.stringify(category.defaultOptions || {}),
        ],
      );

      // Add printers to the category
      if (category.printers && category.printers.length > 0) {
        const stmt = await database.prepare(
          `INSERT INTO category_printers (category_id, printer_name) VALUES (?, ?)`,
        );

        for (const printer of category.printers) {
          await stmt.run(id, printer);
        }

        await stmt.finalize();
      }

      // Add routing rules
      if (category.routingRules && category.routingRules.length > 0) {
        const stmt = await database.prepare(
          `INSERT INTO routing_rules (
            id, category_id, field, pattern, match_type, created_at
          ) VALUES (?, ?, ?, ?, ?, ?)`,
        );

        for (const rule of category.routingRules) {
          await stmt.run(
            uuidv4(),
            id,
            rule.field,
            rule.pattern,
            rule.matchType,
            now,
          );
        }

        await stmt.finalize();
      }

      logger.info(`Created printer category: ${category.name} (${id})`);

      return id;
    } catch (error) {
      logError("Failed to create printer category", error);
      throw error;
    }
  }

  // Get all printer categories
  async getCategories(): Promise<PrinterCategory[]> {
    try {
      const database = await db;

      // Get categories
      const categories = await database.all(
        `SELECT id, name, description, created_at, updated_at, default_options
         FROM printer_categories
         ORDER BY name`,
      );

      // Get printers for each category
      const result: PrinterCategory[] = [];

      for (const category of categories) {
        const printers = await database.all(
          `SELECT printer_name
           FROM category_printers
           WHERE category_id = ?`,
          [category.id],
        );

        const routingRules = await database.all(
          `SELECT id, field, pattern, match_type
           FROM routing_rules
           WHERE category_id = ?`,
          [category.id],
        );

        result.push({
          id: category.id,
          name: category.name,
          description: category.description,
          printers: printers.map((p) => p.printer_name),
          defaultOptions: JSON.parse(category.default_options || "{}"),
          routingRules: routingRules.map((r) => ({
            id: r.id,
            field: r.field,
            pattern: r.pattern,
            matchType: r.match_type as "exact" | "contains" | "regex",
          })),
        });
      }

      return result;
    } catch (error) {
      logError("Failed to get printer categories", error);
      throw error;
    }
  }

  // Get a specific printer category
  async getCategory(id: string): Promise<PrinterCategory | null> {
    try {
      const database = await db;

      // Get category
      const category = await database.get(
        `SELECT id, name, description, created_at, updated_at, default_options
         FROM printer_categories
         WHERE id = ?`,
        [id],
      );

      if (!category) {
        return null;
      }

      // Get printers for the category
      const printers = await database.all(
        `SELECT printer_name
         FROM category_printers
         WHERE category_id = ?`,
        [id],
      );

      // Get routing rules
      const routingRules = await database.all(
        `SELECT id, field, pattern, match_type
         FROM routing_rules
         WHERE category_id = ?`,
        [id],
      );

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        printers: printers.map((p) => p.printer_name),
        defaultOptions: JSON.parse(category.default_options || "{}"),
        routingRules: routingRules.map((r) => ({
          id: r.id,
          field: r.field,
          pattern: r.pattern,
          matchType: r.match_type as "exact" | "contains" | "regex",
        })),
      };
    } catch (error) {
      logError(`Failed to get printer category ${id}`, error);
      throw error;
    }
  }

  // Update a printer category
  async updateCategory(
    id: string,
    updates: Partial<Omit<PrinterCategory, "id">>,
  ): Promise<void> {
    try {
      const database = await db;
      const now = new Date().toISOString();

      // Check if category exists
      const category = await this.getCategory(id);

      if (!category) {
        throw new Error(`Printer category ${id} not found`);
      }

      // Update category
      if (updates.name || updates.description || updates.defaultOptions) {
        await database.run(
          `UPDATE printer_categories
           SET name = ?, description = ?, default_options = ?, updated_at = ?
           WHERE id = ?`,
          [
            updates.name || category.name,
            updates.description !== undefined
              ? updates.description
              : category.description,
            updates.defaultOptions
              ? JSON.stringify(updates.defaultOptions)
              : JSON.stringify(category.defaultOptions),
            now,
            id,
          ],
        );
      }

      // Update printers if provided
      if (updates.printers) {
        // Delete existing printers
        await database.run(
          `DELETE FROM category_printers WHERE category_id = ?`,
          [id],
        );

        // Add new printers
        if (updates.printers.length > 0) {
          const stmt = await database.prepare(
            `INSERT INTO category_printers (category_id, printer_name) VALUES (?, ?)`,
          );

          for (const printer of updates.printers) {
            await stmt.run(id, printer);
          }

          await stmt.finalize();
        }
      }

      // Update routing rules if provided
      if (updates.routingRules) {
        // Delete existing rules
        await database.run(`DELETE FROM routing_rules WHERE category_id = ?`, [
          id,
        ]);

        // Add new rules
        if (updates.routingRules.length > 0) {
          const stmt = await database.prepare(
            `INSERT INTO routing_rules (
              id, category_id, field, pattern, match_type, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)`,
          );

          for (const rule of updates.routingRules) {
            await stmt.run(
              uuidv4(),
              id,
              rule.field,
              rule.pattern,
              rule.matchType,
              now,
            );
          }

          await stmt.finalize();
        }
      }

      logger.info(`Updated printer category: ${category.name} (${id})`);
    } catch (error) {
      logError(`Failed to update printer category ${id}`, error);
      throw error;
    }
  }

  // Delete a printer category
  async deleteCategory(id: string): Promise<void> {
    try {
      const database = await db;

      // Check if category exists
      const category = await this.getCategory(id);

      if (!category) {
        throw new Error(`Printer category ${id} not found`);
      }

      // Delete category (cascade will delete printers and rules)
      await database.run(`DELETE FROM printer_categories WHERE id = ?`, [id]);

      logger.info(`Deleted printer category: ${category.name} (${id})`);
    } catch (error) {
      logError(`Failed to delete printer category ${id}`, error);
      throw error;
    }
  }

  // Assign printers to a category
  async assignPrinters(id: string, printers: string[]): Promise<void> {
    try {
      const database = await db;

      // Check if category exists
      const category = await this.getCategory(id);

      if (!category) {
        throw new Error(`Printer category ${id} not found`);
      }

      // Delete existing printers
      await database.run(
        `DELETE FROM category_printers WHERE category_id = ?`,
        [id],
      );

      // Add new printers
      if (printers.length > 0) {
        const stmt = await database.prepare(
          `INSERT INTO category_printers (category_id, printer_name) VALUES (?, ?)`,
        );

        for (const printer of printers) {
          await stmt.run(id, printer);
        }

        await stmt.finalize();
      }

      logger.info(`Assigned printers to category: ${category.name} (${id})`);
    } catch (error) {
      logError(`Failed to assign printers to category ${id}`, error);
      throw error;
    }
  }

  // Find category for a print job based on routing rules
  async findCategoryForJob(jobData: any): Promise<PrinterCategory | null> {
    try {
      const database = await db;

      // Get all categories with routing rules
      const categories = await this.getCategories();

      // Check each category's routing rules
      for (const category of categories) {
        if (!category.routingRules || category.routingRules.length === 0) {
          continue;
        }

        // Check if any rule matches
        const matches = category.routingRules.some((rule) => {
          // Get the field value from the job data
          const fieldValue = this.getNestedValue(jobData, rule.field);

          if (fieldValue === undefined) {
            return false;
          }

          // Check if the value matches the pattern
          switch (rule.matchType) {
            case "exact":
              return fieldValue === rule.pattern;
            case "contains":
              return String(fieldValue).includes(rule.pattern);
            case "regex":
              try {
                const regex = new RegExp(rule.pattern);
                return regex.test(String(fieldValue));
              } catch (error) {
                logger.error(`Invalid regex pattern: ${rule.pattern}`, error);
                return false;
              }
            default:
              return false;
          }
        });

        if (matches) {
          return category;
        }
      }

      return null;
    } catch (error) {
      logError("Failed to find category for job", error);
      return null;
    }
  }

  // Helper to get nested value from an object
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split(".");
    let value = obj;

    for (const key of keys) {
      if (value === null || value === undefined) {
        return undefined;
      }
      value = value[key];
    }

    return value;
  }
}

// Export a singleton instance
export const printerCategoryService = new PrinterCategoryService();
