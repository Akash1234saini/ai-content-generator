
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

export const generateContent = async ({ 
  prompt, 
  platforms, 
  generateImages = false
}: GenerateContentRequest): Promise<ContentResult[]> => {
  try {
    const { data, error } = await supabase.functions.invoke('generate-content', {
      body: {
        prompt,
        platforms,
        generateImages
      }
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
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
