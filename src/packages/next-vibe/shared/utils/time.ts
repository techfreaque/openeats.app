import { Day } from "@prisma/client";

/**
 * Converts a time string in HH:MM format to seconds since midnight
 */
export function timeToSeconds(timeStr: `${number}:${number}`): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  if (hours === undefined || minutes === undefined) {
    throw new Error(`Invalid time format, timestring: ${timeStr}`);
  }
  return hours * 3600 + minutes * 60;
}

/**
 * Converts seconds since midnight to a time string in HH:MM format
 */
export function secondsToTime(seconds: number): `${string}:${string}` {
  if (seconds < 0 || seconds >= 86400) {
    throw new Error("Seconds must be between 0 and 86399");
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
}

/**
 * Converts a Date object to a day of the week enum (0-6, where 0 is Sunday)
 */
export function getDayEnumFromDate(date: Date): Day {
  // 0 is Sunday, 1 is Monday, etc.
  const dayOfWeek = date.getDay() as 0 | 1 | 2 | 3 | 4 | 5 | 6;
  return dayToDayMapping[dayOfWeek];
}

const dayToDayMapping = {
  0: Day.SUNDAY,
  1: Day.MONDAY,
  2: Day.TUESDAY,
  3: Day.WEDNESDAY,
  4: Day.THURSDAY,
  5: Day.FRIDAY,
  6: Day.SATURDAY,
} as const;
