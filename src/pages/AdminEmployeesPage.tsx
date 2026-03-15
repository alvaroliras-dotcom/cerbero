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
    <div className="admin-page">
      <section className="admin-filters">
        <input
          className="admin-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre / email"
          style={{ maxWidth: 320 }}
        />

        <div className="admin-badge">
          Mostrando: <strong style={{ marginLeft: 6 }}>{filteredEmployees.length}</strong>
          <span style={{ margin: "0 6px" }}>/</span>
          {employees.length}
        </div>
      </section>

      <section className="admin-card">
        <h2 className="admin-card-title">Directorio de empleados</h2>
        <p className="admin-card-sub">Abrir ficha individual de cada trabajador</p>

        {loading && <div className="admin-empty">Cargando empleados…</div>}

        {!loading && employees.length === 0 && (
          <div className="admin-empty">No hay empleados en esta empresa.</div>
        )}

        {!loading && employees.length > 0 && (
          <div className="admin-table-wrap">
            <table className="admin-table" style={{ minWidth: 680 }}>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Email</th>
                  <th className="admin-right"></th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>{(emp.full_name ?? "").trim() || "—"}</td>
                    <td>{emp.email ?? "—"}</td>
                    <td className="admin-right">
                      <button
                        className="admin-btn primary"
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