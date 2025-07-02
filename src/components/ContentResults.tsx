
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Edit3, 
  Save, 
  Share2, 
  Copy, 
  ExternalLink,
  Check,
  MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContentResult {
  platform: string;
  content: string;
}

interface ContentResultsProps {
  results: ContentResult[];
  onSave: (results: ContentResult[]) => void;
  onBack: () => void;
}

const platformColors: { [key: string]: string } = {
  linkedin: 'bg-blue-600',
  instagram: 'bg-pink-600',
  facebook: 'bg-blue-700',
  pinterest: 'bg-red-600',
  whatsapp: 'bg-green-600',
  email: 'bg-gray-600',
  quadrant: 'bg-purple-600'
};

const ContentResults = ({ results, onSave, onBack }: ContentResultsProps) => {
  const [editingResults, setEditingResults] = useState<ContentResult[]>(results);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();

  const handleEdit = (index: number) => {
    setEditingIndex(index);
  };

  const handleSaveEdit = (index: number) => {
    setEditingIndex(null);
    onSave(editingResults);
    toast({
      title: "Content saved",
      description: "Your edited content has been saved to history"
    });
  };

  const handleContentChange = (index: number, newContent: string) => {
    const updated = [...editingResults];
    updated[index] = { ...updated[index], content: newContent };
    setEditingResults(updated);
  };

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: "Copied to clipboard",
        description: "Content ready to paste!"
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please select and copy manually",
        variant: "destructive"
      });
    }
  };

  const handleShare = (platform: string, content: string) => {
    const encodedContent = encodeURIComponent(content);
    let shareUrl = '';

    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedContent}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?quote=${encodedContent}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?mini=true&summary=${encodedContent}`;
        break;
      case 'pinterest':
        shareUrl = `https://pinterest.com/pin/create/button/?description=${encodedContent}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=Generated Content&body=${encodedContent}`;
        break;
      default:
        toast({
          title: "Direct sharing not available",
          description: "Please copy the content and share manually"
        });
        return;
    }

    window.open(shareUrl, '_blank');
    toast({
      title: "Opening share dialog",
      description: `Sharing to ${platform}`
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Generated Content</h1>
            <p className="text-gray-600">Your AI-generated content is ready! Edit, copy, or share directly.</p>
          </div>
          <Button onClick={onBack} variant="outline">
            ← Back to Dashboard
          </Button>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {editingResults.map((result, index) => (
            <Card key={index} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full ${platformColors[result.platform] || 'bg-gray-500'}`}></div>
                    <CardTitle className="text-lg capitalize">{result.platform}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {result.content.length} chars
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {editingIndex === index ? (
                  <div className="space-y-3">
                    <Textarea
                      value={result.content}
                      onChange={(e) => handleContentChange(index, e.target.value)}
                      rows={6}
                      className="text-sm resize-none"
                    />
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(index)}
                        className="flex items-center space-x-1"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingIndex(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 min-h-[120px]">
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                        {result.content}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(index)}
                        className="flex items-center space-x-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Edit</span>
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopy(result.content, index)}
                        className="flex items-center space-x-1"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                        <span>{copiedIndex === index ? 'Copied!' : 'Copy'}</span>
                      </Button>
                      
                      <Button
                        size="sm"
                        onClick={() => handleShare(result.platform, result.content)}
                        className="flex items-center space-x-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <Button 
            onClick={onBack}
            size="lg"
            variant="outline"
            className="px-8"
          >
            Generate More Content
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ContentResults;
