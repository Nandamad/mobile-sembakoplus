import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Check, ChevronLeft, Download, Share2, Store } from "lucide-react";
import api from "../../../../shared/services/api";
import "./StrukBelanja.css";

const rupiah = (amount) => `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;

function ReceiptRow({ label, value, emphasis = false }) {
  return (
    <div className={`receipt__row${emphasis ? " receipt__row--emphasis" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function StrukBelanja() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || state?.order?.id || null;
  const shareToken = searchParams.get("token");

  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId || shareToken));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!orderId && !shareToken) return undefined;
    let active = true;

    const request = shareToken
      ? api.get(`/shared/receipts/${shareToken}`)
      : api.get(`/orders/${orderId}/receipt`);

    request
      .then(({ data }) => {
        if (active) {
          setReceipt(data?.data ?? null);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.response?.data?.error?.message || "Struk belanja belum tersedia.");
      })
      .finally(() => active && setLoading(false));

    return () => { active = false; };
  }, [orderId, shareToken]);

  async function handleDownloadPdf() {
    if (!orderId) return;
    try {
      setNotice("");
      const response = await api.get(`/orders/${orderId}/receipt/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${receipt?.invoice_number || receipt?.order_number || "struk"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setNotice(err.response?.data?.error?.message || "Gagal mengunduh PDF struk.");
    }
  }

  async function handleShare() {
    if (!orderId) return;
    try {
      setNotice("");
      const { data } = await api.post(`/orders/${orderId}/receipt/share-link`);
      const token = data?.data?.token;
      const shareUrl = token ? `${window.location.origin}/pesanan/struk?token=${encodeURIComponent(token)}` : data?.data?.url;
      if (navigator.share) {
        await navigator.share({
          title: `Struk ${receipt?.invoice_number || ""}`,
          url: shareUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setNotice("Tautan struk sementara berhasil disalin.");
      } else {
        setNotice(`Tautan struk: ${shareUrl}`);
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        setNotice(err.response?.data?.error?.message || "Gagal membuat tautan berbagi.");
      }
    }
  }

  return (
    <main className="receipt">
      <header className="receipt__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1>Struk Belanja Digital</h1>
          <p>{receipt ? `Order #${receipt.order_number} • ${receipt.invoice_issued_at_formatted}` : "Bukti Transaksi Resmi"}</p>
        </div>
      </header>

      {loading && <p className="receipt__paper">Memuat struk digital...</p>}
      {!loading && error && (
        <section className="receipt__paper">
          <p role="alert">{error}</p>
          <button type="button" className="receipt__action" onClick={() => navigate("/pesanan")}>
            Kembali ke Pesanan
          </button>
        </section>
      )}

      {!loading && receipt && (
        <>
          <article className="receipt__paper">
            <div className="receipt__brand">
              <span className="receipt__logo"><Store size={17} /></span>
              <strong>{receipt.seller?.name || "SembakoPlus"}</strong>
              {receipt.seller?.address && <small>{receipt.seller.address}</small>}
              <b className="receipt__paid">
                <Check size={11} /> LUNAS ({String(receipt.payment?.payment_method || "").toUpperCase()})
              </b>
            </div>

            <div className="receipt__metadata">
              <ReceiptRow label="No. Invoice" value={receipt.invoice_number} />
              <ReceiptRow label="No. Pesanan" value={receipt.order_number} />
              <ReceiptRow label="Waktu Terbit" value={receipt.invoice_issued_at_formatted} />
              {receipt.customer?.recipient_name && <ReceiptRow label="Nama Penerima" value={receipt.customer.recipient_name} />}
              {receipt.customer?.address_snapshot && <ReceiptRow label="Alamat Kirim" value={receipt.customer.address_snapshot} />}
              <ReceiptRow label="Jadwal Kirim" value={`${receipt.delivery_schedule?.delivery_date || "-"} (${receipt.delivery_schedule?.start_time}-${receipt.delivery_schedule?.end_time})`} />
            </div>

            <section className="receipt__items">
              <header>
                <strong>Daftar Belanjaan</strong>
                <span>{receipt.items?.length || 0} Item</span>
              </header>
              {(receipt.items ?? []).map((item, idx) => (
                <div className="receipt__product" key={`${item.product_name}-${idx}`}>
                  <div>
                    <strong>{item.product_name}</strong>
                    <small>{item.variant_name} • {item.quantity}x ({rupiah(item.unit_price)})</small>
                  </div>
                  <b>{rupiah(item.line_total)}</b>
                </div>
              ))}
            </section>

            <section className="receipt__totals">
              <strong>Rincian Tagihan</strong>
              <ReceiptRow label="Subtotal Belanja" value={rupiah(receipt.summary?.subtotal)} />
              {Number(receipt.summary?.product_discount_total) > 0 && (
                <ReceiptRow label="Diskon Produk" value={`-${rupiah(receipt.summary.product_discount_total)}`} emphasis />
              )}
              {Number(receipt.summary?.voucher_discount_total) > 0 && (
                <ReceiptRow label={`Voucher ${receipt.summary?.voucher_code || ""}`} value={`-${rupiah(receipt.summary.voucher_discount_total)}`} emphasis />
              )}
              {Number(receipt.summary?.coin_discount_total) > 0 && (
                <ReceiptRow label={`Potongan Koin (${receipt.summary.coins_redeemed})`} value={`-${rupiah(receipt.summary.coin_discount_total)}`} emphasis />
              )}
              <ReceiptRow label="Ongkos Kirim" value={rupiah(receipt.summary?.shipping_cost)} />
              {Number(receipt.summary?.shipping_discount) > 0 && (
                <ReceiptRow label="Subsidi Ongkir" value={`-${rupiah(receipt.summary.shipping_discount)}`} emphasis />
              )}
              <ReceiptRow label="Total Pembayaran" value={rupiah(receipt.summary?.total)} emphasis />
            </section>

            <footer className="receipt__note">
              <span>••••••••••••••••••••••••••••••••</span>
              <p>{receipt.barcode_value}</p>
              <small>Struk digital resmi SembakoPlus (tanpa PPN v1).</small>
            </footer>
          </article>

          {notice && <p className="receipt__note" role="status">{notice}</p>}

          {orderId && (
            <footer className="receipt__actions">
              <button type="button" className="receipt__action receipt__action--outline" onClick={handleDownloadPdf}>
                <Download size={14} />
                Unduh PDF
              </button>
              <button type="button" className="receipt__action" onClick={handleShare}>
                <Share2 size={14} />
                Bagikan Struk
              </button>
            </footer>
          )}
        </>
      )}
    </main>
  );
}
