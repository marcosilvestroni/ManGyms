import { NavLink, Outlet } from "react-router-dom";
import {
  Calendar,
  LayoutDashboard,
  Trophy,
  Users,
  Dumbbell,
} from "lucide-react";
import clsx from "clsx";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout">
      {/* Sidebar (Desktop) */}
      <aside className="sidebar glass-panel">
        <div className="logo">
          <img src="/logo-transparent.png" alt="ManGyms" style={{ width: 240, height: 240 }} />
        </div>
        <nav>
          <NavLink
            to="/"
            className={({ isActive }) => clsx("nav-item", isActive && "active")}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/calendar"
            className={({ isActive }) => clsx("nav-item", isActive && "active")}
          >
            <Calendar size={20} />
            <span>Calendario</span>
          </NavLink>
          <NavLink
            to="/matches"
            className={({ isActive }) => clsx("nav-item", isActive && "active")}
          >
            <Trophy size={20} />
            <span>Partite</span>
          </NavLink>
          <NavLink
            to="/groups"
            className={({ isActive }) => clsx("nav-item", isActive && "active")}
          >
            <Users size={20} />
            <span>Gruppi</span>
          </NavLink>
          <NavLink
            to="/gyms"
            className={({ isActive }) => clsx("nav-item", isActive && "active")}
          >
            <Dumbbell size={20} />
            <span>Palestre</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="content">
        <Outlet />
      </main>

      {/* Bottom Nav (Mobile) */}
      <nav className="bottom-nav glass-panel">
        <NavLink
          to="/"
          className={({ isActive }) => clsx("nav-item", isActive && "active")}
        >
          <LayoutDashboard size={24} />
        </NavLink>
        <NavLink
          to="/calendar"
          className={({ isActive }) => clsx("nav-item", isActive && "active")}
        >
          <Calendar size={24} />
        </NavLink>
        <NavLink
          to="/matches"
          className={({ isActive }) => clsx("nav-item", isActive && "active")}
        >
          <Trophy size={24} />
        </NavLink>
        <NavLink
          to="/groups"
          className={({ isActive }) => clsx("nav-item", isActive && "active")}
        >
          <Users size={24} />
        </NavLink>
      </nav>
    </div>
  );
}
