
import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import PromptDashboard from '@/components/PromptDashboard';
import ContentResults from '@/components/ContentResults';
import HistoryPage from '@/components/HistoryPage';
import { generateContent } from '@/services/openaiService';
import { useToast } from '@/hooks/use-toast';

interface User {
  email: string;
  name: string;
}

interface ContentResult {
  platform: string;
  content: string;
}

interface HistoryEntry {
  id: string;
  prompt: string;
  platforms: string[];
  results: ContentResult[];
  timestamp: Date;
}

type AppState = 'auth' | 'dashboard' | 'results' | 'history';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [generatedContent, setGeneratedContent] = useState<ContentResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const { toast } = useToast();

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('content-history');
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setHistory(parsedHistory);
      } catch (error) {
        console.error('Error loading history:', error);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('content-history', JSON.stringify(history));
    }
  }, [history]);

  const handleAuth = (userData: User) => {
    setUser(userData);
    setCurrentState('dashboard');
    toast({
      title: "Welcome!",
      description: `Logged in as ${userData.name}`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentState('auth');
    setGeneratedContent([]);
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
  };

  const handleGenerate = async (prompt: string, platforms: string[]) => {
    setIsGenerating(true);
    
    try {
      const results = await generateContent({ prompt, platforms });
      setGeneratedContent(results);
      
      // Add to history
      const newEntry: HistoryEntry = {
        id: Date.now().toString(),
        prompt,
        platforms,
        results,
        timestamp: new Date()
      };
      
      setHistory(prev => [newEntry, ...prev].slice(0, 50)); // Keep last 50 entries
      setCurrentState('results');
      
      toast({
        title: "Content generated!",
        description: `Created content for ${platforms.length} platform${platforms.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: "Please try again or check your connection",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveContent = (results: ContentResult[]) => {
    setGeneratedContent(results);
    // History is automatically updated through the generation process
    toast({
      title: "Content saved",
      description: "Your edits have been saved",
    });
  };

  const handleDeleteHistoryEntry = (id: string) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
    toast({
      title: "Entry deleted",
      description: "History entry has been removed",
    });
  };

  const handleRegenerateContent = async (prompt: string, platforms: string[]) => {
    setCurrentState('dashboard');
    // Small delay to show transition, then regenerate
    setTimeout(() => {
      handleGenerate(prompt, platforms);
    }, 100);
  };

  const renderCurrentState = () => {
    switch (currentState) {
      case 'auth':
        return <AuthForm onAuth={handleAuth} />;
      
      case 'dashboard':
        return (
          <PromptDashboard
            user={user!}
            onLogout={handleLogout}
            onGenerate={handleGenerate}
            generatedContent={generatedContent}
            isGenerating={isGenerating}
            onShowHistory={() => setCurrentState('history')}
          />
        );
      
      case 'results':
        return (
          <ContentResults
            results={generatedContent}
            onSave={handleSaveContent}
            onBack={() => setCurrentState('dashboard')}
          />
        );
      
      case 'history':
        return (
          <HistoryPage
            history={history}
            onBack={() => setCurrentState('dashboard')}
            onDeleteEntry={handleDeleteHistoryEntry}
            onRegenerateContent={handleRegenerateContent}
          />
        );
      
      default:
        return <AuthForm onAuth={handleAuth} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderCurrentState()}
    </div>
  );
};

export default Index;
