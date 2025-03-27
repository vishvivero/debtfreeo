
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
    if (buckets.find(bucket => bucket.name === 'blog-images')) {
      console.log('Blog images bucket already exists, skipping creation')
      return new Response(
        JSON.stringify({ message: 'Blog images bucket already exists' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Create the bucket if it doesn't exist
    console.log('Creating blog-images bucket with improved configuration')
    const { data, error } = await supabase.storage.createBucket('blog-images', {
      public: true,
      fileSizeLimit: 1024 * 1024 * 10, // 10MB
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
