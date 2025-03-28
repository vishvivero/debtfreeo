
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
    // Create a Supabase client with the service role key
    console.log("Creating Supabase client with service role key");
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if bucket exists
    const bucketName = 'blog-images';
    console.log("Checking if bucket exists:", bucketName);
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error("Error listing buckets:", listError);
      throw listError;
    }
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    console.log("Bucket exists:", bucketExists);
    
    let result;
    if (bucketExists) {
      console.log("Blog images bucket already exists, updating configuration");
      
      // Ensure the bucket is configured correctly
      console.log("Updating bucket to ensure it's public");
      const { error: updateError } = await supabase.storage.updateBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      });
      
      if (updateError) {
        console.error("Error updating bucket:", updateError);
        throw updateError;
      }
      
      console.log("Bucket configuration updated successfully");
      result = {
        success: true,
        message: "Bucket configuration updated",
        bucketName,
        allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
      };
    } else {
      console.log("Creating new blog images bucket");
      
      // Create a new bucket
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'],
        fileSizeLimit: 5 * 1024 * 1024 // 5MB
      });
      
      if (createError) {
        console.error("Error creating bucket:", createError);
        throw createError;
      }
      
      console.log("New bucket created successfully");
      result = {
        success: true,
        message: "Bucket created successfully",
        bucketName,
        allowedTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml']
      };
    }
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error creating/updating bucket:", error);
    
    return new Response(JSON.stringify({
      success: false,
      message: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
