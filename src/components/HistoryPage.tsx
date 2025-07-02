
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  History, 
  Search, 
  Trash2, 
  Share2, 
  Copy,
  Calendar,
  ArrowLeft,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface HistoryEntry {
  id: string;
  prompt: string;
  platforms: string[];
  results: Array<{ platform: string; content: string }>;
  timestamp: Date;
}

interface HistoryPageProps {
  history: HistoryEntry[];
  onBack: () => void;
  onDeleteEntry: (id: string) => void;
  onRegenerateContent: (prompt: string, platforms: string[]) => void;
}

const HistoryPage = ({ history, onBack, onDeleteEntry, onRegenerateContent }: HistoryPageProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatformFilter, setSelectedPlatformFilter] = useState<string>('all');
  const { toast } = useToast();

  const platforms = ['all', 'linkedin', 'instagram', 'facebook', 'pinterest', 'whatsapp', 'email', 'quadrant'];

  const filteredHistory = history.filter(entry => {
    const matchesSearch = entry.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.results.some(result => result.content.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPlatform = selectedPlatformFilter === 'all' || 
                           entry.platforms.includes(selectedPlatformFilter);
    return matchesSearch && matchesPlatform;
  });

  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
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
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button onClick={onBack} variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <History className="w-8 h-8" />
                <span>Content History</span>
              </h1>
              <p className="text-gray-600 mt-1">Your generated content and prompts</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {filteredHistory.length} entries
          </Badge>
        </div>

        {/* Filters */}
        <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search prompts and content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedPlatformFilter}
                  onChange={(e) => setSelectedPlatformFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                  {platforms.map(platform => (
                    <option key={platform} value={platform}>
                      {platform === 'all' ? 'All Platforms' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Entries */}
        {filteredHistory.length === 0 ? (
          <Card className="text-center py-16 bg-white/80 backdrop-blur-sm border-0 shadow-sm">
            <CardContent>
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No content found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedPlatformFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start generating content to see your history here'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredHistory.map((entry) => (
              <Card key={entry.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2 line-clamp-2">
                        {entry.prompt}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(entry.timestamp)}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {entry.platforms.map(platform => (
                            <Badge key={platform} variant="outline" className="text-xs">
                              {platform}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => onRegenerateContent(entry.prompt, entry.platforms)}
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        Regenerate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDeleteEntry(entry.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {entry.results.map((result, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {result.platform}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {result.content.length} chars
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {result.content}
                        </p>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCopy(result.content)}
                            className="flex items-center space-x-1"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleShare(result.platform, result.content)}
                            className="flex items-center space-x-1"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>Share</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
