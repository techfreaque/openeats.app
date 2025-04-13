/**
 * Template repository implementation
 * Provides database access for template-related operations
 */

import { eq } from "drizzle-orm";
import type { DbId } from "next-vibe/server/db/types";

import { db } from "../../../api/db";
import { ApiRepositoryImpl } from "../../../api/db/repository";
import type { NewTemplate, selectTemplateSchema, Template } from "./db";
import { insertTemplateSchema, templates } from "./db";

/**
 * Template repository interface
 * Extends the base repository with template-specific operations
 */
export interface TemplateRepository {
  /**
   * Find all templates
   */
  findAll(): Promise<Template[]>;

  /**
   * Find a template by ID
   * @param id - The template ID
   */
  findById(id: DbId): Promise<Template | undefined>;

  /**
   * Create a new template
   * @param data - The template data
   */
  create(data: NewTemplate): Promise<Template>;

  /**
   * Update a template
   * @param id - The template ID
   * @param data - The template data
   */
  update(id: DbId, data: Partial<NewTemplate>): Promise<Template | undefined>;

  /**
   * Delete a template
   * @param id - The template ID
   */
  delete(id: DbId): Promise<boolean>;

  /**
   * Find templates by some value
   * @param someValue - The value to search for
   */
  findBySomeValue(someValue: string): Promise<Template[]>;
}

/**
 * Template repository implementation
 */
export class TemplateRepositoryImpl
  extends ApiRepositoryImpl<
    typeof templates,
    Template,
    NewTemplate,
    typeof selectTemplateSchema
  >
  implements TemplateRepository
{
  /**
   * Constructor
   */
  constructor() {
    super(templates, insertTemplateSchema);
  }

  /**
   * Find templates by some value
   * @param someValue - The value to search for
   */
  async findBySomeValue(someValue: string): Promise<Template[]> {
    return await (db
      .select()
      .from(templates)
      .where(eq(templates.someValue, someValue)) as Promise<Template[]>);
  }
}

// Export a singleton instance of the repository
export const templateRepository = new TemplateRepositoryImpl();
