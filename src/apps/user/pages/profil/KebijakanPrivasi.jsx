import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import "./KebijakanPrivasi.css";

const SECTIONS = [
  {
    title: "1. Perlindungan Data & Privasi Pengguna",
    body: "PT Generasi Digital Sinergi berkomitmen menjaga kerahasiaan data pribadi Anda. Informasi seperti nama, nomor telepon, dan alamat hanya digunakan untuk memproses pesanan dan layanan SembakoPlus. Data Anda tidak akan dijual atau dibagikan kepada pihak ketiga tanpa persetujuan, sesuai ketentuan perlindungan data pribadi yang berlaku.",
  },
  {
    title: "2. Jaminan Kesegaran Produk (100% Fresh)",
    body: "Seluruh produk yang kami sajikan, termasuk sayur, daging, ikan, dan kebutuhan pokok lainnya, dipilih langsung dari pasar setiap hari. Jika produk yang diterima tidak segar atau tidak sesuai pesanan, silakan hubungi Customer Service agar kami dapat membantu memberikan solusi terbaik.",
  },
  {
    title: "3. Standar Layanan Pengiriman Instan",
    body: "Pesanan yang masuk akan diproses dan dikirim secepat mungkin oleh kurir SembakoPlus. Waktu pengiriman mengikuti jadwal yang dipilih dan kondisi operasional di area layanan. Pastikan alamat dan nomor telepon yang dicantumkan sudah benar agar pesanan dapat diterima dengan baik.",
  },
  {
    title: "4. Kebijakan Pembatalan & Pengembalian Dana",
    body: "Pembatalan dapat diajukan sebelum pesanan diproses. Untuk pesanan yang telah dikirim atau diterima, pengajuan pengembalian dana akan ditinjau oleh tim Customer Service berdasarkan kondisi produk dan bukti yang diberikan. Dana dikembalikan ke metode pembayaran yang digunakan.",
  },
];

export default function KebijakanPrivasi() {
  const navigate = useNavigate();

  return (
    <main className="policy">
      <header className="policy__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Kebijakan Privasi &amp; Syarat</h1>
      </header>

      <section className="policy__intro">
        <strong>PT Generasi Digital Sinergi • Ketentuan Resmi</strong>
        <small>Terakhir diperbarui 15 November 2026 • Versi Dokumen v2.4.0</small>
      </section>

      <div className="policy__sections">
        {SECTIONS.map((section) => (
          <article className="policy__section" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
