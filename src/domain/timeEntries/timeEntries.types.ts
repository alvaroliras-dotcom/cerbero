export type TimeEntry = {
  id: string;
  company_id: string;
  user_id: string;

  check_in_at: string;
  check_out_at: string | null;

  status: string | null;

  created_at?: string;
};