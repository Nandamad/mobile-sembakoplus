import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Clock3, Info, Ticket } from "lucide-react";
import "./Voucher.css";

const ACTIVE_VOUCHERS = [
  { id: "ongkir", brand: "SEMBakoPLUS", kind: "GRATIS ONGKIR", title: "Gratis Ongkir", detail: "Min. Belanja Rp 20.000", expiry: "18 Hari 2 Jam", category: "Ongkir", tone: "green" },
  { id: "diskon15", brand: "SEMBAKOPLUS", kind: "DISKON 50%", title: "Diskon 50% Sayur Pilihan", detail: "Maks. Rp 15 rb • Min. Rp 30.000", expiry: "18 Hari 10 Jam", category: "Diskon", tone: "red" },
  { id: "potongan", brand: "SEMBAKOPLUS", kind: "POTONGAN Rp 20.000", title: "Spesial Daging Sapi & Ayam", detail: "Potongan Rp 20 rb • Min. Rp 75.000", expiry: "9 Hari 05 Jam", category: "Diskon", tone: "green" },
  { id: "cashback", brand: "SEMBAKOPLUS", kind: "CASHBACK 15% COIN", title: "Cashback Koin Sembako", detail: "Hingga 10.000 Koin • Min. Rp 50.000", expiry: "18 Hari 10 Jam", category: "Cashback", tone: "orange" },
  { id: "bebasongkir", brand: "SEMBAKOPLUS", kind: "GRATIS ONGKIR", title: "Bebas Ongkir Belanja Rutin", detail: "Tanpa minimum belanja", expiry: "18 Hari 10 Jam", category: "Ongkir", tone: "green" },
];

const HISTORY_VOUCHERS = {
  "Telah Digunakan": [
    { id: "used-ongkir", brand: "SEMBAKOPLUS", kind: "GRATIS ONGKIR", title: "Gratis Ongkir Kilat 30 Menit", detail: "Digunakan pada 22 Nov 2026, 08:30 WIB", code: "SPKL-261122-0812-001", status: "TELAH DIPAKAI", tone: "green" },
    { id: "used-diskon", brand: "SEMBAKOPLUS", kind: "DISKON Rp 15.000", title: "Diskon Belanja Sayur & Bumbu", detail: "Pesanan pada 22 Nov 2026, 10:15 WIB", code: "SPKL-261122-1023-015", status: "TELAH DIPAKAI", tone: "green" },
    { id: "used-cashback", brand: "SEMBAKOPLUS", kind: "CASHBACK 5.000 COIN", title: "Cashback Koin SembakoPlus", detail: "Pesanan pada 17 Nov 2026, 15:45 WIB", code: "SPKL-261117-1545-011", status: "TELAH DIPAKAI", tone: "green" },
  ],
  Kedaluwarsa: [
    { id: "expired-promo", brand: "SEMBAKOPLUS", kind: "POTONGAN Rp 20.000", title: "Spesial Daging Ayam & Sayur", detail: "Kedaluwarsa pada 15 Nov 2026", code: "SPKL-261115-1002-020", status: "KEDALUWARSA", tone: "red" },
  ],
};

const FILTERS = ["Semua (5)", "Gratis Ongkir (2)", "Diskon (2)", "Cashback (1)"];

function VoucherCard({ voucher, onUse }) {
  return (
    <article className={`voucher__card voucher__card--${voucher.tone}`}>
      <div className="voucher__ticket">
        <strong>{voucher.brand}</strong>
        <b>{voucher.kind}</b>
        <small>Berlaku untuk produk pilihan</small>
      </div>
      <div className="voucher__details">
        <div className="voucher__copy">
          <strong>{voucher.title}</strong>
          <span>{voucher.detail}</span>
          {voucher.expiry ? (
            <small><Clock3 size={10} /> {voucher.expiry} lagi</small>
          ) : (
            <small>Kode: {voucher.code}</small>
          )}
        </div>
        {voucher.status ? (
          <span className={`voucher__status voucher__status--${voucher.tone}`}>{voucher.status}</span>
        ) : (
          <button type="button" onClick={() => onUse(voucher)}>Pakai</button>
        )}
      </div>
    </article>
  );
}

export default function Voucher() {
  const navigate = useNavigate();
  const [view, setView] = useState("aktif");
  const [filter, setFilter] = useState("Semua (5)");
  const [historyTab, setHistoryTab] = useState("Telah Digunakan");

  const activeVouchers = ACTIVE_VOUCHERS.filter((voucher) => {
    if (filter.startsWith("Gratis Ongkir")) return voucher.category === "Ongkir";
    if (filter.startsWith("Diskon")) return voucher.category === "Diskon";
    if (filter.startsWith("Cashback")) return voucher.category === "Cashback";
    return true;
  });

  return (
    <main className="voucher">
      <header className="voucher__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={17} />
        </button>
        <h1>{view === "aktif" ? "Voucher Saya (5)" : "Riwayat Voucher"}</h1>
        <button
          type="button"
          className="voucher__header-action"
          onClick={() => setView((current) => current === "aktif" ? "riwayat" : "aktif")}
        >
          {view === "aktif" ? "Riwayat" : "Voucher Saya"}
        </button>
      </header>

      {view === "aktif" ? (
        <>
          <nav className="voucher__filters" aria-label="Filter voucher">
            {FILTERS.map((item) => (
              <button
                type="button"
                key={item}
                className={filter === item ? "is-active" : ""}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </nav>
          <section className="voucher__list" aria-label="Voucher aktif">
            {activeVouchers.map((voucher) => (
              <VoucherCard
                key={voucher.id}
                voucher={voucher}
                onUse={() => navigate("/beranda")}
              />
            ))}
          </section>
          <p className="voucher__notice"><Info size={12} /> Voucher dapat digabung dengan Koin saat checkout.</p>
          <footer className="voucher__footer">
            <button type="button" onClick={() => navigate("/beranda")}>
              Mulai Belanja &amp; Gunakan Voucher
            </button>
          </footer>
        </>
      ) : (
        <>
          <nav className="voucher__history-tabs" aria-label="Status voucher">
            {Object.keys(HISTORY_VOUCHERS).map((tab) => (
              <button
                type="button"
                key={tab}
                className={historyTab === tab ? "is-active" : ""}
                onClick={() => setHistoryTab(tab)}
              >
                {tab} ({HISTORY_VOUCHERS[tab].length})
              </button>
            ))}
          </nav>
          <section className="voucher__list voucher__list--history" aria-label={historyTab}>
            {HISTORY_VOUCHERS[historyTab].map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} />
            ))}
          </section>
          <footer className="voucher__footer">
            <button type="button" onClick={() => setView("aktif")}>
              <Ticket size={14} /> Kembali ke Voucher Aktif <ChevronRight size={14} />
            </button>
          </footer>
        </>
      )}
    </main>
  );
}
