// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://qwkepsyqgjqdatwfxvym.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3a2Vwc3lxZ2pxZGF0d2Z4dnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2ODQ2NTksImV4cCI6MjA2MTI2MDY1OX0.JlLyPpCgJ_1NH_9ENwrqGwmtED94kb_VCjYhZMeuUDM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);