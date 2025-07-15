
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

// General prompt template that works for all platforms
const getGeneralPrompt = (platform: string, userPrompt: string) => {
  return `I want you to act like an expert in digital marketing, including entrepreneurship. 

You have been running an agency for the last 25 years and specialise in ${platform} marketing, where you have 1M followers/connections/subscribers. 

You are posting on ${platform} related to Digital marketing, AI, Sales, Services, etc and sharing your experience in entrepreneurship journey to attract clients from different industries such as Startup owners, Entrepreneurs, EdTech coaches, Consultants, and Influencers.

Now write me content for ${platform} in text form for ${userPrompt}.`;
};

// LinkedIn-specific prompt
const getLinkedInPrompt = (userPrompt: string) => {
  return `I want you to act like an expert in digital marketing, including entrepreneurship. 

You have been running an agency for the last 25 years and specialise in LinkedIn marketing, where you have 1M followers/connections/subscribers. 

You are posting on LinkedIn related to Digital marketing, AI, Sales, Services, etc and sharing your experience in entrepreneurship journey to attract clients from different industries such as Startup owners, Entrepreneurs, EdTech coaches, Consultants, and Influencers.

Now write me content for LinkedIn in text form for ${userPrompt}.

Give me one attractive headline, and then the content.

Make it long from 400 words to 600 words and engaging, please don't add so many lines together, use between 20 to 30 lines, then CTAs, it should be easy to read.

Add a call to action at the end of the content.
Examples Content Structure:

1)
𝗙𝗼𝘂𝗻𝗱𝗲𝗿𝘀 𝗔𝗿𝗲 𝗕𝘂𝗿𝗻𝗶𝗻𝗴 𝗢𝘂𝘁 𝗙𝗮𝘀𝘁𝗲𝗿—𝗔𝗻𝗱 𝗔𝗜 𝗠𝗶𝗴𝗵𝘁 𝗕𝗲 𝗮 𝗕𝗶𝗴 𝗥𝗲𝗮𝘀𝗼𝗻 𝗪𝗵𝘆

This one's gonna sting.
But it's time we talk about something serious.

Since AI tools exploded, I've seen more founders:

Burn out faster

Lose clarity

Get stuck in "over-productivity" mode

Why?

Because AI makes everything seem urgent.
You can launch 10 products in 10 days.
You can post 100 times in a week.
You can build a full business in 7 days with no code.

Sounds kool. Feels exhausting.

Founders are skipping the pause, the planning, the reflection.
And diving into an endless loop of doing more, more, more…

But just because AI makes it possible, doesn't mean you should.

✨ Focus > Hustle
✨ Intentional growth > Speed
✨ Clarity > Chaos

You don't have to compete with robots. You need to stay human and run your startup like a marathon, not a 100m sprint.

Protect your energy. Reclaim your strategy. Use AI to lighten your load—not add more bricks to your backpack.

💬 Feeling the pressure of AI hustle culture?

📞 Book a Free Consultancy Call
Link

Let's grow with calm confidence—not chaos. 🧠💼

2)
𝗔𝗜 𝗛𝗮𝘀 𝗟𝗲𝘃𝗲𝗹𝗲𝗱 𝘁𝗵𝗲 𝗣𝗹𝗮𝘆𝗶𝗻𝗴 𝗙𝗶𝗲𝗹𝗱—𝗕𝘂𝘁 𝗡𝗼𝘄 𝗜𝘁'𝘀 𝗠𝗼𝗿𝗲 𝗖𝗿𝗼𝘄𝗱𝗲𝗱 𝗧𝗵𝗮𝗻 𝗘𝘃𝗲𝗿

Back in 2018, you needed a big team, a developer, a designer, a copywriter—and a lot of capital—to build a startup.

Now? You just need internet + ChatGPT.

That's both awesome and terrifying.

Because while AI has opened the gates, it also means 100s of people are building the same idea as you… at the same time.

So the big question isn't:
➡️ Can you build something fast?
It's:
➡️ Can you build something that actually stands out?

Your brand voice, customer obsession, founder story, culture, and offers—that's what separates a startup that thrives from one that gets buried under sameness.

Tools are equal. Execution isn't.
AI made the game easier to enter. But it also made it harder to win.

So if you're using the same prompts, same Canva designs, and same "AI-generated landing page" tactics as everyone else… pause. Rethink. Bring you back into your startup.

AI can't replicate your experience, your vision, your story.
Leverage that.

🚀 Ready to sharpen your edge in a crowded AI market?

📞 Book a Free Consultancy Call
Link

Because in this AI era, authenticity is your new currency. 💥

3)
𝗧𝗵𝗲 𝗗𝗮𝗻𝗴𝗲𝗿 𝗼𝗳 𝗥𝗲𝗹𝘆𝗶𝗻𝗴 𝗼𝗻 𝗔𝗜 𝗪𝗵𝗲𝗻 𝗬𝗼𝘂 𝗗𝗼𝗻'𝘁 𝗨𝗻𝗱𝗲𝗿𝘀𝘁𝗮𝗻𝗱 𝗕𝘂𝘀𝗶𝗻𝗲𝘀𝘀 𝗕𝗮𝘀𝗶𝗰𝘀

There's this new wave of "AI entrepreneurs" popping up everywhere.

They buy a ₹500 AI course, learn how to use ChatGPT prompts, and suddenly launch an agency or SaaS idea—without ever understanding the basics of business.

Sounds familiar?

Here's what happens:
They write AI-generated cold emails…
Build landing pages with zero research…
Post daily content written by bots…

And then wonder why nothing converts.

Let's be real—AI can enhance your strategy, but it can't replace your understanding.
If you don't know your audience, your offer, your market positioning, your pricing psychology, and your customer journey...

Then AI is just a glorified copy-paste machine.

Founders who win in 2025 will be:
✅ Masters of the fundamentals
✅ Deeply aware of their customer's pain
✅ Smart enough to use AI as a multiplier, not a bandaid

You wouldn't trust a chef who never tasted food—even if they had a smart kitchen.

Same with business. Don't hide behind AI. Know your craft first.

💬 Want a business breakdown based on where you stand today?

📞 Book a Free Consultancy Call
Link

Let's mix AI + Business Brain and create magic. 🎯

4)
𝗧𝗵𝗲 𝗠𝘆𝘁𝗵 𝗼𝗳 𝗙𝘂𝗹𝗹 𝗔𝗜 𝗔𝘂𝘁𝗼𝗺𝗮𝘁𝗶𝗼𝗻 𝗳𝗼𝗿 𝗦𝘁𝗮𝗿𝘁𝘂𝗽𝘀

Every week I meet founders chasing the dream of "fully automating" their entire business. Sounds tempting, right?

"Set it up once and let AI do the rest."
"100% passive income using AI tools."
"Hire no one. Let automation take care of it all."

Let's get one thing straight—there's no such thing as a truly automated business that scales without effort.

Yes, AI can do a lot. Customer support, copywriting, email campaigns, lead generation... but it's not magic. It still needs:

Context

Strategy

Human decision-making

You can schedule content. But you still need to create connection.
You can automate emails. But you still need to build trust.
You can use AI for outreach. But you still need to close deals.

AI doesn't replace leadership. It replaces repetition.

Too many founders are trying to avoid hard work by drowning in tools and subscriptions.
Instead, build smart systems, yes. But don't disappear from your own business.

Your personal brand, your team culture, your client experience—these can't be outsourced to a chatbot.

If you want true freedom, focus less on replacing everything and more on optimizing what matters.

🚫 Stop chasing "100% automation."
✅ Start designing systems that free up your time while improving the human touch.

That's how you scale.

📞 Book a Free Consultancy Call
https://onlineternals.short.gy/free-consultancy-call

🤝 Join our Startup/Freelancer Community: 
https://lnkd.in/gN9z88_Z

Let's build a startup that feels human—even when powered by machines. 🤖💬

5)
𝗪𝗵𝘆 𝗔𝗜 𝗔𝗹𝗼𝗻𝗲 𝗪𝗼𝗻'𝘁 𝗠𝗮𝗸𝗲 𝗬𝗼𝘂 𝗮 𝗚𝗿𝗲𝗮𝘁 𝗙𝗼𝘂𝗻𝗱𝗲𝗿

Everyone's obsessed with AI tools right now—"Which one should I use?", "Can ChatGPT write my entire business plan?", "Is there an AI that can do my cold outreach?"

And while the tools are amazing (trust me, I use them too)—here's a cold truth: AI won't build your mindset.

That's where most new founders mess up.

They think having access to the same tools as big players is enough. 

But that's like giving a beginner the best cricket bat and expecting a century. Doesn't work that way.

Mindset is the real game-changer.

You still need:

⭐ The courage to execute messy ideas

⭐ The consistency to show up daily (even when it sucks)

⭐ The humility to admit you need help

⭐ The creativity to find solutions where AI gives none

You can have 100 tools, but if you're waiting for AI to think for you, you're playing to lose.

Let AI be your assistant. Not your CEO.

I've seen founders become addicted to automating everything. 

But here's the truth: automation doesn't fix poor thinking, lack of action, or unclear offers.

The founders who win in 2025? They're the ones combining AI speed + human grit.

So before asking, "What tool should I use today?", ask:

➡️ "What uncomfortable thing do I need to face today as a founder?"

Because that is what makes the difference.

💬 If you're ready to build a powerful mindset + AI-powered systems that scale your business the right way:

📞 Book a Free Consultancy Call
Link

Let's build empires—with or without tools. 💡`;
};

// Content planner specific prompt
const getContentPlannerPrompt = (formData: any) => {
  const industryText = formData.industry ? ` for ${formData.industry}` : '';
  const platformsText = formData.platforms && formData.platforms.length > 0 ? ` on ${formData.platforms.join(', ')}` : '';
  const goalText = formData.goal ? ` with the main goal of ${formData.goal}` : '';
  const contentTypesText = formData.contentTypes && formData.contentTypes.length > 0 ? ` They prefer ${formData.contentTypes.join(', ')}` : '';
  const audienceText = formData.targetAudience ? ` Target audience: ${formData.targetAudience}` : '';
  const ageRangeText = formData.ageRange ? ` (age range: ${formData.ageRange})` : '';
  const frequencyText = formData.postingFrequency ? ` Posting frequency: ${formData.postingFrequency}` : '';
  const durationText = formData.duration || '1 week';
  
  return `Create a personalized ${durationText} social media content strategy${industryText}.
${platformsText ? `The user wants to post${platformsText}.` : ''}
${goalText ? `The${goalText}.` : ''}
${contentTypesText}
${audienceText}${ageRangeText}
${frequencyText}

Please provide a structured content plan with specific dates, topics, and draft captions. 
Format your response as a clear list with:
- Date (use YYYY-MM-DD format, starting from today)
- Topic
- Draft Caption (50-100 words, engaging and relevant to the platform)

Make sure the posting frequency matches their preference and cover the full duration requested.
For "weekdays only" frequency, only include Monday through Friday dates.
For "daily" frequency, include all 7 days of the week.
For "3x/week" frequency, space out posts across the week (like Monday, Wednesday, Friday).
Provide practical, actionable content ideas that align with their industry and goals.`;
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

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header');
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
      console.error('User authentication failed:', userError);
      throw new Error('User not authenticated');
    }

    const requestBody = await req.json();
    console.log('Request body:', requestBody);

    // Check if this is a content planner request
    if (requestBody.formData) {
      // Handle content planner request
      const fullPrompt = getContentPlannerPrompt(requestBody.formData);
      
      console.log('Calling Gemini for content planner with prompt:', fullPrompt);

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

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate content plan';
      
      return new Response(JSON.stringify({ 
        results: [{ 
          platform: 'content-plan', 
          content: content 
        }] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Handle regular content generation request
    const { prompt, platforms, generateImages }: ContentRequest = requestBody;

    if (!prompt || !platforms || platforms.length === 0) {
      throw new Error('Missing required fields: prompt and platforms');
    }

    const results = [];

    for (const platform of platforms) {
      // Use LinkedIn-specific prompt for LinkedIn, general prompt for others
      let fullPrompt;
      if (platform === 'linkedin') {
        fullPrompt = getLinkedInPrompt(prompt);
      } else {
        fullPrompt = getGeneralPrompt(platform, prompt);
      }

      console.log(`Generating content for ${platform}`);

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

    // Save to database only for regular content generation
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
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
