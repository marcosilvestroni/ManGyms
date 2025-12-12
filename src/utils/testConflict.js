const {
  timeRangesOverlap,
  dateRangesOverlap,
  findConflictsForSlot,
} = require("./conflictDetector");

// Mock data
const gym1 = { id: "gym1", name: "Gym A" };
const group1 = { id: "group1", name: "Group 1" };

const schedule1 = {
  id: "sch1",
  groupId: "group1",
  validFrom: "2025-01-01",
  validTo: "2025-06-30",
  monday: [
    { id: "slot1", gymId: "gym1", startTime: "10:00", endTime: "11:00" },
  ],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

const allSchedules = [schedule1];
const gyms = [gym1];
const groups = [group1];

// Test Case 1: Direct Overlap
const newSlotOverlap = {
  id: "slot2",
  gymId: "gym1",
  startTime: "10:30",
  endTime: "11:30",
};
const conflicts1 = findConflictsForSlot(
  newSlotOverlap,
  "monday",
  "2025-01-01",
  "2025-06-30",
  allSchedules,
  gyms,
  groups
);
console.log(
  "Test 1 (Overlap):",
  conflicts1.length > 0 ? "PASS" : "FAIL",
  conflicts1
);

// Test Case 2: No Overlap (Different Time)
const newSlotNoOverlap = {
  id: "slot3",
  gymId: "gym1",
  startTime: "11:00",
  endTime: "12:00",
};
const conflicts2 = findConflictsForSlot(
  newSlotNoOverlap,
  "monday",
  "2025-01-01",
  "2025-06-30",
  allSchedules,
  gyms,
  groups
);
console.log(
  "Test 2 (No Overlap Time):",
  conflicts2.length === 0 ? "PASS" : "FAIL",
  conflicts2
);

// Test Case 3: No Overlap (Different Day)
const conflicts3 = findConflictsForSlot(
  newSlotOverlap,
  "tuesday",
  "2025-01-01",
  "2025-06-30",
  allSchedules,
  gyms,
  groups
);
console.log(
  "Test 3 (Different Day):",
  conflicts3.length === 0 ? "PASS" : "FAIL",
  conflicts3
);

// Test Case 4: No Overlap (Different Gym)
const newSlotDiffGym = {
  id: "slot4",
  gymId: "gym2",
  startTime: "10:30",
  endTime: "11:30",
};
const conflicts4 = findConflictsForSlot(
  newSlotDiffGym,
  "monday",
  "2025-01-01",
  "2025-06-30",
  allSchedules,
  gyms,
  groups
);
console.log(
  "Test 4 (Different Gym):",
  conflicts4.length === 0 ? "PASS" : "FAIL",
  conflicts4
);

// Test Case 5: No Overlap (Date Range)
const conflicts5 = findConflictsForSlot(
  newSlotOverlap,
  "monday",
  "2025-07-01",
  "2025-12-31",
  allSchedules,
  gyms,
  groups
);
console.log(
  "Test 5 (Date Range):",
  conflicts5.length === 0 ? "PASS" : "FAIL",
  conflicts5
);
