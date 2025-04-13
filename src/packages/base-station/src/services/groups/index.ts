import { v4 as uuidv4 } from "uuid";

import { db } from "../../db";
import logger, { logError } from "../../logging";
import { printerService } from "../../printing";
import type { PrinterGroup } from "../../types";

interface PrinterStatus {
  name: string;
  status: string;
  jobCount: number;
}

class PrinterGroupService {
  // Create a new printer group
  async createGroup(group: Omit<PrinterGroup, "id">): Promise<string> {
    try {
      const database = await db;

      const id = uuidv4();
      const now = new Date().toISOString();

      await database.run(
        `INSERT INTO printer_groups (
          id, name, description, balancing_strategy, active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          group.name,
          group.description || null,
          group.balancingStrategy,
          group.active ? 1 : 0,
          now,
          now,
        ],
      );

      // Add printers to the group
      if (group.printers && group.printers.length > 0) {
        const stmt = await database.prepare(
          `INSERT INTO group_printers (group_id, printer_name, priority) VALUES (?, ?, ?)`,
        );

        for (let i = 0; i < group.printers.length; i++) {
          const printer = group.printers[i];
          // Use index as priority (lower index = higher priority)
          await stmt.run(id, printer, i + 1);
        }

        await stmt.finalize();
      }

      logger.info(`Created printer group: ${group.name} (${id})`);

      return id;
    } catch (error) {
      logError("Failed to create printer group", error);
      throw error;
    }
  }

  // Get all printer groups
  async getGroups(): Promise<PrinterGroup[]> {
    try {
      const database = await db;

      // Get groups
      const groups = await database.all(
        `SELECT id, name, description, balancing_strategy, active, created_at, updated_at
         FROM printer_groups
         ORDER BY name`,
      );

      // Get printers for each group
      const result: PrinterGroup[] = [];

      for (const group of groups) {
        const printers = await database.all(
          `SELECT printer_name
           FROM group_printers
           WHERE group_id = ?
           ORDER BY priority`,
          [group.id],
        );

        result.push({
          id: group.id,
          name: group.name,
          description: group.description,
          printers: printers.map((p) => p.printer_name),
          balancingStrategy: group.balancing_strategy,
          active: Boolean(group.active),
        });
      }

      return result;
    } catch (error) {
      logError("Failed to get printer groups", error);
      throw error;
    }
  }

  // Get a specific printer group
  async getGroup(id: string): Promise<PrinterGroup | null> {
    try {
      const database = await db;

      // Get group
      const group = await database.get(
        `SELECT id, name, description, balancing_strategy, active, created_at, updated_at
         FROM printer_groups
         WHERE id = ?`,
        [id],
      );

      if (!group) {
        return null;
      }

      // Get printers for the group
      const printers = await database.all(
        `SELECT printer_name
         FROM group_printers
         WHERE group_id = ?
         ORDER BY priority`,
        [id],
      );

      return {
        id: group.id,
        name: group.name,
        description: group.description,
        printers: printers.map((p) => p.printer_name),
        balancingStrategy: group.balancing_strategy,
        active: Boolean(group.active),
      };
    } catch (error) {
      logError(`Failed to get printer group ${id}`, error);
      throw error;
    }
  }

  // Update a printer group
  async updateGroup(
    id: string,
    updates: Partial<Omit<PrinterGroup, "id">>,
  ): Promise<void> {
    try {
      const database = await db;
      const now = new Date().toISOString();

      // Check if group exists
      const group = await this.getGroup(id);

      if (!group) {
        throw new Error(`Printer group ${id} not found`);
      }

      // Update group
      if (
        updates.name !== undefined ||
        updates.description !== undefined ||
        updates.balancingStrategy !== undefined ||
        updates.active !== undefined
      ) {
        await database.run(
          `UPDATE printer_groups
           SET name = ?, description = ?, balancing_strategy = ?, active = ?, updated_at = ?
           WHERE id = ?`,
          [
            updates.name !== undefined ? updates.name : group.name,
            updates.description !== undefined
              ? updates.description
              : group.description,
            updates.balancingStrategy !== undefined
              ? updates.balancingStrategy
              : group.balancingStrategy,
            updates.active !== undefined
              ? updates.active
                ? 1
                : 0
              : group.active
                ? 1
                : 0,
            now,
            id,
          ],
        );
      }

      // Update printers if provided
      if (updates.printers) {
        // Delete existing printers
        await database.run(`DELETE FROM group_printers WHERE group_id = ?`, [
          id,
        ]);

        // Add new printers
        if (updates.printers.length > 0) {
          const stmt = await database.prepare(
            `INSERT INTO group_printers (group_id, printer_name, priority) VALUES (?, ?, ?)`,
          );

          for (let i = 0; i < updates.printers.length; i++) {
            const printer = updates.printers[i];
            // Use index as priority (lower index = higher priority)
            await stmt.run(id, printer, i + 1);
          }

          await stmt.finalize();
        }
      }

      logger.info(`Updated printer group: ${group.name} (${id})`);
    } catch (error) {
      logError(`Failed to update printer group ${id}`, error);
      throw error;
    }
  }

  // Delete a printer group
  async deleteGroup(id: string): Promise<void> {
    try {
      const database = await db;

      // Check if group exists
      const group = await this.getGroup(id);

      if (!group) {
        throw new Error(`Printer group ${id} not found`);
      }

      // Delete group (cascade will delete printers)
      await database.run(`DELETE FROM printer_groups WHERE id = ?`, [id]);

      logger.info(`Deleted printer group: ${group.name} (${id})`);
    } catch (error) {
      logError(`Failed to delete printer group ${id}`, error);
      throw error;
    }
  }

  // Assign printers to a group
  async assignPrinters(id: string, printers: string[]): Promise<void> {
    try {
      const database = await db;

      // Check if group exists
      const group = await this.getGroup(id);

      if (!group) {
        throw new Error(`Printer group ${id} not found`);
      }

      // Delete existing printers
      await database.run(`DELETE FROM group_printers WHERE group_id = ?`, [id]);

      // Add new printers
      if (printers.length > 0) {
        const stmt = await database.prepare(
          `INSERT INTO group_printers (group_id, printer_name, priority) VALUES (?, ?, ?)`,
        );

        for (let i = 0; i < printers.length; i++) {
          const printer = printers[i];
          // Use index as priority (lower index = higher priority)
          await stmt.run(id, printer, i + 1);
        }

        await stmt.finalize();
      }

      logger.info(`Assigned printers to group: ${group.name} (${id})`);
    } catch (error) {
      logError(`Failed to assign printers to group ${id}`, error);
      throw error;
    }
  }

  // Get status of a printer group
  async getGroupStatus(id: string): Promise<{
    id: string;
    name: string;
    active: boolean;
    printers: PrinterStatus[];
  }> {
    try {
      // Get group
      const group = await this.getGroup(id);

      if (!group) {
        throw new Error(`Printer group ${id} not found`);
      }

      // Get printer status
      const printers = await printerService.getPrinters();

      // Get job counts from database
      const database = await db;
      const jobCounts = await database.all(
        `SELECT printer, COUNT(*) as count
         FROM print_jobs
         WHERE status IN ('pending', 'printing')
         GROUP BY printer`,
      );

      // Create printer status objects
      const printerStatus: PrinterStatus[] = [];

      for (const printer of group.printers) {
        const printerInfo = printers.find((p) => p.name === printer);
        const jobCount =
          jobCounts.find((j) => j.printer === printer)?.count || 0;

        printerStatus.push({
          name: printer,
          status: printerInfo?.status || "unknown",
          jobCount,
        });
      }

      return {
        id: group.id,
        name: group.name,
        active: group.active,
        printers: printerStatus,
      };
    } catch (error) {
      logError(`Failed to get printer group status ${id}`, error);
      throw error;
    }
  }

  // Select a printer from a group based on the balancing strategy
  async selectPrinterFromGroup(groupId: string): Promise<string | null> {
    try {
      // Get group
      const group = await this.getGroup(groupId);

      if (!group || !group.active || !group.printers.length) {
        return null;
      }

      // Get group status
      const status = await this.getGroupStatus(groupId);

      // Select printer based on balancing strategy
      switch (group.balancingStrategy) {
        case "round-robin": {
          // Use database to track last used printer
          const database = await db;

          // Get last used printer index
          const lastUsed = await database.get(
            `SELECT value FROM key_value WHERE key = ?`,
            [`group_${groupId}_last_printer`],
          );

          // Calculate next printer index
          const lastIndex = lastUsed ? parseInt(lastUsed.value, 10) : -1;
          const nextIndex = (lastIndex + 1) % group.printers.length;

          // Update last used printer index
          if (lastUsed) {
            await database.run(`UPDATE key_value SET value = ? WHERE key = ?`, [
              nextIndex.toString(),
              `group_${groupId}_last_printer`,
            ]);
          } else {
            await database.run(
              `INSERT INTO key_value (key, value) VALUES (?, ?)`,
              [`group_${groupId}_last_printer`, nextIndex.toString()],
            );
          }

          return group.printers[nextIndex];
        }

        case "least-busy": {
          // Find printer with fewest jobs
          const leastBusy = status.printers.reduce((prev, curr) => {
            if (curr.status === "error") {
              return prev;
            }
            if (prev.status === "error") {
              return curr;
            }
            return curr.jobCount < prev.jobCount ? curr : prev;
          });

          return leastBusy.name;
        }

        case "failover": {
          // Find first available printer in priority order
          for (const printer of status.printers) {
            if (printer.status !== "error") {
              return printer.name;
            }
          }
          return null;
        }

        default:
          return group.printers[0];
      }
    } catch (error) {
      logError(`Failed to select printer from group ${groupId}`, error);
      return null;
    }
  }
}

// Export a singleton instance
export const printerGroupService = new PrinterGroupService();
