import type { Gym, Group, Match } from "../types";
import { v4 as uuidv4 } from "uuid";
import { MOCK_GYMS, MOCK_GROUPS, MOCK_MATCHES } from "./mockData";

const KEYS = {
  GYMS: "gyms",
  GROUPS: "groups",
  MATCHES: "matches",
};

export const storage = {
  // Generic helper
  getItem: <T>(key: string): T[] => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },
  setItem: <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
  },

  // Gyms
  getGyms: async (): Promise<Gym[]> => storage.getItem<Gym>(KEYS.GYMS),
  addGym: async (gym: Omit<Gym, "id">): Promise<Gym> => {
    const gyms = await storage.getGyms();
    const newGym = { ...gym, id: uuidv4() };
    storage.setItem(KEYS.GYMS, [...gyms, newGym]);
    return newGym;
  },
  updateGym: async (gym: Gym): Promise<Gym> => {
    const gyms = await storage.getGyms();
    const index = gyms.findIndex((g) => g.id === gym.id);
    if (index !== -1) {
      gyms[index] = gym;
      storage.setItem(KEYS.GYMS, gyms);
    }
    return gym;
  },
  deleteGym: async (id: string): Promise<void> => {
    const gyms = await storage.getGyms();
    const filtered = gyms.filter((g) => g.id !== id);
    storage.setItem(KEYS.GYMS, filtered);
    // Cascade delete from groups slots not implemented yet for simplicity in this migration step,
    // but logic exists in previous project. Can be ported if needed.
  },

  // Groups
  getGroups: async (): Promise<Group[]> => storage.getItem<Group>(KEYS.GROUPS),
  addGroup: async (group: Omit<Group, "id">): Promise<Group> => {
    const groups = await storage.getGroups();
    const newGroup = { ...group, id: uuidv4() };
    if (newGroup.schedule) newGroup.schedule.groupId = newGroup.id;
    storage.setItem(KEYS.GROUPS, [...groups, newGroup]);
    return newGroup;
  },
  updateGroup: async (group: Group): Promise<Group> => {
    const groups = await storage.getGroups();
    const index = groups.findIndex((g) => g.id === group.id);
    if (index !== -1) {
      if (group.schedule) group.schedule.groupId = group.id;
      groups[index] = group;
      storage.setItem(KEYS.GROUPS, groups);
    }
    return group;
  },
  deleteGroup: async (id: string): Promise<void> => {
    const groups = await storage.getGroups();
    const filtered = groups.filter((g) => g.id !== id);
    storage.setItem(KEYS.GROUPS, filtered);
  },

  // Matches
  getMatches: async (): Promise<Match[]> =>
    storage.getItem<Match>(KEYS.MATCHES),
  addMatch: async (match: Omit<Match, "id">): Promise<Match> => {
    const matches = await storage.getMatches();
    const newMatch = { ...match, id: uuidv4() };
    storage.setItem(KEYS.MATCHES, [...matches, newMatch]);
    return newMatch;
  },
  updateMatch: async (match: Match): Promise<Match> => {
    const matches = await storage.getMatches();
    const index = matches.findIndex((m) => m.id === match.id);
    if (index !== -1) {
      matches[index] = match;
      storage.setItem(KEYS.MATCHES, matches);
    }
    return match;
  },
  deleteMatch: async (id: string): Promise<void> => {
    const matches = await storage.getMatches();
    const filtered = matches.filter((m) => m.id !== id);
    storage.setItem(KEYS.MATCHES, filtered);
  },

  // Initialize with mock data if empty
  initializeData: async (): Promise<void> => {
    const [gyms, groups, matches] = await Promise.all([
      storage.getGyms(),
      storage.getGroups(),
      storage.getMatches(),
    ]);

    // Only initialize if ALL are empty
    if (gyms.length === 0 && groups.length === 0 && matches.length === 0) {
      storage.setItem(KEYS.GYMS, MOCK_GYMS);
      storage.setItem(KEYS.GROUPS, MOCK_GROUPS);
      storage.setItem(KEYS.MATCHES, MOCK_MATCHES);
      console.log("Initialized storage with mock data");
    }
  },
};
