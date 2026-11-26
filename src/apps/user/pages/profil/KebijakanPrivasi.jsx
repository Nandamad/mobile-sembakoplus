import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import api from "../../../../shared/services/api";
import "./KebijakanPrivasi.css";

function splitBlocks(html) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const blocks = [];
  doc.body.querySelectorAll("p, h2, h3, h4, li").forEach((node) => {
    const text = (node.textContent || "").trim();
    if (text) blocks.push(text);
  });
  if (!blocks.length) {
    const fallback = (doc.body.textContent || "").trim();
    if (fallback) blocks.push(fallback);
  }
  return blocks;
}

export default function KebijakanPrivasi() {
  const navigate = useNavigate();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get("/content/privacy-policy")
      .then(({ data }) => {
        if (active) {
          setPolicy(data?.data ?? null);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Kebijakan privasi belum tersedia.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const paragraphs = splitBlocks(policy?.content || "");

  return (
    <main className="policy">
      <header className="policy__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Kebijakan Privasi &amp; Syarat</h1>
      </header>

      {loading && <p className="policy__intro">Memuat kebijakan privasi...</p>}
      {error && <p className="policy__intro" role="alert">{error}</p>}

      {!loading && policy && (
        <>
          <section className="policy__intro">
            <strong>SembakoPlus • Ketentuan Resmi</strong>
            <small>
              Versi {policy.version}
              {policy.effective_at ? ` • Berlaku sejak ${new Date(policy.effective_at).toLocaleDateString("id-ID")}` : ""}
            </small>
          </section>

          <div className="policy__sections">
            {paragraphs.map((text, index) => (
              <article className="policy__section" key={index}>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
