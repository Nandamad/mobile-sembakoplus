import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, Plus, ShoppingCart } from "lucide-react";
import api from "../../../../shared/services/api";
import { loadCart } from "../keranjang/cartData";
import "./BeliLagi.css";

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

export default function BeliLagi() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || state?.order?.id || null;

  const [order, setOrder] = useState(state?.order ?? null);
  const [reorderableItems, setReorderableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [warnings, setWarnings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const request = orderId
      ? api.get(`/orders/${orderId}`).then(({ data }) => {
          if (!active) return;
          const fetchedOrder = data?.data ?? null;
          setOrder(fetchedOrder);
          setReorderableItems((fetchedOrder?.items ?? []).map((item) => ({
            product_variant_id: item.product_variant_id,
            product_name: item.product_name,
            variant_name: item.variant_name,
            price: item.unit_price,
            last_quantity: item.quantity,
            is_available: true,
          })));
          setError("");
        })
      : api.get("/orders/reorderable-products").then(({ data }) => {
          if (!active) return;
          setReorderableItems(data?.data ?? []);
          setError("");
        });

    request
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Produk beli lagi gagal dimuat.");
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [orderId]);

  async function handleReorderAll() {
    if (!orderId) return;
    try {
      setSubmitting(true);
      setError("");
      const { data } = await api.post(`/orders/${orderId}/reorder`);
      const nextWarnings = data?.data?.warnings ?? [];
      setWarnings(nextWarnings);
      await loadCart().catch(() => {});
      if (!nextWarnings.length) {
        navigate("/keranjang");
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || "Gagal memasukkan item ke keranjang.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddSingle(item) {
    try {
      setError("");
      await api.post("/cart/items", {
        product_variant_id: item.product_variant_id,
        quantity: item.last_quantity || 1,
      });
      await loadCart().catch(() => {});
      navigate("/keranjang");
    } catch (err) {
      setError(err.response?.data?.error?.message || "Varian tidak dapat ditambahkan ke keranjang.");
    }
  }

  return (
    <main className="reorder">
      <header className="reorder__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <h1>Beli Lagi</h1>
      </header>

      {order && (
        <section className="reorder__panel reorder__address">
          <div className="reorder__address-copy">
            <div className="reorder__address-title">
              <strong>Dari Pesanan #{order.order_number}</strong>
            </div>
            <p>Harga, stok, jadwal, voucher, dan ongkir akan dihitung ulang saat checkout.</p>
          </div>
        </section>
      )}

      {loading && <p className="reorder__panel">Memuat riwayat produk...</p>}
      {error && <p className="reorder__panel" role="alert">{error}</p>}

      {warnings.length > 0 && (
        <section className="reorder__panel" role="status">
          <strong>Catatan Pembaharuan:</strong>
          <ul>
            {warnings.map((note, idx) => <li key={idx}>{note}</li>)}
          </ul>
          <button type="button" className="reorder__change" onClick={() => navigate("/keranjang")}>
            Lanjut ke Keranjang
          </button>
        </section>
      )}

      {!loading && (
        <section className="reorder__panel reorder__items">
          <header className="reorder__section-head">
            <h2>Daftar Produk ({reorderableItems.length})</h2>
            <span>Harga Terkini</span>
          </header>
          {reorderableItems.length ? reorderableItems.map((item, idx) => (
            <div className="reorder__product" key={`${item.product_variant_id || idx}-${idx}`}>
              <span className="reorder__product-image" aria-hidden="true">🛒</span>
              <div className="reorder__product-copy">
                <strong>{item.product_name}</strong>
                <small>{item.variant_name} • {item.last_quantity || 1}x</small>
                {!item.is_available && <small>Stok habis / nonaktif</small>}
              </div>
              <div className="reorder__product-price">
                <strong>{rupiah(item.price)}</strong>
                {!orderId && item.is_available && (
                  <button type="button" className="reorder__change" onClick={() => handleAddSingle(item)}>
                    <Plus size={12} /> Keranjang
                  </button>
                )}
              </div>
            </div>
          )) : <p>Belum ada produk dari pesanan selesai.</p>}
        </section>
      )}

      {orderId && reorderableItems.length > 0 && (
        <footer className="reorder__paybar">
          <div>
            <span>Siap dimasukkan ke keranjang</span>
            <strong>{reorderableItems.length} Produk</strong>
          </div>
          <button type="button" disabled={submitting} onClick={handleReorderAll}>
            <ShoppingCart size={13} /> {submitting ? "Memproses..." : "Masukkan Keranjang"}
          </button>
        </footer>
      )}
    </main>
  );
}
