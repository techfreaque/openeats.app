import { db } from "../../../src/db";
import { printerCategoryService } from "../../../src/services/categories";

describe("Printer Category Service", () => {
  beforeEach(async () => {
    // Clear the database before each test
    const database = await db;
    await database.exec("DELETE FROM printer_categories");
    await database.exec("DELETE FROM category_printers");
    await database.exec("DELETE FROM routing_rules");

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("createCategory", () => {
    it("should create a new printer category", async () => {
      const category = {
        name: "Test Category",
        description: "Test Description",
        printers: ["Printer1", "Printer2"],
        defaultOptions: { copies: 2 },
        routingRules: [
          {
            field: "order.type",
            pattern: "food",
            matchType: "exact" as const,
          },
        ],
      };

      const id = await printerCategoryService.createCategory(category);

      expect(id).toBeDefined();

      // Check if category was added to the database
      const database = await db;
      const dbCategory = await database.get(
        "SELECT * FROM printer_categories WHERE id = ?",
        [id],
      );

      expect(dbCategory).toBeDefined();
      expect(dbCategory.name).toBe(category.name);
      expect(dbCategory.description).toBe(category.description);

      // Check if printers were added
      const printers = await database.all(
        "SELECT * FROM category_printers WHERE category_id = ?",
        [id],
      );
      expect(printers).toHaveLength(2);

      // Check if routing rules were added
      const rules = await database.all(
        "SELECT * FROM routing_rules WHERE category_id = ?",
        [id],
      );
      expect(rules).toHaveLength(1);
      expect(rules[0].field).toBe(category.routingRules[0].field);
    });
  });

  describe("getCategories", () => {
    it("should return all printer categories", async () => {
      // Add some categories
      await printerCategoryService.createCategory({
        name: "Category 1",
        printers: ["Printer1"],
      });

      await printerCategoryService.createCategory({
        name: "Category 2",
        printers: ["Printer2"],
      });

      const categories = await printerCategoryService.getCategories();

      expect(categories).toHaveLength(2);
      expect(categories[0].name).toBe("Category 1");
      expect(categories[1].name).toBe("Category 2");
    });
  });

  describe("getCategory", () => {
    it("should return a specific category", async () => {
      const id = await printerCategoryService.createCategory({
        name: "Test Category",
        printers: ["Printer1"],
        routingRules: [
          {
            field: "order.type",
            pattern: "food",
            matchType: "exact" as const,
          },
        ],
      });

      const category = await printerCategoryService.getCategory(id);

      expect(category).toBeDefined();
      expect(category?.id).toBe(id);
      expect(category?.name).toBe("Test Category");
      expect(category?.printers).toEqual(["Printer1"]);
      expect(category?.routingRules).toHaveLength(1);
    });

    it("should return null for non-existent category", async () => {
      const category =
        await printerCategoryService.getCategory("non-existent-id");

      expect(category).toBeNull();
    });
  });

  describe("updateCategory", () => {
    it("should update a category", async () => {
      const id = await printerCategoryService.createCategory({
        name: "Original Name",
        description: "Original Description",
        printers: ["Printer1"],
        routingRules: [
          {
            field: "order.type",
            pattern: "food",
            matchType: "exact" as const,
          },
        ],
      });

      const updates = {
        name: "Updated Name",
        description: "Updated Description",
        printers: ["Printer2", "Printer3"],
        routingRules: [
          {
            field: "order.status",
            pattern: "ready",
            matchType: "exact" as const,
          },
        ],
      };

      await printerCategoryService.updateCategory(id, updates);

      const category = await printerCategoryService.getCategory(id);

      expect(category?.name).toBe(updates.name);
      expect(category?.description).toBe(updates.description);
      expect(category?.printers).toEqual(updates.printers);
      expect(category?.routingRules).toHaveLength(1);
      expect(category?.routingRules?.[0].field).toBe(
        updates.routingRules[0].field,
      );
    });

    it("should throw error for non-existent category", async () => {
      await expect(
        printerCategoryService.updateCategory("non-existent-id", {
          name: "New Name",
        }),
      ).rejects.toThrow("Printer category non-existent-id not found");
    });
  });

  describe("deleteCategory", () => {
    it("should delete a category", async () => {
      const id = await printerCategoryService.createCategory({
        name: "Test Category",
        printers: ["Printer1"],
      });

      await printerCategoryService.deleteCategory(id);

      const category = await printerCategoryService.getCategory(id);
      expect(category).toBeNull();

      // Check if printers were deleted
      const database = await db;
      const printers = await database.all(
        "SELECT * FROM category_printers WHERE category_id = ?",
        [id],
      );
      expect(printers).toHaveLength(0);
    });

    it("should throw error for non-existent category", async () => {
      await expect(
        printerCategoryService.deleteCategory("non-existent-id"),
      ).rejects.toThrow("Printer category non-existent-id not found");
    });
  });

  describe("assignPrinters", () => {
    it("should assign printers to a category", async () => {
      const id = await printerCategoryService.createCategory({
        name: "Test Category",
        printers: ["Printer1"],
      });

      await printerCategoryService.assignPrinters(id, ["Printer2", "Printer3"]);

      const category = await printerCategoryService.getCategory(id);
      expect(category?.printers).toEqual(["Printer2", "Printer3"]);
    });

    it("should throw error for non-existent category", async () => {
      await expect(
        printerCategoryService.assignPrinters("non-existent-id", ["Printer1"]),
      ).rejects.toThrow("Printer category non-existent-id not found");
    });
  });

  describe("findCategoryForJob", () => {
    it("should find a category based on exact match rule", async () => {
      await printerCategoryService.createCategory({
        name: "Food Category",
        printers: ["Kitchen Printer"],
        routingRules: [
          {
            field: "order.type",
            pattern: "food",
            matchType: "exact" as const,
          },
        ],
      });

      const jobData = {
        order: {
          type: "food",
          items: ["Pizza", "Pasta"],
        },
      };

      const category = await printerCategoryService.findCategoryForJob(jobData);

      expect(category).toBeDefined();
      expect(category?.name).toBe("Food Category");
    });

    it("should find a category based on contains match rule", async () => {
      await printerCategoryService.createCategory({
        name: "Drink Category",
        printers: ["Bar Printer"],
        routingRules: [
          {
            field: "order.items",
            pattern: "Coffee",
            matchType: "contains" as const,
          },
        ],
      });

      const jobData = {
        order: {
          type: "drink",
          items: ["Coffee", "Tea"],
        },
      };

      const category = await printerCategoryService.findCategoryForJob(jobData);

      expect(category).toBeDefined();
      expect(category?.name).toBe("Drink Category");
    });

    it("should find a category based on regex match rule", async () => {
      await printerCategoryService.createCategory({
        name: "Special Category",
        printers: ["Special Printer"],
        routingRules: [
          {
            field: "order.id",
            pattern: "^SP-\\d+$",
            matchType: "regex" as const,
          },
        ],
      });

      const jobData = {
        order: {
          id: "SP-12345",
          type: "special",
        },
      };

      const category = await printerCategoryService.findCategoryForJob(jobData);

      expect(category).toBeDefined();
      expect(category?.name).toBe("Special Category");
    });

    it("should return null if no category matches", async () => {
      await printerCategoryService.createCategory({
        name: "Food Category",
        printers: ["Kitchen Printer"],
        routingRules: [
          {
            field: "order.type",
            pattern: "food",
            matchType: "exact" as const,
          },
        ],
      });

      const jobData = {
        order: {
          type: "drink",
          items: ["Coffee", "Tea"],
        },
      };

      const category = await printerCategoryService.findCategoryForJob(jobData);

      expect(category).toBeNull();
    });
  });
});
