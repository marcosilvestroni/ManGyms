import type { TimeSlot, Conflict, Schedule } from "../types";

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  // Convert HH:mm to minutes since midnight for easier comparison
  const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);

  // Check if ranges overlap: start1 < end2 AND start2 < end1
  return s1 < e2 && s2 < e1;
}

/**
 * Check if two date ranges overlap
 */
export function dateRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const s1 = new Date(start1);
  const e1 = new Date(end1);
  const s2 = new Date(start2);
  const e2 = new Date(end2);

  return s1 <= e2 && s2 <= e1;
}

/**
 * Find conflicts for a time slot on a specific day
 */
export function findConflictsForSlot(
  newSlot: TimeSlot,
  dayOfWeek:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday",
  newScheduleValidFrom: string,
  newScheduleValidTo: string,
  allSchedules: Schedule[],
  gyms: { id: string; name: string }[],
  groups: { id: string; name: string }[],
  excludeGroupId?: string
): Conflict[] {
  const conflicts: Conflict[] = [];

  allSchedules.forEach((schedule) => {
    // Skip if this is the same group (for editing) OR override logic for Match
    if (excludeGroupId && schedule.groupId === excludeGroupId) {
      return;
    }

    // Check if validity periods overlap
    if (
      !dateRangesOverlap(
        newScheduleValidFrom,
        newScheduleValidTo,
        schedule.validFrom,
        schedule.validTo
      )
    ) {
      return;
    }

    // Get slots for the same day of week
    const existingSlots = schedule[dayOfWeek];

    existingSlots.forEach((existingSlot) => {
      // Check if same gym
      if (existingSlot.gymId !== newSlot.gymId) {
        return;
      }

      // Check if time ranges overlap
      if (
        timeRangesOverlap(
          newSlot.startTime,
          newSlot.endTime,
          existingSlot.startTime,
          existingSlot.endTime
        )
      ) {
        const group = groups.find((g) => g.id === schedule.groupId);
        const gym = gyms.find((g) => g.id === existingSlot.gymId);

        conflicts.push({
          groupName: group?.name || "Unknown",
          gymName: gym?.name || "Unknown",
          timeRange: `${existingSlot.startTime}-${existingSlot.endTime}`,
          dayOfWeek: dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1),
        });
      }
    });
  });

  return conflicts;
}

/**
 * Find all conflicts for an entire schedule
 */
export function findAllConflicts(
  newSchedule: Schedule,
  allSchedules: Schedule[],
  gyms: { id: string; name: string }[],
  groups: { id: string; name: string }[],
  excludeGroupId?: string
): Map<string, Conflict[]> {
  const conflictsByDay = new Map<string, Conflict[]>();

  const days: Array<
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
  > = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  days.forEach((day) => {
    const slots = newSchedule[day];
    const dayConflicts: Conflict[] = [];

    slots.forEach((slot) => {
      const conflicts = findConflictsForSlot(
        slot,
        day,
        newSchedule.validFrom,
        newSchedule.validTo,
        allSchedules,
        gyms,
        groups,
        excludeGroupId
      );
      dayConflicts.push(...conflicts);
    });

    if (dayConflicts.length > 0) {
      conflictsByDay.set(day, dayConflicts);
    }
  });

  return conflictsByDay;
}
