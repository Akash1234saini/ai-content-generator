
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  History, 
  LogOut, 
  Loader2, 
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  email: string;
  name: string;
}

interface ContentResult {
  platform: string;
  content: string;
}

interface PromptDashboardProps {
  user: User;
  onLogout: () => void;
  onGenerate: (prompt: string, platforms: string[], generateImages: boolean) => void;
  generatedContent: ContentResult[];
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
  const [generateImages, setGenerateImages] = useState(false);
  const { toast } = useToast();

  const handlePlatformToggle = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Write your idea to generate content",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Please select platforms",
        description: "Choose at least one platform to generate content for",
        variant: "destructive"
      });
      return;
    }

    onGenerate(prompt.trim(), selectedPlatforms, generateImages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">AI Content Generator</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              onClick={onShowHistory}
              className="flex items-center space-x-2"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={onLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Generate AI Content
            </CardTitle>
            <p className="text-gray-600">
              Write your idea and select platforms to create engaging, platform-optimized content
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Your Idea</label>
              <Textarea
                placeholder="Write your idea here... (Press Enter to generate or Shift+Enter for new line)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={4}
                className="resize-none text-base"
                disabled={isGenerating}
              />
            </div>

            {/* Platform Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Select Platforms</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {platforms.map((platform) => (
                  <div
                    key={platform.id}
                    className={`relative flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPlatforms.includes(platform.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => handlePlatformToggle(platform.id)}
                  >
                    <Checkbox
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={() => handlePlatformToggle(platform.id)}
                      className="pointer-events-none"
                    />
                    <div className="flex items-center space-x-2 flex-1">
                      <div className={`w-3 h-3 rounded-full ${platform.color}`}></div>
                      <span className="text-sm font-medium text-gray-900">{platform.name}</span>
                    </div>
                    {selectedPlatforms.includes(platform.id) && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                ))}
              </div>
              
              {selectedPlatforms.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
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

            {/* Image Generation Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
                <Checkbox
                  checked={generateImages}
                  onCheckedChange={(checked) => setGenerateImages(checked as boolean)}
                />
                <div className="flex items-center space-x-2">
                  <ImageIcon className="w-5 h-5 text-gray-600" />
                  <div>
                    <label className="text-sm font-medium text-gray-900 cursor-pointer">
                      Generate images for content
                    </label>
                    <p className="text-xs text-gray-600">
                      Create platform-specific image prompts alongside your content
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim() || selectedPlatforms.length === 0}
              size="lg"
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 text-lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Generating Content...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Content
                </>
              )}
            </Button>

            {/* Quick Stats */}
            {(prompt.trim() || selectedPlatforms.length > 0) && (
              <div className="flex justify-center space-x-6 text-sm text-gray-500 pt-2">
                <span>{prompt.trim().length} characters</span>
                <span>•</span>
                <span>{selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''}</span>
                {generateImages && (
                  <>
                    <span>•</span>
                    <span>Images enabled</span>
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Results Preview */}
        {generatedContent.length > 0 && !isGenerating && (
          <Card className="mt-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Latest Generated Content</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {generatedContent.slice(0, 4).map((result, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${platforms.find(p => p.id === result.platform)?.color || 'bg-gray-500'}`}></div>
                      <span className="text-sm font-medium capitalize">{result.platform}</span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {result.content}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Button variant="outline" size="sm">
                  View Full Results →
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PromptDashboard;
