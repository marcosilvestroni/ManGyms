import type { Schedule, Event, Match } from "../types";
import { isHoliday } from "./holidays";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate events from a schedule within a date range
 */
export function generateEventsFromSchedule(
  schedule: Schedule,
  groupName: string,
  gyms: { id: string; name: string }[],
  dateRange: { from: Date; to: Date }
): Event[] {
  const events: Event[] = [];

  const validFrom = new Date(schedule.validFrom);
  const validTo = new Date(schedule.validTo);

  // Start from the later of dateRange.from or validFrom
  const startDate = new Date(
    Math.max(dateRange.from.getTime(), validFrom.getTime())
  );

  // End at the earlier of dateRange.to or validTo
  // Ensure we compare correctly by setting hours to 0 for validTo as well
  const endDate = new Date(Math.min(dateRange.to.getTime(), validTo.getTime()));
  endDate.setHours(23, 59, 59, 999); // Ensure we include the full end date

  // Iterate through each day in the range
  const currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    // Skip if it's a holiday
    if (isHoliday(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = currentDate.getDay();

    // Map to our schedule day names
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    const dayNames = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ] as const;

    const dayName = dayNames[dayOfWeek];

    // Get time slots for this day
    const slots = schedule[dayName];

    // Create an event for each slot
    slots.forEach((slot) => {
      const gym = gyms.find((g) => g.id === slot.gymId);

      events.push({
        id: uuidv4(),
        groupId: schedule.groupId,
        groupName,
        gymId: slot.gymId,
        gymName: gym?.name || "Unknown",
        // Use local date string to avoid UTC shift
        date: `${currentDate.getFullYear()}-${String(
          currentDate.getMonth() + 1
        ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return events;
}

/**
 * Generate events from a single match
 */
export function generateEventsFromMatch(
  match: Match,
  groupName: string,
  gyms: { id: string; name: string }[],
  dateRange: { from: Date; to: Date }
): Event[] {
  const events: Event[] = [];
  const gym = gyms.find((g) => g.id === match.gymId); // Find gym name

  // Helper to add event
  const addEvent = (dateStr: string) => {
    // Check if date is within range
    const dateObj = new Date(dateStr);
    if (dateObj >= dateRange.from && dateObj <= dateRange.to) {
      events.push({
        id: match.id, // Use match ID directly or generate new if recurrence splits
        groupId: match.groupId,
        groupName,
        gymId: match.gymId,
        gymName: gym?.name || "Unknown",
        date: dateStr,
        startTime: match.startTime,
        endTime: match.endTime,
        isMatch: true, // Tag as match
        opponent: match.opponent,
      });
    }
  };

  if (match.type === "one-off" && match.date) {
    addEvent(match.date);
  } else if (
    match.type === "recurring" &&
    match.validFrom &&
    match.validTo &&
    match.dayOfWeek
  ) {
    // Recurring logic
    const startDate = new Date(
      Math.max(dateRange.from.getTime(), new Date(match.validFrom).getTime())
    );
    const endDate = new Date(
      Math.min(dateRange.to.getTime(), new Date(match.validTo).getTime())
    );
    endDate.setHours(23, 59, 59, 999);

    const currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    // recurrenceInterval (weeks) - this is tricky if we don't have a reference start date for the interval
    // Assuming validFrom is the anchor for recurrence
    const anchorDate = new Date(match.validFrom);
    anchorDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      const dayNames = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      if (dayNames[currentDate.getDay()] === match.dayOfWeek) {
        // Check recurrence interval
        // Calculate weeks difference from anchor
        const diffTime = Math.abs(currentDate.getTime() - anchorDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);

        if (diffWeeks % (match.recurrenceInterval || 1) === 0) {
          const dateStr = `${currentDate.getFullYear()}-${String(
            currentDate.getMonth() + 1
          ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(
            2,
            "0"
          )}`;
          addEvent(dateStr);
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  return events;
}

/**
 * Generate all events from all schedules AND matches
 */
export function generateAllEvents(
  schedules: Schedule[],
  groups: { id: string; name: string }[],
  gyms: { id: string; name: string }[],
  dateRange: { from: Date; to: Date },
  matches: Match[] = [] // Optional for backward compatibility
): Event[] {
  let allEvents: Event[] = [];

  // 1. Generate Training Events
  schedules.forEach((schedule) => {
    const group = groups.find((g) => g.id === schedule.groupId);
    if (!group) return;

    const events = generateEventsFromSchedule(
      schedule,
      group.name,
      gyms,
      dateRange
    );
    allEvents.push(...events);
  });

  // 2. Generate Match Events
  const matchEvents: Event[] = [];
  matches.forEach((match) => {
    const group = groups.find((g) => g.id === match.groupId);
    // If group deleted/missing, we might still want to show it or skip. Let's skip for safety.
    if (!group) return;

    const mEvents = generateEventsFromMatch(match, group.name, gyms, dateRange);
    matchEvents.push(...mEvents);
  });

  // 3. Override Logic: Remove training events that conflict with matches
  // A match overrides a training event if:
  // - Same Group
  // - Same Date
  // - Time Overlap

  // Create a set of training event IDs to remove
  const eventsToRemove = new Set<string>();

  matchEvents.forEach((mEvent) => {
    allEvents.forEach((tEvent) => {
      if (tEvent.groupId === mEvent.groupId && tEvent.date === mEvent.date) {
        // Check time overlap
        if (
          timeRangesOverlap(
            mEvent.startTime,
            mEvent.endTime,
            tEvent.startTime,
            tEvent.endTime
          )
        ) {
          eventsToRemove.add(tEvent.id);
        }
      }
    });
  });

  allEvents = allEvents.filter((e) => !eventsToRemove.has(e.id));
  allEvents.push(...matchEvents);

  // Sort by date and time
  return allEvents.sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.startTime.localeCompare(b.startTime);
  });
}

function timeRangesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };
  return (
    toMinutes(start1) < toMinutes(end2) && toMinutes(start2) < toMinutes(end1)
  );
}
