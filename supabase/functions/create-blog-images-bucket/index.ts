
// Supabase Edge Function: Create Blog Images Bucket
// This function creates a new storage bucket for blog images and makes it public

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle CORS preflight requests
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Supabase credentials from environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    console.log("Creating Supabase client with service role key");
    // Create Supabase admin client with service key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const bucketName = 'blog-images';

    // First check if bucket already exists
    console.log("Checking if bucket exists:", bucketName);
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Failed to list buckets:", listError);
      throw new Error(`Failed to list buckets: ${listError.message}`);
    }
    
    // If bucket already exists, check its configuration
    if (buckets?.find(bucket => bucket.name === bucketName)) {
      console.log('Blog images bucket already exists, checking configuration');
      
      // Update bucket configuration to ensure it's public
      console.log("Updating bucket to ensure it's public");
      const { error: updateError } = await supabase.storage.updateBucket(
        bucketName,
        { public: true }
      );
      
      if (updateError) {
        console.error("Failed to update bucket configuration:", updateError);
        throw new Error(`Failed to update bucket configuration: ${updateError.message}`);
      }
      
      console.log('Bucket configuration updated successfully');
      
      // Try to set CORS configuration
      try {
        // We're no longer trying to use the setCors method as it's not available
        console.log("Note: CORS configuration should be managed through the Supabase dashboard");
      } catch (corsError) {
        console.error('Error handling CORS configuration:', corsError);
      }
      
      return new Response(
        JSON.stringify({ success: true, message: 'Bucket configuration updated', bucketName }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Create the bucket if it doesn't exist
    console.log(`Creating new bucket: ${bucketName}`);
    const { error: createError } = await supabase.storage.createBucket(
      bucketName,
      { public: true } // Make the bucket public
    );
    
    if (createError) {
      console.error("Failed to create bucket:", createError);
      throw new Error(`Failed to create bucket: ${createError.message}`);
    }
    
    console.log(`Bucket ${bucketName} created successfully`);
    
    // Create SQL that could be run to set storage policies (for documentation)
    const policiesInfo = `
    -- Public read access policy
    CREATE POLICY "Public Access" 
    ON storage.objects 
    FOR SELECT USING (bucket_id = '${bucketName}');
    
    -- Authenticated users can upload/update policy
    CREATE POLICY "Authenticated Users Upload Access"
    ON storage.objects
    FOR INSERT TO authenticated 
    WITH CHECK (bucket_id = '${bucketName}');
    
    -- Authenticated users can update their files
    CREATE POLICY "Authenticated Users Update Access"
    ON storage.objects
    FOR UPDATE TO authenticated
    USING (bucket_id = '${bucketName}')
    WITH CHECK (bucket_id = '${bucketName}');
    `;
    
    console.log("Storage policies information:", policiesInfo);
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created ${bucketName} bucket`, 
        bucketName,
        policies: policiesInfo
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating blog images bucket:', error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
