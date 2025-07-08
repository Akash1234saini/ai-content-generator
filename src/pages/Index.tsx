
import React, { useState, useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import PromptDashboard from '@/components/PromptDashboard';
import ContentResults from '@/components/ContentResults';
import HistoryPage from '@/components/HistoryPage';
import { generateContent, loadContentHistory, deleteContentHistory, updateContentHistory } from '@/services/openaiService';
import type { ContentResult, HistoryEntry } from '@/services/openaiService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  email: string;
  name: string;
  id: string;
}

type AppState = 'auth' | 'dashboard' | 'results' | 'history';

const Index = () => {
  const [currentState, setCurrentState] = useState<AppState>('auth');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [generatedContent, setGeneratedContent] = useState<ContentResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { toast } = useToast();

  // Function to load user history
  const loadUserHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      const historyData = await loadContentHistory();
      setHistory(historyData);
    } catch (error) {
      console.error('Error loading history:', error);
      toast({
        title: "Failed to load history",
        description: "Could not load your content history",
        variant: "destructive"
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          const userProfile: UserProfile = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.display_name || session.user.email!.split('@')[0]
          };
          setUser(userProfile);
          
          // Restore saved state or default to dashboard
          const savedState = localStorage.getItem('currentAppState') as AppState;
          if (savedState && ['dashboard', 'results', 'history'].includes(savedState)) {
            setCurrentState(savedState);
          } else {
            setCurrentState('dashboard');
          }
          
          // Always load user's content history when user logs in
          console.log('Loading history for user:', userProfile.id);
          setTimeout(() => {
            loadUserHistory();
          }, 100);
        } else {
          setUser(null);
          setCurrentState('auth');
          setHistory([]);
          // Clear saved state when logging out
          localStorage.removeItem('currentAppState');
        }
      }
    );

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      if (session?.user) {
        const userProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.display_name || session.user.email!.split('@')[0]
        };
        setUser(userProfile);
        
        // Restore saved state or default to dashboard
        const savedState = localStorage.getItem('currentAppState') as AppState;
        if (savedState && ['dashboard', 'results', 'history'].includes(savedState)) {
          setCurrentState(savedState);
        } else {
          setCurrentState('dashboard');
        }
        
        // Load history immediately for existing session
        console.log('Loading history for existing session:', userProfile.id);
        setTimeout(() => {
          loadUserHistory();
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Reload history when user changes (additional safety check)
  useEffect(() => {
    if (user && history.length === 0) {
      console.log('User changed or history empty, reloading history:', user.id);
      loadUserHistory();
    }
  }, [user]);

  const handleAuth = (userData: UserProfile) => {
    // Auth state is now handled by the useEffect listener
    toast({
      title: "Welcome!",
      description: `Logged in as ${userData.name}`,
    });
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "See you next time!",
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: "There was an error logging out",
        variant: "destructive"
      });
    }
  };

  const handleGenerate = async (prompt: string, platforms: string[], generateImages: boolean = false) => {
    if (!user) return;
    
    setIsGenerating(true);
    
    try {
      const results = await generateContent({ prompt, platforms, generateImages });
      setGeneratedContent(results);
      
      // Reload history to get the new entry saved by the edge function
      await loadUserHistory();
      setCurrentState('results');
      localStorage.setItem('currentAppState', 'results');
      
      toast({
        title: "Content generated!",
        description: `Created content for ${platforms.length} platform${platforms.length > 1 ? 's' : ''}${generateImages ? ' with image prompts' : ''}`,
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again or check your connection",
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

  const handleDeleteHistoryEntry = async (id: string) => {
    try {
      await deleteContentHistory(id);
      setHistory(prev => prev.filter(entry => entry.id !== id));
      toast({
        title: "Entry deleted",
        description: "History entry has been removed",
      });
    } catch (error) {
      console.error('Error deleting history:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete the history entry",
        variant: "destructive"
      });
    }
  };

  const handleUpdateHistoryEntry = async (id: string, updatedEntry: HistoryEntry) => {
    try {
      await updateContentHistory(id, updatedEntry);
      setHistory(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
      toast({
        title: "Entry updated",
        description: "History entry has been updated",
      });
    } catch (error) {
      console.error('Error updating history:', error);
      toast({
        title: "Update failed",
        description: "Could not update the history entry",
        variant: "destructive"
      });
    }
  };

  const handleRegenerateContent = async (prompt: string, platforms: string[]) => {
    setCurrentState('dashboard');
    localStorage.setItem('currentAppState', 'dashboard');
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
            onShowHistory={() => {
              setCurrentState('history');
              localStorage.setItem('currentAppState', 'history');
            }}
          />
        );
      
      case 'results':
        return (
          <ContentResults
            results={generatedContent}
            onSave={handleSaveContent}
            onBack={() => {
              setCurrentState('dashboard');
              localStorage.setItem('currentAppState', 'dashboard');
            }}
          />
        );
      
      case 'history':
        return (
          <HistoryPage
            history={history}
            onBack={() => {
              setCurrentState('dashboard');
              localStorage.setItem('currentAppState', 'dashboard');
            }}
            onDeleteEntry={handleDeleteHistoryEntry}
            onRegenerateContent={handleRegenerateContent}
            onUpdateEntry={handleUpdateHistoryEntry}
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
