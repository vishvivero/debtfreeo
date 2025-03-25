
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Running scheduled blog generation check");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get all active automation schedules
    const { data: schedules, error: fetchError } = await supabase
      .from("blog_automation_schedules")
      .select("*")
      .eq("is_active", true);
      
    if (fetchError) {
      throw new Error(`Error fetching schedules: ${fetchError.message}`);
    }
    
    console.log(`Found ${schedules.length} active schedules`);
    
    const results = [];
    
    // Check each schedule
    for (const schedule of schedules) {
      try {
        // Call the auto-generate-blog function for each schedule
        const { data, error } = await supabase.functions.invoke("auto-generate-blog", {
          body: {
            schedule,
            category: schedule.category,
            userId: schedule.user_id
          }
        });
        
        if (error) {
          console.error(`Error processing schedule ${schedule.id}:`, error);
          results.push({
            schedule_id: schedule.id,
            success: false,
            message: error.message
          });
          continue;
        }
        
        // If the function returned success: true, it means a blog was published
        if (data.success) {
          console.log(`Successfully ran schedule ${schedule.id}: ${data.message}`);
          results.push({
            schedule_id: schedule.id,
            success: true,
            message: data.message
          });
        } else {
          // If the function returned a message about timing, it wasn't scheduled to run now
          console.log(`Schedule ${schedule.id} not due to run: ${data.message}`);
          results.push({
            schedule_id: schedule.id,
            success: true,
            message: data.message,
            no_action: true
          });
        }
      } catch (scheduleError) {
        console.error(`Exception processing schedule ${schedule.id}:`, scheduleError);
        results.push({
          schedule_id: schedule.id,
          success: false,
          message: scheduleError instanceof Error ? scheduleError.message : "Unknown error"
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Checked ${schedules.length} schedules`,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error running scheduled blogs:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
