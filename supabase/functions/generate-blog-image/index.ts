
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Validates if a prompt is safe to use for image generation
 */
const isValidPrompt = (prompt: string): boolean => {
  if (!prompt || typeof prompt !== 'string') {
    return false;
  }
  
  // Check for reasonable length
  if (prompt.length > 4000 || prompt.length < 3) {
    return false;
  }
  
  // Check for potential injection attempts
  const suspiciousPatterns = [
    '\x00', // null byte
    'charset=s', // Related to the jsPDF vulnerability
    'data:image', // Trying to pass a data URL as a prompt
    '<script', // Script tags
    'function(', // JS code
    'function (', // JS code variant
  ];
  
  return !suspiciousPatterns.some(pattern => prompt.includes(pattern));
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    if (!prompt) {
      throw new Error('Image prompt is required');
    }
    
    if (!isValidPrompt(prompt)) {
      throw new Error('Invalid or potentially harmful prompt');
    }

    console.log(`Generating image with prompt: ${prompt}`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAIApiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }
    
    const imageUrl = data.data[0].url;

    return new Response(JSON.stringify({ imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating image:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
