
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Calendar, Edit, Download, Share, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

interface ContentPlanItem {
  date: string;
  topic: string;
  caption: string;
  platform?: string;
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

interface ContentPlannerResultsProps {
  plan: ContentPlanItem[];
  formData: PlannerFormData;
  onBack: () => void;
  onEdit: (updatedPlan: ContentPlanItem[]) => void;
}

const ContentPlannerResults: React.FC<ContentPlannerResultsProps> = ({
  plan,
  formData,
  onBack,
  onEdit
}) => {
  const [selectedEvent, setSelectedEvent] = useState<ContentPlanItem | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentPlanItem | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Convert plan items to FullCalendar events
    const events = plan.map((item, index) => ({
      id: index.toString(),
      title: item.topic,
      date: item.date,
      extendedProps: {
        caption: item.caption,
        platform: item.platform || formData.platforms[0]
      },
      backgroundColor: getPlatformColor(item.platform || formData.platforms[0]),
      borderColor: getPlatformColor(item.platform || formData.platforms[0])
    }));
    setCalendarEvents(events);
  }, [plan, formData.platforms]);

  const getPlatformColor = (platform: string) => {
    const colors: { [key: string]: string } = {
      'LinkedIn': '#0077B5',
      'Instagram': '#E4405F',
      'Facebook': '#1877F2',
      'Pinterest': '#BD081C',
      'WhatsApp': '#25D366',
      'Email': '#D44638',
      'Quadrant': '#6366F1'
    };
    return colors[platform] || '#6366F1';
  };

  const handleEventClick = (info: any) => {
    const planItem: ContentPlanItem = {
      date: info.event.startStr,
      topic: info.event.title,
      caption: info.event.extendedProps.caption,
      platform: info.event.extendedProps.platform
    };
    setSelectedEvent(planItem);
    setEditingItem({ ...planItem });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem || !selectedEvent) return;

    const updatedPlan = plan.map(item => 
      item.date === selectedEvent.date && item.topic === selectedEvent.topic
        ? editingItem
        : item
    );

    onEdit(updatedPlan);
    setIsEditModalOpen(false);
    setSelectedEvent(null);
    setEditingItem(null);

    toast({
      title: "Content Updated",
      description: "Your content plan has been updated successfully",
    });
  };

  const handleCopyPlan = () => {
    const planText = plan.map(item => 
      `${item.date}: ${item.topic}\n${item.caption}\n`
    ).join('\n');
    
    navigator.clipboard.writeText(planText);
    toast({
      title: "Plan Copied",
      description: "Content plan copied to clipboard",
    });
  };

  const handleDownloadPlan = () => {
    const planText = plan.map(item => 
      `Date: ${item.date}\nTopic: ${item.topic}\nCaption: ${item.caption}\n${'-'.repeat(50)}\n`
    ).join('\n');
    
    const blob = new Blob([planText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-plan-${formData.duration}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Plan Downloaded",
      description: "Content plan downloaded successfully",
    });
  };

  const handleSharePlan = () => {
    const planText = plan.map(item => 
      `${item.date}: ${item.topic}`
    ).join('\n');
    
    if (navigator.share) {
      navigator.share({
        title: 'My Content Plan',
        text: planText,
      });
    } else {
      navigator.clipboard.writeText(planText);
      toast({
        title: "Plan Copied",
        description: "Content plan copied to clipboard for sharing",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Form
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCopyPlan} size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="outline" onClick={handleDownloadPlan} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="outline" onClick={handleSharePlan} size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Content Plan Table */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-indigo-700 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Your {formData.duration} Content Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {plan.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-sm text-gray-600">
                        {new Date(item.date).toLocaleDateString()}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(item);
                          setEditingItem({ ...item });
                          setIsEditModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="font-medium text-gray-900 mb-2">
                      {item.topic}
                    </div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {item.caption}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-indigo-700">
                Calendar View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <FullCalendar
                  plugins={[dayGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  events={calendarEvents}
                  eventClick={handleEventClick}
                  height="100%"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth'
                  }}
                  eventDisplay="block"
                  eventTextColor="white"
                  eventBackgroundColor="#6366F1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
            </DialogHeader>
            
            {editingItem && (
              <div className="space-y-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editingItem.date}
                    onChange={(e) => setEditingItem(prev => 
                      prev ? { ...prev, date: e.target.value } : null
                    )}
                  />
                </div>
                
                <div>
                  <Label>Topic</Label>
                  <Input
                    value={editingItem.topic}
                    onChange={(e) => setEditingItem(prev => 
                      prev ? { ...prev, topic: e.target.value } : null
                    )}
                    placeholder="Content topic"
                  />
                </div>
                
                <div>
                  <Label>Caption</Label>
                  <Textarea
                    value={editingItem.caption}
                    onChange={(e) => setEditingItem(prev => 
                      prev ? { ...prev, caption: e.target.value } : null
                    )}
                    placeholder="Draft caption"
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ContentPlannerResults;
