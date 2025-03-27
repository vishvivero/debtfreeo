
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // First check if the bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      throw listError
    }
    
    // If bucket already exists, return success
    const existingBucket = buckets.find(bucket => bucket.name === 'blog-images')
    if (existingBucket) {
      console.log('Blog images bucket already exists, checking configuration')
      
      // Update bucket to ensure it has the proper configuration
      try {
        const { data, error } = await supabase.storage.updateBucket('blog-images', {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: [
            'image/png', 
            'image/jpeg', 
            'image/jpg',
            'image/gif', 
            'image/webp', 
            'image/svg+xml'
          ]
        })
        
        if (error) {
          console.error('Error updating bucket:', error)
        } else {
          console.log('Bucket configuration updated successfully')
        }
      } catch (updateError) {
        console.error('Exception updating bucket:', updateError)
      }
      
      // Set CORS for the bucket using a different approach since updateBucketCors is not available
      try {
        // Make a direct API call to set CORS since the SDK method might not be available
        const corsSettings = [
          {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            headers: ['authorization', 'x-client-info', 'apikey', 'content-type', 'cache-control', 'x-file-name'],
            maxAgeSeconds: 86400,
            credentials: true
          }
        ];
        
        // Create a direct fetch request to set CORS
        const corsResponse = await fetch(`${supabaseUrl}/storage/v1/buckets/blog-images/cors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey
          },
          body: JSON.stringify(corsSettings)
        });
        
        if (!corsResponse.ok) {
          console.error('Error setting CORS configuration via API:', await corsResponse.text());
        } else {
          console.log('CORS configuration updated successfully via direct API call');
        }
      } catch (corsError) {
        console.error('Error setting CORS configuration:', corsError)
        // Continue even if CORS setting fails - the bucket might still work
      }
      
      // Return success response
      return new Response(
        JSON.stringify({ message: 'Blog images bucket already exists and configuration updated' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Create the bucket if it doesn't exist
    console.log('Creating blog-images bucket with improved configuration')
    const { data, error } = await supabase.storage.createBucket('blog-images', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: [
        'image/png', 
        'image/jpeg', 
        'image/jpg',
        'image/gif', 
        'image/webp', 
        'image/svg+xml'
      ]
    })

    if (error) {
      console.error('Error creating bucket:', error)
      throw error
    }

    // Set CORS for the bucket using direct API call
    try {
      const corsSettings = [
        {
          origin: '*',
          methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          headers: ['authorization', 'x-client-info', 'apikey', 'content-type', 'cache-control', 'x-file-name'],
          maxAgeSeconds: 86400,
          credentials: true
        }
      ];
      
      const corsResponse = await fetch(`${supabaseUrl}/storage/v1/buckets/blog-images/cors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey
        },
        body: JSON.stringify(corsSettings)
      });
      
      if (!corsResponse.ok) {
        console.error('Error setting CORS configuration via API:', await corsResponse.text());
      } else {
        console.log('CORS configuration updated successfully via direct API call');
      }
    } catch (corsError) {
      console.error('Error setting CORS configuration:', corsError)
    }

    console.log('Blog images bucket created successfully')
    return new Response(
      JSON.stringify({ message: 'Blog images bucket created successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error creating bucket:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
