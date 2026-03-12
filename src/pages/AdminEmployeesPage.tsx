import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useActiveMembership } from "../app/useActiveMembership";

// ======================================================
// PARTE 1/6 — TIPOS
// ======================================================

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
};

// ======================================================
// PARTE 2/6 — COMPONENTE Y ESTADO
// ======================================================

export function AdminEmployeesPage() {
  const navigate = useNavigate();
  const { membership, loading: membershipLoading } = useActiveMembership();

  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

// ======================================================
// PARTE 3/6 — CARGA DE DATOS
// ======================================================

  async function loadEmployees() {
    if (!membership) return;

    setLoading(true);

    const { data, error } = await supabase.rpc("admin_company_profiles", {
      p_company_id: membership.company_id,
    });

    if (!error && data) {
      const sorted = [...(data as Profile[])].sort((a, b) => {
        const ak = (a.full_name ?? a.email ?? a.id).toLowerCase();
        const bk = (b.full_name ?? b.email ?? b.id).toLowerCase();
        return ak.localeCompare(bk);
      });

      setEmployees(sorted);
    } else {
      setEmployees([]);
    }

    setLoading(false);
  }

// ======================================================
// PARTE 4/6 — DERIVADOS Y EFECTOS
// ======================================================

  useEffect(() => {
    if (!membership) return;
    loadEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [membership?.company_id]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;

    return employees.filter((e) => {
      const name = (e.full_name ?? "").toLowerCase();
      const email = (e.email ?? "").toLowerCase();
      const id = e.id.toLowerCase();

      return name.includes(q) || email.includes(q) || id.includes(q);
    });
  }, [employees, search]);

// ======================================================
// PARTE 5/6 — ESTADOS BASE
// ======================================================

  if (membershipLoading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!membership) return <div style={{ padding: 24 }}>Sin empresa activa.</div>;

// ======================================================
// PARTE 6/6 — UI DE LA PÁGINA
// ======================================================

  return (
    <div className="adminEmpPageUi">
      <style>{`
        .adminEmpPageUi {
          display: grid;
          gap: 12px;
        }

        .adminEmpTopBar {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .adminEmpInput {
          height: 40px;
          padding: 0 12px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px;
          background: #10191b;
          color: #eef2f7;
          outline: none;
          font-weight: 700;
          min-width: 260px;
        }

        .adminEmpBadge {
          height: 40px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px;
          background: #10191b;
          color: rgba(255,255,255,.80);
          font-size: 13px;
          font-weight: 700;
        }

        .adminEmpCard {
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 18px;
          background: #111c1f;
          padding: 16px;
        }

        .adminEmpCardTitle {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #eef2f7;
        }

        .adminEmpCardSub {
          margin: 4px 0 0 0;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,.70);
        }

        .adminEmpTableWrap {
          margin-top: 12px;
          overflow: auto;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 14px;
          background: #0d1517;
        }

        .adminEmpTable {
          width: 100%;
          border-collapse: collapse;
          min-width: 680px;
        }

        .adminEmpTable th,
        .adminEmpTable td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,.08);
          font-size: 14px;
          color: #eef2f7;
          vertical-align: middle;
        }

        .adminEmpTable th {
          color: rgba(255,255,255,.75);
          font-weight: 800;
        }

        .adminEmpRight {
          text-align: right;
        }

        .adminEmpBtn {
          height: 40px;
          padding: 0 16px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px;
          background: #4bada9;
          color: #071012;
          font-weight: 700;
          cursor: pointer;
        }

        .adminEmpEmpty {
          margin-top: 12px;
          color: rgba(255,255,255,.70);
          font-weight: 600;
        }

        @media (max-width: 700px) {
          .adminEmpInput {
            min-width: 100%;
          }
        }
      `}</style>

      <section className="adminEmpTopBar">
        <input
          className="adminEmpInput"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre / email"
        />

        <div className="adminEmpBadge">
          Mostrando: <strong style={{ marginLeft: 6 }}>{filteredEmployees.length}</strong>
          <span style={{ margin: "0 6px" }}>/</span>
          {employees.length}
        </div>
      </section>

      <section className="adminEmpCard">
        <h2 className="adminEmpCardTitle">Directorio de empleados</h2>
        <p className="adminEmpCardSub">Abrir ficha individual de cada trabajador</p>

        {loading && <div className="adminEmpEmpty">Cargando empleados…</div>}

        {!loading && employees.length === 0 && (
          <div className="adminEmpEmpty">No hay empleados en esta empresa.</div>
        )}

        {!loading && employees.length > 0 && (
          <div className="adminEmpTableWrap">
            <table className="adminEmpTable">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Email</th>
                  <th className="adminEmpRight"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{(emp.full_name ?? "").trim() || "—"}</td>
                    <td>{emp.email ?? "—"}</td>
                    <td className="adminEmpRight">
                      <button
                        className="adminEmpBtn"
                        onClick={() => navigate(`/admin/worker/${emp.id}`)}
                      >
                        Abrir ficha
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}