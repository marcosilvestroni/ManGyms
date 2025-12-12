import { useEffect, useState, useMemo } from "react";
import { storage } from "../services/storage";
import { generateAllEvents } from "../utils/scheduler";
import type { Gym, Group, Match, Event } from "../types";
import "./Dashboard.css";

export default function Dashboard() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    // Load data
    const loadData = async () => {
      const [g, gr, m] = await Promise.all([
        storage.getGyms(),
        storage.getGroups(),
        storage.getMatches(),
      ]);
      setGyms(g || []);
      setGroups(gr || []);
      setMatches(m || []);
    };
    loadData();
  }, []);

  const today = useMemo(() => new Date(), []);

  // Format Date: "Lunedì, 10 Dicembre 2025"
  const formattedDate = new Intl.DateTimeFormat("it-IT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(today);

  const events = useMemo(() => {
    const schedules = groups.filter((g) => g.schedule).map((g) => g.schedule!);
    return generateAllEvents(
      schedules,
      groups,
      gyms,
      { from: today, to: today },
      matches
    );
  }, [groups, gyms, matches, today]);

  const eventsByGym = useMemo(() => {
    const map = new Map();
    gyms.forEach((gym) => {
      const gymEvents = events.filter((e) => e.gymId === gym.id);
      map.set(gym.id, gymEvents);
    });
    return map;
  }, [gyms, events]);

  return (
    <div className="dashboard">
      <header className="page-header">
        <h1>Agenda di Oggi</h1>
        <p className="subtitle">{formattedDate}</p>
      </header>

      {gyms.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>Nessuna palestra configurata.</p>
        </div>
      ) : (
        <div className="gym-grid">
          {gyms.map((gym) => {
            const gymEvents = eventsByGym.get(gym.id) || [];
            return (
              <div key={gym.id} className="gym-column glass-panel">
                <div className="gym-header">
                  <h2>{gym.name}</h2>
                  <span className="badge">{gymEvents.length}</span>
                </div>
                <div className="events-list">
                  {gymEvents.length === 0 ? (
                    <p className="no-events">Nessun evento</p>
                  ) : (
                    gymEvents.map((event: Event) => (
                      <div
                        key={event.id}
                        className={`event-card ${
                          event.isMatch ? "match-card" : ""
                        }`}
                      >
                        <div className="event-time">
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="event-title">
                          {event.isMatch && "🏆 "}
                          {event.groupName}
                        </div>
                        {event.opponent && (
                          <div className="event-subtitle">
                            vs {event.opponent}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
