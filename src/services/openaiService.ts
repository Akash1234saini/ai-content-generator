
// OpenAI Service for content generation
// In a real application, you would implement the actual OpenAI API call here
// For this demo, we'll use mock responses

interface GenerateContentRequest {
  prompt: string;
  platforms: string[];
  generateImages?: boolean;
  apiKey?: string;
}

interface ContentResult {
  platform: string;
  content: string;
  imagePrompt?: string;
}

// Mock content templates for demonstration
const mockContentTemplates: { [key: string]: (prompt: string) => string } = {
  linkedin: (prompt: string) => `🚀 Professional insight on ${prompt}

Here's what industry leaders should know:

• Key point about the topic
• Strategic consideration for businesses  
• Actionable takeaway for professionals

What's your experience with this? Share your thoughts in the comments.

#Professional #Industry #Growth #Strategy`,

  instagram: (prompt: string) => `✨ ${prompt} ✨

🌟 Here's the scoop!

💡 Quick tip: Make it visual and engaging
📸 Don't forget to show, not just tell
🎯 Tag relevant communities

What do you think? Double tap if you agree! 👇

#ContentCreator #Inspiration #Tips #Instagram #Social`,

  facebook: (prompt: string) => `${prompt} - Let's discuss! 🤔

I've been thinking about this lately, and here's what I've discovered:

→ First important point about the topic
→ Another perspective to consider
→ Why this matters to our community

What are your thoughts? I'd love to hear different perspectives in the comments below!

Feel free to share this post if you found it helpful. 🙌`,

  pinterest: (prompt: string) => `📌 ${prompt} - Save This Pin!

🔥 Ultimate guide to getting started:

✅ Step 1: Foundation basics
✅ Step 2: Implementation tips  
✅ Step 3: Advanced strategies

💫 Pin this for later and follow for more tips!

#DIY #Tips #Inspiration #Guide #Pinterest`,

  whatsapp: (prompt: string) => `Hey! 👋 

Just wanted to share something interesting about ${prompt}:

🎯 Quick insight: [Key point]
💡 Pro tip: [Actionable advice]
⚡ Why it matters: [Impact explanation]

Thought you might find this useful! Let me know what you think.`,

  email: (prompt: string) => `Subject: Insights on ${prompt}

Hi there!

I hope this email finds you well. I wanted to share some thoughts on ${prompt} that I think you'll find valuable.

Here are the key points:

• Important consideration #1
• Valuable insight #2  
• Actionable step you can take

I'd love to hear your perspective on this. Feel free to reply and let me know what you think!

Best regards,
[Your Name]`,

  quadrant: (prompt: string) => `QUADRANT ANALYSIS: ${prompt}

📊 Strategic Breakdown:

🟢 HIGH IMPACT | LOW EFFORT
• Quick wins you can implement today

🔴 HIGH IMPACT | HIGH EFFORT  
• Strategic initiatives worth the investment

🟡 LOW IMPACT | LOW EFFORT
• Easy maintenance tasks

⚫ LOW IMPACT | HIGH EFFORT
• Activities to avoid or minimize

💼 Recommended action: Focus on the green quadrant first!`
};

// Image prompt templates for different platforms
const imagePromptTemplates: { [key: string]: (prompt: string) => string } = {
  linkedin: (prompt: string) => `Professional, clean business photo related to ${prompt}. Corporate style, high-quality, suitable for LinkedIn professional network. Modern office setting or business context.`,

  instagram: (prompt: string) => `Trendy, visually appealing image about ${prompt}. Instagram-worthy, bright colors, engaging composition, perfect for social media feeds. Aesthetic and eye-catching.`,

  facebook: (prompt: string) => `Friendly, relatable image representing ${prompt}. Social media friendly, warm and inviting, suitable for Facebook community sharing. Approachable and engaging.`,

  pinterest: (prompt: string) => `Pinterest-style vertical image for ${prompt}. High-quality, pin-worthy design with text overlay potential. Inspirational and save-worthy aesthetic.`,

  whatsapp: (prompt: string) => `Simple, clear image illustrating ${prompt}. Easy to understand at small sizes, suitable for mobile messaging. Clean and straightforward visual.`,

  email: (prompt: string) => `Professional email header image for ${prompt}. Clean, business-appropriate design suitable for email newsletters. Polished and professional appearance.`,

  quadrant: (prompt: string) => `Analytical diagram or chart visualization for ${prompt}. Data-driven, strategic business graphic. Professional infographic style with clear quadrants or sections.`
};

export const generateContent = async ({ 
  prompt, 
  platforms, 
  generateImages = false,
  apiKey 
}: GenerateContentRequest): Promise<ContentResult[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));

  // In a real implementation, you would make an API call to OpenAI here:
  /*
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a social media content expert. Create engaging, platform-specific content that is ready to post.'
        },
        {
          role: 'user',
          content: `Create engaging content for ${platforms.join(', ')} using this input: ${prompt}. Format it suitable for each selected platform. Keep it clear, short, and platform-ready.${generateImages ? ' Also provide image generation prompts for each platform.' : ''}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  // Parse the response and format it for each platform
  */

  // For demo purposes, we'll return mock content
  return platforms.map(platform => ({
    platform,
    content: mockContentTemplates[platform] 
      ? mockContentTemplates[platform](prompt)
      : `Here's great content about ${prompt} optimized for ${platform}!\n\nThis is where your AI-generated content would appear, tailored specifically for ${platform}'s audience and format requirements.\n\n✨ Ready to post and engage your audience!`,
    ...(generateImages && {
      imagePrompt: imagePromptTemplates[platform] 
        ? imagePromptTemplates[platform](prompt)
        : `Professional image representing ${prompt}, optimized for ${platform} platform aesthetic and requirements.`
    })
  }));
};

// Function to validate OpenAI API key format
export const validateApiKey = (apiKey: string): boolean => {
  return apiKey.startsWith('sk-') && apiKey.length > 20;
};
