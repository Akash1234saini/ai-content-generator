import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContentRequest {
  prompt: string;
  platforms: string[];
  generateImages: boolean;
}

const platformPrompts = {
  linkedin: "Create professional LinkedIn content that's engaging and business-focused.",
  instagram: "Create Instagram content with hashtags, engaging captions, and visual appeal.",
  facebook: "Create Facebook content that encourages engagement and sharing.",
  pinterest: "Create Pinterest-optimized content with SEO-friendly descriptions.",
  whatsapp: "Create concise WhatsApp message content that's easy to share.",
  email: "Create compelling email content with clear subject line and call-to-action.",
  quadrant: "Create strategic business content suitable for decision-makers.",
  youtube: "Create YouTube video content with an engaging title and detailed script broken down scene by scene. Include timing suggestions and engagement hooks.",
  miniblog: "Create a comprehensive 500-word blog post that is informative, engaging, and well-structured with clear sections."
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const { prompt, platforms, generateImages }: ContentRequest = await req.json();

    const results = [];

    for (const platform of platforms) {
      const platformPrompt = platformPrompts[platform as keyof typeof platformPrompts] || 
        "Create engaging content for this platform.";
      
      const fullPrompt = `${platformPrompt}\n\nUser prompt: ${prompt}\n\nGenerate content optimized for ${platform}. Make it engaging, relevant, and platform-appropriate.`;

      // Call Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: fullPrompt
            }]
          }]
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Gemini API error:', data);
        throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate content';
      
      const result: any = {
        platform,
        content
      };

      // Generate image prompt if requested
      if (generateImages) {
        let imagePromptText = '';
        
        // Platform-specific image prompt instructions
        if (platform === 'youtube') {
          imagePromptText = `Create a detailed YouTube thumbnail image prompt based on this content: ${content.substring(0, 200)}... The image should be 16:9 aspect ratio (1280x720), eye-catching, with bold text overlay potential, and designed to attract clicks. Make it vibrant and engaging for YouTube's platform.`;
        } else if (platform === 'miniblog') {
          imagePromptText = `Create a detailed blog header image prompt based on this content: ${content.substring(0, 200)}... The image should be 16:9 or 3:2 aspect ratio, professional, clean, and suitable for a blog post header. Make it relevant to the blog topic and visually appealing.`;
        } else {
          imagePromptText = `Create a detailed image prompt for ${platform} based on this content: ${content.substring(0, 200)}... Make it visual, specific, and optimized for ${platform}'s visual style.`;
        }

        const imagePromptResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: imagePromptText
              }]
            }]
          }),
        });

        const imageData = await imagePromptResponse.json();
        result.imagePrompt = imageData.candidates?.[0]?.content?.parts?.[0]?.text || 'Visual content suggestion';
      }

      results.push(result);
    }

    // Save to database
    const { error: saveError } = await supabase
      .from('content_history')
      .insert({
        user_id: user.id,
        prompt,
        platforms,
        results
      });

    if (saveError) {
      console.error('Error saving to database:', saveError);
    }

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      results: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});