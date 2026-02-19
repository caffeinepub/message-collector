import type { Message } from '../backend';

interface MessageBubbleProps {
  message: Message;
  searchTerm?: string;
}

export default function MessageBubble({ message, searchTerm }: MessageBubbleProps) {
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const highlightText = (text: string, term?: string) => {
    if (!term) return text;

    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <mark key={index} className="bg-coral-200 dark:bg-coral-800 text-foreground rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline gap-2">
        <span className="font-semibold text-sm text-coral-700 dark:text-coral-400">
          {highlightText(message.sender, searchTerm)}
        </span>
        <span className="text-xs text-muted-foreground">
          {formatTimestamp(message.timestamp)}
        </span>
      </div>
      <div className="bg-card border border-border rounded-lg px-4 py-2.5 max-w-[85%]">
        <p className="text-sm text-foreground whitespace-pre-wrap break-words">
          {highlightText(message.text, searchTerm)}
        </p>
      </div>
    </div>
  );
}
