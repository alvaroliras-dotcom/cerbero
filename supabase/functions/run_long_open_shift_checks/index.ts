import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results = [];

  const { data: longOpen } = await supabase.rpc(
    "get_long_open_shift_notifications",
    {
      p_company_id: "2cff6a40-94d8-4166-bb6f-5e1f46e0e9be",
    }
  );

  const { data: missingCheckin } = await supabase.rpc(
    "get_missing_checkin_notifications",
    {
      p_company_id: "2cff6a40-94d8-4166-bb6f-5e1f46e0e9be",
    }
  );

  const { data: missingLunchCheckout } = await supabase.rpc(
    "get_missing_lunch_checkout_notifications",
    {
      p_company_id: "2cff6a40-94d8-4166-bb6f-5e1f46e0e9be",
    }
  );

  const allCandidates = [
    ...(longOpen ?? []),
    ...(missingCheckin ?? []),
    ...(missingLunchCheckout ?? []),
  ];

  for (const item of allCandidates) {
    const body =
      item.notification_type === "missing_checkin_warning_1"
        ? "Todavía no has fichado tu entrada."
        : item.notification_type === "missing_lunch_checkout_warning_1"
        ? "Puede que hayas olvidado fichar la salida de comida."
        : "Llevas muchas horas con la jornada abierta. Revisa si falta fichar la salida.";

    const res = await fetch(
      "https://dooldjcaasfrmtozcyyq.supabase.co/functions/v1/send_push_notification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvb2xkamNhYXNmcm10b3pjeXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTg3ODgsImV4cCI6MjA4NTA5NDc4OH0.T0KruRRY4FjFoKnitIsEReuemZBLpnxm_R90nAfhU00",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6ImFub24iLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvb2xkamNhYXNmcm10b3pjeXlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTg3ODgsImV4cCI6MjA4NTA5NDc4OH0.T0KruRRY4FjFoKnitIsEReuemZBLpnxm_R90nAfhU00",
        },
        body: JSON.stringify({
          company_id: item.company_id,
          user_id: item.user_id,
          notification_type: item.notification_type,
          reference_date: item.reference_date,
          reference_slot: item.reference_slot,
          title: "Cerbero",
          body,
        }),
      }
    );

    const text = await res.text();

    results.push({
      status: res.status,
      body: text,
    });
  }

  return new Response(
    JSON.stringify({
      ok: true,
      processed: allCandidates.length,
      results,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
});