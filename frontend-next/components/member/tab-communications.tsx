'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Send,
  MessageSquare,
  Check,
  CheckCheck,
  User,
  Shield,
  Loader2,
  X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';
import {
  MemberProfile,
  ConversationSummary,
  MessageItem,
  ConversationPartner,
} from '@/types/society';

interface TabCommunicationsProps {
  currentProfile: MemberProfile | null;
}

export function TabCommunications({ currentProfile }: TabCommunicationsProps) {
  const queryClient = useQueryClient();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<ConversationPartner | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations
  const { data: conversations = [], isLoading: isLoadingConvs } = useQuery<ConversationSummary[]>({
    queryKey: ['conversations'],
    queryFn: () => api.get<ConversationSummary[]>('/conversations'),
    refetchInterval: 5000, // Background sync fallback
  });

  // 2. Fetch Messages for active conversation
  const { data: messages = [], isLoading: isLoadingMsgs } = useQuery<MessageItem[]>({
    queryKey: ['messages', activeConversationId],
    queryFn: () =>
      activeConversationId
        ? api.get<MessageItem[]>(`/messages/${activeConversationId}?limit=150`)
        : Promise.resolve([]),
    enabled: !!activeConversationId,
    refetchInterval: 3000,
  });

  // Auto-scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  // Set default active conversation if none selected
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
      setActivePartner(conversations[0].partner || null);
    }
  }, [conversations, activeConversationId]);

  // 3. Supabase Realtime Subscription
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('society_dispatches_stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as MessageItem;
            if (newMsg.conversation_id === activeConversationId) {
              queryClient.setQueryData<MessageItem[]>(
                ['messages', activeConversationId],
                (old = []) => {
                  if (old.some((m) => m.id === newMsg.id)) return old;
                  return [...old, newMsg];
                }
              );
              // Auto mark read if received from partner
              if (newMsg.sender_id !== currentProfile?.id) {
                api.put(`/messages/${newMsg.id}/read`).catch(() => {});
              }
            }
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as MessageItem;
            queryClient.setQueryData<MessageItem[]>(
              ['messages', updated.conversation_id],
              (old = []) =>
                old.map((m) => (m.id === updated.id ? { ...m, is_read: updated.is_read } : m))
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'conversations' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, currentProfile?.id, queryClient]);

  // 4. Send Message Mutation
  const sendMutation = useMutation({
    mutationFn: (content: string) =>
      api.post<MessageItem>('/messages', {
        conversation_id: activeConversationId,
        content,
      }),
    onMutate: async (newContent) => {
      await queryClient.cancelQueries({ queryKey: ['messages', activeConversationId] });
      const previousMessages = queryClient.getQueryData<MessageItem[]>([
        'messages',
        activeConversationId,
      ]);

      const optimisticMsg: MessageItem = {
        id: `temp-${Date.now()}`,
        conversation_id: activeConversationId!,
        sender_id: currentProfile?.id || '',
        content: newContent,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData<MessageItem[]>(
        ['messages', activeConversationId],
        (old = []) => [...old, optimisticMsg]
      );

      return { previousMessages };
    },
    onError: (_err, _newContent, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['messages', activeConversationId],
          context.previousMessages
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId || sendMutation.isPending) return;
    const content = messageInput.trim();
    setMessageInput('');
    sendMutation.mutate(content);
  };

  // 5. Search Fellows for New Dispatch
  const handleSearchUsers = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await api.get<any[]>(`/users?query=${encodeURIComponent(query.trim())}`);
      setSearchResults(results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleStartConversation = async (recipientId: string) => {
    try {
      const conv = await api.post<any>('/conversations', { recipient_id: recipientId });
      if (conv) {
        setIsSearchModalOpen(false);
        setActiveConversationId(conv.id);
        setActivePartner(conv.partner || null);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start dispatch');
    }
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c.partner?.codename || c.partner?.username || '';
    return name.toLowerCase().includes(filterQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-2rem)] border border-[var(--charcoal-border)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--obsidian)]">
      {/* LEFT: Conversation List Sidebar */}
      <div className="w-80 border-r border-[var(--charcoal-border)] flex flex-col bg-[var(--midnight-black)]">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[var(--charcoal-border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--antique-gold)]" />
            <h2 className="font-serif-formal text-sm font-bold tracking-wider text-[var(--imperial-gold)]">
              Dispatches
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(true)}
            className="p-1.5 rounded hover:bg-[var(--charcoal)] text-[var(--antique-gold)] hover:text-[var(--imperial-gold)] transition-colors"
            title="Locate Fellow for New Dispatch"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="p-3 border-b border-[var(--charcoal-border)]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-grey)]" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search dispatches..."
              className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] pl-8 pr-3 py-2 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
            />
          </div>
        </div>

        {/* Conversations Scrollable List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[var(--charcoal-border)]/50">
          {isLoadingConvs ? (
            <div className="p-8 text-center text-xs text-[var(--muted-grey)] flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--antique-gold)]" />
              <span>Scanning dispatches...</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--muted-grey)] space-y-3">
              <p>No active dispatches found.</p>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(true)}
                className="society-btn-primary text-xs py-1.5 px-3"
              >
                Locate Fellow
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const partner = conv.partner;
              const isActive = conv.id === activeConversationId;
              const partnerName = partner?.codename || partner?.username || 'Unknown Fellow';
              const lastMsg = conv.latest_message?.content || 'No dispatches yet';
              const unread = conv.unread_count || 0;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setActivePartner(partner || null);
                  }}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-all ${
                    isActive
                      ? 'bg-[var(--charcoal)] border-l-2 border-[var(--antique-gold)]'
                      : 'hover:bg-[var(--charcoal)]/50'
                  }`}
                >
                  <div className="w-9 h-9 rounded bg-[var(--charcoal-light)] border border-[var(--charcoal-border)] flex items-center justify-center font-serif-formal text-xs font-bold text-[var(--antique-gold)] shrink-0">
                    {partnerName[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-serif-formal text-xs font-semibold text-[var(--ivory)] truncate">
                        {partnerName}
                      </span>
                      {unread > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[0.625rem] font-bold bg-[var(--antique-gold)] text-[var(--midnight-black)]">
                          {unread}
                        </span>
                      )}
                    </div>
                    <p className="text-[0.6875rem] text-[var(--muted-grey)] truncate mt-0.5">
                      {lastMsg}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT: Active Dispatch Thread */}
      <div className="flex-1 flex flex-col bg-[var(--obsidian)]">
        {activePartner ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-[var(--charcoal-border)] flex items-center justify-between bg-[var(--charcoal)]/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[var(--charcoal)] border border-[var(--gold-border)] flex items-center justify-center font-serif-formal text-xs font-bold text-[var(--imperial-gold)]">
                  {(activePartner.codename || activePartner.username || 'F')[0].toUpperCase()}
                </div>
                <div>
                  <h3 className="font-serif-formal text-sm font-bold text-[var(--imperial-gold)]">
                    {activePartner.codename || activePartner.username}
                  </h3>
                  <div className="flex items-center gap-2 text-[0.6875rem] text-[var(--muted-grey)]">
                    <span className="text-[#4ADE80] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" /> Online
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono text-[var(--antique-gold)]">
                      {activePartner.society_rank || 'Initiate'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {isLoadingMsgs ? (
                <div className="flex items-center justify-center h-full text-xs text-[var(--muted-grey)] gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--antique-gold)]" />
                  <span>Decrypting dispatches...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-xs text-[var(--muted-grey)] space-y-2">
                  <Shield className="w-8 h-8 text-[var(--antique-gold)]/40" />
                  <p className="font-serif-formal text-[var(--ivory-muted)]">Encrypted Dispatch Channel Open</p>
                  <p className="text-[0.6875rem]">Transmissions in this chamber are strictly confidential.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOutgoing = msg.sender_id === currentProfile?.id;
                  const time = new Date(msg.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3.5 rounded-[var(--radius-sm)] text-xs leading-relaxed ${
                          isOutgoing
                            ? 'bg-[var(--deep-burgundy)] text-[var(--ivory)] border border-[rgba(197,160,89,0.3)] shadow-[0_2px_12px_rgba(92,22,29,0.25)]'
                            : 'bg-[var(--charcoal)] text-[var(--ivory)] border border-[var(--charcoal-border)]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-1.5 text-[0.625rem] text-[var(--ivory-muted)] opacity-70">
                          <span>{time}</span>
                          {isOutgoing && (
                            msg.is_read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[var(--antique-gold)]" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Dispatch Composer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--charcoal-border)] bg-[var(--midnight-black)]">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Transmit encrypted dispatch... (Enter to send)"
                  className="flex-1 bg-[var(--charcoal)] text-xs text-[var(--ivory)] px-4 py-3 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim() || sendMutation.isPending}
                  className="society-btn-primary py-2.5 px-4 shrink-0 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <MessageSquare className="w-10 h-10 text-[var(--antique-gold)]/30" />
            <h3 className="font-serif-formal text-base text-[var(--imperial-gold)]">
              Communications Network
            </h3>
            <p className="text-xs text-[var(--muted-grey)] max-w-sm">
              Select an ongoing dispatch from the left or locate a Fellow to initiate a new encrypted transmission.
            </p>
          </div>
        )}
      </div>

      {/* MODAL: Locate Fellow for New Dispatch */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="society-card max-w-md w-full p-6 space-y-4 border border-[var(--gold-border)]">
            <div className="flex items-center justify-between border-b border-[var(--charcoal-border)] pb-3">
              <h3 className="font-serif-formal text-sm font-bold text-[var(--imperial-gold)]">
                Locate Fellow
              </h3>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="text-[var(--muted-grey)] hover:text-[var(--ivory)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-grey)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                placeholder="Search by codename or identifier..."
                autoFocus
                className="w-full bg-[var(--charcoal)] text-xs text-[var(--ivory)] pl-9 pr-3 py-2.5 rounded border border-[var(--charcoal-border)] focus:outline-none focus:border-[var(--antique-gold)]"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-[var(--charcoal-border)]/40">
              {isSearching ? (
                <div className="p-4 text-center text-xs text-[var(--muted-grey)]">Searching registry...</div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-[var(--muted-grey)]">
                  {searchQuery ? 'No Fellows found matching query' : 'Type to search the Society Registry'}
                </div>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 flex items-center justify-between hover:bg-[var(--charcoal)]/60 rounded cursor-pointer transition-colors"
                    onClick={() => handleStartConversation(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-[var(--charcoal-light)] border border-[var(--charcoal-border)] flex items-center justify-center font-serif-formal text-xs font-bold text-[var(--antique-gold)]">
                        {(user.codename || user.username || 'F')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-serif-formal text-xs font-semibold text-[var(--ivory)]">
                          {user.codename || user.username}
                        </div>
                        <div className="text-[0.625rem] text-[var(--muted-grey)] font-mono">
                          {user.member_number || 'SOC-FELLOW'}
                        </div>
                      </div>
                    </div>
                    <button type="button" className="society-btn-primary text-[0.625rem] py-1 px-2.5">
                      Dispatch
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
