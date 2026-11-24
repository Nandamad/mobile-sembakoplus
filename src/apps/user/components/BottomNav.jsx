import { NavLink } from "react-router-dom";
import { Home, Package, Tag, User } from "lucide-react";
import "./BottomNav.css";

const ITEMS = [
  { to: "/beranda", label: "Beranda", Icon: Home },
  { to: "/promo", label: "Promo", Icon: Tag },
  { to: "/pesanan", label: "Pesanan", Icon: Package },
  { to: "/profil", label: "Profil", Icon: User },
];

export default function BottomNav() {
  return (
    <nav className="bnav">
      {ITEMS.map(({ to, label, Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => "bnav__item" + (isActive ? " is-active" : "")}>
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}