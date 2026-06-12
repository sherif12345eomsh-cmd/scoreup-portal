// ============================================================
//  ScoreUp Portal — Database connection
//  Your keys are already filled in. Don't change anything here.
// ============================================================

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://zsujbcivmdjrauygmnlz.supabase.co";

const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_YzxKLg0db5O31bs0H5X3FA_sLDxJaSI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const isConfigured =
  SUPABASE_URL.startsWith("https://") && SUPABASE_KEY.length > 10;
