
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, History, LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  email: string;
  name: string;
}

interface PromptDashboardProps {
  user: User;
  onLogout: () => void;
  onGenerate: (prompt: string, platforms: string[]) => Promise<any>;
  generatedContent: any;
  isGenerating: boolean;
  onShowHistory: () => void;
}

const platforms = [
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-600' },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-600' },
  { id: 'facebook', name: 'Facebook', color: 'bg-blue-700' },
  { id: 'pinterest', name: 'Pinterest', color: 'bg-red-600' },
  { id: 'whatsapp', name: 'WhatsApp', color: 'bg-green-600' },
  { id: 'email', name: 'Email', color: 'bg-gray-600' },
  { id: 'quadrant', name: 'Quadrant', color: 'bg-purple-600' }
];

const PromptDashboard = ({ 
  user, 
  onLogout, 
  onGenerate, 
  generatedContent, 
  isGenerating,
  onShowHistory 
}: PromptDashboardProps) => {
  const [prompt, setPrompt] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const { toast } = useToast();

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe the content you'd like to generate",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Select at least one platform",
        description: "Choose where you want to share your content",
        variant: "destructive"
      });
      return;
    }

    await onGenerate(prompt, selectedPlatforms);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Content Genius</h1>
              <p className="text-sm text-gray-500">Welcome back, {user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={onShowHistory} className="flex items-center space-x-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </Button>
            <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Input Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-gray-800">
              What content would you like to create today?
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Platform Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700">Select Platforms</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platforms.map((platform) => (
                  <label
                    key={platform.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <Checkbox
                      checked={selectedPlatforms.includes(platform.id)}
                      onCheckedChange={() => handlePlatformToggle(platform.id)}
                    />
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                      <span className="text-sm font-medium">{platform.name}</span>
                    </div>
                  </label>
                ))}
              </div>
              {selectedPlatforms.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedPlatforms.map(platformId => {
                    const platform = platforms.find(p => p.id === platformId);
                    return (
                      <Badge key={platformId} variant="secondary" className="text-xs">
                        {platform?.name}
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Prompt Input */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="prompt" className="text-lg font-semibold text-gray-700">
                  Your Content Idea
                </label>
                <Textarea
                  id="prompt"
                  placeholder="Write your idea here... (e.g., 'Create a post about sustainable living tips for busy professionals')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows={4}
                  className="text-base resize-none focus:ring-2 focus:ring-blue-500 border-gray-300"
                />
              </div>
              
              <Button
                type="submit"
                size="lg"
                disabled={isGenerating}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Generating Content...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="w-5 h-5" />
                    <span>Generate Content</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromptDashboard;
