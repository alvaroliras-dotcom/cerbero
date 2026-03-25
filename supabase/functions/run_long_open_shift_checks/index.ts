import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type CalendarRow = {
  company_id: string;
  morning_start: string | null;
  lunch_start: string | null;
  afternoon_start: string | null;
  day_end: string | null;
};

type MembershipRow = {
  user_id: string;
  company_id: string;
  role: string;
};

type TimeEntryRow = {
  id: string;
  check_in_at: string | null;
  check_out_at: string | null;
};

function getMadridNowParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));

  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
    dateStr: `${map.year}-${map.month}-${map.day}`,
  };
}

function timeStringToMinutes(value: string) {
  const [hh, mm] = value.slice(0, 5).split(":").map(Number);
  return hh * 60 + mm;
}

function getLocalDateInMadrid(value: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function getLocalTimeInMadrid(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(value));
}

function getLocalMinutesInMadrid(value: string) {
  return timeStringToMinutes(getLocalTimeInMadrid(value));
}

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const companyId = "6f41257b-f20e-4e33-9cd1-b4109d02ffb8";
  const results: Array<Record<string, unknown>> = [];

  const nowMadrid = getMadridNowParts();
  const nowMinutes = nowMadrid.hour * 60 + nowMadrid.minute;

  const { data: calendar } = await supabase
    .from("company_work_calendar")
    .select("company_id, morning_start, lunch_start, afternoon_start, day_end")
    .eq("company_id", companyId)
    .single<CalendarRow>();

  if (!calendar) {
    return new Response(JSON.stringify({ ok: false, error: "No calendar" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  const morningDeadline = timeStringToMinutes(calendar.morning_start!) + 45;
  const lunchDeadline = timeStringToMinutes(calendar.lunch_start!) + 45;
  const afternoonDeadline = timeStringToMinutes(calendar.afternoon_start!) + 45;
  const finalDeadline = timeStringToMinutes(calendar.day_end!) + 45;

  const { data: memberships } = await supabase
    .from("memberships")
    .select("user_id, company_id, role")
    .eq("company_id", companyId)
    .in("role", ["employee", "worker"])
    .returns<MembershipRow[]>();

  for (const member of memberships ?? []) {
    const { data: entries } = await supabase
      .from("time_entries")
      .select("id, check_in_at, check_out_at")
      .eq("company_id", companyId)
      .eq("user_id", member.user_id)
      .returns<TimeEntryRow[]>();

    const todayEntries = (entries ?? []).filter((entry) => {
      if (!entry.check_in_at) return false;
      return getLocalDateInMadrid(entry.check_in_at) === nowMadrid.dateStr;
    });

    const sorted = [...todayEntries].sort((a, b) =>
      new Date(a.check_in_at!).getTime() - new Date(b.check_in_at!).getTime()
    );

    const first = sorted[0] ?? null;
    const second = sorted[1] ?? null;

    const firstMinutes = first?.check_in_at ? getLocalMinutesInMadrid(first.check_in_at) : null;
    const lunchOutMinutes = first?.check_out_at ? getLocalMinutesInMadrid(first.check_out_at) : null;
    const secondMinutes = second?.check_in_at ? getLocalMinutesInMadrid(second.check_in_at) : null;
    const finalOutMinutes = second?.check_out_at ? getLocalMinutesInMadrid(second.check_out_at) : null;

    if (nowMinutes >= morningDeadline) {
      if (firstMinutes === null || firstMinutes > morningDeadline) {
        await supabase.rpc("create_missing_checkin_incident", {
          p_company_id: companyId,
          p_user_id: member.user_id,
        });
      }
      if (first && firstMinutes! > morningDeadline) {
        await supabase.rpc("create_late_checkin_incident", {
          p_company_id: companyId,
          p_user_id: member.user_id,
          p_time_entry_id: first.id,
        });
      }
    }

    if (nowMinutes >= lunchDeadline) {
      if (lunchOutMinutes === null || lunchOutMinutes > lunchDeadline) {
        await supabase.rpc("create_missing_lunch_checkout_incident", {
          p_company_id: companyId,
          p_user_id: member.user_id,
        });
      }
      if (first && lunchOutMinutes && lunchOutMinutes > lunchDeadline) {
        await supabase.rpc("create_late_lunch_checkout_incident", {
          p_company_id: companyId,
          p_user_id: member.user_id,
          p_time_entry_id: first.id,
        });
      }
    }

    if (nowMinutes >= afternoonDeadline) {
      if (secondMinutes === null || secondMinutes > afternoonDeadline) {
        await supabase.rpc("create_missing_afternoon_checkin_incident", {
          p_company_id: companyId,
          p_user_id: member.user_id,
        });
      }
      if (second && secondMinutes! > afternoonDeadline) {
        await supabase.rpc("create_late_afternoon_checkin_incident", {
          p_company_id: companyId,
          p_user_id: member.user_id,
          p_time_entry_id: second.id,
        });
      }
    }

    if (nowMinutes >= finalDeadline) {
      if (finalOutMinutes === null || finalOutMinutes > finalDeadline) {
        await supabase.rpc("create_missing_final_checkout_incident", {
          p_company_id: companyId,
          p_user_id: member.user_id,
        });
      }
      if (second && finalOutMinutes && finalOutMinutes > finalDeadline) {
        await supabase.rpc("create_late_final_checkout_incident", {
          p_company_id: companyId,
          p_user_id: member.user_id,
          p_time_entry_id: second.id,
        });
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, results }), {
    headers: { "Content-Type": "application/json" },
  });
});