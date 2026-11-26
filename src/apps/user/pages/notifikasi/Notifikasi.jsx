import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronLeft } from "lucide-react";
import api from "../../../../shared/services/api";
import BottomNav from "../../components/BottomNav";
import "./Notifikasi.css";

const FILTERS = [
  { id: "semua", label: "Semua" },
  { id: "unread", label: "Belum Dibaca" },
];

function formatTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Notifikasi() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("semua");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/notifications")
      .then(({ data }) => {
        if (active) {
          setNotifications(data?.data ?? []);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Gagal memuat notifikasi.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const unreadCount = notifications.filter((item) => !item.read_at).length;
  const filtered = filter === "unread"
    ? notifications.filter((item) => !item.read_at)
    : notifications;

  async function markOneRead(item) {
    if (item.read_at) return;
    try {
      await api.post(`/notifications/${item.id}/read`);
      setNotifications((items) => items.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry));
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal menandai notifikasi dibaca.");
    }
  }

  async function markAllRead() {
    try {
      setError("");
      await api.post("/notifications/read-all");
      const now = new Date().toISOString();
      setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at || now })));
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal menandai semua notifikasi.");
    }
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
            const count = id === "semua" ? notifications.length : unreadCount;
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

        {error && <p className="notifications__empty" role="alert">{error}</p>}
        {loading && <p className="notifications__empty">Memuat notifikasi...</p>}

        {!loading && !error && (
          <section className="notifications__list" aria-label="Daftar notifikasi">
            {filtered.map((item) => {
              const isUnread = !item.read_at;
              return (
                <article
                  className={`notifications__card${isUnread ? " is-unread" : ""}`}
                  key={item.id}
                  onClick={() => markOneRead(item)}
                >
                  <div className="notifications__meta">
                    <span className="notifications__category notifications__category--transaksi">
                      {item.type || "Info"}
                    </span>
                    <span>{formatTime(item.created_at)}</span>
                    {isUnread && <i aria-label="Belum dibaca" />}
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.message}</p>
                </article>
              );
            })}
            {!filtered.length && (
              <div className="notifications__empty">
                <Bell size={20} />
                <p>Belum ada notifikasi di kategori ini.</p>
              </div>
            )}
          </section>
        )}
      </div>

      <BottomNav />
    </main>
  );
}
