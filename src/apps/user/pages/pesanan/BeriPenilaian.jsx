import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeft, PackageCheck, Star } from "lucide-react";
import api from "../../../../shared/services/api";
import "./BeriPenilaian.css";

const TAGS = ["Sayur & Bahan Segar", "Kemasan Rapi", "Timbangan Pas", "Pengiriman Cepat", "Sesuai Pesanan"];

export default function BeriPenilaian() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || state?.order?.id || null;
  const formRef = useRef(null);

  const [order, setOrder] = useState(state?.order ?? null);
  const [loading, setLoading] = useState(Boolean(orderId) && !state?.order?.items);
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return undefined;
    let active = true;
    api.get(`/orders/${orderId}`)
      .then(({ data }) => {
        if (active) setOrder(data?.data ?? null);
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Data pesanan gagal dimuat.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [orderId]);

  function toggleTag(tag) {
    setSelectedTags((current) => current.includes(tag)
      ? current.filter((item) => item !== tag)
      : [...current, tag]);
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!orderId) return setError("Pesanan tidak ditemukan.");
    const fullComment = [selectedTags.join(", "), comment.trim()].filter(Boolean).join(" — ");

    try {
      setSubmitting(true);
      setError("");
      await api.post(`/orders/${orderId}/reviews`, {
        rating,
        comment: fullComment || null,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Penilaian gagal dikirim.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="review">
        <header className="review__header">
          <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}><ChevronLeft size={17} /></button>
          <div><h1>Beri Penilaian</h1></div>
        </header>
        <p className="review__group">Memuat pesanan...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="review">
        <header className="review__header">
          <button type="button" aria-label="Kembali" onClick={() => navigate("/pesanan")}><ChevronLeft size={17} /></button>
          <div><h1>Beri Penilaian</h1></div>
        </header>
        <section className="review__group">
          <p>{error || "Pilih pesanan yang sudah selesai terlebih dahulu."}</p>
          <button type="button" onClick={() => navigate("/pesanan")}>Ke Pesanan Saya</button>
        </section>
      </main>
    );
  }

  const productSummary = (order.items ?? []).map((item) => item.product_name).join(", ") || "Pesanan SembakoPlus";

  return (
    <main className="review">
      <header className="review__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={17} />
        </button>
        <div>
          <h1>Beri Penilaian</h1>
          <small>Order #{order.order_number}</small>
        </div>
      </header>

      <form ref={formRef} className="review__form" onSubmit={submitReview}>
        <section className="review__group">
          <header className="review__group-header">
            <span><PackageCheck size={15} /></span>
            <strong>Kualitas Pesanan &amp; Pelayanan</strong>
          </header>
          <p>{productSummary}</p>
          <div className="review__stars" role="group" aria-label="Nilai pesanan">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                type="button"
                key={value}
                aria-label={`${value} bintang`}
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
              >
                <Star
                  size={18}
                  fill={value <= rating ? "var(--sp-rating)" : "transparent"}
                  stroke="var(--sp-rating)"
                />
              </button>
            ))}
            <strong>{rating}/5</strong>
          </div>
          <div className="review__tags">
            {TAGS.map((tag) => (
              <button
                type="button"
                key={tag}
                className={selectedTags.includes(tag) ? "is-selected" : ""}
                aria-pressed={selectedTags.includes(tag)}
                onClick={() => toggleTag(tag)}
              >
                {selectedTags.includes(tag) ? "✓ " : "+ "}{tag}
              </button>
            ))}
          </div>
        </section>

        <section className="review__comment">
          <label htmlFor="review-comment">Tulis Ulasan Anda (Opsional)</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Bagikan pengalaman belanja dan pengantaran Anda..."
            rows={3}
            maxLength={500}
          />
        </section>
      </form>

      {error && <p className="review__group" role="alert">{error}</p>}
      {submitted && (
        <p className="review__success" role="status">
          Terima kasih! Penilaian Anda telah tersimpan.
        </p>
      )}
      <footer className="review__footer">
        <button
          type="button"
          disabled={submitting || submitted || Boolean(order.rating)}
          onClick={() => formRef.current?.requestSubmit()}
        >
          {order.rating || submitted ? "Penilaian Tersimpan" : submitting ? "Mengirim..." : "Kirim Penilaian"}
        </button>
      </footer>
    </main>
  );
}
