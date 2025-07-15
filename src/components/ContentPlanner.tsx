
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { generateContentPlan } from '@/services/openaiService';
import { useToast } from '@/hooks/use-toast';
import ContentPlannerResults from './ContentPlannerResults';
import { Calendar, ArrowLeft, Clock } from 'lucide-react';

interface UserProfile {
  email: string;
  name: string;
  id: string;
}

interface ContentPlannerProps {
  user: UserProfile;
  onBack: () => void;
}

interface PlannerFormData {
  industry: string;
  platforms: string[];
  goal: string;
  contentTypes: string[];
  targetAudience: string;
  ageRange: string;
  postingFrequency: string;
  duration: string;
}

interface ContentPlanItem {
  date: string;
  topic: string;
  caption: string;
  platform?: string;
}

const ContentPlanner: React.FC<ContentPlannerProps> = ({ user, onBack }) => {
  const [formData, setFormData] = useState<PlannerFormData>({
    industry: '',
    platforms: [],
    goal: '',
    contentTypes: [],
    targetAudience: '',
    ageRange: '',
    postingFrequency: '',
    duration: ''
  });
  
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  const [generatedPlan, setGeneratedPlan] = useState<ContentPlanItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const platforms = ['LinkedIn', 'Instagram', 'Facebook', 'Pinterest', 'WhatsApp', 'Email', 'Quadrant'];
  const contentTypes = ['Videos', 'Carousels', 'Quotes', 'Tips', 'Memes', 'Text Posts'];
  const goals = ['Awareness', 'Sales', 'Engagement', 'Education', 'Traffic', 'Leads'];
  const frequencies = ['Daily', '3x/week', 'Weekdays only', 'Custom'];
  const durations = ['1 week', '2 weeks', '3 weeks', '4 weeks'];
  const ageRanges = ['13-17', '18-24', '25-34', '35-44', '45-54', '55-64', '65+'];

  const handlePlatformChange = (platform: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      platforms: checked 
        ? [...prev.platforms, platform]
        : prev.platforms.filter(p => p !== platform)
    }));
  };

  const handleContentTypeChange = (contentType: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: checked 
        ? [...prev.contentTypes, contentType]
        : prev.contentTypes.filter(c => c !== contentType)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsGenerating(true);
    setProgress(0);
    setTimeRemaining(30);
    
    // Progress simulation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 1000);
    
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    
    try {
      const plan = await generateContentPlan(formData);
      setProgress(100);
      setGeneratedPlan(plan);
      setShowResults(true);
      toast({
        title: "Content Plan Generated!",
        description: `Created a ${formData.duration} content strategy for ${formData.platforms.length || 1} platform${formData.platforms.length > 1 ? 's' : ''}`,
      });
    } catch (error) {
      console.error('Plan generation error:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
    } finally {
      clearInterval(progressInterval);
      clearInterval(timerInterval);
      setIsGenerating(false);
      setProgress(0);
      setTimeRemaining(0);
    }
  };

  if (showResults) {
    return (
      <ContentPlannerResults 
        plan={generatedPlan}
        formData={formData}
        onBack={() => setShowResults(false)}
        onEdit={setGeneratedPlan}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-900">Content Planner</h1>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center text-indigo-700">
              Plan Your Social Media Strategy
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Industry/Niche */}
              <div className="space-y-2">
                <Label htmlFor="industry" className="text-sm font-medium">
                  What is your industry or niche?
                </Label>
                <Input
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., Digital Marketing, Fitness, Food & Beverage"
                  className="w-full"
                />
              </div>

              {/* Platforms */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Which platforms do you want to plan for?
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {platforms.map((platform) => (
                    <div key={platform} className="flex items-center space-x-2">
                      <Checkbox
                        id={platform}
                        checked={formData.platforms.includes(platform)}
                        onCheckedChange={(checked) => 
                          handlePlatformChange(platform, checked as boolean)
                        }
                      />
                      <Label htmlFor={platform} className="text-sm">
                        {platform}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  What is your main goal?
                </Label>
                <Select value={formData.goal} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, goal: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your main goal" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal} value={goal.toLowerCase()}>
                        {goal}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Content Types */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  What types of content do you prefer?
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {contentTypes.map((contentType) => (
                    <div key={contentType} className="flex items-center space-x-2">
                      <Checkbox
                        id={contentType}
                        checked={formData.contentTypes.includes(contentType)}
                        onCheckedChange={(checked) => 
                          handleContentTypeChange(contentType, checked as boolean)
                        }
                      />
                      <Label htmlFor={contentType} className="text-sm">
                        {contentType}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="audience" className="text-sm font-medium">
                  Who is your target audience?
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="audience" className="text-xs text-gray-600 mb-2 block">
                      Audience Description
                    </Label>
                    <Input
                      id="audience"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="e.g., small business owners, fitness enthusiasts, homemakers"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">
                      Age Range
                    </Label>
                    <Select value={formData.ageRange} onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, ageRange: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageRanges.map((ageRange) => (
                          <SelectItem key={ageRange} value={ageRange}>
                            {ageRange}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Posting Frequency */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  How often do you want to post?
                </Label>
                <Select value={formData.postingFrequency} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, postingFrequency: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select posting frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map((frequency) => (
                      <SelectItem key={frequency} value={frequency.toLowerCase()}>
                        {frequency}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">
                  How long should the plan cover?
                </Label>
                <Select value={formData.duration} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, duration: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {durations.map((duration) => (
                      <SelectItem key={duration} value={duration}>
                        {duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Progress Bar and Timer */}
              {isGenerating && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                  <div className="flex items-center gap-2 text-indigo-700 font-medium">
                    <Clock className="h-4 w-4" />
                    Generating your content plan...
                  </div>
                  <Progress value={progress} className="w-full" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{Math.round(progress)}% complete</span>
                    <span>{timeRemaining}s remaining</span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg font-semibold"
              >
                {isGenerating ? 'Generating Your Plan...' : 'Generate Content Plan'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContentPlanner;
