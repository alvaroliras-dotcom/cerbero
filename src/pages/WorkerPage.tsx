import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  useOpenEntry,
  useCheckIn,
  useCheckOut,
} from "../domain/timeEntries/timeEntries.hooks";
import { useActiveCompany } from "../domain/companies/companies.hooks";

export function WorkerPage() {
  const [userId, setUserId] = useState<string | null>(null);

  const {
    activeCompany,
    loading: companyLoading,
    status,
    message,
  } = useActiveCompany();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // ✅ Hooks SIEMPRE se ejecutan (aunque haya null). React Query ya evita llamadas con enabled.
  const { data: openEntry, isLoading } = useOpenEntry(activeCompany, userId);
  const checkIn = useCheckIn(activeCompany, userId);
  const checkOut = useCheckOut();

  // ✅ UI gating (después de hooks)
  if (!userId) return <div>Cargando usuario...</div>;
  if (companyLoading) return <div>Cargando empresa...</div>;

  if (status === "pending") {
    return (
      <div>
        <h2>Acceso pendiente</h2>
        <p>{message}</p>
        <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div>
        <h2>Error</h2>
        <p>{message}</p>
        <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
      </div>
    );
  }

  if (status === "no-auth") {
    return (
      <div>
        <h2>Sesión no válida</h2>
        <p>{message}</p>
        <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
      </div>
    );
  }

  if (!activeCompany) return <div>No hay empresa activa.</div>;
  if (isLoading) return <div>Cargando estado...</div>;

  const isOpen = !!openEntry;

  return (
    <div>
      <h2>Fichaje</h2>

      <p>
        Estado actual: <strong>{isOpen ? "EN TURNO" : "FUERA DE TURNO"}</strong>
      </p>

      {!isOpen && <button onClick={() => checkIn.mutate()}>Entrar</button>}

      {isOpen && openEntry && (
        <button onClick={() => checkOut.mutate(openEntry.id)}>Salir</button>
      )}

      <br />
      <br />

      <button onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
    </div>
  );
}