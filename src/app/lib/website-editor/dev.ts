import { prisma } from "@/next-portal/db";
import { debugLogger } from "@/next-portal/utils/logger";

export const updateUpdatedAtFields = async (): Promise<void> => {
  const batchSize = 100;
  let skip = 0;
  let updatedCount = 0;

  while (true) {
    const records = await prisma.uI.findMany({
      select: {
        id: true,
        createdAt: true,
      },
      take: batchSize,
      skip: skip,
    });

    if (records.length === 0) {
      break; // No more records to update
    }

    for (const record of records) {
      await prisma.uI.update({
        where: { id: record.id },
        data: { updatedAt: record.createdAt },
      });
      updatedCount++;
    }

    debugLogger(`Updated ${updatedCount} records so far...`);
    skip += batchSize;
  }

  debugLogger(`Finished updating ${updatedCount} records.`);
};
