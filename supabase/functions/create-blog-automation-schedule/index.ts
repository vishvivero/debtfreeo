
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
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { frequency, hour, day_of_week, day_of_month, category, user_id } = await req.json();

    // Validate required fields
    if (!frequency || !category || !user_id) {
      throw new Error('Missing required fields: frequency, category and user_id are required');
    }

    // Validate hour (0-23)
    if (hour < 0 || hour > 23) {
      throw new Error('Hour must be between 0 and 23');
    }

    // Validate specific frequency requirements
    if (frequency === 'weekly' && (day_of_week === undefined || day_of_week < 0 || day_of_week > 6)) {
      throw new Error('Weekly schedules require a day_of_week between 0 (Sunday) and 6 (Saturday)');
    }

    if (frequency === 'monthly' && (day_of_month === undefined || day_of_month < 1 || day_of_month > 31)) {
      throw new Error('Monthly schedules require a day_of_month between 1 and 31');
    }

    // Insert the new schedule
    const { data, error } = await supabase
      .from('blog_automation_schedules')
      .insert({
        user_id,
        frequency,
        hour,
        day_of_week: frequency === 'weekly' ? day_of_week : null,
        day_of_month: frequency === 'monthly' ? day_of_month : null,
        category,
        created_at: new Date().toISOString(),
        is_active: true
      })
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, data: data[0] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating blog automation schedule:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
