import { useState, useEffect } from "react";
import { storage } from "../services/storage";
import type { Match, Group, Gym } from "../types";
import { findConflictsForSlot } from "../utils/conflictDetector";
import Modal from "../components/Modal";
import { Plus, Trash, Trophy, Repeat } from "lucide-react";
import "./GroupsPage.css"; // Reusing styles

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [groupId, setGroupId] = useState("");
  const [gymId, setGymId] = useState("");
  const [opponent, setOpponent] = useState("");
  const [type, setType] = useState<"one-off" | "recurring">("one-off");

  // One-off fields
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Recurring fields
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [validFrom, setValidFrom] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [validTo, setValidTo] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  });
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);

  // Common fields
  const [startTime, setStartTime] = useState("18:00");
  const [endTime, setEndTime] = useState("20:00");

  const loadData = async () => {
    const [m, g, gy] = await Promise.all([
      storage.getMatches(),
      storage.getGroups(),
      storage.getGyms(),
    ]);
    setMatches(m || []);
    setGroups(g || []);
    setGyms(gy || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!groupId || !gymId) {
      alert("Gruppo e Palestra sono obbligatori");
      return;
    }

    // Determine conflict validation parameters
    let checkDay: string;
    let checkFrom: string;
    let checkTo: string;

    if (type === "one-off") {
      if (!date) return;
      const d = new Date(date);
      const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      checkDay = days[d.getDay()];
      checkFrom = date;
      checkTo = date;
    } else {
      if (!dayOfWeek || !validFrom || !validTo) {
        alert("Configurazione ricorrenza incompleta");
        return;
      }
      checkDay = dayOfWeek;
      checkFrom = validFrom;
      checkTo = validTo;
    }

    // Check Conflicts
    // We pass 'groupId' as excludeGroupId because if a match overlaps with the SAME group's training,
    // it is considered an OVERRIDE (allowed), not a conflict.
    // If it overlaps with ANOTHER group, it is a conflict (blocked).
    const schedules = groups.filter((g) => g.schedule).map((g) => g.schedule!);

    // Typecast day for the function
    const dayName = checkDay as
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";

    const conflicts = findConflictsForSlot(
      { id: "temp", gymId, startTime, endTime },
      dayName,
      checkFrom,
      checkTo,
      schedules,
      gyms,
      groups,
      groupId // Pass current group ID to exclude its own trainings from conflict list
    );

    if (conflicts.length > 0) {
      const msg = conflicts
        .map(
          (c) =>
            `- ${c.dayOfWeek}: ${c.groupName} @ ${c.gymName} (${c.timeRange})`
        )
        .join("\n");
      alert(
        `Impossibile creare la partita. Conflitto con altri gruppi:\n\n${msg}`
      );
      return;
    }

    await storage.addMatch({
      groupId,
      gymId,
      opponent,
      type,
      // One-off
      date: type === "one-off" ? date : undefined,
      // Recurring
      dayOfWeek: type === "recurring" ? dayOfWeek : undefined,
      validFrom: type === "recurring" ? validFrom : undefined,
      validTo: type === "recurring" ? validTo : undefined,
      recurrenceInterval: type === "recurring" ? recurrenceInterval : undefined,

      startTime,
      endTime,
    });

    setIsModalOpen(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Eliminare questa partita?")) {
      await storage.deleteMatch(id);
      loadData();
    }
  };

  const getGroupName = (id: string) =>
    groups.find((g) => g.id === id)?.name || "Unknown";
  const getGymName = (id: string) =>
    gyms.find((g) => g.id === id)?.name || "Unknown";

  return (
    <div className="page">
      <header className="page-header flex-between">
        <h1>Partite</h1>
        <button className="btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Nuova Partita
        </button>
      </header>

      <div className="groups-list">
        {matches.map((match) => (
          <div
            key={match.id}
            className="group-card glass-panel"
            style={{ borderLeft: "4px solid orange" }}
          >
            <div className="group-info">
              <Trophy className="text-primary" color="orange" />
              <div>
                <h3>
                  {getGroupName(match.groupId)} vs {match.opponent || "TBD"}
                  {match.type === "recurring" && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: "0.7em",
                        background: "#eee",
                        padding: "2px 6px",
                        borderRadius: 4,
                      }}
                    >
                      Ricorrente
                    </span>
                  )}
                </h3>
                <div style={{ fontSize: "0.8rem", color: "#666" }}>
                  {match.type === "one-off"
                    ? match.date
                    : `${
                        match.dayOfWeek
                          ? {
                              monday: "Lunedì",
                              tuesday: "Martedì",
                              wednesday: "Mercoledì",
                              thursday: "Giovedì",
                              friday: "Venerdì",
                              saturday: "Sabato",
                              sunday: "Domenica",
                            }[match.dayOfWeek]
                          : ""
                      } (Ogni ${match.recurrenceInterval} sett.)`}
                  | {match.startTime}-{match.endTime} @{" "}
                  {getGymName(match.gymId)}
                </div>
              </div>
            </div>
            <div className="group-actions">
              <button
                className="btn-icon text-danger"
                onClick={() => handleDelete(match.id)}
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
        title="Nuova Partita"
      >
        {/* Toggle Type */}
        <div className="form-group">
          <label>Tipo Partita</label>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="button"
              className={`btn ${
                type === "one-off" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setType("one-off")}
              style={{ flex: 1, opacity: type === "one-off" ? 1 : 0.6 }}
            >
              Partita Singola
            </button>
            <button
              type="button"
              className={`btn ${
                type === "recurring" ? "btn-primary" : "btn-secondary"
              }`}
              onClick={() => setType("recurring")}
              style={{ flex: 1, opacity: type === "recurring" ? 1 : 0.6 }}
            >
              <Repeat size={16} style={{ marginRight: 6 }} /> Ricorrente
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Gruppo</label>
          <select
            className="input"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
          >
            <option value="">Seleziona gruppo...</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Avversario</label>
          <input
            className="input"
            value={opponent}
            onChange={(e) => setOpponent(e.target.value)}
            placeholder="Nome avversario"
          />
        </div>

        <div className="form-group">
          <label>Palestra</label>
          <select
            className="input"
            value={gymId}
            onChange={(e) => setGymId(e.target.value)}
          >
            <option value="">Seleziona palestra...</option>
            {gyms.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {type === "one-off" ? (
          <div className="form-group">
            <label>Data</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        ) : (
          <>
            <div className="form-group">
              <label>Giorno della Settimana</label>
              <select
                className="input"
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
              >
                <option value="">Seleziona giorno...</option>
                <option value="monday">Lunedì</option>
                <option value="tuesday">Martedì</option>
                <option value="wednesday">Mercoledì</option>
                <option value="thursday">Giovedì</option>
                <option value="friday">Venerdì</option>
                <option value="saturday">Sabato</option>
                <option value="sunday">Domenica</option>
              </select>
            </div>
            <div className="form-row" style={{ display: "flex", gap: "1rem" }}>
              <div className="form-group flex-1" style={{ flex: 1 }}>
                <label>Dal</label>
                <input
                  type="date"
                  className="input"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                />
              </div>
              <div className="form-group flex-1" style={{ flex: 1 }}>
                <label>Al</label>
                <input
                  type="date"
                  className="input"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Ripeti ogni (settimane)</label>
              <input
                type="number"
                min="1"
                max="4"
                className="input"
                value={recurrenceInterval}
                onChange={(e) => setRecurrenceInterval(Number(e.target.value))}
              />
            </div>
          </>
        )}

        <div className="form-group" style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label>Inizio</label>
            <input
              type="time"
              className="input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label>Fine</label>
            <input
              type="time"
              className="input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
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
