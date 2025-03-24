
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
    const { existingBlogTitles, category } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log(`Generating blog ideas for category: ${category}`);
    console.log(`Avoiding duplication with ${existingBlogTitles.length} existing blogs`);

    const systemPrompt = `You are a financial content strategist specializing in generating unique blog ideas.
    Based on the category and list of existing blog titles provided, suggest 5 fresh blog ideas that:
    1. Are relevant to the specified category
    2. Don't overlap with existing content
    3. Would be engaging and valuable for readers interested in financial advice
    4. Include a catchy title and a brief description (1-2 sentences) of what the blog would cover
    
    Format each idea as:
    {
      "title": "Catchy Title Here",
      "description": "Brief description of what this blog post would cover and why it would be valuable."
    }
    
    Your response should be a valid JSON array containing 5 blog ideas.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: `Category: ${category || 'finance'}\nExisting blog titles: ${JSON.stringify(existingBlogTitles)}` 
          }
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }
    
    const ideasText = data.choices[0].message.content;
    let ideas;
    
    try {
      // Parse the JSON response
      ideas = JSON.parse(ideasText);
    } catch (error) {
      console.error('Error parsing ideas JSON:', error);
      console.log('Raw response:', ideasText);
      // Fallback to regex extraction if JSON parsing fails
      ideas = extractIdeasFromText(ideasText);
    }

    return new Response(JSON.stringify({ ideas }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating blog ideas:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Fallback function to extract ideas from text if JSON parsing fails
function extractIdeasFromText(text) {
  const ideas = [];
  const titleRegex = /"title":\s*"([^"]+)"/g;
  const descriptionRegex = /"description":\s*"([^"]+)"/g;
  
  const titles = [...text.matchAll(titleRegex)].map(match => match[1]);
  const descriptions = [...text.matchAll(descriptionRegex)].map(match => match[1]);
  
  for (let i = 0; i < Math.min(titles.length, descriptions.length); i++) {
    ideas.push({
      title: titles[i],
      description: descriptions[i]
    });
  }
  
  return ideas;
}
