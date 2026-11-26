import { useEffect, useState } from "react";
import api, { clearAuthToken, saveAuthToken } from "../../../../shared/services/api";

export default function ProfilDriver() {
  const [hasStoredToken] = useState(() => Boolean(localStorage.getItem("sembakoplus.auth.token")));
  const [user, setUser] = useState(null);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(hasStoredToken);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasStoredToken) return undefined;
    let active = true;
    api.get("/profile")
      .then(({ data }) => active && setUser(data?.data ?? null))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [hasStoredToken]);

  async function handleLogin(event) {
    event.preventDefault();
    try {
      setError("");
      const { data } = await api.post("/auth/login", { identifier, password });
      saveAuthToken(data?.data?.token);
      setUser(data?.data?.user ?? null);
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.error?.message || err.response?.data?.message || "Login kurir gagal.");
    }
  }

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      clearAuthToken();
      setUser(null);
    }
  }

  if (loading) return <p className="driver-empty">Memuat profil kurir...</p>;

  if (!user) {
    return (
      <section className="driver-section">
        <form className="driver-card driver-form" onSubmit={handleLogin}>
          <h2>Masuk Akun Kurir</h2>
          <input
            type="text"
            placeholder="Email atau No. HP Kurir"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error && <p className="driver-alert" role="alert">{error}</p>}
          <button type="submit">Masuk Driver</button>
        </form>
      </section>
    );
  }

  return (
    <section className="driver-section">
      <article className="driver-card driver-form">
        <h2>Profil Kurir</h2>
        <p><strong>Nama:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email || "-"}</p>
        <p><strong>Telepon:</strong> {user.phone || "-"}</p>
        <p><strong>Role:</strong> {(user.roles ?? []).join(", ")}</p>
        <button type="button" className="is-outline" onClick={handleLogout}>Keluar Akun</button>
      </article>
    </section>
  );
}
