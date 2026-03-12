import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, useSearchParams } from "react-router-dom";

import CerberoLogo from "../assets/LOGOTIPO-CERBERO.svg";
import SolventoLogo from "../assets/LOGOTIPO-SOLVENTO-COLOR.svg";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const emailFromLink = useMemo(
    () => (searchParams.get("u") ?? "").trim(),
    [searchParams]
  );

  const [email, setEmail] = useState(emailFromLink);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const brand = "#4bada9";

  useEffect(() => {
    setEmail(emailFromLink);
  }, [emailFromLink]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanEmail = (email ?? "").trim();
    const cleanPin = (pin ?? "").trim();

    if (!cleanEmail) {
      setError("Falta el enlace de acceso. Pide al administrador que te lo reenvíe.");
      return;
    }

    if (cleanPin.length < 4) {
      setError("PIN inválido.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPin,
    });

    if (error) {
      setLoading(false);
      setError("PIN incorrecto.");
      return;
    }

    const { data: memberships } = await supabase.rpc("my_memberships");

    setLoading(false);

    if (!memberships || memberships.length === 0) {
      navigate("/pending", { replace: true });
      return;
    }

    const role = memberships[0].role;
    navigate(role === "employee" ? "/worker" : "/admin", { replace: true });
  }

  return (
    <div
      className="loginPage"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "auto",
        background: `linear-gradient(180deg, ${brand} 0%, #cfeeed 60%, #ffffff 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#ffffff",
          borderRadius: 18,
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          padding: 24,
          border: `1px solid ${brand}33`,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* SOLVENTO */}
        <div style={{ textAlign: "center" }}>
          <img
            src={SolventoLogo}
            alt="Solvento"
            style={{
              height: 92,
              width: "auto",
              maxWidth: "100%",
              display: "inline-block",
            }}
          />
        </div>

        <div style={{ textAlign: "center", fontSize: 14, color: "#444" }}>
          {email ? (
            <>
              Acceso para <strong>{email}</strong>
            </>
          ) : (
            "Acceso de trabajador"
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <input type="hidden" value={email} readOnly />

          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{
              padding: 16,
              fontSize: 18,
              borderRadius: 12,
              border: "1px solid #ddd",
              outline: "none",
              textAlign: "center",
            }}
          />

          <button
            disabled={loading}
            style={{
              padding: 16,
              fontSize: 16,
              fontWeight: 800,
              borderRadius: 12,
              border: "none",
              background: brand,
              color: "white",
              cursor: "pointer",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {error && (
            <div
              style={{
                color: "crimson",
                fontSize: 13,
                textAlign: "center",
                background: "#ffeef0",
                padding: 10,
                borderRadius: 10,
              }}
            >
              {error}
            </div>
          )}
        </form>

        <div style={{ textAlign: "center", fontSize: 12, color: "#666" }}>
          Si no tienes el enlace, pide a tu responsable que te lo reenvíe.
        </div>

        {/* CERBERO */}
        <div
          style={{
            marginTop: 10,
            paddingTop: 16,
            borderTop: "1px solid #eee",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={CerberoLogo}
            alt="Cerbero"
            style={{
              height: 110,
              width: "auto",
              maxWidth: "100%",
              display: "block",
            }}
          />
        </div>
      </div>
    </div>
  );
}