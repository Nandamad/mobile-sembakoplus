import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import "./ProductCard.css";

export default function ProductCard({ product: p, label, onAdd }) {
  const navigate = useNavigate();
  const open = () => navigate(`/produk/${p.id}`, { state: { product: p } });

  return (
    <article
      className="pcard"
      role="link"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => e.key === "Enter" && open()}
    >
      <div className="pcard__img">
        {p.image ? <img src={p.image} alt={p.name} /> : <span>{p.icon || "🛒"}</span>}
      </div>
      <div className="pcard__body">
        <p className="pcard__cat">{label}</p>
        <h3 className="pcard__name">{p.name}</h3>
        <p className="pcard__unit">{p.unit}</p>
        <div className="pcard__foot">
          <strong>Rp {Number(p.price).toLocaleString("id-ID")}</strong>
          <button
            type="button"
            aria-label={`Tambah ${p.name}`}
            onClick={(e) => { e.stopPropagation(); onAdd?.(); }}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}