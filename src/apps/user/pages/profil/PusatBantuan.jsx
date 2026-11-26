import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  MessageCircle,
  QrCode,
  Search,
} from "lucide-react";
import api from "../../../../shared/services/api";
import "./PusatBantuan.css";

function htmlToPlainText(html) {
  if (!html) return "";
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent || "").trim();
}

export default function PusatBantuan() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState([]);
  const [support, setSupport] = useState(null);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/help/faqs"),
      api.get("/support/contact").catch(() => ({ data: { data: null } })),
    ])
      .then(([faqRes, supportRes]) => {
        if (!active) return;
        setFaqs(faqRes.data?.data ?? []);
        setSupport(supportRes.data?.data ?? null);
        setError("");
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Gagal memuat pusat bantuan.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const visibleQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id");
    return faqs.filter((item) => {
      const searchableText = `${item.title} ${htmlToPlainText(item.content)}`.toLocaleLowerCase("id");
      return !normalizedQuery || normalizedQuery.split(/\s+/).every((term) => searchableText.includes(term));
    });
  }, [faqs, query]);

  function openWhatsappSupport() {
    if (!support?.is_active || !support?.whatsapp_url) {
      setChatMessage("Layanan WhatsApp CS sedang tidak aktif atau belum dikonfigurasi.");
      return;
    }
    window.open(support.whatsapp_url, "_blank", "noopener,noreferrer");
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
              setOpenId(null);
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
            <h2>{support?.display_name || "Layanan CS WhatsApp Resmi"}</h2>
            <p>
              Kendala pesanan, konfirmasi kurir, atau pertanyaan barang?
              Tim SembakoPlus siap melayani langsung.
            </p>
          </div>
          <span className="help-center__availability">
            {support?.is_active ? "Online" : "Offline"}
          </span>
          <button
            type="button"
            className="help-center__chat"
            onClick={openWhatsappSupport}
          >
            <MessageCircle size={11} />
            Hubungi WhatsApp CS
          </button>
          {chatMessage && <p className="help-center__chat-notice" role="status">{chatMessage}</p>}
        </section>

        <section className="help-center__topics">
          <h2>Panduan Cepat</h2>
          <div className="help-center__topic-grid">
            <button
              type="button"
              className="help-center__topic"
              onClick={() => navigate("/profil/bantuan/pembayaran", { state: { fromHelpCenter: true } })}
            >
              <span><QrCode size={13} /></span>
              <span className="help-center__topic-copy">
                <strong>QRIS &amp; COD</strong>
                <small>Panduan pembayaran resmi</small>
              </span>
            </button>
          </div>
        </section>

        <section className="help-center__faqs">
          <h2>Pertanyaan Umum (FAQ)</h2>
          {loading && <p className="help-center__empty">Memuat daftar FAQ...</p>}
          {error && <p className="help-center__empty" role="alert">{error}</p>}
          {!loading && !error && (
            visibleQuestions.length ? visibleQuestions.map((item) => {
              const isOpen = openId === item.id;
              return (
                <article className="help-center__faq" key={item.id}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenId(isOpen ? null : item.id)}
                  >
                    <strong>{item.title}</strong>
                    <ChevronDown size={11} className={isOpen ? "is-open" : ""} />
                  </button>
                  {isOpen && <p>{htmlToPlainText(item.content)}</p>}
                </article>
              );
            }) : (
              <p className="help-center__empty">Belum ada FAQ yang cocok. Coba kata kunci lain.</p>
            )
          )}
        </section>

        <footer className="help-center__hours">
          {support?.opening_hours || "Jam layanan mengikuti jadwal operasional toko"}
        </footer>
      </div>
    </main>
  );
}
