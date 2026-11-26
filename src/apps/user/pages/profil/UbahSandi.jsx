import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, Eye, EyeOff, Lock, X } from "lucide-react";
import api from "../../../../shared/services/api";
import "./UbahSandi.css";

const REQUIREMENTS = [
  {
    label: "Minimal 8 karakter",
    test: (password) => password.length >= 8,
  },
  {
    label: "Mengandung kombinasi huruf besar dan kecil",
    test: (password) => /[a-z]/.test(password) && /[A-Z]/.test(password),
  },
  {
    label: "Mengandung minimal 1 angka atau simbol (8+)",
    test: (password) => /[\d\W_]/.test(password),
  },
];

function PasswordField({ id, label, value, onChange, visible, onToggle, autoComplete }) {
  return (
    <div className="change-password__field-wrap">
      <label htmlFor={id}>{label}</label>
      <div className="change-password__field">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          required
        />
        <button
          type="button"
          aria-label={visible ? `Sembunyikan ${label.toLowerCase()}` : `Tampilkan ${label.toLowerCase()}`}
          onClick={onToggle}
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );
}

export default function UbahSandi() {
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const passedRequirements = REQUIREMENTS.filter((rule) => rule.test(newPassword)).length;
  const passwordMatches = newPassword.length > 0 && confirmation === newPassword;
  const canSubmit = currentPassword.length > 0
    && passedRequirements === REQUIREMENTS.length
    && passwordMatches;

  function toggleVisibility(field) {
    setVisible((state) => ({ ...state, [field]: !state[field] }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      setSuccess("");
      await api.patch("/profile/password", {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmation,
      });
      setSuccess("Kata sandi berhasil diperbarui. Sesi di perangkat lain telah dicabut.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Kata sandi gagal diperbarui.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="change-password">
      <header className="change-password__header">
        <button type="button" aria-label="Kembali" onClick={() => navigate(-1)}>
          <ChevronLeft size={19} />
        </button>
        <h1>Ubah Kata Sandi</h1>
      </header>

      <form className="change-password__form" onSubmit={handleSubmit}>
        <div className="change-password__notice">
          <Lock size={13} />
          <span>
            Jangan berikan kata sandi Anda kepada siapa pun demi menjaga
            keamanan transaksi akun SembakoPlus.
          </span>
        </div>

        <PasswordField
          id="current-password"
          label="Kata Sandi Saat Ini"
          value={currentPassword}
          onChange={setCurrentPassword}
          visible={visible.current}
          onToggle={() => toggleVisibility("current")}
          autoComplete="current-password"
        />
        <PasswordField
          id="new-password"
          label="Kata Sandi Baru"
          value={newPassword}
          onChange={(value) => { setNewPassword(value); setError(""); }}
          visible={visible.next}
          onToggle={() => toggleVisibility("next")}
          autoComplete="new-password"
        />
        <PasswordField
          id="confirm-password"
          label="Konfirmasi Kata Sandi Baru"
          value={confirmation}
          onChange={(value) => { setConfirmation(value); setError(""); }}
          visible={visible.confirm}
          onToggle={() => toggleVisibility("confirm")}
          autoComplete="new-password"
        />

        {confirmation && (
          <p className={`change-password__match${passwordMatches ? " is-valid" : " is-invalid"}`}>
            {passwordMatches ? <Check size={12} /> : <X size={12} />}
            {passwordMatches ? "Kata sandi sudah cocok" : "Kata sandi belum cocok"}
          </p>
        )}

        <section className="change-password__requirements">
          <header>
            <strong>
              {passedRequirements === REQUIREMENTS.length
                ? "Semua Syarat Terpenuhi"
                : `Syarat Keamanan (${passedRequirements} dari 3):`}
            </strong>
            <span className={passedRequirements === REQUIREMENTS.length ? "is-strong" : ""}>
              {passedRequirements === REQUIREMENTS.length ? "Sangat Kuat" : "Wajib"}
            </span>
          </header>
          {REQUIREMENTS.map((rule) => {
            const passed = rule.test(newPassword);
            return (
              <p className={passed ? "is-valid" : ""} key={rule.label}>
                <span>{passed ? <Check size={9} /> : <span className="change-password__bullet" />}</span>
                {rule.label}
              </p>
            );
          })}
          <div className="change-password__strength" aria-hidden="true">
            <span style={{ width: `${(passedRequirements / REQUIREMENTS.length) * 100}%` }} />
          </div>
        </section>

        {error && <p className="change-password__error" role="alert">{error}</p>}
        {success && <p className="change-password__match is-valid" role="status">{success}</p>}

        <footer className="change-password__footer">
          <button type="submit" disabled={!canSubmit || submitting}>
            {canSubmit && <Check size={14} />}
            {submitting ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
          </button>
        </footer>
      </form>
    </main>
  );
}
