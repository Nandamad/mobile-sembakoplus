import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Camera, CheckCircle2, Navigation, Wallet } from "lucide-react";
import api from "../../../../shared/services/api";

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

export default function Antaran() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId") || state?.task?.id || null;

  const [task, setTask] = useState(state?.task ?? null);
  const [photo, setPhoto] = useState(null);
  const [recipientName, setRecipientName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    const request = taskId
      ? api.get(`/courier/tasks/${taskId}`).then(({ data }) => {
          if (active) {
            setTask(data?.data ?? null);
            setError("");
          }
        })
      : api.get("/courier/tasks").then(({ data }) => {
          if (!active) return;
          const activeList = data?.data ?? [];
          const current = activeList.find((item) => ["picked_up", "on_delivery", "accepted"].includes(item.assignment_status)) ?? activeList[0] ?? null;
          setTask(current);
          setError("");
        });

    request
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Detail antaran gagal dimuat.");
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [taskId]);

  async function handleUploadProof(event) {
    event.preventDefault();
    if (!task || !photo) return;
    try {
      setBusy(true);
      setError("");
      setNotice("");
      const formData = new FormData();
      formData.append("photo", photo);
      if (recipientName.trim()) formData.append("recipient_name", recipientName.trim());
      if (notes.trim()) formData.append("notes", notes.trim());

      const { data } = await api.post(`/courier/tasks/${task.id}/proof`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTask(data?.data?.delivery ?? task);
      setPhoto(null);
      setNotice("Foto bukti pengantaran berhasil diunggah.");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal mengunggah foto bukti.");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmCod() {
    if (!task) return;
    try {
      setBusy(true);
      setError("");
      setNotice("");
      const { data } = await api.post(`/courier/tasks/${task.id}/confirm-cod`, {
        amount_received: task.cod_amount_due,
      });
      setTask(data?.data?.delivery ?? task);
      setNotice("Pembayaran COD berhasil dikonfirmasi.");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Konfirmasi COD gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete() {
    if (!task) return;
    try {
      setBusy(true);
      setError("");
      setNotice("");
      await api.post(`/courier/tasks/${task.id}/complete`);
      navigate("/riwayat");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal menyelesaikan pengantaran.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="driver-empty">Memuat detail antaran...</p>;
  }

  if (!task) {
    return (
      <section className="driver-app__placeholder">
        <h2>Tidak Ada Antaran Aktif</h2>
        <p>{error || "Pilih tugas aktif dari halaman Tugas."}</p>
      </section>
    );
  }

  return (
    <section className="driver-section">
      <article className="driver-card">
        <header className="driver-card__top">
          <div>
            <strong>#{task.order_number}</strong>
            <small>Status Tugas: {task.assignment_status} • Pesanan: {task.order_status}</small>
          </div>
          <a href={task.maps_url} target="_blank" rel="noopener noreferrer" className="driver-link-btn">
            <Navigation size={12} /> Peta
          </a>
        </header>

        <p className="driver-card__addr">
          {task.recipient_name} ({task.recipient_phone})<br />
          {task.address}
        </p>

        <div className="driver-items">
          {(task.items ?? []).map((item) => (
            <div key={item.id}>
              <span>{item.product_name} ({item.variant_name})</span>
              <strong>{item.quantity}x</strong>
            </div>
          ))}
        </div>

        <p className="driver-card__meta">
          {task.is_cod
            ? (task.is_paid ? "COD: Lunas" : `Tagihan COD: ${rupiah(task.cod_amount_due)}`)
            : "Pembayaran: QRIS (Lunas)"}
        </p>
      </article>

      <form className="driver-card driver-form" onSubmit={handleUploadProof}>
        <h3>1. Unggah Foto Bukti Pengantaran</h3>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
        />
        <input
          type="text"
          placeholder="Nama penerima (opsional)"
          value={recipientName}
          onChange={(event) => setRecipientName(event.target.value)}
        />
        <input
          type="text"
          placeholder="Catatan pengantaran (opsional)"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
        <button type="submit" disabled={!photo || busy}>
          <Camera size={13} /> {task.has_delivery_confirmation ? "Perbarui Foto Bukti" : "Unggah Foto Bukti"}
        </button>
      </form>

      {task.is_cod && !task.is_paid && (
        <div className="driver-card driver-form">
          <h3>2. Konfirmasi Uang COD</h3>
          <button type="button" disabled={busy || !task.has_delivery_confirmation} onClick={handleConfirmCod}>
            <Wallet size={13} /> Terima Tunai {rupiah(task.cod_amount_due)}
          </button>
          {!task.has_delivery_confirmation && (
            <small>Unggah foto bukti terlebih dahulu sebelum mengonfirmasi tunai COD.</small>
          )}
        </div>
      )}

      <div className="driver-card driver-form">
        <h3>3. Selesaikan Pengantaran</h3>
        <button
          type="button"
          disabled={busy || !task.has_delivery_confirmation || (task.is_cod && !task.is_paid)}
          onClick={handleComplete}
        >
          <CheckCircle2 size={13} /> Tandai Pengantaran Selesai
        </button>
      </div>

      {error && <p className="driver-alert" role="alert">{error}</p>}
      {notice && <p className="driver-notice" role="status">{notice}</p>}
    </section>
  );
}
