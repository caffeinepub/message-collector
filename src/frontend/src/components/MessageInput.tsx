import { useState } from 'react';
import { useAddMessage } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface MessageInputProps {
  conversationId: string;
}

export default function MessageInput({ conversationId }: MessageInputProps) {
  const [sender, setSender] = useState('');
  const [text, setText] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const addMessage = useAddMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sender.trim() || !text.trim() || !timestamp) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const timestampMs = new Date(timestamp).getTime();
      await addMessage.mutateAsync({
        conversationId,
        message: {
          sender: sender.trim(),
          text: text.trim(),
          timestamp: BigInt(timestampMs),
        },
      });
      toast.success('Message added successfully!');
      setSender('');
      setText('');
      setTimestamp('');
    } catch (error) {
      toast.error('Failed to add message');
      console.error('Add message error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 bg-card">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="sender">Sender Name</Label>
          <Input
            id="sender"
            placeholder="Who sent this message?"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timestamp">Date & Time</Label>
          <Input
            id="timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <Label htmlFor="text">Message</Label>
        <Textarea
          id="text"
          placeholder="Enter the message text..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-coral-600 hover:bg-coral-700 text-white"
        disabled={addMessage.isPending}
      >
        {addMessage.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Add Message
          </>
        )}
      </Button>
    </form>
  );
}
