import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Download, Loader2, Calendar } from 'lucide-react';
import { generatePDF } from '../utils/pdfGenerator';
import type { Message } from '../backend';
import { toast } from 'sonner';

interface ExportButtonProps {
  conversationId: string;
  messages: Message[];
}

export default function ExportButton({ conversationId, messages }: ExportButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      let filteredMessages = messages;

      if (startDate || endDate) {
        const startMs = startDate ? new Date(startDate).getTime() : 0;
        const endMs = endDate ? new Date(endDate).getTime() : Date.now();

        filteredMessages = messages.filter((msg) => {
          const msgTime = Number(msg.timestamp);
          return msgTime >= startMs && msgTime <= endMs;
        });
      }

      if (filteredMessages.length === 0) {
        toast.error('No messages found in the selected date range');
        setIsGenerating(false);
        return;
      }

      await generatePDF({
        conversations: [{ id: conversationId, messages: filteredMessages }],
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      toast.success('PDF generated successfully!');
      setIsDialogOpen(false);
      setStartDate('');
      setEndDate('');
    } catch (error) {
      toast.error('Failed to generate PDF');
      console.error('PDF generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Conversation</DialogTitle>
          <DialogDescription>
            Optionally select a date range to filter messages
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="startDate">Start Date (Optional)</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="endDate">End Date (Optional)</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <Button
            onClick={handleExport}
            className="w-full bg-coral-600 hover:bg-coral-700 text-white"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Generate PDF
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
