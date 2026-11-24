import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, Camera, Star, Truck } from "lucide-react";
import "./BeriPenilaian.css";

const DEMO_ORDER = {
  id: "#SP-261018-AGT",
  date: "18 Nov 2026",
  product: "Bayam Hijau Segar, Telur Ayam Negeri",
  image: "🥬",
};

const COURIER_TAGS = ["Ramah & Sopan", "Pengiriman Cepat", "Pesanan Terjaga Aman", "Kembalian Pas"];
const PRODUCT_TAGS = ["Sayur & Ikan Segar", "Kemasan Rapi", "Timbangan Pas 100%", "Packing Bersih & Rapi", "Sesuai Pesanan"];

function RatingGroup({ title, description, rating, onRate, tags, selectedTags, onToggle, icon }) {
  return (
    <section className="review__group">
      <header className="review__group-header">
        <span>{icon}</span>
        <strong>{title}</strong>
      </header>
      <p>{description}</p>
      <div className="review__stars" role="group" aria-label={`Nilai ${title}`}>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            type="button"
            key={value}
            aria-label={`${value} bintang`}
            aria-pressed={rating === value}
            onClick={() => onRate(value)}
          >
            <Star size={18} fill={value <= rating ? "#f5a623" : "transparent"} stroke="#f5a623" />
          </button>
        ))}
        <strong>{rating === 5 ? "Sangat Baik (5/5)" : `${rating}/5`}</strong>
      </div>
      <div className="review__tags">
        {tags.map((tag) => (
          <button
            type="button"
            key={tag}
            className={selectedTags.includes(tag) ? "is-selected" : ""}
            aria-pressed={selectedTags.includes(tag)}
            onClick={() => onToggle(tag)}
          >
            {selectedTags.includes(tag) ? "✓ " : "+ "}{tag}
          </button>
        ))}
      </div>
    </section>
  );
}

export default function BeriPenilaian() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const formRef = useRef(null);
  const order = state?.order ?? DEMO_ORDER;
  const [courierRating, setCourierRating] = useState(5);
  const [productRating, setProductRating] = useState(5);
  const [courierTags, setCourierTags] = useState(["Ramah & Sopan", "Pengiriman Cepat"]);
  const [productTags, setProductTags] = useState(["Sayur & Ikan Segar", "Kemasan Rapi"]);
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState([]);
  const [anonymous, setAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  function toggleTag(setter, tag) {
    setter((selected) => selected.includes(tag)
      ? selected.filter((item) => item !== tag)
      : [...selected, tag]);
  }

  function submitReview(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="review">
      <header className="review__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={17} />
        </button>
        <div>
          <h1>Beri Penilaian</h1>
          <small>Order {order.id} • {order.date}</small>
        </div>
      </header>

      <form ref={formRef} className="review__form" onSubmit={submitReview}>
        <RatingGroup
          title="Kurir Internal Toko"
          description="Bagaimana pelayanan kurir pengantar?"
          rating={courierRating}
          onRate={setCourierRating}
          tags={COURIER_TAGS}
          selectedTags={courierTags}
          onToggle={(tag) => toggleTag(setCourierTags, tag)}
          icon={<Truck size={15} />}
        />

        <RatingGroup
          title="Kualitas Produk Belanja"
          description={order.product || DEMO_ORDER.product}
          rating={productRating}
          onRate={setProductRating}
          tags={PRODUCT_TAGS}
          selectedTags={productTags}
          onToggle={(tag) => toggleTag(setProductTags, tag)}
          icon={<span className="review__product-emoji">{order.image || "🥬"}</span>}
        />

        <section className="review__comment">
          <label htmlFor="review-comment">Tulis Ulasan &amp; Lampirkan Foto (Opsional)</label>
          <textarea
            id="review-comment"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Bagaimana kualitas barang, timbangannya pas, pengiriman cepat dan aman. Mantap, SembakoPlus!"
            rows={3}
          />
          <div className="review__extras">
            <label className="review__upload">
              <Camera size={13} /> + Foto
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => setPhotos(Array.from(event.target.files ?? []))}
              />
            </label>
            {photos.length > 0 && <small>{photos.length} foto dipilih</small>}
            <label className="review__anonymous">
              Kirim Anonim
              <input
                type="checkbox"
                checked={anonymous}
                onChange={(event) => setAnonymous(event.target.checked)}
              />
              <span aria-hidden="true" />
            </label>
          </div>
        </section>
      </form>

      {submitted && (
        <p className="review__success" role="status">
          Terima kasih! Penilaian Anda berhasil dikirim.
        </p>
      )}
      <footer className="review__footer">
        <button type="button" onClick={() => formRef.current?.requestSubmit()}>
          {submitted ? "Penilaian Terkirim" : "Kirim Penilaian"}
        </button>
      </footer>
    </main>
  );
}
