-- Ensure pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create clock_entries table
CREATE TABLE public.clock_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('in', 'out')),
  timestamp timestamptz NOT NULL DEFAULT now(),
  location text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_clock_entries_user_timestamp ON public.clock_entries (user_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE public.clock_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own entries
CREATE POLICY "Users can view own clock entries"
ON public.clock_entries
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own entries
CREATE POLICY "Users can insert own clock entries"
ON public.clock_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);