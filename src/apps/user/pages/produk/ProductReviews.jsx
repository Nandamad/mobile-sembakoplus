import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Star } from "lucide-react";
import "./ProductReviews.css";

const SAMPLE_REVIEWS = [
  {
    id: 1,
    initials: "RA",
    name: "Rina Anggraini",
    date: "18 Nov 2026 • 250 + 500 gram",
    comment: "Masya Allah bayamnya segar banget, masih ada embun pagi. Diantar kurir jam 7 pagi pas buat sarapan anak. Timbangan pas bersih tanpa akar tebal.",
    image: "🥬",
    tone: "green",
  },
  {
    id: 2,
    initials: "BS",
    name: "Budi Santoso",
    date: "17 Nov 2026 • 1 Kilogram",
    comment: "Pengiriman kilat cuma 20 menit dari PT Generasi Digital Sinergi. Daunnya masih segar, gak ada yang bolong. Kualitas bayamnya juara sekali di Cilacap!",
    tone: "blue",
  },
  {
    id: 3,
    initials: "MK",
    name: "Mama Kayla",
    date: "15 Nov 2026 • 250 gram",
    comment: "Porsi 250gr pas banget buat masak sekali makan. Harganya murah meriah sama banyak daunnya segar tapi perlu menetap sedikit.",
    tone: "pink",
  },
  {
    id: 4,
    initials: "HW",
    name: "Hendra Wijaya",
    date: "12 Nov 2026 • 250 gram",
    comment: "Beli bayam buat stok MPASI si kecil, bersih segar gak perlu repot milihin daun busuk. Selalu langganan tiap 2 hari sekali.",
    tone: "purple",
  },
];

const FILTERS = [
  { id: "all", label: "Semua (1.2k)" },
  { id: "photos", label: "Dengan Foto (840)" },
  { id: "five", label: "5 Bintang (1.1k)" },
];

export default function ProductReviews() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const product = state?.product;
  const [filter, setFilter] = useState("all");
  const reviews = filter === "photos"
    ? SAMPLE_REVIEWS.filter((review) => review.image)
    : SAMPLE_REVIEWS;
  const count = product?.reviews || "1.2k";
  const productImage = product?.image || product?.images?.[0];

  return (
    <main className="product-reviews">
      <header className="product-reviews__header">
        <button
          type="button"
          aria-label="Kembali ke produk"
          onClick={() => product ? navigate(-1) : navigate("/beranda")}
        >
          <ChevronLeft size={17} />
        </button>
        <h1>Penilaian Produk ({count})</h1>
      </header>

      <nav className="product-reviews__filters" aria-label="Filter penilaian">
        {FILTERS.map((item) => (
          <button
            type="button"
            key={item.id}
            className={filter === item.id ? "is-active" : ""}
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <section className="product-reviews__list" aria-label={`Ulasan ${product?.name || "produk"}`}>
        {reviews.map((review) => (
          <article className="product-reviews__item" key={review.id}>
            <header>
              <span className={`product-reviews__avatar product-reviews__avatar--${review.tone}`}>
                {review.initials}
              </span>
              <div>
                <strong>{review.name}</strong>
                <small><Star size={9} fill="var(--sp-rating)" stroke="var(--sp-rating)" /> 5.0 <i>•</i> {review.date}</small>
              </div>
            </header>
            <p>{review.comment}</p>
            {review.image && (
              <div className="product-reviews__photo">
                {productImage ? <img src={productImage} alt={`Foto ${product?.name || "produk"} dari pembeli`} /> : review.image}
              </div>
            )}
          </article>
        ))}
      </section>

      <footer className="product-reviews__footer">
        <button type="button" onClick={() => navigate("/pesanan/ulasan")}>
          Tulis Ulasan Anda
        </button>
      </footer>
    </main>
  );
}
