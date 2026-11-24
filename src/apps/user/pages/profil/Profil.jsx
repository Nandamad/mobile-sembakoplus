import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  CreditCard,
  Headset,
  ShieldCheck,
  Settings,
  ChevronRight,
  LogOut,
  Gift,
  Ticket,
} from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "./Profil.css";

const ITEMS = [
  {
    icon: MapPin,
    tone: "green",
    title: "Daftar Alamat Pengiriman",
    description: "Rumah Hanif Utama • Sidakaya, Cilacap",
    action: "1 Alamat",
    path: "/profil/alamat",
  },
  {
    icon: CreditCard,
    tone: "blue",
    title: "Metode Pembayaran",
    description: "COD (Bayar di Tempat) & Rekening Bank",
    action: "Aktif",
    path: "/profil/metode-pembayaran",
  },
  {
    icon: Headset,
    tone: "teal",
    title: "Pusat Bantuan & CS WhatsApp",
    description: "Hubungi Customer Service 24/7",
    action: "Chat",
    path: "/profil/bantuan",
  },
  {
    icon: ShieldCheck,
    tone: "teal",
    title: "Kebijakan Privasi & Syarat",
    description: "Ketentuan Layanan & Pengelolaan Data Sensitif",
    action: "Lihat",
    path: "/profil/kebijakan",
  },
  {
    icon: Settings,
    tone: "gray",
    title: "Pengaturan Akun & Keamanan",
    description: "Ubah kata sandi dan verifikasi data",
    action: "Atur",
    path: "/profil/keamanan",
  },
];

export default function Profil() {
  const navigate = useNavigate();
  const name = localStorage.getItem("sembakoplus.profile.name") || "Hanif Satria";
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  return (
    <main className="profile">
      <header className="profile__header">
        <div className="profile__avatar" aria-hidden="true">H</div>
        <strong className="profile__name">{name}</strong>
        <button
          type="button"
          className="profile__edit"
          onClick={() => navigate("/profil/ubah-nama")}
        >
          Ubah
        </button>
      </header>

      <section className="profile__rewards" aria-label="Poin dan voucher">
        <div className="profile__reward profile__reward--points">
          <span><Gift size={15} /></span>
          <span><strong>3.450 Poin</strong><small>Senilai Rp 3.450</small></span>
          <ChevronRight size={13} />
        </div>
        <button
          type="button"
          className="profile__reward profile__reward--voucher"
          onClick={() => navigate("/profil/voucher")}
        >
          <span><Ticket size={15} /></span>
          <span><strong>5 Voucher</strong><small>Diskon s/d 50%</small></span>
          <ChevronRight size={13} />
        </button>
      </section>

      <section className="profile__menu" aria-label="Menu profil">
        {ITEMS.map(({ icon: Icon, tone, title, description, action, path }) => (
          <button
            type="button"
            className="profile__item"
            key={title}
            onClick={() => path && navigate(path)}
          >
            <span className={`profile__item-icon profile__item-icon--${tone}`}>
              <Icon size={18} />
            </span>
            <span className="profile__item-copy">
              <strong>{title}</strong>
              <small>{description}</small>
            </span>
            <span className="profile__action">{action}</span>
            <ChevronRight className="profile__chevron" size={14} />
          </button>
        ))}
      </section>

      <button
        type="button"
        className="profile__logout"
        onClick={() => setShowLogoutDialog(true)}
      >
        <LogOut size={15} />
        Keluar dari Akun
      </button>

      <p className="profile__version">SembakoPlus • PT Generasi Digital Sinergi</p>

      {showLogoutDialog && (
        <div
          className="profile__dialog-backdrop"
          onClick={() => setShowLogoutDialog(false)}
        >
          <section
            className="profile__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-logout-title"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="profile__dialog-icon">
              <LogOut size={20} />
            </span>
            <h2 id="profile-logout-title">Keluar dari Akun SembakoPlus?</h2>
            <p>
              Apakah Anda yakin ingin keluar? Anda perlu masuk kembali
              menggunakan nomor handphone terdaftar untuk melihat riwayat
              belanja.
            </p>
            <button
              type="button"
              className="profile__dialog-confirm"
              onClick={() => navigate("/masuk")}
            >
              Ya, Keluar dari Akun
            </button>
            <button
              type="button"
              className="profile__dialog-cancel"
              onClick={() => setShowLogoutDialog(false)}
            >
              Batal &amp; Tetap di Akun
            </button>
          </section>
        </div>
      )}

      <BottomNav />
    </main>
  );
}
