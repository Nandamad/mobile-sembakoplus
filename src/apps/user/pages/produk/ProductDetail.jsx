import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../../../../shared/services/api";
import { ChevronLeft, Star, Plus, Check, Minus, X } from "lucide-react";
import { addCartItem, createCartItem } from "../keranjang/cartData";
import "./ProductDetail.css";

const rp = (n) => "Rp " + Number(n).toLocaleString("id-ID");

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  // data awal dari kartu yang diklik (langsung tampil), lalu dilengkapi dari API
  const [p, setP] = useState(state?.product ?? null);
  const [img, setImg] = useState(0);
  const [vi, setVi] = useState(0); // varian berat terpilih
  const [added, setAdded] = useState(false);
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    api.get(`/api/products/${id}`).then((r) => setP(r.data)).catch(() => {});
  }, [id]);

  if (!p) {
    return (
      <main className="detail">
        <p className="detail__empty">Produk tidak ditemukan.</p>
      </main>
    );
  }

  const variants = p.variants?.length
    ? p.variants
    : [{ label: p.unit, price: p.price, original_price: p.original_price }];
  const v = variants[vi] ?? variants[0];
  const images = p.images?.length ? p.images : p.image ? [p.image] : [];
  const save = v.original_price > v.price ? v.original_price - v.price : 0;
  const pct = save ? Math.round((save / v.original_price) * 100) : 0;

  function handleAdd() {
    addCartItem(p, v, quantity);
    setAdded(true);
    setShowCartSheet(false);
    setQuantity(1);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleBuyNow() {
    navigate("/checkout", {
      state: { checkoutItems: [{ ...createCartItem(p, v), quantity }] },
    });
  }

  return (
    <main className="detail">
      <div
        className="detail__hero"
        onClick={() => images.length > 1 && setImg((img + 1) % images.length)}
      >
        {images.length ? (
          <img src={images[img]} alt={p.name} />
        ) : (
          <span className="detail__emoji">{p.icon || "🛒"}</span>
        )}
        <button
          type="button"
          className="detail__back"
          aria-label="Kembali"
          onClick={(e) => { e.stopPropagation(); navigate(-1); }}
        >
          <ChevronLeft size={20} />
        </button>
        {images.length > 1 && (
          <span className="detail__count">{img + 1}/{images.length}</span>
        )}
      </div>

      <section className="detail__info">
        <div className="detail__price">
          <strong>{rp(v.price)}</strong>
          {save > 0 && (
            <>
              <s>{rp(v.original_price)}</s>
              <span className="detail__pct">-{pct}%</span>
              <span className="detail__save">Hemat {rp(save)}</span>
            </>
          )}
        </div>

        <h1 className="detail__name">{p.name}</h1>

        {p.rating && (
          <button
            type="button"
            className="detail__rating"
            aria-label={`Lihat ${p.reviews || "semua"} ulasan untuk ${p.name}`}
            onClick={() => navigate(`/produk/${id}/ulasan`, { state: { product: p } })}
          >
            <Star size={13} fill="var(--sp-rating)" stroke="var(--sp-rating)" /> <b>{p.rating}</b>
            {p.reviews && <> ({p.reviews} ulasan)</>}
            {p.sold && <> • Terjual {p.sold}</>}
          </button>
        )}
      </section>

      <section className="detail__box">
        <h2>Pilih Berat / Timbangan:</h2>
        <div className="detail__variants">
          {variants.map((x, i) => (
            <button
              key={x.label}
              type="button"
              className={i === vi ? "is-on" : ""}
              onClick={() => setVi(i)}
            >
              <b>{x.label}</b>
              <span>{rp(x.price)}</span>
            </button>
          ))}
        </div>
      </section>

      {(p.specs?.length > 0 || p.description) && (
        <section className="detail__box">
          <h2>Deskripsi Produk:</h2>
          {p.specs?.length > 0 && (
            <dl className="detail__specs">
              {p.specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>: <b>{s.value}</b></dd>
                </div>
              ))}
            </dl>
          )}
          {p.description && <p className="detail__desc">{p.description}</p>}
        </section>
      )}

      <div className="detail__bar">
        <button
          type="button"
          className="detail__btn detail__btn--ghost"
          onClick={() => setShowCartSheet(true)}
        >
          {added ? <Check size={16} /> : <Plus size={16} />}
          {added ? "Ditambahkan" : "Keranjang"}
        </button>
        <button type="button" className="detail__btn" onClick={handleBuyNow}>
          Beli Sekarang
        </button>
      </div>

      {showCartSheet && (
        <div
          className="detail__sheet-backdrop"
          onClick={() => setShowCartSheet(false)}
        >
          <section
            className="detail__sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="detail-sheet-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="detail__sheet-close"
              aria-label="Tutup pilihan produk"
              onClick={() => setShowCartSheet(false)}
            >
              <X size={15} />
            </button>
            <div className="detail__sheet-product">
              <span className="detail__sheet-image">
                {images.length ? <img src={images[img]} alt="" /> : p.icon || "🛒"}
              </span>
              <div>
                <strong id="detail-sheet-title">{rp(v.price)}</strong>
                {v.original_price > v.price && <small><s>{rp(v.original_price)}</s></small>}
                <span>Stok: {p.stock ?? 50} • {v.label}</span>
              </div>
            </div>

            <section className="detail__sheet-section">
              <h2>Pilih Berat / Timbangan</h2>
              <div className="detail__variants">
                {variants.map((variant, index) => (
                  <button
                    key={variant.label}
                    type="button"
                    className={index === vi ? "is-on" : ""}
                    aria-pressed={index === vi}
                    onClick={() => setVi(index)}
                  >
                    <b>{variant.label}</b>
                    <span>{rp(variant.price)}</span>
                  </button>
                ))}
              </div>
            </section>

            <section className="detail__sheet-section detail__sheet-quantity">
              <h2>Jumlah Pembelian</h2>
              <div className="detail__stepper" aria-label="Jumlah pembelian">
                <button
                  type="button"
                  aria-label="Kurangi jumlah"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                >
                  <Minus size={13} />
                </button>
                <strong>{quantity}</strong>
                <button
                  type="button"
                  aria-label="Tambah jumlah"
                  onClick={() => setQuantity((current) => current + 1)}
                >
                  <Plus size={13} />
                </button>
              </div>
            </section>

            <div className="detail__sheet-total">
              <span>Total Belanja</span>
              <strong>{rp(v.price * quantity)}</strong>
            </div>
            <button type="button" className="detail__sheet-submit" onClick={handleAdd}>
              <Plus size={14} /> Masukkan Keranjang
            </button>
          </section>
        </div>
      )}
    </main>
  );
}