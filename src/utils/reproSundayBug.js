const { generateEventsFromSchedule } = require("./scheduler");

// Mock data
const schedule = {
  id: "test-schedule",
  groupId: "test-group",
  validFrom: "2025-12-02", // Tuesday
  validTo: "2025-12-08", // Monday
  monday: [{ id: "1", startTime: "10:00", endTime: "11:00", gymId: "gym1" }],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: [],
};

const groupName = "Test Group";
const gyms = [{ id: "gym1", name: "Test Gym" }];
const dateRange = {
  from: new Date("2025-12-01"), // Sunday
  to: new Date("2025-12-10"),
};

console.log("--- Testing Schedule Generation ---");
const events = generateEventsFromSchedule(schedule, groupName, gyms, dateRange);

events.forEach((event) => {
  const date = new Date(event.date);
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
  console.log(`Event: ${event.date} (${dayName}) - ${event.startTime}`);
});

if (events.some((e) => new Date(e.date).getDay() === 0)) {
  console.log("FAIL: Found event on Sunday!");
} else {
  console.log("PASS: No events on Sunday.");
}
