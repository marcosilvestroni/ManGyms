import type { Gym, Group, Match } from "../types";
import { v4 as uuidv4 } from "uuid";

// Generate IDs for consistency
const gymIds = {
    palestra1: uuidv4(),
    palestra2: uuidv4(),
    palestra3: uuidv4(),
};

const groupIds = {
    under14: uuidv4(),
    under16: uuidv4(),
    under18: uuidv4(),
    senior: uuidv4(),
    femminile: uuidv4(),
};

export const MOCK_GYMS: Gym[] = [
    {
        id: gymIds.palestra1,
        name: "Palestra Comunale Marconi",
        address: "Via Marconi 15, Milano",
    },
    {
        id: gymIds.palestra2,
        name: "PalaVerde",
        address: "Viale dello Sport 8, Milano",
    },
    {
        id: gymIds.palestra3,
        name: "Palazzetto San Siro",
        address: "Piazza San Siro 3, Milano",
    },
];

// Helper to get date strings
const today = new Date();
const validFrom = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
const validTo = new Date(today.getFullYear(), today.getMonth() + 6, 0)
    .toISOString()
    .split("T")[0];

export const MOCK_GROUPS: Group[] = [
    {
        id: groupIds.under14,
        name: "Under 14",
        sportType: "Pallavolo",
        schedule: {
            id: uuidv4(),
            groupId: groupIds.under14,
            validFrom,
            validTo,
            monday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra1,
                    startTime: "17:00",
                    endTime: "19:00",
                },
            ],
            tuesday: [],
            wednesday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra1,
                    startTime: "17:00",
                    endTime: "19:00",
                },
            ],
            thursday: [],
            friday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra2,
                    startTime: "17:30",
                    endTime: "19:30",
                },
            ],
            saturday: [],
            sunday: [],
        },
    },
    {
        id: groupIds.under16,
        name: "Under 16",
        sportType: "Pallavolo",
        schedule: {
            id: uuidv4(),
            groupId: groupIds.under16,
            validFrom,
            validTo,
            monday: [],
            tuesday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra2,
                    startTime: "18:00",
                    endTime: "20:00",
                },
            ],
            wednesday: [],
            thursday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra2,
                    startTime: "18:00",
                    endTime: "20:00",
                },
            ],
            friday: [],
            saturday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra1,
                    startTime: "10:00",
                    endTime: "12:00",
                },
            ],
            sunday: [],
        },
    },
    {
        id: groupIds.under18,
        name: "Under 18",
        sportType: "Pallavolo",
        schedule: {
            id: uuidv4(),
            groupId: groupIds.under18,
            validFrom,
            validTo,
            monday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra3,
                    startTime: "19:30",
                    endTime: "21:30",
                },
            ],
            tuesday: [],
            wednesday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra3,
                    startTime: "19:30",
                    endTime: "21:30",
                },
            ],
            thursday: [],
            friday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra3,
                    startTime: "19:00",
                    endTime: "21:00",
                },
            ],
            saturday: [],
            sunday: [],
        },
    },
    {
        id: groupIds.senior,
        name: "Serie C Maschile",
        sportType: "Pallavolo",
        schedule: {
            id: uuidv4(),
            groupId: groupIds.senior,
            validFrom,
            validTo,
            monday: [],
            tuesday: [
                // Two sessions in one day
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra3,
                    startTime: "09:00",
                    endTime: "11:00",
                },
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra3,
                    startTime: "20:00",
                    endTime: "22:00",
                },
            ],
            wednesday: [],
            thursday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra3,
                    startTime: "20:00",
                    endTime: "22:00",
                },
            ],
            friday: [],
            saturday: [],
            sunday: [],
        },
    },
    {
        id: groupIds.femminile,
        name: "Serie D Femminile",
        sportType: "Pallavolo",
        schedule: {
            id: uuidv4(),
            groupId: groupIds.femminile,
            validFrom,
            validTo,
            monday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra2,
                    startTime: "20:00",
                    endTime: "22:00",
                },
            ],
            tuesday: [],
            wednesday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra2,
                    startTime: "20:00",
                    endTime: "22:00",
                },
            ],
            thursday: [],
            friday: [
                {
                    id: uuidv4(),
                    gymId: gymIds.palestra1,
                    startTime: "20:00",
                    endTime: "22:00",
                },
            ],
            saturday: [],
            sunday: [],
        },
    },
];

// Helper for one-off match dates
const nextSaturday = new Date(today);
nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7 || 7));
const nextSunday = new Date(nextSaturday);
nextSunday.setDate(nextSaturday.getDate() + 1);

export const MOCK_MATCHES: Match[] = [
    // Recurring matches (3)
    {
        id: uuidv4(),
        groupId: groupIds.under14,
        gymId: gymIds.palestra1,

        type: "recurring",
        dayOfWeek: "saturday",
        validFrom,
        validTo,
        recurrenceInterval: 2,
        startTime: "15:00",
        endTime: "17:00",
    },
    {
        id: uuidv4(),
        groupId: groupIds.senior,
        gymId: gymIds.palestra3,

        type: "recurring",
        dayOfWeek: "sunday",
        validFrom,
        validTo,
        recurrenceInterval: 1,
        startTime: "18:00",
        endTime: "20:00",
    },
    {
        id: uuidv4(),
        groupId: groupIds.femminile,
        gymId: gymIds.palestra2,

        type: "recurring",
        dayOfWeek: "saturday",
        validFrom,
        validTo,
        recurrenceInterval: 2,
        startTime: "17:00",
        endTime: "19:00",
    },
    // One-off matches (2)
    {
        id: uuidv4(),
        groupId: groupIds.under16,
        gymId: gymIds.palestra2,

        type: "one-off",
        date: nextSaturday.toISOString().split("T")[0],
        startTime: "14:00",
        endTime: "16:00",
    },
    {
        id: uuidv4(),
        groupId: groupIds.under18,
        gymId: gymIds.palestra3,

        type: "one-off",
        date: nextSunday.toISOString().split("T")[0],
        startTime: "16:00",
        endTime: "18:00",
    },
];
