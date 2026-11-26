import { useEffect, useState } from "react";
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
import api, { clearAuthToken } from "../../../../shared/services/api";
import BottomNav from "../../components/BottomNav";
import "./Profil.css";

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [voucherCount, setVoucherCount] = useState(0);
  const [addressCount, setAddressCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/profile"),
      api.get("/wallet").catch(() => ({ data: { data: null } })),
      api.get("/vouchers").catch(() => ({ data: { data: { my_vouchers: [] } } })),
      api.get("/profile/addresses").catch(() => ({ data: { data: [] } })),
    ])
      .then(([profileRes, walletRes, voucherRes, addressRes]) => {
        if (!active) return;
        setUser(profileRes.data?.data ?? null);
        setWallet(walletRes.data?.data ?? null);
        const availableVouchers = (voucherRes.data?.data?.my_vouchers ?? []).filter((v) => v.status === "available");
        setVoucherCount(availableVouchers.length);
        setAddressCount((addressRes.data?.data ?? []).length);
        setError("");
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Profil gagal dimuat. Silakan masuk kembali.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // tetap bersihkan token lokal
    } finally {
      clearAuthToken();
      navigate("/masuk", { replace: true });
    }
  }

  const displayName = user?.name || (loading ? "Memuat..." : "Pelanggan");
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "P";

  const items = [
    {
      icon: MapPin,
      tone: "green",
      title: "Daftar Alamat Pengiriman",
      description: "Kelola alamat dan titik koordinat pengiriman",
      action: `${addressCount} Alamat`,
      path: "/profil/alamat",
    },
    {
      icon: CreditCard,
      tone: "blue",
      title: "Metode Pembayaran",
      description: "QRIS Dinamis & COD (Bayar di Tempat)",
      action: "Pilih",
      path: "/profil/metode-pembayaran",
    },
    {
      icon: Headset,
      tone: "teal",
      title: "Pusat Bantuan & CS WhatsApp",
      description: "FAQ dan kontak resmi SembakoPlus",
      action: "Buka",
      path: "/profil/bantuan",
    },
    {
      icon: ShieldCheck,
      tone: "teal",
      title: "Kebijakan Privasi & Syarat",
      description: "Ketentuan layanan dan perlindungan data pribadi",
      action: "Lihat",
      path: "/profil/kebijakan",
    },
    {
      icon: Settings,
      tone: "gray",
      title: "Pengaturan Akun & Keamanan",
      description: "Kata sandi, verifikasi email, nomor HP, hapus akun",
      action: "Atur",
      path: "/profil/keamanan",
    },
  ];

  return (
    <main className="profile">
      <header className="profile__header">
        <div className="profile__avatar" aria-hidden="true">{avatarInitial}</div>
        <strong className="profile__name">{displayName}</strong>
        {user && (
          <button
            type="button"
            className="profile__edit"
            onClick={() => navigate("/profil/ubah-nama", { state: { user } })}
          >
            Ubah
          </button>
        )}
      </header>

      {error && <p className="profile__version" role="alert">{error}</p>}

      <section className="profile__rewards" aria-label="Koin dan voucher">
        <div className="profile__reward profile__reward--points">
          <span><Gift size={15} /></span>
          <span>
            <strong>{wallet?.balance ?? user?.coin_balance ?? 0} Koin</strong>
            <small>Senilai {rupiah(wallet?.estimated_rupiah_value ?? 0)}</small>
          </span>
          <ChevronRight size={13} />
        </div>
        <button
          type="button"
          className="profile__reward profile__reward--voucher"
          onClick={() => navigate("/profil/voucher")}
        >
          <span><Ticket size={15} /></span>
          <span><strong>{voucherCount} Voucher</strong><small>Voucher milik saya</small></span>
          <ChevronRight size={13} />
        </button>
      </section>

      <section className="profile__menu" aria-label="Menu profil">
        {items.map(({ icon: Icon, tone, title, description, action, path }) => (
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

      <p className="profile__version">SembakoPlus</p>

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
              Apakah Anda yakin ingin keluar? Token sesi Anda akan dicabut dari perangkat ini.
            </p>
            <button
              type="button"
              className="profile__dialog-confirm"
              onClick={handleLogout}
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
