import { useNavigate } from "react-router-dom";
import { adminTheme } from "../ui/adminTheme";

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WorkerGestionesPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: `linear-gradient(180deg, ${adminTheme.colors.primary} 0%, ${adminTheme.colors.primarySoft} 100%)`,
        display: "flex",
        justifyContent: "center",
        padding: 14,
      }}
    >
      <div style={{ width: "100%", maxWidth: 520, display: "grid", gap: 12 }}>
        <div
          style={{
            background: adminTheme.colors.panelBg,
            borderRadius: 22,
            border: `1px solid ${adminTheme.colors.border}`,
            boxShadow: adminTheme.shadow.lg,
            padding: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => navigate("/worker")}
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                border: `1px solid ${adminTheme.colors.border}`,
                background: adminTheme.colors.panelSoft,
                color: adminTheme.colors.text,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              <BackIcon />
            </button>

            <div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 950,
                  color: adminTheme.colors.text,
                }}
              >
                Gestiones
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: adminTheme.colors.textSoft,
                  fontWeight: 700,
                }}
              >
                Descargas y solicitudes
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            background: adminTheme.colors.panelBg,
            borderRadius: 22,
            border: `1px solid ${adminTheme.colors.border}`,
            boxShadow: adminTheme.shadow.lg,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 950,
              color: adminTheme.colors.text,
              marginBottom: 12,
            }}
          >
            Descargas
          </div>

          <button
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 16,
              border: `1px solid ${adminTheme.colors.border}`,
              background: adminTheme.colors.panelSoft,
              marginBottom: 10,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Descargar esta semana
          </button>

          <button
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 16,
              border: `1px solid ${adminTheme.colors.border}`,
              background: adminTheme.colors.panelSoft,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            Descargar este mes
          </button>
        </div>

        <div
          style={{
            background: adminTheme.colors.panelBg,
            borderRadius: 22,
            border: `1px solid ${adminTheme.colors.border}`,
            boxShadow: adminTheme.shadow.lg,
            padding: 16,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 950,
              color: adminTheme.colors.text,
              marginBottom: 12,
            }}
          >
            Solicitudes
          </div>

          <input
            placeholder="Tipo de solicitud"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 16,
              border: `1px solid ${adminTheme.colors.border}`,
              marginBottom: 10,
            }}
          />

          <textarea
            placeholder="Comentario"
            rows={4}
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 16,
              border: `1px solid ${adminTheme.colors.border}`,
              resize: "none",
            }}
          />

          <button
            style={{
              width: "100%",
              marginTop: 12,
              padding: 14,
              borderRadius: 16,
              border: "none",
              background: adminTheme.colors.primary,
              color: adminTheme.colors.textOnPrimary,
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}