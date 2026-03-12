import { Outlet, useLocation, useNavigate } from "react-router-dom";
import CerberoLogo from "../assets/LOGOTIPO-CERBERO.svg";
import SolventoLogo from "../assets/LOGOTIPO-SOLVENTO-COLOR.svg";

// ======================================================
// PARTE 1/5 — TIPOS Y METADATOS
// ======================================================

type AdminPageMeta = {
  title: string;
  subtitle: string;
};

function getAdminPageMeta(pathname: string): AdminPageMeta {
  if (pathname === "/admin") {
    return {
      title: "Panel de administración",
      subtitle: "Resumen general",
    };
  }

  if (pathname.startsWith("/admin/incidents")) {
    return {
      title: "Panel de incidencias",
      subtitle: "Gestión y revisión",
    };
  }

  if (pathname.startsWith("/admin/employees")) {
    return {
      title: "Panel de empleados",
      subtitle: "Listado y acceso a fichas",
    };
  }

  if (pathname.startsWith("/admin/exports")) {
    return {
      title: "Panel de exportaciones",
      subtitle: "Descarga y control de datos",
    };
  }

  if (pathname.startsWith("/admin/settings")) {
    return {
      title: "Panel de configuración",
      subtitle: "Calendario laboral y ajustes",
    };
  }

  if (pathname.startsWith("/admin/worker/")) {
    return {
      title: "Ficha de trabajador",
      subtitle: "Detalle individual",
    };
  }

  return {
    title: "Panel de administración",
    subtitle: "Gestión de empresa",
  };
}

// ======================================================
// PARTE 2/5 — ICONOS
// ======================================================

function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 10.5 12 4l9 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 9.5V20h14V9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9 20v-6h6v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IncidentsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 8.5v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16.5h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path
        d="M10.3 4.8 2.8 18.2A2 2 0 0 0 4.5 21h15a2 2 0 0 0 1.7-2.8L13.7 4.8a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmployeesIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 20a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExportsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 4v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M8.5 10.5 12 14l3.5-3.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 18.5h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 9.25a2.75 2.75 0 1 0 0 5.5 2.75 2.75 0 0 0 0-5.5Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a2 2 0 1 1-4 0v-.1a1 1 0 0 0-.6-.9 1 1 0 0 0-1.1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a2 2 0 1 1 0-4h.1a1 1 0 0 0 .9-.6 1 1 0 0 0-.2-1.1l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a2 2 0 1 1 4 0v.1a1 1 0 0 0 .6.9 1 1 0 0 0 1.1-.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6H20a2 2 0 1 1 0 4h-.1a1 1 0 0 0-.9.6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ======================================================
// PARTE 3/5 — COMPONENTE
// ======================================================

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const pageMeta = getAdminPageMeta(location.pathname);

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="cerbAdmRoot">
      <style>{`
        .cerbAdmRoot {
          min-height: 100vh;
          background: #0b1416;
          color: #eef2f7;
          padding: 16px;
        }

        .cerbAdmRoot * {
          box-sizing: border-box;
        }

        .cerbAdmShell {
          max-width: 1600px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 170px minmax(0, 1fr);
          gap: 16px;
          align-items: start;
        }

        .cerbAdmSidebar {
          min-height: calc(100vh - 32px);
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 18px;
          background: #111c1f;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cerbAdmNavBtn {
          width: 100%;
          height: 56px;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 14px;
          background: #162427;
          color: #eef2f7;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex: 0 0 auto;
        }

        .cerbAdmNavBtn.isActive {
          background: #1f4f52;
          border-color: #4bada9;
        }

        .cerbAdmSidebarSpacer {
          flex: 1 1 auto;
        }

        .cerbAdmSidebarBrand {
          border-top: 1px solid rgba(255,255,255,.10);
          padding-top: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          flex: 0 0 auto;
        }

        .cerbAdmCerberoLogo {
          width: 120px;
          max-width: 100%;
          height: auto;
          display: block;
        }

        .cerbAdmVersion {
          font-size: 11px;
          color: rgba(255,255,255,.65);
          font-weight: 700;
        }

        .cerbAdmMain {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .cerbAdmHeader {
          height: 64px;
          min-height: 64px;
          max-height: 64px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 18px;
          background: #111c1f;
          padding: 8px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex: 0 0 auto;
        }

        .cerbAdmHeaderText {
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 2px;
        }

        .cerbAdmHeaderTitle {
          margin: 0;
          font-size: 18px;
          line-height: 1;
          font-weight: 800;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cerbAdmHeaderSubtitle {
          margin: 0;
          font-size: 11px;
          line-height: 1;
          color: rgba(255,255,255,.70);
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cerbAdmHeaderLogoWrap {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex: 0 0 auto;
          height: 100%;
        }

        .cerbAdmSolventoLogo {
          height: 42px;
          max-height: 42px;
          width: auto;
          display: block;
          object-fit: contain;
        }

        .cerbAdmBody {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        @media (max-width: 1100px) {
          .cerbAdmShell {
            grid-template-columns: 1fr;
          }

          .cerbAdmSidebar {
            min-height: auto;
            flex-direction: row;
            align-items: center;
          }

          .cerbAdmNavBtn {
            width: 56px;
            min-width: 56px;
          }

          .cerbAdmSidebarBrand {
            display: none;
          }
        }
      `}</style>

      <div className="cerbAdmShell">
        <aside className="cerbAdmSidebar">
          <button
            className={`cerbAdmNavBtn ${isActive("/admin") ? "isActive" : ""}`}
            title="Administración"
            onClick={() => navigate("/admin")}
          >
            <HomeIcon />
          </button>

          <button
            className={`cerbAdmNavBtn ${isActive("/admin/incidents") ? "isActive" : ""}`}
            title="Incidencias"
            onClick={() => navigate("/admin/incidents")}
          >
            <IncidentsIcon />
          </button>

          <button
            className={`cerbAdmNavBtn ${isActive("/admin/employees") ? "isActive" : ""}`}
            title="Empleados"
            onClick={() => navigate("/admin/employees")}
          >
            <EmployeesIcon />
          </button>

          <button
            className={`cerbAdmNavBtn ${isActive("/admin/exports") ? "isActive" : ""}`}
            title="Exportaciones"
            onClick={() => navigate("/admin/exports")}
          >
            <ExportsIcon />
          </button>

          <button
            className={`cerbAdmNavBtn ${isActive("/admin/settings") ? "isActive" : ""}`}
            title="Configuración"
            onClick={() => navigate("/admin/settings")}
          >
            <SettingsIcon />
          </button>

          <div className="cerbAdmSidebarSpacer" />

          <div className="cerbAdmSidebarBrand">
            <img className="cerbAdmCerberoLogo" src={CerberoLogo} alt="Cerbero" />
            <div className="cerbAdmVersion">v1.0</div>
          </div>
        </aside>

        <main className="cerbAdmMain">
          <header className="cerbAdmHeader">
            <div className="cerbAdmHeaderText">
              <h1 className="cerbAdmHeaderTitle">{pageMeta.title}</h1>
              <p className="cerbAdmHeaderSubtitle">{pageMeta.subtitle}</p>
            </div>

            <div className="cerbAdmHeaderLogoWrap">
              <img className="cerbAdmSolventoLogo" src={SolventoLogo} alt="Solvento" />
            </div>
          </header>

          <div className="cerbAdmBody">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}