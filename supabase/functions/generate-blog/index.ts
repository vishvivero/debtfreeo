
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { prompt, category } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Generating blog with prompt: ${prompt}, category: ${category}`);

    const systemPrompt = `You are a professional blog writer specializing in financial content. 
    Create a well-structured blog post in markdown format with the following structure:
    
    ---
    title: A catchy title
    excerpt: A concise summary of the blog post (2-3 sentences)
    category: ${category || 'finance'}
    meta_title: SEO-friendly title
    meta_description: SEO-friendly description
    keywords: keyword1, keyword2, keyword3, keyword4, keyword5
    key_takeaways: 3-5 bullet points summarizing key takeaways
    ---
    
    # [Title]
    
    [Introduction paragraph]
    
    ## [First section heading]
    
    [Section content with 2-3 paragraphs]
    
    ## [Second section heading]
    
    [Section content with 2-3 paragraphs]
    
    ## [Third section heading]
    
    [Section content with 2-3 paragraphs]
    
    ## Conclusion
    
    [Concluding paragraph]
    
    Make sure the content is informative, engaging, and adheres to best practices for financial advice.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }
    
    const generatedBlog = data.choices[0].message.content;

    return new Response(JSON.stringify({ blog: generatedBlog }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating blog:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
