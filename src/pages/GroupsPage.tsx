import { useState, useEffect } from "react";
import { storage } from "../services/storage";
import type { Group, Gym, TimeSlot, Schedule, Conflict } from "../types";
import { findConflictsForSlot } from "../utils/conflictDetector";
import Modal from "../components/Modal";
import { Plus, Edit, Trash, Users } from "lucide-react";

import { TIME_SLOTS } from "../utils/timeSlots";
import "./GroupsPage.css";

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [sportType, setSportType] = useState("");
  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [validTo, setValidTo] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split("T")[0];
  });

  const [schedule, setSchedule] = useState<Record<string, TimeSlot[]>>({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  const loadData = async () => {
    const [gr, g] = await Promise.all([storage.getGroups(), storage.getGyms()]);
    setGroups(gr || []);
    setGyms(g || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenModal = (group?: Group) => {
    if (group) {
      setEditingGroup(group);
      setName(group.name);
      setSportType(group.sportType || "");
      if (group.schedule) {
        setValidFrom(group.schedule.validFrom);
        setValidTo(group.schedule.validTo);
        const {
          monday,
          tuesday,
          wednesday,
          thursday,
          friday,
          saturday,
          sunday,
        } = group.schedule;
        setSchedule({
          monday,
          tuesday,
          wednesday,
          thursday,
          friday,
          saturday,
          sunday,
        });
      } else {
        // Default dates if missing
        setValidFrom(new Date().toISOString().split("T")[0]);
        const d = new Date();
        d.setMonth(d.getMonth() + 6);
        setValidTo(d.toISOString().split("T")[0]);
        setSchedule({
          monday: [],
          tuesday: [],
          wednesday: [],
          thursday: [],
          friday: [],
          saturday: [],
          sunday: [],
        });
      }
    } else {
      setEditingGroup(null);
      setName("");
      setSportType("");
      setValidFrom(new Date().toISOString().split("T")[0]);
      const d = new Date();
      d.setMonth(d.getMonth() + 6);
      setValidTo(d.toISOString().split("T")[0]);
      setSchedule({
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!name) {
      alert("Il nome del gruppo è obbligatorio");
      return;
    }
    if (!validFrom || !validTo) {
      alert("Le date di validità sono obbligatorie");
      return;
    }
    if (new Date(validFrom) > new Date(validTo)) {
      alert("La data di inizio non può essere successiva alla data di fine");
      return;
    }

    // 1. Construct temporary schedule for validation
    const tempSchedule: Schedule = {
      id: editingGroup?.schedule?.id || crypto.randomUUID(),
      groupId: editingGroup?.id || "temp-id",
      validFrom,
      validTo,
      monday: schedule.monday,
      tuesday: schedule.tuesday,
      wednesday: schedule.wednesday,
      thursday: schedule.thursday,
      friday: schedule.friday,
      saturday: schedule.saturday,
      sunday: schedule.sunday,
    };

    // 2. Check Conflicts
    let conflictsFound: Conflict[] = [];
    const days = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ] as const;

    // Get all OTHER schedules
    const otherSchedules = groups
      .filter((g) => g.schedule && g.id !== editingGroup?.id)
      .map((g) => g.schedule!);

    days.forEach((day) => {
      tempSchedule[day].forEach((slot) => {
        const slotConflicts = findConflictsForSlot(
          slot,
          day,
          validFrom,
          validTo,
          otherSchedules,
          gyms,
          groups,
          editingGroup?.id
        );
        conflictsFound.push(...slotConflicts);
      });
    });

    if (conflictsFound.length > 0) {
      const msg = conflictsFound
        .map(
          (c) =>
            `- ${c.dayOfWeek}: ${c.groupName} @ ${c.gymName} (${c.timeRange})`
        )
        .join("\n");
      alert(`Attenzione! Ci sono conflitti:\n\n${msg}`);
      return; // Block save
    }

    // 3. Save
    const groupData: any = {
      name,
      sportType,
      schedule: tempSchedule,
    };

    if (editingGroup) {
      // Ensure schedule groupId matches
      tempSchedule.groupId = editingGroup.id;
      await storage.updateGroup({ ...editingGroup, ...groupData });
    } else {
      await storage.addGroup(groupData);
    }

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Sei sicuro di voler eliminare questo gruppo?")) {
      await storage.deleteGroup(id);
      loadData();
    }
  };

  // Schedule Logic helpers
  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  const addSlot = (day: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          id: crypto.randomUUID(),
          gymId: gyms[0]?.id || "",
          startTime: "18:00",
          endTime: "20:00",
        },
      ],
    }));
  };

  const updateSlot = (
    day: string,
    index: number,
    field: keyof TimeSlot,
    value: string
  ) => {
    setSchedule((prev) => {
      const newDaySlots = [...prev[day]];
      newDaySlots[index] = { ...newDaySlots[index], [field]: value };
      return { ...prev, [day]: newDaySlots };
    });
  };

  const removeSlot = (day: string, index: number) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="page">
      <header className="page-header flex-between">
        <h1>Gruppi</h1>
        <button className="btn" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Nuovo Gruppo
        </button>
      </header>

      <div className="groups-list">
        {groups.map((group) => (
          <div key={group.id} className="group-card glass-panel">
            <div className="group-info">
              <Users className="text-primary" />
              <div>
                <h3>{group.name}</h3>
                {group.sportType && (
                  <span className="text-sm text-secondary">
                    {group.sportType}
                  </span>
                )}
              </div>
            </div>
            <div className="group-actions">
              <button
                className="btn-icon"
                onClick={() => handleOpenModal(group)}
              >
                <Edit size={18} />
              </button>
              <button
                className="btn-icon text-danger"
                onClick={() => handleDelete(group.id)}
              >
                <Trash size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGroup ? "Modifica Gruppo" : "Nuovo Gruppo"}
      >
        <div className="form-row">
          <div className="form-group flex-1">
            <label>Nome Gruppo</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Under 14"
            />
          </div>
          <div className="form-group flex-1">
            <label>Tipo Sport</label>
            <input
              className="input"
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              placeholder="Es. Volley"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group flex-1">
            <label>Valido Dal</label>
            <input
              type="date"
              className="input"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </div>
          <div className="form-group flex-1">
            <label>Valido Al</label>
            <input
              type="date"
              className="input"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
            />
          </div>
        </div>

        <div className="schedule-editor">
          <h4>Orari Allenamento</h4>
          {days.map((day) => (
            <div key={day} className="day-row">
              <div className="day-label">{day}</div>
              <div className="day-slots">
                {schedule[day]?.map((slot, idx) => (
                  <div key={idx} className="slot-editor">
                    <select
                      value={slot.gymId}
                      onChange={(e) =>
                        updateSlot(day, idx, "gymId", e.target.value)
                      }
                      className="input input-sm"
                    >
                      {gyms.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={slot.startTime}
                      onChange={(e) =>
                        updateSlot(day, idx, "startTime", e.target.value)
                      }
                      className="input input-sm"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <span>-</span>
                    <select
                      value={slot.endTime}
                      onChange={(e) =>
                        updateSlot(day, idx, "endTime", e.target.value)
                      }
                      className="input input-sm"
                    >
                      {TIME_SLOTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <button
                      className="btn-icon text-danger"
                      onClick={() => removeSlot(day, idx)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <button
                  className="btn-sm btn-secondary"
                  onClick={() => addSlot(day)}
                >
                  + Orario
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button className="btn" onClick={handleSave}>
            Salva
          </button>
        </div>
      </Modal>
    </div>
  );
}

// Helper component for icon
function X({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
