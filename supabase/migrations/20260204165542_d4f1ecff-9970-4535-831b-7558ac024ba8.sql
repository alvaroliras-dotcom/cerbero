-- =====================================================
-- FASE 5A.1: VISTA LEGAL DE JORNADAS (EXPORTACIÓN)
-- =====================================================

CREATE OR REPLACE VIEW public.legal_time_report AS
SELECT
  ce.company_id,
  ce.user_id,
  p.full_name AS worker_name,
  date_trunc('day', ce.timestamp) AS work_day,
  MIN(CASE WHEN ce.type = 'in' THEN ce.timestamp END) AS first_check_in,
  MAX(CASE WHEN ce.type = 'out' THEN ce.timestamp END) AS last_check_out,
  COUNT(*) FILTER (WHERE ce.type = 'in') AS total_check_ins,
  COUNT(*) FILTER (WHERE ce.type = 'out') AS total_check_outs
FROM public.clock_entries ce
JOIN public.profiles p ON p.id = ce.user_id
GROUP BY
  ce.company_id,
  ce.user_id,
  p.full_name,
  date_trunc('day', ce.timestamp);

ALTER VIEW public.legal_time_report SET (security_invoker = true);