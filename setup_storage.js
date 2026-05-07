const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function setupStorage() {
    const { data, error } = await supabase.storage.createBucket('materials', {
        public: true,
        allowedMimeTypes: null, // Allow all
        fileSizeLimit: 52428800 // 50MB
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log("Bucket 'materials' already exists.");
        } else {
            console.error("Error creating bucket:", error.message);
        }
    } else {
        console.log("Bucket 'materials' created successfully.");
    }
}

setupStorage();
