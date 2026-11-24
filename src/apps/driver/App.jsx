import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ClipboardList, MapPin, UserRound, History } from "lucide-react";
import Tugas from "./pages/tugas/Tugas";
import Antaran from "./pages/antaran/Antaran";
import Riwayat from "./pages/riwayat/Riwayat";
import ProfilDriver from "./pages/profil/ProfilDriver";
import "./DriverApp.css";

const DRIVER_SECTIONS = [
  { path: "/tugas", title: "Tugas", Icon: ClipboardList },
  { path: "/antaran", title: "Antaran", Icon: MapPin },
  { path: "/riwayat", title: "Riwayat", Icon: History },
  { path: "/profil", title: "Profil", Icon: UserRound },
];

function DriverShell() {
  const { pathname } = useLocation();

  return (
    <main className="driver-app">
      <header className="driver-app__header">
        <strong>SembakoPlus</strong>
        <span>Aplikasi Driver</span>
      </header>
      <Routes>
        <Route path="/" element={<Navigate to="/tugas" replace />} />
        <Route path="/tugas" element={<Tugas />} />
        <Route path="/antaran" element={<Antaran />} />
        <Route path="/riwayat" element={<Riwayat />} />
        <Route path="/profil" element={<ProfilDriver />} />
        <Route path="*" element={<Navigate to="/tugas" replace />} />
      </Routes>
      <nav className="driver-app__nav" aria-label="Navigasi driver">
        {DRIVER_SECTIONS.map(({ path, title, Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={pathname.endsWith(path) ? "is-active" : ""}
          >
            <Icon size={18} />
            <span>{title}</span>
          </NavLink>
        ))}
      </nav>
    </main>
  );
}

export default function DriverApp() {
  return (
    <BrowserRouter basename="/driver">
      <DriverShell />
    </BrowserRouter>
  );
}
