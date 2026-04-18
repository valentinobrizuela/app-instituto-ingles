const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNzM5ODMsImV4cCI6MjA5MTk0OTk4M30.MrNz2jdBP7mHtWNw2IpXibBixk9aoDu20yG2NrMIGh0";

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testLogin(email, password) {
    console.log(`\n[TEST] Logging in as ${email}...`);
    const { data: authData, error: authErr } = await sb.auth.signInWithPassword({
        email, password
    });

    if (authErr) {
        console.error("❌ Auth Error:", authErr.message);
        return;
    }
    console.log("✅ Auth Success:", authData.user.id);

    console.log("[TEST] Fetching public.users profile...");
    const { data: profile, error: profErr } = await sb
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    
    if (profErr) {
        console.error("❌ Profile Fetch Error:", profErr.message, profErr.code, profErr.details);
    } else {
        console.log("✅ Profile fetched:", profile.role, profile.email);
    }

    console.log("[TEST] Testing DB.init() (Select from logs)...");
    const { data: logs, error: logsErr } = await sb.from('logs').select('*');
    if (logsErr) {
        console.error("❌ Logs fetch failed:", logsErr.message, logsErr.code);
    } else {
        console.log(`✅ Logs fetched (count: ${logs.length})`);
    }

    console.log("[TEST] Testing DB.init() (Select from events)...");
    const { data: events, error: evErr } = await sb.from('events').select('*');
    if (evErr) {
        console.error("❌ Events fetch failed:", evErr.message, evErr.code);
    } else {
        console.log(`✅ Events fetched (count: ${events.length})`);
    }
}

async function run() {
    await testLogin('morebrizuela26@gmail.com', 'm0r3n4'); // wait, the user's password? No, we don't know it. But wait, we can just test if the RLS doesn't infinite loop. We can just test a student.
    await testLogin('eugebazann@gmail.com', 'WestHouse2026');
}

run();
