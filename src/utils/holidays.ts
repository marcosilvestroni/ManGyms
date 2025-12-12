/**
 * Italian national holidays
 */
export const ITALIAN_HOLIDAYS = [
  { month: 1, day: 1, name: "Capodanno" },
  { month: 1, day: 6, name: "Epifania" },
  { month: 4, day: 25, name: "Festa della Liberazione" },
  { month: 5, day: 1, name: "Festa del Lavoro" },
  { month: 6, day: 2, name: "Festa della Repubblica" },
  { month: 8, day: 15, name: "Ferragosto" },
  { month: 11, day: 1, name: "Ognissanti" },
  { month: 12, day: 8, name: "Immacolata Concezione" },
  { month: 12, day: 25, name: "Natale" },
  { month: 12, day: 26, name: "Santo Stefano" },
];

/**
 * Calculate Easter date using Computus algorithm (Meeus/Jones/Butcher)
 */
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Get Easter Monday date (Pasquetta)
 */
function getEasterMonday(year: number): Date {
  const easter = calculateEaster(year);
  const easterMonday = new Date(easter);
  easterMonday.setDate(easter.getDate() + 1);
  return easterMonday;
}

/**
 * Check if a date is an Italian holiday
 */
export function isHoliday(date: Date): boolean {
  const month = date.getMonth() + 1; // 0-indexed to 1-indexed
  const day = date.getDate();
  const year = date.getFullYear();

  // Check fixed holidays
  const isFixedHoliday = ITALIAN_HOLIDAYS.some(
    (holiday) => holiday.month === month && holiday.day === day
  );

  if (isFixedHoliday) return true;

  // Check Easter Monday
  const easterMonday = getEasterMonday(year);
  if (
    date.getDate() === easterMonday.getDate() &&
    date.getMonth() === easterMonday.getMonth()
  ) {
    return true;
  }

  return false;
}

/**
 * Get all holidays for a given year
 */
export function getHolidaysForYear(year: number): Date[] {
  const holidays: Date[] = [];

  // Add fixed holidays
  ITALIAN_HOLIDAYS.forEach((holiday) => {
    holidays.push(new Date(year, holiday.month - 1, holiday.day));
  });

  // Add Easter Monday
  holidays.push(getEasterMonday(year));

  return holidays.sort((a, b) => a.getTime() - b.getTime());
}
