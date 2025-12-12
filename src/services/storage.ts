import type { Gym, Group, Match } from "../types";
import { v4 as uuidv4 } from "uuid";

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
  deleteMatch: async (id: string): Promise<void> => {
    const matches = await storage.getMatches();
    const filtered = matches.filter((m) => m.id !== id);
    storage.setItem(KEYS.MATCHES, filtered);
  },
};
