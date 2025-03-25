
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
    const { schedule, category, userId } = await req.json();
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Check if we should run this schedule now
    const shouldRun = checkScheduleTiming(schedule);
    if (!shouldRun) {
      return new Response(
        JSON.stringify({ message: "Not scheduled to run at this time" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing blog titles to avoid duplication
    const { data: existingBlogs, error: fetchError } = await supabase
      .from("blogs")
      .select("title")
      .order("created_at", { ascending: false });
      
    if (fetchError) {
      throw new Error(`Error fetching existing blogs: ${fetchError.message}`);
    }
    
    const existingBlogTitles = existingBlogs.map(blog => blog.title);
    
    // Generate blog ideas
    console.log(`Generating blog ideas for category: ${category}`);
    const ideas = await generateBlogIdeas(existingBlogTitles, category);
    if (!ideas || ideas.length === 0) {
      throw new Error('Failed to generate blog ideas');
    }
    
    // Pick one idea randomly
    const selectedIdea = ideas[Math.floor(Math.random() * ideas.length)];
    console.log(`Selected blog idea: ${selectedIdea.title}`);
    
    // Generate full blog content
    const prompt = `Write a blog post about "${selectedIdea.title}". The blog should cover: ${selectedIdea.description}`;
    const blogContent = await generateBlogContent(prompt, category);
    
    if (!blogContent) {
      throw new Error('Failed to generate blog content');
    }
    
    // Parse the generated content
    const metadataMatch = blogContent.match(/---\n([\s\S]*?)\n---\n([\s\S]*)/);
    
    if (!metadataMatch) {
      throw new Error("Could not parse blog metadata");
    }
    
    const metadataStr = metadataMatch[1];
    const content = metadataMatch[2].trim();
    
    const metadata: Record<string, string> = {};
    metadataStr.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split(':');
      if (key && valueParts.length) {
        metadata[key.trim()] = valueParts.join(':').trim();
      }
    });
    
    const timestamp = new Date().getTime();
    const slug = `${(metadata.title || 'blog-post').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${timestamp}`;
    
    // Insert the blog post into the database
    const { error: insertError } = await supabase
      .from('blogs')
      .insert({
        title: metadata.title || 'Untitled',
        content,
        excerpt: metadata.excerpt || metadata.title,
        category: metadata.category || category || 'uncategorized',
        author_id: userId,
        is_published: true,
        slug,
        meta_title: metadata.meta_title || metadata.title,
        meta_description: metadata.meta_description || metadata.excerpt,
        keywords: metadata.keywords ? metadata.keywords.split(',').map(k => k.trim()) : [],
        key_takeaways: metadata.key_takeaways || '',
        published_at: new Date().toISOString(),
      });

    if (insertError) {
      throw new Error(`Error inserting blog: ${insertError.message}`);
    }

    // Update the automation schedule's last run time
    const { error: updateError } = await supabase
      .from('blog_automation_schedules')
      .update({ last_run_at: new Date().toISOString() })
      .eq('id', schedule.id);
      
    if (updateError) {
      console.error('Error updating schedule:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully generated and published blog: ${metadata.title}` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error auto-generating blog:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function generateBlogIdeas(existingBlogTitles: string[], category: string) {
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Category: ${category || 'finance'}\nExisting blog titles: ${JSON.stringify(existingBlogTitles)}` }
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
  
  return ideas;
}

function extractIdeasFromText(text: string) {
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

async function generateBlogContent(prompt: string, category: string) {
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
  
  return data.choices[0].message.content;
}

function checkScheduleTiming(schedule: any): boolean {
  if (!schedule) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentDayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
  
  // Check if last run was too recent (within last 23 hours)
  if (schedule.last_run_at) {
    const lastRun = new Date(schedule.last_run_at);
    const hoursSinceLastRun = (now.getTime() - lastRun.getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastRun < 23) {
      return false;
    }
  }
  
  // Check if current time matches the schedule
  if (schedule.frequency === 'daily') {
    return currentHour === schedule.hour;
  } else if (schedule.frequency === 'weekly') {
    return currentDayOfWeek === schedule.day_of_week && currentHour === schedule.hour;
  } else if (schedule.frequency === 'monthly') {
    const currentDayOfMonth = now.getDate();
    return currentDayOfMonth === schedule.day_of_month && currentHour === schedule.hour;
  }
  
  return false;
}
