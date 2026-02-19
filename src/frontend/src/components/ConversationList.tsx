import { useState } from 'react';
import { useAddConversation } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ConversationListProps {
  conversations: string[];
  selectedConversation: string | null;
  onSelectConversation: (id: string) => void;
}

export default function ConversationList({
  conversations,
  selectedConversation,
  onSelectConversation,
}: ConversationListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newConversationName, setNewConversationName] = useState('');
  const addConversation = useAddConversation();

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConversationName.trim()) {
      toast.error('Please enter a conversation name');
      return;
    }

    try {
      await addConversation.mutateAsync(newConversationName.trim());
      toast.success('Conversation created successfully!');
      setNewConversationName('');
      setIsDialogOpen(false);
      onSelectConversation(newConversationName.trim());
    } catch (error: any) {
      if (error.message?.includes('already exists')) {
        toast.error('A conversation with this name already exists');
      } else {
        toast.error('Failed to create conversation');
      }
    }
  };

  return (
    <div className="flex flex-col h-full border border-border rounded-lg bg-card">
      <div className="p-4 border-b border-border">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-coral-600 hover:bg-coral-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              New Conversation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Conversation</DialogTitle>
              <DialogDescription>
                Enter a name for your new conversation
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateConversation} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="conversationName">Conversation Name</Label>
                <Input
                  id="conversationName"
                  placeholder="e.g., Family Chat, Work Messages"
                  value={newConversationName}
                  onChange={(e) => setNewConversationName(e.target.value)}
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-coral-600 hover:bg-coral-700 text-white"
                disabled={addConversation.isPending}
              >
                {addConversation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv}
                  onClick={() => onSelectConversation(conv)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                    selectedConversation === conv
                      ? 'bg-coral-100 dark:bg-coral-950 text-coral-900 dark:text-coral-100'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate font-medium text-sm">{conv}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
