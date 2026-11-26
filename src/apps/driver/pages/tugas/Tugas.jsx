import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, MapPin, Navigation } from "lucide-react";
import api from "../../../../shared/services/api";

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

export default function Tugas() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");
      const { data } = await api.get("/courier/tasks");
      setTasks(data?.data ?? []);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Daftar tugas kurir gagal dimuat. Pastikan login sebagai kurir.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    api.get("/courier/tasks")
      .then(({ data }) => {
        if (active) {
          setTasks(data?.data ?? []);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Daftar tugas kurir gagal dimuat. Pastikan login sebagai kurir.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  async function runAction(id, action) {
    try {
      setBusyId(id);
      setError("");
      await api.post(`/courier/tasks/${id}/${action}`);
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.error?.message || "Aksi tugas gagal diproses.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="driver-section">
      <div className="driver-section__head">
        <h2>Daftar Tugas Aktif ({tasks.length})</h2>
        <button type="button" onClick={loadTasks}>Muat Ulang</button>
      </div>

      {error && <p className="driver-alert" role="alert">{error}</p>}
      {loading && <p className="driver-empty">Memuat tugas pengantaran...</p>}
      {!loading && !error && !tasks.length && (
        <p className="driver-empty">Belum ada tugas pengantaran aktif.</p>
      )}

      {tasks.map((task) => (
        <article className="driver-card" key={task.id}>
          <header className="driver-card__top">
            <div>
              <strong>#{task.order_number}</strong>
              <small>{task.delivery_date} • {task.start_time}-{task.end_time} WIB</small>
            </div>
            <span className="driver-badge">{task.assignment_status}</span>
          </header>

          <p className="driver-card__addr">
            <MapPin size={12} /> {task.recipient_name} ({task.recipient_phone})<br />
            {task.address}
          </p>

          <p className="driver-card__meta">
            {task.is_cod
              ? (task.is_paid ? "COD (Sudah Dibayar)" : `Tagih COD: ${rupiah(task.cod_amount_due)}`)
              : "QRIS (Sudah Lunas)"}
          </p>

          <div className="driver-card__actions">
            {task.assignment_status === "assigned" && (
              <>
                <button type="button" disabled={busyId === task.id} onClick={() => runAction(task.id, "accept")}>
                  Terima
                </button>
                <button type="button" className="is-outline" disabled={busyId === task.id} onClick={() => runAction(task.id, "reject")}>
                  Tolak
                </button>
              </>
            )}
            {task.assignment_status === "accepted" && (
              <button type="button" disabled={busyId === task.id} onClick={() => runAction(task.id, "pickup")}>
                Ambil Barang
              </button>
            )}
            <a href={task.maps_url} target="_blank" rel="noopener noreferrer" className="driver-link-btn">
              <Navigation size={12} /> Navigasi
            </a>
            <button
              type="button"
              className="is-outline"
              onClick={() => navigate(`/antaran?taskId=${task.id}`, { state: { task } })}
            >
              Detail <ChevronRight size={12} />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}
