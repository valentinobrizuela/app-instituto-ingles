import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzM5ODMsImV4cCI6MjA5MTk0OTk4M30.MrNz2jdBP7mHtWNw2IpXibBixk9aoDu20yG2NrMIGh0";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
