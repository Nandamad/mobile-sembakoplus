import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock3, Info, Ticket } from "lucide-react";
import api from "../../../../shared/services/api";
import "./Voucher.css";

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

function formatVoucherKind(voucher) {
  if (!voucher) return "VOUCHER";
  if (voucher.voucher_type === "free_shipping") return "GRATIS ONGKIR";
  if (voucher.voucher_type === "percentage") return `DISKON ${voucher.discount_value}%`;
  return `POTONGAN ${rupiah(voucher.discount_value)}`;
}

function formatVoucherDetail(voucher) {
  if (!voucher) return "";
  const parts = [`Min. Belanja ${rupiah(voucher.minimum_purchase)}`];
  if (voucher.maximum_discount !== null && voucher.maximum_discount !== undefined) {
    parts.push(`Maks. ${rupiah(voucher.maximum_discount)}`);
  }
  return parts.join(" • ");
}

function VoucherCard({ entry, onUse }) {
  const voucher = entry.voucher ?? entry;
  const status = entry.status && entry.status !== "available" ? entry.status.toUpperCase() : null;
  const tone = voucher.voucher_type === "free_shipping" ? "green" : voucher.voucher_type === "percentage" ? "red" : "orange";
  const expiresAt = entry.expires_at ?? voucher.end_at;

  return (
    <article className={`voucher__card voucher__card--${tone}`}>
      <div className="voucher__ticket">
        <strong>SEMBAKOPLUS</strong>
        <b>{formatVoucherKind(voucher)}</b>
        <small>{voucher.code ? `Kode: ${voucher.code}` : "Otomatis akun"}</small>
      </div>
      <div className="voucher__details">
        <div className="voucher__copy">
          <strong>{voucher.name}</strong>
          <span>{formatVoucherDetail(voucher)}</span>
          {expiresAt && (
            <small>
              <Clock3 size={10} /> Berlaku s/d {new Date(expiresAt).toLocaleDateString("id-ID")}
            </small>
          )}
        </div>
        {status ? (
          <span className={`voucher__status voucher__status--${tone}`}>{status}</span>
        ) : (
          <button type="button" onClick={() => onUse(voucher)}>Pakai</button>
        )}
      </div>
    </article>
  );
}

export default function Voucher() {
  const navigate = useNavigate();
  const [view, setView] = useState("aktif");
  const [myVouchers, setMyVouchers] = useState([]);
  const [publicVouchers, setPublicVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/vouchers")
      .then(({ data }) => {
        if (!active) return;
        setMyVouchers(data?.data?.my_vouchers ?? []);
        setPublicVouchers(data?.data?.public_vouchers ?? []);
        setError("");
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Gagal memuat daftar voucher.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const availableMine = myVouchers.filter((item) => item.status === "available" && item.voucher);
  const historyMine = myVouchers.filter((item) => item.status !== "available" && item.voucher);

  return (
    <main className="voucher">
      <header className="voucher__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={17} />
        </button>
        <h1>{view === "aktif" ? `Voucher Saya (${availableMine.length})` : "Riwayat Voucher"}</h1>
        <button
          type="button"
          className="voucher__header-action"
          onClick={() => setView((current) => current === "aktif" ? "riwayat" : "aktif")}
        >
          {view === "aktif" ? "Riwayat" : "Voucher Saya"}
        </button>
      </header>

      {error && <p className="voucher__notice" role="alert">{error}</p>}
      {loading && <p className="voucher__notice">Memuat voucher...</p>}

      {!loading && view === "aktif" && (
        <>
          <section className="voucher__list" aria-label="Voucher akun saya">
            {availableMine.length ? availableMine.map((entry) => (
              <VoucherCard key={`my-${entry.id}`} entry={entry} onUse={() => navigate("/checkout")} />
            )) : (
              <p className="voucher__notice">Belum ada voucher khusus di akun Anda.</p>
            )}
          </section>

          {publicVouchers.length > 0 && (
            <section className="voucher__list" aria-label="Voucher promo publik">
              {publicVouchers.map((voucher) => (
                <VoucherCard key={`pub-${voucher.id}`} entry={{ voucher, status: "available" }} onUse={() => navigate("/checkout")} />
              ))}
            </section>
          )}

          <p className="voucher__notice"><Info size={12} /> Kombinasi voucher dan koin mengikuti aturan masing-masing voucher.</p>
          <footer className="voucher__footer">
            <button type="button" onClick={() => navigate("/beranda")}>
              Mulai Belanja &amp; Gunakan Voucher
            </button>
          </footer>
        </>
      )}

      {!loading && view === "riwayat" && (
        <>
          <section className="voucher__list voucher__list--history" aria-label="Riwayat voucher">
            {historyMine.length ? historyMine.map((entry) => (
              <VoucherCard key={`hist-${entry.id}`} entry={entry} onUse={() => {}} />
            )) : (
              <p className="voucher__notice">Belum ada riwayat penggunaan atau voucher kedaluwarsa.</p>
            )}
          </section>
          <footer className="voucher__footer">
            <button type="button" onClick={() => setView("aktif")}>
              <Ticket size={14} /> Kembali ke Voucher Aktif <ChevronRight size={14} />
            </button>
          </footer>
        </>
      )}
    </main>
  );
}
