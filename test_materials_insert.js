const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://mwfxxppefpyaxwtybcnf.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13Znh4cHBlZnB5YXh3dHliY25mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjM3Mzk4MywiZXhwIjoyMDkxOTQ5OTgzfQ.Q4AWe3YtYHrY90QFASLNsEUPbk_-XWVOiI_N5nF1GxE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testInsert() {
    const { data, error } = await supabase.from('materials').insert({
        title: 'Test Material',
        url: 'https://example.com',
        type: 'link',
        course_id: 1, // Assuming course 1 exists
        added_by: 1 // Assuming user 1 exists
    }).select();

    if (error) {
        console.error("Insert error:", error.message);
        // Try camelCase if snake_case fails
        const { data: data2, error: error2 } = await supabase.from('materials').insert({
            title: 'Test Material',
            url: 'https://example.com',
            type: 'link',
            courseId: 1,
            addedBy: 1
        }).select();
        if (error2) {
            console.error("CamelCase Insert error:", error2.message);
        } else {
            console.log("CamelCase Insert success:", Object.keys(data2[0]));
        }
    } else {
        console.log("SnakeCase Insert success:", Object.keys(data[0]));
    }
}
testInsert();
