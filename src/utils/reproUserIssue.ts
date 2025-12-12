import { findConflictsForSlot } from "./conflictDetector";
import type { Schedule } from "../types";

// Data provided by user
const groupsData = [
  {
    id: "dbcad095-cc88-4f1d-86a8-5e549ce40c42",
    name: "U12 Femminile",
    schedule: {
      id: "543f2e2f-ba1d-4f2f-81ef-e8b477f1b0df",
      groupId: "dbcad095-cc88-4f1d-86a8-5e549ce40c42",
      validFrom: "2025-12-01",
      validTo: "2025-12-30",
      monday: [
        {
          id: "f82dac4d-9064-4d1a-993f-cda14b9c462c",
          startTime: "16:00",
          endTime: "18:00",
          gymId: "890fca89-bd8a-4c22-9270-8561e88f15e9",
        },
      ],
      tuesday: [],
      wednesday: [
        {
          id: "59b41954-2318-477f-b15d-8b984c878229",
          startTime: "16:00",
          endTime: "18:00",
          gymId: "890fca89-bd8a-4c22-9270-8561e88f15e9",
        },
      ],
      thursday: [],
      friday: [
        {
          id: "a34111ae-8dc7-41f0-8ae6-87c5ac80654e",
          startTime: "16:00",
          endTime: "18:00",
          gymId: "890fca89-bd8a-4c22-9270-8561e88f15e9",
        },
      ],
      saturday: [],
      sunday: [],
    },
  },
  {
    id: "ef30337f-7896-40c7-bc71-92075c297a60",
    name: "U13 Femminile",
    schedule: {
      id: "0a7bb3ef-3d22-4041-bd76-5ba14daa0721",
      groupId: "ef30337f-7896-40c7-bc71-92075c297a60",
      validFrom: "2025-12-01",
      validTo: "2025-12-30",
      monday: [],
      tuesday: [
        {
          id: "0fe3a497-5f1c-4047-9d2f-fdf60fefdf10",
          startTime: "16:00",
          endTime: "18:00",
          gymId: "890fca89-bd8a-4c22-9270-8561e88f15e9",
        },
      ],
      wednesday: [],
      thursday: [
        {
          id: "e30aab10-0e30-4c70-b771-e1dc92bb7108",
          startTime: "16:00",
          endTime: "18:00",
          gymId: "890fca89-bd8a-4c22-9270-8561e88f15e9",
        },
      ],
      friday: [
        {
          id: "e2c48fa4-2943-43c9-806b-cff1eebd1049",
          startTime: "18:00",
          endTime: "20:00",
          gymId: "890fca89-bd8a-4c22-9270-8561e88f15e9",
        },
      ],
      saturday: [],
      sunday: [],
    },
  },
];

// The group being added (U14)
const newGroupData = {
  id: "8c203b67-89c3-412c-8b19-7a7851a44147",
  name: "U14 Femminile",
  schedule: {
    id: "6a27aebd-e5a8-4b24-839f-2d9c680d8370",
    groupId: "8c203b67-89c3-412c-8b19-7a7851a44147",
    validFrom: "2025-12-01",
    validTo: "2025-12-30",
    monday: [
      {
        id: "01f7418d-5846-493e-ab0e-bb94505bb32c",
        startTime: "16:00",
        endTime: "18:00",
        gymId: "890fca89-bd8a-4c22-9270-8561e88f15e9",
      },
    ],
    tuesday: [],
    wednesday: [
      {
        id: "49f6a35b-c080-4bc7-93d9-0285b25aae5a",
        startTime: "19:00",
        endTime: "20:00",
        gymId: "890fca89-bd8a-4c22-9270-8561e88f15e9",
      },
    ],
    thursday: [],
    friday: [
      {
        id: "564cacb3-3f61-4dbe-af73-72b57ba80f26",
        startTime: "17:00",
        endTime: "19:00",
        gymId: "77e748e8-4064-437c-baab-5f1f1c6a85e6",
      },
    ],
    saturday: [],
    sunday: [],
  },
};

// Mock gyms
const gyms = [
  { id: "890fca89-bd8a-4c22-9270-8561e88f15e9", name: "Gym A" },
  { id: "77e748e8-4064-437c-baab-5f1f1c6a85e6", name: "Gym B" },
];

// Extract schedules from existing groups
const allSchedules = groupsData.map((g) => g.schedule as Schedule);
const groupsList = groupsData.map((g) => ({ id: g.id, name: g.name }));

// Test Conflict: U14 Monday 16:00-18:00 vs U12 Monday 16:00-18:00
const mondaySlot = newGroupData.schedule.monday[0];
console.log("Testing Slot:", mondaySlot);

const conflicts = findConflictsForSlot(
  mondaySlot,
  "monday",
  newGroupData.schedule.validFrom,
  newGroupData.schedule.validTo,
  allSchedules,
  gyms,
  groupsList
);

console.log("Conflicts Found:", conflicts);

if (conflicts.length > 0) {
  console.log("SUCCESS: Conflict detected correctly.");
} else {
  console.error("FAILURE: No conflict detected!");
}
