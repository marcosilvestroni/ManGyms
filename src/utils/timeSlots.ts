
export const TIME_SLOTS: string[] = [];

for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
        const hh = h.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        TIME_SLOTS.push(`${hh}:${mm}`);
    }
}
