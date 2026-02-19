import { useState } from 'react';
import { useGetConversations, useGetMessages } from '../hooks/useQueries';
import ConversationList from '../components/ConversationList';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import MessageSearch from '../components/MessageSearch';
import ExportButton from '../components/ExportButton';
import MultiConversationExport from '../components/MultiConversationExport';
import { Loader2, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ConversationManager() {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { data: conversations, isLoading: conversationsLoading } = useGetConversations();
  const { data: messages, isLoading: messagesLoading } = useGetMessages(selectedConversation || '');

  const filteredMessages = messages?.filter((msg) =>
    msg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    msg.sender.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (conversationsLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-coral-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 h-[calc(100vh-180px)]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <ConversationList
            conversations={conversations || []}
            selectedConversation={selectedConversation}
            onSelectConversation={setSelectedConversation}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{selectedConversation}</h2>
                  <p className="text-sm text-muted-foreground">
                    {messages?.length || 0} message{messages?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <ExportButton
                    conversationId={selectedConversation}
                    messages={messages || []}
                  />
                  <MultiConversationExport conversations={conversations || []} />
                </div>
              </div>

              {/* Search */}
              <MessageSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />

              {/* Messages */}
              <div className="flex-1 overflow-hidden mb-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-coral-600" />
                  </div>
                ) : (
                  <MessageList messages={filteredMessages} searchTerm={searchTerm} />
                )}
              </div>

              {/* Input */}
              <MessageInput conversationId={selectedConversation} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No Conversation Selected</h3>
                <p className="text-muted-foreground">
                  {conversations && conversations.length > 0
                    ? 'Select a conversation from the sidebar to view messages'
                    : 'Create a new conversation to get started'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
