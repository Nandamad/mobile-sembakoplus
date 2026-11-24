import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  Leaf,
  MessageCircle,
  PackageCheck,
  QrCode,
  Search,
  UserRound,
} from "lucide-react";
import "./PusatBantuan.css";

const TOPICS = [
  { name: "Pesanan & Kirim", detail: "Lacak & status pesanan", category: "pesanan", icon: PackageCheck },
  { name: "QRIS & COD", detail: "Panduan pembayaran", category: "pembayaran", icon: QrCode },
  { name: "Garansi Segar", detail: "Komplain & retur", category: "produk", icon: Leaf },
  { name: "Akun & Alamat", detail: "Ubah info & data", category: "akun", icon: UserRound },
];

const QUESTIONS = [
  {
    question: "Berapa lama estimasi sembako sampai?",
    answer: "Pengiriman instan biasanya tiba dalam 30–45 menit, bergantung pada jarak dan kondisi pesanan. Estimasi terbaru dapat dilihat di halaman pelacakan pesanan.",
    category: "pesanan",
  },
  {
    question: "Metode pembayaran apa saja yang didukung?",
    answer: "Anda dapat membayar dengan QRIS dari berbagai e-wallet dan aplikasi m-banking, atau memilih COD tunai saat pesanan sampai.",
    category: "pembayaran",
  },
  {
    question: "Bagaimana jika produk sayur atau buah rusak?",
    answer: "Kami menjaga kesegaran produk. Jika pesanan diterima dalam kondisi rusak, siapkan foto produk dan hubungi CS agar tim kami dapat membantu pemeriksaan.",
    category: "produk",
  },
  {
    question: "Bagaimana cara mengubah alamat atau data akun?",
    answer: "Buka Profil, lalu pilih Daftar Alamat atau Pengaturan Akun & Keamanan untuk memperbarui informasi Anda.",
    category: "akun",
  },
];

export default function PusatBantuan() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [openQuestion, setOpenQuestion] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  const visibleQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    return QUESTIONS.filter((item) => {
      const matchesTopic = !activeTopic || item.category === activeTopic;
      const searchableText = `${item.question} ${item.answer}`.toLocaleLowerCase("id");
      const matchesQuery =
        !normalizedQuery ||
        normalizedQuery.split(/\s+/).every((term) => searchableText.includes(term));
      return matchesTopic && matchesQuery;
    });
  }, [activeTopic, query]);

  function chooseTopic(category) {
    setActiveTopic((current) => current === category ? "" : category);
    setQuery("");
    setOpenQuestion("");
  }

  return (
    <main className="help-center">
      <header className="help-center__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={16} />
        </button>
        <h1>Pusat Bantuan &amp; CS</h1>
      </header>

      <div className="help-center__content">
        <label className="help-center__search">
          <Search size={12} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveTopic("");
              setOpenQuestion("");
            }}
            placeholder="Ketik kendala atau pertanyaan Anda..."
            aria-label="Cari bantuan"
          />
        </label>

        <section className="help-center__card">
          <span className="help-center__illustration">
            <MessageCircle size={15} />
          </span>
          <div className="help-center__card-copy">
            <h2>Layanan CS WhatsApp Resmi</h2>
            <p>
              Kendala pesanan, konfirmasi kurir, atau pertanyaan barang?
              Tim SembakoPlus siap melayani langsung.
            </p>
          </div>
          <span className="help-center__availability">Online</span>
          <button
            type="button"
            className="help-center__chat"
            onClick={() => setChatMessage("Kontak WhatsApp resmi belum terhubung di aplikasi ini.")}
          >
            <MessageCircle size={11} />
            Hubungi WhatsApp CS
          </button>
          {chatMessage && <p className="help-center__chat-notice" role="status">{chatMessage}</p>}
        </section>

        <section className="help-center__topics">
          <h2>Topik Bantuan Utama</h2>
          <div className="help-center__topic-grid">
            {TOPICS.map(({ name, detail, category, icon: Icon }) => (
              <button
                type="button"
                key={category}
                className={`help-center__topic${activeTopic === category ? " is-active" : ""}`}
                aria-pressed={activeTopic === category}
                onClick={() => category === "pembayaran"
                  ? navigate("/profil/bantuan/pembayaran", { state: { fromHelpCenter: true } })
                  : chooseTopic(category)}
              >
                <span><Icon size={13} /></span>
                <span className="help-center__topic-copy">
                  <strong>{name}</strong>
                  <small>{detail}</small>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="help-center__faqs">
          <h2>Pertanyaan Umum (FAQ)</h2>
          {visibleQuestions.length ? visibleQuestions.map((item) => {
            const isOpen = openQuestion === item.question;
            return (
              <article className="help-center__faq" key={item.question}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenQuestion(isOpen ? "" : item.question)}
                >
                  <strong>{item.question}</strong>
                  <ChevronDown size={11} className={isOpen ? "is-open" : ""} />
                </button>
                {isOpen && <p>{item.answer}</p>}
              </article>
            );
          }) : (
            <p className="help-center__empty">Belum ada jawaban yang cocok. Coba kata kunci lain.</p>
          )}
        </section>

        <footer className="help-center__hours">
          Layanan CS Resmi SembakoPlus • Setiap Hari 08:00 - 22:00 WIB
        </footer>
      </div>
    </main>
  );
}
