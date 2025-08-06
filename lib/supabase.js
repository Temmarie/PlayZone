import { createClient } from "@supabase/supabase-js";

const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYWd1YnJjdnZiYnBjcWZhcHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0ODUyNDUsImV4cCI6MjA3MDA2MTI0NX0.UnmKDiv4bL3yJGVACEz6Jw4C1I4OrTAFv1U5oyQCnMU";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
