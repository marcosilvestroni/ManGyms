import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
// Placeholder imports (will create these files next)
import Dashboard from "./pages/Dashboard";
import CalendarPage from "./pages/CalendarPage";
import MatchesPage from "./pages/MatchesPage";
import GroupsPage from "./pages/GroupsPage";
import GymsPage from "./pages/GymsPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="matches" element={<MatchesPage />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="gyms" element={<GymsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
