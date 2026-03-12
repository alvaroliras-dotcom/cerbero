import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useActiveMembership } from "../app/useActiveMembership";

// ======================================================
// PARTE 1/6 — TIPOS Y HELPERS
// ======================================================

type IncidentSourceType = "manual" | "automatic";

type PendingAdjustment = {
  adjustment_id: string;
  time_entry_id: string;
  user_id: string;
  check_in_at: string;
  proposed_check_out: string;
  reason: string;
  created_at: string;
  source_type: IncidentSourceType;
};

type TimeEntryRow = {
  id: string;
  user_id: string;
  check_in_at: string;
  check_out_at: string | null;
  status: string | null;
  workflow_status: string | null;
  created_at: string | null;
  approved_at: string | null;
  flags: any | null;
  check_in_geo_lat?: number | null;
  check_in_geo_lng?: number | null;
  check_in_geo_accuracy_m?: number | null;
  check_out_geo_lat?: number | null;
  check_out_geo_lng?: number | null;
  check_out_geo_accuracy_m?: number | null;
};

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
};

type Preset = "today" | "week" | "month" | "custom";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatMinutesHm(totalMinutes: number) {
  const safe = Math.max(0, Math.floor(totalMinutes));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}h ${m}m`;
}

function safeDurationMinutes(checkInIso: string, checkOutIso: string | null) {
  if (!checkOutIso) return null;
  const inMs = new Date(checkInIso).getTime();
  const outMs = new Date(checkOutIso).getTime();
  const diff = outMs - inMs;
  if (!Number.isFinite(diff) || diff <= 0) return null;
  return Math.floor(diff / 60000);
}

function formatLocalDateTime(iso: string) {
  const d = new Date(iso);
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function toDateInputValue(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateInputValue(s: string) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1, 0, 0, 0, 0);
}

function startOfLocalDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endExclusiveFromLocalDate(endDateLocal: Date) {
  const x = startOfLocalDay(endDateLocal);
  x.setDate(x.getDate() + 1);
  return x;
}

function startOfLocalWeek(d: Date) {
  const x = startOfLocalDay(d);
  const day = x.getDay();
  const diffToMonday = (day + 6) % 7;
  x.setDate(x.getDate() - diffToMonday);
  return x;
}

function startOfLocalMonth(d: Date) {
  const x = startOfLocalDay(d);
  x.setDate(1);
  return x;
}

function translateStatus(status: string | null) {
  switch (status) {
    case "open":
      return "Abierta";
    case "closed":
      return "Cerrada";
    default:
      return status ?? "—";
  }
}

function translateWorkflow(workflow: string | null) {
  switch (workflow) {
    case "auto":
      return "Sin incidencia";
    case "pending":
      return "Pendiente";
    case "adjusted":
      return "Ajustada";
    case "requires_new_proposal":
      return "Requiere nueva propuesta";
    case "rejected":
      return "Rechazada";
    default:
      return workflow ?? "—";
  }
}

function formatReason(value: unknown) {
  if (typeof value !== "string" || !value) return "No disponible";

  switch (value) {
    case "low_accuracy":
      return "Precisión insuficiente";
    case "inside_workplace_radius":
      return "Dentro del radio permitido";
    case "outside_workplace_radius":
      return "Fuera del radio permitido";
    case "no_geolocation":
      return "Sin geolocalización";
    case "open_entry_crossed_day":
      return "Jornada abierta de un día anterior";
    case "open_entry_exceeded_hours":
      return "Jornada demasiado larga";
    case "zero_length_shift":
      return "Tramo de duración casi cero";
    case "possible_missed_lunch_checkout":
      return "Posible olvido de salida para la comida";
    case "check_out_outside_workplace":
      return "Salida fuera del centro de trabajo";
    case "check_in_outside_workplace":
      return "Entrada fuera del centro de trabajo";
    default:
      return value;
  }
}

function buildGoogleMapsEmbedUrl(lat: number, lng: number) {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
}

function buildGoogleMapsExternalUrl(lat: number, lng: number) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function formatCoords(lat: number, lng: number) {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function getIncidentTypeLabel(sourceType: IncidentSourceType) {
  return sourceType === "automatic" ? "Automática" : "Manual";
}

function isAutomaticIncident(item: PendingAdjustment) {
  return item.source_type === "automatic";
}

// ======================================================
// PARTE 2/6 — COMPONENTE Y ESTADO
// ======================================================

export function AdminWorkerPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [searchParams] = useSearchParams();
  const { membership, loading: membershipLoading } = useActiveMembership();

  const initialFrom = searchParams.get("from");
  const initialTo = searchParams.get("to");
  const hasInitialRange =
    !!initialFrom &&
    !!initialTo &&
    /^\d{4}-\d{2}-\d{2}$/.test(initialFrom) &&
    /^\d{4}-\d{2}-\d{2}$/.test(initialTo);

  const today = useMemo(() => new Date(), []);
  const monthStart = useMemo(() => startOfLocalMonth(today), [today]);

  const [preset, setPreset] = useState<Preset>(hasInitialRange ? "custom" : "month");

  const [fromDateStr, setFromDateStr] = useState<string>(() =>
    hasInitialRange ? initialFrom! : toDateInputValue(monthStart)
  );
  const [toDateStr, setToDateStr] = useState<string>(() =>
    hasInitialRange ? initialTo! : toDateInputValue(today)
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [entries, setEntries] = useState<TimeEntryRow[]>([]);
  const [pending, setPending] = useState<PendingAdjustment[]>([]);

  const [totalMinutes, setTotalMinutes] = useState<number>(0);
  const [closedCount, setClosedCount] = useState<number>(0);
  const [openCount, setOpenCount] = useState<number>(0);

  const [resolutionReason, setResolutionReason] = useState<string>("");

  const [selectedGeoEntry, setSelectedGeoEntry] = useState<TimeEntryRow | null>(null);

  // ======================================================
  // PARTE 3/6 — RANGO Y HELPERS DE PÁGINA
  // ======================================================

  const range = useMemo(() => {
    const fromLocal = startOfLocalDay(fromDateInputValue(fromDateStr));
    const toLocalExclusive = endExclusiveFromLocalDate(fromDateInputValue(toDateStr));

    return {
      fromIso: fromLocal.toISOString(),
      toIsoExclusive: toLocalExclusive.toISOString(),
    };
  }, [fromDateStr, toDateStr]);

  const rangeLabel = useMemo(() => {
    if (preset === "today") return "Hoy";
    if (preset === "week") return "Esta semana";
    if (preset === "month") return "Este mes";
    return `${fromDateStr} → ${toDateStr}`;
  }, [preset, fromDateStr, toDateStr]);

  function displayProfile(p: Profile | null, fallbackId: string) {
    if (!p) return fallbackId;

    const name = (p.full_name ?? "").trim();
    const email = (p.email ?? "").trim();

    if (name && email) return `${name} (${email})`;
    if (name) return name;
    if (email) return email;
    return fallbackId;
  }

  function applyPreset(p: Preset) {
    setPreset(p);
    const now = new Date();

    if (p === "today") {
      const d = toDateInputValue(now);
      setFromDateStr(d);
      setToDateStr(d);
      return;
    }

    if (p === "week") {
      const start = startOfLocalWeek(now);
      setFromDateStr(toDateInputValue(start));
      setToDateStr(toDateInputValue(now));
      return;
    }

    if (p === "month") {
      const start = startOfLocalMonth(now);
      setFromDateStr(toDateInputValue(start));
      setToDateStr(toDateInputValue(now));
    }
  }

  // ======================================================
  // PARTE 4/6 — CARGA DE DATOS Y ACCIONES
  // ======================================================

  async function load() {
    if (!membership || !userId) return;

    setLoading(true);
    setError(null);

    const { data: companyProfiles, error: profErr } = await supabase.rpc(
      "admin_company_profiles",
      { p_company_id: membership.company_id }
    );

    if (profErr) {
      console.error("admin_company_profiles error:", profErr);
      setProfile(null);
    } else {
      const list = (companyProfiles ?? []) as Profile[];
      setProfile(list.find((p) => p.id === userId) ?? null);
    }

    const { data: rows, error: entriesErr } = await supabase
      .from("time_entries")
      .select(
        "id,user_id,check_in_at,check_out_at,status,workflow_status,created_at,approved_at,flags,check_in_geo_lat,check_in_geo_lng,check_in_geo_accuracy_m,check_out_geo_lat,check_out_geo_lng,check_out_geo_accuracy_m"
      )
      .eq("company_id", membership.company_id)
      .eq("user_id", userId)
      .gte("check_in_at", range.fromIso)
      .lt("check_in_at", range.toIsoExclusive)
      .order("check_in_at", { ascending: false });

    if (entriesErr) {
      setError(entriesErr.message);
      setEntries([]);
      setPending([]);
      setLoading(false);
      return;
    }

    const list = (rows ?? []) as TimeEntryRow[];
    setEntries(list);

    let minutes = 0;
    let closed = 0;
    let open = 0;

    for (const e of list) {
      const dur = safeDurationMinutes(e.check_in_at, e.check_out_at);
      if (dur !== null) {
        minutes += dur;
        closed += 1;
      } else if (!e.check_out_at) {
        open += 1;
      }
    }

    setTotalMinutes(minutes);
    setClosedCount(closed);
    setOpenCount(open);

    const { data: pendRows, error: pendErr } = await supabase.rpc(
      "admin_pending_adjustments",
      { p_company_id: membership.company_id }
    );

    if (pendErr) {
      setError(pendErr.message);
      setPending([]);
      setLoading(false);
      return;
    }

    const manualPending: PendingAdjustment[] = ((pendRows ?? []) as Omit<
      PendingAdjustment,
      "source_type"
    >[])
      .filter(
        (p) =>
          p.user_id === userId &&
          new Date(p.check_in_at).getTime() >= new Date(range.fromIso).getTime() &&
          new Date(p.check_in_at).getTime() < new Date(range.toIsoExclusive).getTime()
      )
      .map((p) => ({
        ...p,
        source_type: "manual",
      }));

    const { data: autoRows, error: autoErr } = await supabase
      .from("time_entries")
      .select("id,user_id,check_in_at,check_out_at,flags")
      .eq("company_id", membership.company_id)
      .eq("user_id", userId)
      .eq("workflow_status", "pending")
      .gte("check_in_at", range.fromIso)
      .lt("check_in_at", range.toIsoExclusive);

    if (autoErr) {
      setError(autoErr.message);
      setPending(manualPending);
      setLoading(false);
      return;
    }

    const autoPending: PendingAdjustment[] =
      (autoRows ?? []).map((e: any) => ({
        adjustment_id: `auto-${e.id}`,
        time_entry_id: e.id,
        user_id: e.user_id,
        check_in_at: e.check_in_at,
        proposed_check_out: e.check_out_at ?? e.check_in_at,
        reason:
          e.flags?.auto_incident_reason ??
          "Incidencia automática detectada por el sistema",
        created_at: e.check_in_at,
        source_type: "automatic",
      })) ?? [];

    setPending(
      [...manualPending, ...autoPending].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    );

    setLoading(false);
  }

  async function resolveManual(
    adjustmentId: string,
    decision: "validated" | "rejected"
  ) {
    setError(null);

    if (!resolutionReason || resolutionReason.trim().length < 3) {
      setError("Motivo de resolución obligatorio para incidencias manuales (mínimo 3 caracteres).");
      return;
    }

    const { error } = await supabase.rpc("resolve_time_entry_adjustment", {
      p_adjustment_id: adjustmentId,
      p_decision: decision,
      p_resolution_reason: resolutionReason.trim(),
    });

    if (error) {
      setError(error.message);
      return;
    }

    setResolutionReason("");
    await load();
  }

  function openIncidentsPage() {
    navigate("/admin/incidents");
  }

  // ======================================================
  // PARTE 5/6 — EFECTOS Y ESTADOS BASE
  // ======================================================

  useEffect(() => {
    if (membershipLoading) return;
    if (!membership) return;
    if (!userId) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    membershipLoading,
    membership?.company_id,
    userId,
    range.fromIso,
    range.toIsoExclusive,
  ]);

  if (membershipLoading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (!membership) return <div style={{ padding: 24 }}>Sin empresa activa.</div>;
  if (!userId) return <div style={{ padding: 24 }}>Falta userId.</div>;

  // ======================================================
  // PARTE 6/6 — UI DE LA PÁGINA
  // ======================================================

  return (
    <div className="adminWorkerPageUi">
      <style>{`
        .adminWorkerPageUi {
          display: grid;
          gap: 12px;
        }

        .adminWorkerFilters {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
        }

        .adminWorkerPill {
          height: 40px;
          padding: 0 14px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px;
          background: #162427;
          color: #eef2f7;
          font-weight: 700;
          cursor: pointer;
        }

        .adminWorkerPill.active {
          background: #1f4f52;
          border-color: #4bada9;
        }

        .adminWorkerField {
          display: flex;
          align-items: center;
          gap: 8px;
          height: 40px;
          padding: 0 12px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px;
          background: #10191b;
        }

        .adminWorkerField input {
          background: transparent;
          border: none;
          outline: none;
          color: #eef2f7;
          font-weight: 700;
        }

        .adminWorkerBtn {
          height: 40px;
          padding: 0 16px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px;
          background: #162427;
          color: #eef2f7;
          font-weight: 700;
          cursor: pointer;
        }

        .adminWorkerBtn.primary {
          background: #4bada9;
          color: #071012;
          border-color: #4bada9;
        }

        .adminWorkerBtn.danger {
          background: #7f1d1d;
          color: #ffffff;
          border-color: #991b1b;
        }

        .adminWorkerBtn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .adminWorkerBtn.small {
          height: 34px;
          padding: 0 12px;
          font-size: 12px;
        }

        .adminWorkerBadge {
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

        .adminWorkerCard {
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 18px;
          background: #111c1f;
          padding: 16px;
        }

        .adminWorkerCardTitle {
          margin: 0;
          font-size: 18px;
          font-weight: 800;
          color: #eef2f7;
        }

        .adminWorkerCardSub {
          margin: 4px 0 0 0;
          font-size: 13px;
          font-weight: 600;
          color: rgba(255,255,255,.70);
        }

        .adminWorkerStats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 12px;
        }

        .adminWorkerStat {
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 16px;
          background: #0d1517;
          padding: 14px;
        }

        .adminWorkerStatLabel {
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,.70);
        }

        .adminWorkerStatValue {
          margin-top: 8px;
          font-size: 24px;
          font-weight: 800;
          color: #eef2f7;
        }

        .adminWorkerNotice {
          margin-top: 12px;
          padding: 12px;
          border-radius: 12px;
          background: #3b1014;
          color: #ffd7d7;
          border: 1px solid #7f1d1d;
          font-weight: 700;
        }

        .adminWorkerInput {
          width: 100%;
          margin-top: 12px;
          height: 40px;
          padding: 0 12px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 12px;
          background: #10191b;
          color: #eef2f7;
          outline: none;
          font-weight: 700;
        }

        .adminWorkerList {
          display: grid;
          gap: 12px;
          margin-top: 12px;
        }

        .adminWorkerIncident {
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 16px;
          background: #0d1517;
          padding: 14px;
        }

        .adminWorkerIncidentMeta {
          display: grid;
          gap: 6px;
          margin-bottom: 12px;
          color: #eef2f7;
          font-size: 14px;
        }

        .adminWorkerIncidentActions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .adminWorkerEmpty {
          margin-top: 12px;
          color: rgba(255,255,255,.70);
          font-weight: 600;
        }

        .adminWorkerTableWrap {
          margin-top: 12px;
          overflow: auto;
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 14px;
          background: #0d1517;
        }

        .adminWorkerTable {
          width: 100%;
          border-collapse: collapse;
          min-width: 1040px;
        }

        .adminWorkerTable th,
        .adminWorkerTable td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid rgba(255,255,255,.08);
          font-size: 14px;
          color: #eef2f7;
          vertical-align: middle;
        }

        .adminWorkerTable th {
          color: rgba(255,255,255,.75);
          font-weight: 800;
        }

        .adminWorkerStatus {
          display: inline-flex;
          align-items: center;
          min-height: 30px;
          padding: 4px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.12);
          background: #10191b;
          font-size: 12px;
          font-weight: 700;
          color: #eef2f7;
        }

        .adminWorkerGeoModalOverlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.68);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
        }

        .adminWorkerGeoModalCard {
          width: min(1100px, 100%);
          max-height: calc(100vh - 40px);
          overflow: auto;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 20px;
          background: #111c1f;
          padding: 18px;
          box-shadow: 0 24px 60px rgba(0,0,0,.35);
        }

        .adminWorkerGeoHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .adminWorkerGeoTitle {
          margin: 0;
          font-size: 20px;
          font-weight: 900;
          color: #eef2f7;
        }

        .adminWorkerGeoSub {
          margin-top: 4px;
          font-size: 13px;
          font-weight: 700;
          color: rgba(255,255,255,.68);
        }

        .adminWorkerGeoGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .adminWorkerGeoCard {
          display: grid;
          gap: 12px;
          padding: 14px;
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 16px;
          background: #0d1517;
        }

        .adminWorkerGeoCardTitle {
          font-size: 15px;
          font-weight: 900;
          color: #eef2f7;
        }

        .adminWorkerGeoMetaGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .adminWorkerGeoMetaItem {
          padding: 10px 12px;
          border-radius: 12px;
          background: #10191b;
          border: 1px solid rgba(255,255,255,.06);
        }

        .adminWorkerGeoMetaLabel {
          font-size: 11px;
          font-weight: 800;
          color: rgba(255,255,255,.62);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: .02em;
        }

        .adminWorkerGeoMetaValue {
          font-size: 13px;
          font-weight: 700;
          color: #eef2f7;
          word-break: break-word;
        }

        .adminWorkerGeoMap {
          width: 100%;
          height: 320px;
          border: 0;
          border-radius: 14px;
          background: #0b1113;
        }

        .adminWorkerGeoLink {
          color: #7dd3fc;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .adminWorkerGeoLink:hover {
          text-decoration: underline;
        }

        @media (max-width: 1200px) {
          .adminWorkerStats {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .adminWorkerGeoGrid,
          .adminWorkerGeoMetaGrid {
            grid-template-columns: 1fr;
          }

          .adminWorkerGeoMap {
            height: 280px;
          }
        }

        @media (max-width: 700px) {
          .adminWorkerStats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <section className="adminWorkerFilters">
        <button
          className={`adminWorkerPill ${preset === "today" ? "active" : ""}`}
          onClick={() => applyPreset("today")}
        >
          Hoy
        </button>

        <button
          className={`adminWorkerPill ${preset === "week" ? "active" : ""}`}
          onClick={() => applyPreset("week")}
        >
          Semana
        </button>

        <button
          className={`adminWorkerPill ${preset === "month" ? "active" : ""}`}
          onClick={() => applyPreset("month")}
        >
          Mes
        </button>

        <button
          className={`adminWorkerPill ${preset === "custom" ? "active" : ""}`}
          onClick={() => setPreset("custom")}
        >
          Personalizado
        </button>

        <div className="adminWorkerField">
          <input
            type="date"
            value={fromDateStr}
            onChange={(e) => {
              setPreset("custom");
              setFromDateStr(e.target.value);
            }}
          />
        </div>

        <div className="adminWorkerField">
          <input
            type="date"
            value={toDateStr}
            onChange={(e) => {
              setPreset("custom");
              setToDateStr(e.target.value);
            }}
          />
        </div>

        <button className="adminWorkerBtn primary" onClick={load} disabled={loading}>
          {loading ? "Cargando..." : "Aplicar"}
        </button>

        <button className="adminWorkerBtn" onClick={() => navigate("/admin/incidents")}>
          Volver a incidencias
        </button>

        <div className="adminWorkerBadge">Rango: {rangeLabel}</div>
      </section>

      <section className="adminWorkerCard">
        <h2 className="adminWorkerCardTitle">{displayProfile(profile, userId)}</h2>
        <p className="adminWorkerCardSub">Resumen del trabajador seleccionado</p>

        <div className="adminWorkerStats">
          <div className="adminWorkerStat">
            <div className="adminWorkerStatLabel">Total horas (rango)</div>
            <div className="adminWorkerStatValue">{loading ? "…" : formatMinutesHm(totalMinutes)}</div>
          </div>

          <div className="adminWorkerStat">
            <div className="adminWorkerStatLabel">Jornadas cerradas</div>
            <div className="adminWorkerStatValue">{loading ? "…" : closedCount}</div>
          </div>

          <div className="adminWorkerStat">
            <div className="adminWorkerStatLabel">Jornadas abiertas</div>
            <div className="adminWorkerStatValue">{loading ? "…" : openCount}</div>
          </div>

          <div className="adminWorkerStat">
            <div className="adminWorkerStatLabel">Incidencias pendientes</div>
            <div className="adminWorkerStatValue">{loading ? "…" : pending.length}</div>
          </div>
        </div>

        {error && <div className="adminWorkerNotice">{error}</div>}
      </section>

      <section className="adminWorkerCard">
        <h2 className="adminWorkerCardTitle">Incidencias pendientes</h2>
        <p className="adminWorkerCardSub">
          Las manuales se resuelven aquí. Las automáticas deben revisarse en la pantalla de incidencias.
        </p>

        <input
          className="adminWorkerInput"
          value={resolutionReason}
          onChange={(e) => setResolutionReason(e.target.value)}
          placeholder="Motivo de resolución para incidencias manuales"
        />

        {loading && <div className="adminWorkerEmpty">Cargando incidencias…</div>}

        {!loading && pending.length === 0 && (
          <div className="adminWorkerEmpty">No hay incidencias pendientes.</div>
        )}

        {!loading && pending.length > 0 && (
          <div className="adminWorkerList">
            {pending.map((it) => (
              <div key={it.adjustment_id} className="adminWorkerIncident">
                <div className="adminWorkerIncidentMeta">
                  <div><strong>Tipo:</strong> {getIncidentTypeLabel(it.source_type)}</div>
                  <div><strong>Entrada:</strong> {formatLocalDateTime(it.check_in_at)}</div>
                  <div>
                    <strong>{isAutomaticIncident(it) ? "Salida registrada" : "Salida propuesta"}:</strong>{" "}
                    {formatLocalDateTime(it.proposed_check_out)}
                  </div>
                  <div><strong>Motivo:</strong> {formatReason(it.reason)}</div>
                </div>

                <div className="adminWorkerIncidentActions">
                  {isAutomaticIncident(it) ? (
                    <button
                      className="adminWorkerBtn primary"
                      onClick={openIncidentsPage}
                    >
                      Revisar incidencia
                    </button>
                  ) : (
                    <>
                      <button
                        className="adminWorkerBtn primary"
                        onClick={() => resolveManual(it.adjustment_id, "validated")}
                      >
                        Validar
                      </button>

                      <button
                        className="adminWorkerBtn danger"
                        onClick={() => resolveManual(it.adjustment_id, "rejected")}
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="adminWorkerCard">
        <h2 className="adminWorkerCardTitle">Jornadas del trabajador</h2>
        <p className="adminWorkerCardSub">Registros de entrada y salida en el rango seleccionado</p>

        {loading && <div className="adminWorkerEmpty">Cargando jornadas…</div>}

        {!loading && entries.length === 0 && (
          <div className="adminWorkerEmpty">No hay jornadas en este rango.</div>
        )}

        {!loading && entries.length > 0 && (
          <div className="adminWorkerTableWrap">
            <table className="adminWorkerTable">
              <thead>
                <tr>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Duración</th>
                  <th>Revisión</th>
                  <th>Estado</th>
                  <th>Ubicación</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e) => {
                  const mins = safeDurationMinutes(e.check_in_at, e.check_out_at);

                  const hasGeo =
                    (e.check_in_geo_lat != null && e.check_in_geo_lng != null) ||
                    (e.check_out_geo_lat != null && e.check_out_geo_lng != null);

                  return (
                    <tr key={e.id}>
                      <td>{formatLocalDateTime(e.check_in_at)}</td>

                      <td>
                        {e.check_out_at
                          ? formatLocalDateTime(e.check_out_at)
                          : "— (abierta)"}
                      </td>

                      <td>{mins === null ? "—" : formatMinutesHm(mins)}</td>

                      <td>
                        <span className="adminWorkerStatus">
                          {translateWorkflow(e.workflow_status)}
                        </span>
                      </td>

                      <td>
                        <span className="adminWorkerStatus">
                          {translateStatus(e.status)}
                        </span>
                      </td>

                      <td>
                        {hasGeo ? (
                          <button
                            className="adminWorkerBtn small"
                            onClick={() => setSelectedGeoEntry(e)}
                          >
                            Ver localización
                          </button>
                        ) : (
                          <span className="adminWorkerStatus">Sin ubicación</span>
                        )}
                      </td>

                      <td>
                        {e.workflow_status === "pending" ? (
                          <button
                            className="adminWorkerBtn primary small"
                            onClick={openIncidentsPage}
                          >
                            Revisar
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedGeoEntry && (
        <div
          className="adminWorkerGeoModalOverlay"
          onClick={() => setSelectedGeoEntry(null)}
        >
          <div className="adminWorkerGeoModalCard" onClick={(e) => e.stopPropagation()}>
            <div className="adminWorkerGeoHeader">
              <div>
                <h3 className="adminWorkerGeoTitle">Localización del fichaje</h3>
                <div className="adminWorkerGeoSub">
                  {formatLocalDateTime(selectedGeoEntry.check_in_at)}
                  {selectedGeoEntry.check_out_at
                    ? ` → ${formatLocalDateTime(selectedGeoEntry.check_out_at)}`
                    : " → jornada abierta"}
                </div>
              </div>

              <button className="adminWorkerBtn" onClick={() => setSelectedGeoEntry(null)}>
                Cerrar
              </button>
            </div>

            <div className="adminWorkerGeoGrid">
              <div className="adminWorkerGeoCard">
                <div className="adminWorkerGeoCardTitle">Ubicación de entrada</div>

                {selectedGeoEntry.check_in_geo_lat != null &&
                selectedGeoEntry.check_in_geo_lng != null ? (
                  <>
                    <div className="adminWorkerGeoMetaGrid">
                      <div className="adminWorkerGeoMetaItem">
                        <div className="adminWorkerGeoMetaLabel">Coordenadas</div>
                        <div className="adminWorkerGeoMetaValue">
                          {formatCoords(
                            selectedGeoEntry.check_in_geo_lat,
                            selectedGeoEntry.check_in_geo_lng
                          )}
                        </div>
                      </div>

                      <div className="adminWorkerGeoMetaItem">
                        <div className="adminWorkerGeoMetaLabel">Precisión</div>
                        <div className="adminWorkerGeoMetaValue">
                          {selectedGeoEntry.check_in_geo_accuracy_m != null
                            ? `${Math.round(selectedGeoEntry.check_in_geo_accuracy_m)} m`
                            : "No disponible"}
                        </div>
                      </div>
                    </div>

                    <iframe
                      className="adminWorkerGeoMap"
                      src={buildGoogleMapsEmbedUrl(
                        selectedGeoEntry.check_in_geo_lat,
                        selectedGeoEntry.check_in_geo_lng
                      )}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mapa de entrada"
                    />

                    <a
                      className="adminWorkerGeoLink"
                      href={buildGoogleMapsExternalUrl(
                        selectedGeoEntry.check_in_geo_lat,
                        selectedGeoEntry.check_in_geo_lng
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver ubicación exacta
                    </a>
                  </>
                ) : (
                  <div className="adminWorkerGeoMetaValue">
                    No hay geolocalización registrada en la entrada.
                  </div>
                )}
              </div>

              <div className="adminWorkerGeoCard">
                <div className="adminWorkerGeoCardTitle">Ubicación de salida</div>

                {selectedGeoEntry.check_out_geo_lat != null &&
                selectedGeoEntry.check_out_geo_lng != null ? (
                  <>
                    <div className="adminWorkerGeoMetaGrid">
                      <div className="adminWorkerGeoMetaItem">
                        <div className="adminWorkerGeoMetaLabel">Coordenadas</div>
                        <div className="adminWorkerGeoMetaValue">
                          {formatCoords(
                            selectedGeoEntry.check_out_geo_lat,
                            selectedGeoEntry.check_out_geo_lng
                          )}
                        </div>
                      </div>

                      <div className="adminWorkerGeoMetaItem">
                        <div className="adminWorkerGeoMetaLabel">Precisión</div>
                        <div className="adminWorkerGeoMetaValue">
                          {selectedGeoEntry.check_out_geo_accuracy_m != null
                            ? `${Math.round(selectedGeoEntry.check_out_geo_accuracy_m)} m`
                            : "No disponible"}
                        </div>
                      </div>
                    </div>

                    <iframe
                      className="adminWorkerGeoMap"
                      src={buildGoogleMapsEmbedUrl(
                        selectedGeoEntry.check_out_geo_lat,
                        selectedGeoEntry.check_out_geo_lng
                      )}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Mapa de salida"
                    />

                    <a
                      className="adminWorkerGeoLink"
                      href={buildGoogleMapsExternalUrl(
                        selectedGeoEntry.check_out_geo_lat,
                        selectedGeoEntry.check_out_geo_lng
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver ubicación exacta
                    </a>
                  </>
                ) : (
                  <div className="adminWorkerGeoMetaValue">
                    No hay geolocalización registrada en la salida.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}