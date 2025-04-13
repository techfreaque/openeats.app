import { db } from "../../../src/db";
import { printerGroupService } from "../../../src/services/groups";

// Mock the printer service
jest.mock("../../../src/printing", () => {
  return {
    printerService: {
      getPrinters: jest.fn().mockResolvedValue([
        { name: "Printer1", isDefault: true, status: "idle" },
        { name: "Printer2", isDefault: false, status: "idle" },
        { name: "Printer3", isDefault: false, status: "error" },
      ]),
    },
  };
});

describe("Printer Group Service", () => {
  beforeEach(async () => {
    // Clear the database before each test
    const database = await db;
    await database.exec("DELETE FROM printer_groups");
    await database.exec("DELETE FROM group_printers");
    await database.exec("DELETE FROM key_value");

    // Reset mocks
    jest.clearAllMocks();
  });

  describe("createGroup", () => {
    it("should create a new printer group", async () => {
      const group = {
        name: "Test Group",
        description: "Test Description",
        printers: ["Printer1", "Printer2"],
        balancingStrategy: "round-robin" as const,
        active: true,
      };

      const id = await printerGroupService.createGroup(group);

      expect(id).toBeDefined();

      // Check if group was added to the database
      const database = await db;
      const dbGroup = await database.get(
        "SELECT * FROM printer_groups WHERE id = ?",
        [id],
      );

      expect(dbGroup).toBeDefined();
      expect(dbGroup.name).toBe(group.name);
      expect(dbGroup.description).toBe(group.description);
      expect(dbGroup.balancing_strategy).toBe(group.balancingStrategy);
      expect(Boolean(dbGroup.active)).toBe(group.active);

      // Check if printers were added
      const printers = await database.all(
        "SELECT * FROM group_printers WHERE group_id = ?",
        [id],
      );
      expect(printers).toHaveLength(2);
    });
  });

  describe("getGroups", () => {
    it("should return all printer groups", async () => {
      // Add some groups
      await printerGroupService.createGroup({
        name: "Group 1",
        printers: ["Printer1"],
        balancingStrategy: "round-robin",
        active: true,
      });

      await printerGroupService.createGroup({
        name: "Group 2",
        printers: ["Printer2"],
        balancingStrategy: "least-busy",
        active: false,
      });

      const groups = await printerGroupService.getGroups();

      expect(groups).toHaveLength(2);
      expect(groups[0].name).toBe("Group 1");
      expect(groups[1].name).toBe("Group 2");
      expect(groups[0].active).toBe(true);
      expect(groups[1].active).toBe(false);
    });
  });

  describe("getGroup", () => {
    it("should return a specific group", async () => {
      const id = await printerGroupService.createGroup({
        name: "Test Group",
        printers: ["Printer1", "Printer2"],
        balancingStrategy: "round-robin",
        active: true,
      });

      const group = await printerGroupService.getGroup(id);

      expect(group).toBeDefined();
      expect(group?.id).toBe(id);
      expect(group?.name).toBe("Test Group");
      expect(group?.printers).toEqual(["Printer1", "Printer2"]);
      expect(group?.balancingStrategy).toBe("round-robin");
      expect(group?.active).toBe(true);
    });

    it("should return null for non-existent group", async () => {
      const group = await printerGroupService.getGroup("non-existent-id");

      expect(group).toBeNull();
    });
  });

  describe("updateGroup", () => {
    it("should update a group", async () => {
      const id = await printerGroupService.createGroup({
        name: "Original Name",
        description: "Original Description",
        printers: ["Printer1"],
        balancingStrategy: "round-robin",
        active: true,
      });

      const updates = {
        name: "Updated Name",
        description: "Updated Description",
        printers: ["Printer2", "Printer3"],
        balancingStrategy: "least-busy" as const,
        active: false,
      };

      await printerGroupService.updateGroup(id, updates);

      const group = await printerGroupService.getGroup(id);

      expect(group?.name).toBe(updates.name);
      expect(group?.description).toBe(updates.description);
      expect(group?.printers).toEqual(updates.printers);
      expect(group?.balancingStrategy).toBe(updates.balancingStrategy);
      expect(group?.active).toBe(updates.active);
    });

    it("should throw error for non-existent group", async () => {
      await expect(
        printerGroupService.updateGroup("non-existent-id", {
          name: "New Name",
        }),
      ).rejects.toThrow("Printer group non-existent-id not found");
    });
  });

  describe("deleteGroup", () => {
    it("should delete a group", async () => {
      const id = await printerGroupService.createGroup({
        name: "Test Group",
        printers: ["Printer1"],
        balancingStrategy: "round-robin",
        active: true,
      });

      await printerGroupService.deleteGroup(id);

      const group = await printerGroupService.getGroup(id);
      expect(group).toBeNull();

      // Check if printers were deleted
      const database = await db;
      const printers = await database.all(
        "SELECT * FROM group_printers WHERE group_id = ?",
        [id],
      );
      expect(printers).toHaveLength(0);
    });

    it("should throw error for non-existent group", async () => {
      await expect(
        printerGroupService.deleteGroup("non-existent-id"),
      ).rejects.toThrow("Printer group non-existent-id not found");
    });
  });

  describe("assignPrinters", () => {
    it("should assign printers to a group", async () => {
      const id = await printerGroupService.createGroup({
        name: "Test Group",
        printers: ["Printer1"],
        balancingStrategy: "round-robin",
        active: true,
      });

      await printerGroupService.assignPrinters(id, ["Printer2", "Printer3"]);

      const group = await printerGroupService.getGroup(id);
      expect(group?.printers).toEqual(["Printer2", "Printer3"]);
    });

    it("should throw error for non-existent group", async () => {
      await expect(
        printerGroupService.assignPrinters("non-existent-id", ["Printer1"]),
      ).rejects.toThrow("Printer group non-existent-id not found");
    });
  });

  describe("getGroupStatus", () => {
    it("should return group status with printer information", async () => {
      const id = await printerGroupService.createGroup({
        name: "Test Group",
        printers: ["Printer1", "Printer2", "Printer3"],
        balancingStrategy: "round-robin",
        active: true,
      });

      const status = await printerGroupService.getGroupStatus(id);

      expect(status).toBeDefined();
      expect(status.id).toBe(id);
      expect(status.name).toBe("Test Group");
      expect(status.active).toBe(true);
      expect(status.printers).toHaveLength(3);

      // Check printer status
      const printer1 = status.printers.find((p) => p.name === "Printer1");
      const printer3 = status.printers.find((p) => p.name === "Printer3");

      expect(printer1?.status).toBe("idle");
      expect(printer3?.status).toBe("error");
    });

    it("should throw error for non-existent group", async () => {
      await expect(
        printerGroupService.getGroupStatus("non-existent-id"),
      ).rejects.toThrow("Printer group non-existent-id not found");
    });
  });

  describe("selectPrinterFromGroup", () => {
    it("should select a printer using round-robin strategy", async () => {
      const id = await printerGroupService.createGroup({
        name: "Test Group",
        printers: ["Printer1", "Printer2"],
        balancingStrategy: "round-robin",
        active: true,
      });

      const printer1 = await printerGroupService.selectPrinterFromGroup(id);
      expect(printer1).toBe("Printer1");

      const printer2 = await printerGroupService.selectPrinterFromGroup(id);
      expect(printer2).toBe("Printer2");

      const printer1Again =
        await printerGroupService.selectPrinterFromGroup(id);
      expect(printer1Again).toBe("Printer1");
    });

    it("should select a printer using least-busy strategy", async () => {
      const id = await printerGroupService.createGroup({
        name: "Test Group",
        printers: ["Printer1", "Printer2"],
        balancingStrategy: "least-busy",
        active: true,
      });

      // Add a job for Printer1
      const database = await db;
      await database.run(
        `INSERT INTO print_jobs (id, status, created_at, updated_at, file_name, printer)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          "job1",
          "pending",
          new Date().toISOString(),
          new Date().toISOString(),
          "test.txt",
          "Printer1",
        ],
      );

      const printer = await printerGroupService.selectPrinterFromGroup(id);
      expect(printer).toBe("Printer2");
    });

    it("should select a printer using failover strategy", async () => {
      const id = await printerGroupService.createGroup({
        name: "Test Group",
        printers: ["Printer3", "Printer1"],
        balancingStrategy: "failover",
        active: true,
      });

      const printer = await printerGroupService.selectPrinterFromGroup(id);
      expect(printer).toBe("Printer1");
    });

    it("should return null for inactive group", async () => {
      const id = await printerGroupService.createGroup({
        name: "Test Group",
        printers: ["Printer1"],
        balancingStrategy: "round-robin",
        active: false,
      });

      const printer = await printerGroupService.selectPrinterFromGroup(id);
      expect(printer).toBeNull();
    });

    it("should return null for non-existent group", async () => {
      const printer =
        await printerGroupService.selectPrinterFromGroup("non-existent-id");
      expect(printer).toBeNull();
    });
  });
});
