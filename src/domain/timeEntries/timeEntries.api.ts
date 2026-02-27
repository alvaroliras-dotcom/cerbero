import { supabase } from "../../lib/supabaseClient";
import type { TimeEntry } from "./timeEntries.types";

export async function getOpenEntry(companyId: string, userId: string) {
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("company_id", companyId)
    .eq("user_id", userId)
    .is("check_out_at", null)
    .order("check_in_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as TimeEntry | null;
}

export async function createCheckIn(companyId: string, userId: string) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      company_id: companyId,
      user_id: userId,
      check_in_at: now,
      status: "open",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as TimeEntry;
}

export async function createCheckOut(entryId: string) {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("time_entries")
    .update({
      check_out_at: now,
      status: "closed",
    })
    .eq("id", entryId)
    .select("*")
    .single();

  if (error) throw error;
  return data as TimeEntry;
}