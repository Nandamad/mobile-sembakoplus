import { useEffect, useState } from "react";
import api from "../../../../shared/services/api";

export default function Riwayat() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/courier/history")
      .then(({ data }) => {
        if (active) setItems(data?.data ?? []);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Riwayat antaran gagal dimuat.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  return (
    <section className="driver-section">
      <div className="driver-section__head">
        <h2>Riwayat Antaran ({items.length})</h2>
      </div>
      {loading && <p className="driver-empty">Memuat riwayat...</p>}
      {error && <p className="driver-alert" role="alert">{error}</p>}
      {!loading && !error && !items.length && <p className="driver-empty">Belum ada riwayat antaran.</p>}

      {items.map((item) => (
        <article className="driver-card" key={item.id}>
          <header className="driver-card__top">
            <div>
              <strong>#{item.order_number}</strong>
              <small>{item.delivery_date} • {item.recipient_name}</small>
            </div>
            <span className="driver-badge">{item.assignment_status}</span>
          </header>
          <p className="driver-card__addr">{item.address}</p>
        </article>
      ))}
    </section>
  );
}
