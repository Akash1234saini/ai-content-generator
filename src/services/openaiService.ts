// Gemini Content Generation Service using Supabase Edge Functions
import { supabase } from '@/integrations/supabase/client';

interface GenerateContentRequest {
  prompt: string;
  platforms: string[];
  generateImages?: boolean;
}

interface ContentResult {
  platform: string;
  content: string;
  imagePrompt?: string;
}

interface PlannerFormData {
  industry: string;
  platforms: string[];
  goal: string;
  contentTypes: string[];
  targetAudience: string;
  postingFrequency: string;
  duration: string;
}

interface ContentPlanItem {
  date: string;
  topic: string;
  caption: string;
  platform?: string;
}

export const generateContent = async ({ 
  prompt, 
  platforms, 
  generateImages = false
}: GenerateContentRequest): Promise<ContentResult[]> => {
  try {
    console.log('Calling edge function with:', { prompt, platforms, generateImages });
    
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: {
        prompt,
        platforms,
        generateImages
      }
    });

    console.log('Edge function response:', { data, error });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to generate content: ${error.message || JSON.stringify(error)}`);
    }

    return data?.results || [];
  } catch (error) {
    console.error('Content generation error:', error);
    throw error;
  }
};

// Interface for history entry to match database schema
export interface HistoryEntry {
  id: string;
  prompt: string;
  platforms: string[];
  results: ContentResult[];
  timestamp: Date;
}

// Export ContentResult interface for use in other components
export type { ContentResult };

// Load content history from Supabase
export const loadContentHistory = async (): Promise<HistoryEntry[]> => {
  const { data, error } = await supabase
    .from('content_history')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error loading history:', error);
    return [];
  }

  return data.map(entry => ({
    id: entry.id,
    prompt: entry.prompt,
    platforms: entry.platforms,
    results: (entry.results as unknown) as ContentResult[], // Safe type assertion
    timestamp: new Date(entry.created_at)
  }));
};

// Delete content history entry
export const deleteContentHistory = async (id: string) => {
  const { error } = await supabase
    .from('content_history')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting history:', error);
    throw error;
  }
};

export const updateContentHistory = async (id: string, updatedEntry: HistoryEntry): Promise<void> => {
  const { error } = await supabase
    .from('content_history')
    .update({
      prompt: updatedEntry.prompt,
      platforms: updatedEntry.platforms,
      results: updatedEntry.results as any, // Cast to any to match Json type
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating content history:', error);
    throw new Error('Failed to update content history');
  }
};

// Add new function for content planner
export const generateContentPlan = async (formData: PlannerFormData): Promise<ContentPlanItem[]> => {
  try {
    const prompt = `Create a personalized ${formData.duration} social media content strategy for ${formData.industry}. 
    The user wants to post on ${formData.platforms.join(', ')}. 
    The main goal is ${formData.goal}. 
    They prefer ${formData.contentTypes.join(', ')}. 
    Target audience is: ${formData.targetAudience}. 
    Posting frequency: ${formData.postingFrequency}.
    
    Please provide a structured content plan with specific dates, topics, and draft captions. 
    Format your response as a clear list with:
    - Date (use YYYY-MM-DD format, starting from today)
    - Topic
    - Draft Caption (50-100 words, engaging and relevant to the platform)
    
    Make sure the posting frequency matches their preference and cover the full duration requested.
    Provide practical, actionable content ideas that align with their industry and goals.`;

    console.log('Calling edge function for content plan with:', { prompt, platforms: formData.platforms });
    
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: {
        prompt,
        platforms: ['content-plan'], // Use a special platform identifier
        generateImages: false
      }
    });

    console.log('Edge function response for content plan:', { data, error });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to generate content plan: ${error.message || JSON.stringify(error)}`);
    }

    // Parse the response and convert to structured format
    const planText = data?.results?.[0]?.content || '';
    const planItems = parsePlanText(planText, formData.duration);
    
    return planItems;
  } catch (error) {
    console.error('Content plan generation error:', error);
    throw error;
  }
};

// Helper function to parse the AI response into structured plan items
const parsePlanText = (planText: string, duration: string): ContentPlanItem[] => {
  const items: ContentPlanItem[] = [];
  const lines = planText.split('\n').filter(line => line.trim());
  
  let currentDate = new Date();
  const durationDays = getDurationInDays(duration);
  
  // Simple parsing - look for date patterns or create dates based on duration
  for (let i = 0; i < Math.min(lines.length, durationDays); i++) {
    const line = lines[i];
    
    // Try to extract meaningful content
    if (line.includes(':') || line.length > 20) {
      const parts = line.split(':');
      const topic = parts[0]?.trim() || `Content Idea ${i + 1}`;
      const caption = parts.slice(1).join(':').trim() || line.trim();
      
      items.push({
        date: new Date(currentDate.getTime() + (i * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
        topic: topic.substring(0, 100), // Limit topic length
        caption: caption.substring(0, 500) // Limit caption length
      });
    }
  }
  
  // If we don't have enough items, create some based on common content themes
  while (items.length < Math.min(durationDays, 30)) {
    const dayIndex = items.length;
    items.push({
      date: new Date(currentDate.getTime() + (dayIndex * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      topic: `Content Topic ${dayIndex + 1}`,
      caption: `Engaging content for your audience. This is a placeholder that should be replaced with AI-generated content.`
    });
  }
  
  return items;
};

// Helper function to convert duration string to days
const getDurationInDays = (duration: string): number => {
  switch (duration) {
    case '1 week': return 7;
    case '2 weeks': return 14;
    case '1 month': return 30;
    case '3 months': return 90;
    default: return 30;
  }
};
