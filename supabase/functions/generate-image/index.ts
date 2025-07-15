import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Gemini API key not found');
      throw new Error('Gemini API key not configured');
    }

    const { prompt } = await req.json();
    
    if (!prompt) {
      throw new Error('Missing prompt for image generation');
    }

    console.log('Generating image with prompt:', prompt);

    // Use Gemini's imagen model for image generation
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        config: {
          aspectRatio: "1:1",
          safetyFilterLevel: "BLOCK_ONLY_HIGH",
          personGeneration: "ALLOW_ADULT"
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini Image API error:', data);
      throw new Error(`Gemini Image API error: ${data.error?.message || 'Unknown error'}`);
    }

    // Extract the generated image data
    const generatedImage = data.candidates?.[0]?.image;
    
    if (!generatedImage) {
      throw new Error('No image generated from Gemini');
    }

    // Convert base64 to data URL if needed
    const imageUrl = generatedImage.startsWith('data:') 
      ? generatedImage 
      : `data:image/jpeg;base64,${generatedImage}`;

    return new Response(JSON.stringify({ 
      imageUrl: imageUrl,
      image: imageUrl 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-image function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});