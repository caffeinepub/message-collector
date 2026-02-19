import { useState } from 'react';
import { useGetMessages } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, Loader2, FileText } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import { toast } from 'sonner';
import { useActor } from '../hooks/useActor';

interface MultiConversationExportProps {
  conversations: string[];
}

export default function MultiConversationExport({ conversations }: MultiConversationExportProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { actor } = useActor();

  const toggleConversation = (convId: string) => {
    setSelectedConversations((prev) =>
      prev.includes(convId) ? prev.filter((id) => id !== convId) : [...prev, convId]
    );
  };

  const toggleAll = () => {
    if (selectedConversations.length === conversations.length) {
      setSelectedConversations([]);
    } else {
      setSelectedConversations([...conversations]);
    }
  };

  const handleExport = async () => {
    if (selectedConversations.length === 0) {
      toast.error('Please select at least one conversation');
      return;
    }

    if (!actor) {
      toast.error('Not connected to backend');
      return;
    }

    setIsGenerating(true);
    try {
      const conversationsData = await Promise.all(
        selectedConversations.map(async (convId) => {
          const messages = await actor.getMessages(convId);
          return { id: convId, messages };
        })
      );

      await generatePDF({ conversations: conversationsData });
      toast.success('Multi-conversation PDF ready! Use your browser\'s print dialog to save as PDF.');
      setIsDialogOpen(false);
      setSelectedConversations([]);
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('Multi-conversation PDF error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="mr-2 h-4 w-4" />
          Export Multiple
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Multiple Conversations</DialogTitle>
          <DialogDescription>
            Select conversations to include in a single PDF
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="selectAll"
              checked={selectedConversations.length === conversations.length}
              onCheckedChange={toggleAll}
            />
            <Label htmlFor="selectAll" className="font-medium cursor-pointer">
              Select All
            </Label>
          </div>
          <ScrollArea className="h-[300px] border border-border rounded-md p-4">
            <div className="space-y-3">
              {conversations.map((conv) => (
                <div key={conv} className="flex items-center space-x-2">
                  <Checkbox
                    id={conv}
                    checked={selectedConversations.includes(conv)}
                    onCheckedChange={() => toggleConversation(conv)}
                  />
                  <Label htmlFor={conv} className="cursor-pointer flex-1">
                    {conv}
                  </Label>
                </div>
              ))}
            </div>
          </ScrollArea>
          <Button
            onClick={handleExport}
            className="w-full bg-coral-600 hover:bg-coral-700 text-white"
            disabled={isGenerating || selectedConversations.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate PDF ({selectedConversations.length})
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
