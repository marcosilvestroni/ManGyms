import { useState, useMemo, useEffect } from "react";
import { storage } from "../services/storage";
import { generateAllEvents } from "../utils/scheduler";
import type { Gym, Group, Match } from "../types";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isSameWeek, // Import added
  addWeeks, // Import added
  subWeeks, // Import added
} from "date-fns";
import { it } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
} from "lucide-react";
import "./CalendarPage.css";

type ViewMode = "month" | "agenda";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
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

  // Determine date range based on view mode
  const calendarDays = useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else {
      // Agenda view: Show 2 weeks starting from start of current week
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(addWeeks(start, 1), { weekStartsOn: 1 });
      return eachDayOfInterval({ start, end });
    }
  }, [currentDate, viewMode]);

  const events = useMemo(() => {
    // Optimization: Generate events only for the view range
    if (calendarDays.length === 0) return [];

    const from = calendarDays[0];
    const to = calendarDays[calendarDays.length - 1];

    const schedules = groups.filter((g) => g.schedule).map((g) => g.schedule!);
    return generateAllEvents(schedules, groups, gyms, { from, to }, matches);
  }, [groups, gyms, matches, calendarDays]);

  const toggleMonth = (dir: "prev" | "next") => {
    const fn =
      viewMode === "month"
        ? dir === "prev"
          ? subMonths
          : addMonths
        : dir === "prev"
        ? subWeeks
        : addWeeks;

    setCurrentDate((d) => fn(d, 1));
  };

  return (
    <div className="calendar-page">
      <header className="calendar-header glass-panel">
        <div className="header-controls">
          <button className="btn-icon" onClick={() => toggleMonth("prev")}>
            <ChevronLeft />
          </button>
          <h2>
            {viewMode === "month"
              ? format(currentDate, "MMMM yyyy", { locale: it })
              : `Agenda: ${format(calendarDays[0], "d MMM", {
                  locale: it,
                })} - ${format(calendarDays[calendarDays.length - 1], "d MMM", {
                  locale: it,
                })}`}
          </h2>
          <button className="btn-icon" onClick={() => toggleMonth("next")}>
            <ChevronRight />
          </button>
        </div>

        <div className="view-toggle">
          <button
            className={`btn-icon ${viewMode === "month" ? "active" : ""}`}
            onClick={() => setViewMode("month")}
            title="Vista Calendario"
          >
            <CalendarIcon size={20} />
          </button>
          <button
            className={`btn-icon ${viewMode === "agenda" ? "active" : ""}`}
            onClick={() => setViewMode("agenda")}
            title="Vista Agenda"
          >
            <List size={20} />
          </button>
        </div>
      </header>

      {viewMode === "month" ? (
        <div className="calendar-grid glass-panel">
          {/* Weekday Headers */}
          {["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"].map((day) => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}

          {/* Days */}
          {calendarDays.map((day) => {
            const dayEvents = events.filter((e) =>
              isSameDay(new Date(e.date), day)
            );
            // Sort by time
            dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));

            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`day-cell ${
                  !isCurrentMonth ? "outside-month" : ""
                } ${isToday ? "today" : ""}`}
              >
                <div className="day-number">{format(day, "d")}</div>
                <div className="day-events">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`calendar-event ${
                        event.isMatch ? "match-event" : ""
                      }`}
                      title={`${event.startTime} ${event.groupName} @ ${event.gymName}`}
                    >
                      <span className="event-time">{event.startTime}</span>
                      <span className="event-name">
                        {event.isMatch && "🏆"} {event.groupName}{" "}
                        <span style={{ opacity: 0.8, fontSize: "0.9em" }}>
                          @{event.gymName}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="agenda-view glass-panel">
          {calendarDays.map((day) => {
            const dayEvents = events.filter((e) =>
              isSameDay(new Date(e.date), day)
            );
            dayEvents.sort((a, b) => a.startTime.localeCompare(b.startTime));

            if (dayEvents.length === 0) return null;

            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={`agenda-day ${isToday ? "today" : ""}`}
              >
                <div className="agenda-date">
                  <span className="day-name">
                    {format(day, "EEEE", { locale: it })}
                  </span>
                  <span className="day-num">
                    {format(day, "d MMMM", { locale: it })}
                  </span>
                </div>
                <div className="agenda-events">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`agenda-event ${event.isMatch ? "match" : ""}`}
                    >
                      <div className="time-badge">
                        {event.startTime} - {event.endTime}
                      </div>
                      <div className="event-details">
                        <div className="event-title">
                          {event.isMatch && "🏆 "} {event.groupName}
                          {event.opponent && (
                            <span className="vs"> vs {event.opponent}</span>
                          )}
                        </div>
                        <div className="event-gym">📍 {event.gymName}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {events.length === 0 && (
            <div className="no-events-view">
              Nessun evento in questo periodo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
