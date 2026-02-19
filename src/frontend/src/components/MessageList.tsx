import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import MessageBubble from './MessageBubble';
import type { Message } from '../backend';

interface MessageListProps {
  messages: Message[];
  searchTerm?: string;
}

export default function MessageList({ messages, searchTerm }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-4">
      <div ref={scrollRef} className="space-y-4 py-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            message={message}
            searchTerm={searchTerm}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
