export interface Gym {
  id: string;
  name: string;
  address: string;
}

export interface Group {
  id: string;
  name: string;
  sportType?: string;
  schedule?: Schedule;
}

export interface TimeSlot {
  id: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  gymId: string;
}

export interface Schedule {
  id: string;
  groupId: string;
  validFrom: string; // ISO Date (YYYY-MM-DD)
  validTo: string; // ISO Date (YYYY-MM-DD)
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface Event {
  id: string;
  groupId: string;
  groupName: string;
  gymId: string;
  gymName: string;
  date: string; // ISO Date (YYYY-MM-DD)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isMatch?: boolean;
  opponent?: string;
}

export interface Match {
  id: string;
  groupId: string;
  gymId: string;
  opponent?: string;
  type: "recurring" | "one-off";
  date?: string; // YYYY-MM-DD (For one-off)
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  // Recurring specific
  dayOfWeek?: string; // 'monday', 'tuesday', etc.
  validFrom?: string; // YYYY-MM-DD
  validTo?: string; // YYYY-MM-DD
  recurrenceInterval?: number; // weeks
}

export interface Conflict {
  groupName: string;
  gymName: string;
  timeRange: string;
  dayOfWeek: string;
}
