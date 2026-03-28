// ─── Supabase Configuration ───────────────────────────────────────
// 1. Go to https://supabase.com → your project → Settings → API
// 2. Copy your Project URL and anon/public key and paste below
// ──────────────────────────────────────────────────────────────────

const SUPABASE_URL  = 'https://zunbtwrebvujtdmfavke.supabase.co';   // e.g. https://xyzabc.supabase.co
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1bmJ0d3JlYnZ1anRkbWZhdmtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2ODg1NDEsImV4cCI6MjA5MDI2NDU0MX0.5Wr4tvxjplslnnX_IKecfwEJfR0nCFolRWhqqntURb4';      // starts with eyJh...

// Overwrite the original window.supabase property with the client instance
window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
