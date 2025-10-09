import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { theme, count } = await req.json();
    
    // Validate inputs
    if (!theme || typeof theme !== 'string' || theme.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Theme is required and must be a non-empty string' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    if (!count || typeof count !== 'number' || count < 1 || count > 40) {
      return new Response(
        JSON.stringify({ error: 'Count must be a number between 1 and 40' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Sanitize theme input to prevent injection
    const sanitizedTheme = theme.trim().replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 50);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating ${count} images for theme: ${sanitizedTheme}`);

    // Generate images in parallel batches to speed up generation
    const batchSize = 5; // Generate 5 images at a time to avoid rate limits
    const images: string[] = [];
    
    const generateImage = async (index: number): Promise<string> => {
      const prompt = `A simple, recognizable icon-style image of a ${sanitizedTheme}, variation ${index + 1}. Clean, minimalist design suitable for authentication. High quality, clear details.`;
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash-image-preview',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          modalities: ['image', 'text']
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI gateway error:', response.status, errorText);
        throw new Error(`Failed to generate image ${index + 1}`);
      }

      const data = await response.json();
      const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!imageUrl) {
        throw new Error(`No image URL in response for image ${index + 1}`);
      }
      
      console.log(`Generated image ${index + 1}/${count}`);
      return imageUrl;
    };
    
    // Process in batches
    for (let i = 0; i < count; i += batchSize) {
      const batch = [];
      for (let j = i; j < Math.min(i + batchSize, count); j++) {
        batch.push(generateImage(j));
      }
      const batchResults = await Promise.all(batch);
      images.push(...batchResults);
    }

    return new Response(
      JSON.stringify({ images }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error: unknown) {
    console.error('Error in generate-images function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});