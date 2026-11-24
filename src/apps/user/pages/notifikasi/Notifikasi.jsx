import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronLeft } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import "./Notifikasi.css";

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    category: "Pengantaran",
    group: "transaksi",
    title: "Pesanan Sedang Diantar Kurir",
    message: "Kurir internal toko sedang otw ke alamatmu di Jl. Raya No. 33 Sidakaya. Siapkan uang pas Rp 69.500 ya buat bayar di tempat.",
    time: "10 mnt lalu",
    unread: true,
  },
  {
    id: 2,
    category: "Batas Jam",
    group: "transaksi",
    title: "Pesananmu bakal dikirim besok pagi",
    message: "Pesanan order lewat jam 17.00, lain dari sayuran segar jadi tidak dikirim karena sudah sore. Besoknya akan dikirim pada pagi jam 08.00 WIB.",
    time: "11:15 WIB",
    unread: true,
  },
  {
    id: 3,
    category: "Status Pesanan",
    group: "transaksi",
    title: "Pesanan #SP-20261117-02 Selesai",
    message: "Terima kasih sudah belanja sayur dan lauk segar di Toko BISMA. Semoga pesanan hari ini diterima dengan baik.",
    time: "Kemarin",
    unread: true,
  },
  {
    id: 4,
    category: "Promo Sore",
    group: "info",
    title: "Diskon sore s.d. 30% bumbu & ayam",
    message: "Cicil hemat, bumbu dapur, dan paha ayam turun harga sore ini di TP Gemilang! Stok terbatas. Promo berlaku sampai jam 18.00 WIB.",
    time: "2 hari lalu",
    unread: false,
  },
  {
    id: 5,
    category: "Info Pengiriman",
    group: "info",
    title: "Slot belanja subuh jam 05.30 WIB siap",
    message: "Kini area Cilacap Tengah & Selatan bisa terima belanja subuh. Sayur baru dipetik langsung diantar sebelum jam 7 pagi.",
    time: "3 hari lalu",
    unread: false,
  },
];

const FILTERS = [
  { id: "semua", label: "Semua" },
  { id: "transaksi", label: "Transaksi" },
  { id: "info", label: "Promo & Info" },
];

export default function Notifikasi() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState("semua");

  const unreadCount = notifications.filter((item) => item.unread).length;
  const filtered = notifications.filter((item) => filter === "semua" || item.group === filter);

  function markAllRead() {
    setNotifications((items) => items.map((item) => ({ ...item, unread: false })));
  }

  return (
    <main className="notifications">
      <header className="notifications__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={17} />
        </button>
        <h1>Notifikasi</h1>
        {unreadCount > 0 && <span className="notifications__new">{unreadCount} Baru</span>}
        <button
          type="button"
          className="notifications__mark"
          onClick={markAllRead}
          disabled={!unreadCount}
        >
          Tandai Dibaca
        </button>
      </header>

      <div className="notifications__content">
        <nav className="notifications__filters" aria-label="Filter notifikasi">
          {FILTERS.map(({ id, label }) => {
            const count = id === "semua"
              ? notifications.length
              : notifications.filter((item) => item.group === id).length;
            return (
              <button
                type="button"
                key={id}
                className={filter === id ? "is-active" : ""}
                aria-pressed={filter === id}
                onClick={() => setFilter(id)}
              >
                {label} ({count})
              </button>
            );
          })}
        </nav>

        <section className="notifications__list" aria-label="Daftar notifikasi">
          {filtered.map((item) => (
            <article
              className={`notifications__card${item.unread ? " is-unread" : ""}`}
              key={item.id}
            >
              <div className="notifications__meta">
                <span className={`notifications__category notifications__category--${item.group}`}>
                  {item.category}
                </span>
                <span>{item.time}</span>
                {item.unread && <i aria-label="Belum dibaca" />}
              </div>
              <h2>{item.title}</h2>
              <p>{item.message}</p>
              {item.id === 1 && (
                <button type="button" onClick={() => navigate("/pesanan/lacak")}>
                  Lacak Posisi Kurir <ChevronLeft size={10} />
                </button>
              )}
            </article>
          ))}
          {!filtered.length && (
            <div className="notifications__empty">
              <Bell size={20} />
              <p>Belum ada notifikasi di kategori ini.</p>
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </main>
  );
}
