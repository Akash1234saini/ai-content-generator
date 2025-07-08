
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, Sparkles, History, Calendar, Wand2 } from 'lucide-react';
import type { ContentResult } from '@/services/openaiService';

interface UserProfile {
  email: string;
  name: string;
  id: string;
}

interface PromptDashboardProps {
  user: UserProfile;
  onLogout: () => void;
  onGenerate: (prompt: string, platforms: string[], generateImages: boolean) => void;
  generatedContent: ContentResult[];
  isGenerating: boolean;
  onShowHistory: () => void;
  onShowPlanner: () => void;
}

const PromptDashboard: React.FC<PromptDashboardProps> = ({
  user,
  onLogout,
  onGenerate,
  generatedContent,
  isGenerating,
  onShowHistory,
  onShowPlanner
}) => {
  const [prompt, setPrompt] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [generateImages, setGenerateImages] = useState(false);

  const platforms = [
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'pinterest', name: 'Pinterest', icon: '📌' },
    { id: 'instagram', name: 'Instagram', icon: '📸' },
    { id: 'facebook', name: 'Facebook', icon: '👥' },
    { id: 'quadrant', name: 'Quadrant', icon: '📊' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '💬' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'youtube', name: 'YouTube', icon: '📺' },
    { id: 'miniblog', name: 'Mini Blog', icon: '📝' },
  ];

  const handlePlatformChange = (platformId: string, checked: boolean) => {
    setSelectedPlatforms(prev => 
      checked 
        ? [...prev, platformId]
        : prev.filter(p => p !== platformId)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && selectedPlatforms.length > 0) {
      onGenerate(prompt, selectedPlatforms, generateImages);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-8 w-8 text-indigo-600" />
                <h1 className="text-2xl font-bold text-gray-900">AI Content Generator</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button
                variant="ghost"
                onClick={onShowPlanner}
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Content Planner</span>
              </Button>
              <Button
                variant="ghost"
                onClick={onShowHistory}
                className="flex items-center space-x-2"
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </Button>
              <Button
                variant="outline"
                onClick={onLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-indigo-700 mb-2">
              Generate Amazing Content
            </CardTitle>
            <p className="text-gray-600">
              Enter your prompt and select platforms to create engaging content instantly
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt" className="text-lg font-semibold text-gray-700">
                  Your Content Prompt
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter your content idea here... (e.g., 'Create a motivational post about overcoming challenges in entrepreneurship')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] text-lg border-2 border-gray-200 focus:border-indigo-500 rounded-lg"
                />
              </div>

              {/* Platform Selection */}
              <div className="space-y-4">
                <Label className="text-lg font-semibold text-gray-700">
                  Select Platforms
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <div
                      key={platform.id}
                      className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                    >
                      <Checkbox
                        id={platform.id}
                        checked={selectedPlatforms.includes(platform.id)}
                        onCheckedChange={(checked) => 
                          handlePlatformChange(platform.id, checked as boolean)
                        }
                        className="w-5 h-5"
                      />
                      <Label 
                        htmlFor={platform.id} 
                        className="flex items-center space-x-2 cursor-pointer text-base"
                      >
                        <span className="text-xl">{platform.icon}</span>
                        <span>{platform.name}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Generation Option */}
              <div className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg">
                <Checkbox
                  id="generateImages"
                  checked={generateImages}
                  onCheckedChange={(checked) => setGenerateImages(checked as boolean)}
                  className="w-5 h-5"
                />
                <Label htmlFor="generateImages" className="text-base font-medium cursor-pointer">
                  <span className="flex items-center space-x-2">
                    <Wand2 className="h-4 w-4" />
                    <span>Generate image prompts for visual content</span>
                  </span>
                </Label>
              </div>

              {/* Generate Button */}
              <Button
                type="submit"
                disabled={!prompt.trim() || selectedPlatforms.length === 0 || isGenerating}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 text-xl font-semibold rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                {isGenerating ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Generating Amazing Content...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-6 w-6" />
                    <span>Generate Content</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💡 Quick Tips for Better Content</h3>
          <ul className="space-y-2 text-gray-600">
            <li>• Be specific about your target audience and goals</li>
            <li>• Include relevant keywords and hashtags in your prompt</li>
            <li>• Mention the tone you want (professional, casual, humorous, etc.)</li>
            <li>• Specify content format (tips, questions, stories, etc.)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PromptDashboard;
