import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Star } from "lucide-react";
import api from "../../../../shared/services/api";
import "./ProductReviews.css";

const FILTERS = [
  { id: "all", label: "Semua" },
  { id: "five", label: "5 Bintang" },
];

export default function ProductReviews() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const product = state?.product ?? null;
  const [filter, setFilter] = useState("all");
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState({ total: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const params = filter === "five" ? { rating: 5 } : {};
    api.get(`/products/${id}/reviews`, { params })
      .then(({ data }) => {
        if (!active) return;
        setReviews(data?.data ?? []);
        setMeta(data?.meta ?? { total: 0, average_rating: 0 });
        setError("");
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Ulasan produk gagal dimuat.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, filter]);

  return (
    <main className="product-reviews">
      <header className="product-reviews__header">
        <button
          type="button"
          aria-label="Kembali ke produk"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft size={17} />
        </button>
        <h1>Penilaian Produk ({meta.total ?? 0})</h1>
      </header>

      <nav className="product-reviews__filters" aria-label="Filter penilaian">
        {FILTERS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={filter === item.id ? "is-active" : ""}
            aria-pressed={filter === item.id}
            onClick={() => { setLoading(true); setFilter(item.id); }}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {loading && <p className="product-reviews__empty">Memuat ulasan produk...</p>}
      {error && <p className="product-reviews__empty" role="alert">{error}</p>}

      {!loading && !error && (
        <section className="product-reviews__list" aria-label={`Ulasan ${product?.name || "produk"}`}>
          {reviews.length ? reviews.map((review) => (
            <article className="product-reviews__item" key={review.id}>
              <header>
                <span className="product-reviews__avatar product-reviews__avatar--green">
                  {review.initials || "PL"}
                </span>
                <div>
                  <strong>{review.reviewer_name}</strong>
                  <small>
                    <Star size={9} fill="var(--sp-rating)" stroke="var(--sp-rating)" /> {Number(review.rating).toFixed(1)}
                    {review.variants?.length ? <> <i>•</i> {review.variants.join(", ")}</> : null}
                  </small>
                </div>
              </header>
              <p>{review.comment || "Pembeli memberikan penilaian tanpa komentar tertulis."}</p>
            </article>
          )) : (
            <p className="product-reviews__empty">Belum ada ulasan untuk produk ini.</p>
          )}
        </section>
      )}

      <footer className="product-reviews__footer">
        <button type="button" onClick={() => navigate("/pesanan")}>
          Lihat Pesanan Saya
        </button>
      </footer>
    </main>
  );
}
