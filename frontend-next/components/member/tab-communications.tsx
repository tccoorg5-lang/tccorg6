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
  Paperclip,
  Smile,
  Users,
  Lock,
  ArrowLeft,
  Info,
  Radio,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { getSupabaseClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input, SearchInput } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { useToast } from '@/components/ui/toast';
import {
  MemberProfile,
  ConversationSummary,
  MessageItem,
  ConversationPartner,
} from '@/types/society';

interface TabCommunicationsProps {
  currentProfile: MemberProfile | null;
}

// Built-in Institutional Conclave Chambers
interface ConclaveRoom {
  id: string;
  name: string;
  description: string;
  category: 'founding' | 'roundtable' | 'missions' | 'assembly';
  unreadCount?: number;
  isRoom: true;
}

const INSTITUTIONAL_ROOMS: ConclaveRoom[] = [
  {
    id: 'room-founding-sanctum',
    name: 'Founding Members\' Sanctum',
    description: 'Restricted conclave for Sovereign Founders and Charter signatories.',
    category: 'founding',
    isRoom: true,
  },
  {
    id: 'room-roundtable-conclave',
    name: 'Round Table Conclave',
    description: 'High Council chamber for parliamentary resolutions and governance.',
    category: 'roundtable',
    isRoom: true,
  },
  {
    id: 'room-mission-alpha',
    name: 'Mission Alpha &bull; Public Welfare',
    description: 'Operational coordination channel for municipal transparency audits.',
    category: 'missions',
    isRoom: true,
  },
  {
    id: 'room-general-assembly',
    name: 'General Assembly Hall',
    description: 'Open communication hall for all active Fellows of The Society.',
    category: 'assembly',
    isRoom: true,
  },
];

export function TabCommunications({ currentProfile }: TabCommunicationsProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<ConversationPartner | null>(null);
  const [activeRoom, setActiveRoom] = useState<ConclaveRoom | null>(null);

  const [filterQuery, setFilterQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'rooms' | 'direct'>('all');
  const [messageInput, setMessageInput] = useState('');

  // Mobile navigation state: show thread or list
  const [mobileShowThread, setMobileShowThread] = useState(false);

  // New Dispatch / Fellow Search Modal
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Direct Conversations from Backend
  const { data: conversations = [], isLoading: isLoadingConvs } = useQuery<ConversationSummary[]>({
    queryKey: ['conversations'],
    queryFn: () => api.get<ConversationSummary[]>('/conversations'),
    refetchInterval: 5000,
  });

  // 2. Fetch Messages for active direct conversation
  const { data: messages = [], isLoading: isLoadingMsgs } = useQuery<MessageItem[]>({
    queryKey: ['messages', activeConversationId],
    queryFn: () =>
      activeConversationId && !activeRoom
        ? api.get<MessageItem[]>(`/messages/${activeConversationId}?limit=150`)
        : Promise.resolve([]),
    enabled: !!activeConversationId && !activeRoom,
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
    if (!activeConversationId && !activeRoom && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
      setActivePartner(conversations[0].partner || null);
    }
  }, [conversations, activeConversationId, activeRoom]);

  // 3. Supabase Realtime Subscription for Dispatches
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('society_dispatches_stream_v2')
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
              // Auto mark read if from partner
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
    onError: (err: any, _newContent, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['messages', activeConversationId],
          context.previousMessages
        );
      }
      toast({
        type: 'error',
        title: 'Dispatch Transmission Error',
        description: err.message || 'Unable to deliver encrypted dispatch to peer.',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', activeConversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeConversationId || sendMutation.isPending) return;

    if (activeRoom) {
      toast({
        type: 'info',
        title: 'Broadcast Dispatched',
        description: `Your transmission was received in ${activeRoom.name}.`,
      });
      setMessageInput('');
      return;
    }

    const content = messageInput.trim();
    setMessageInput('');
    sendMutation.mutate(content);
  };

  // 5. Locate Fellow Handler
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
        setActiveRoom(null);
        setActiveConversationId(conv.id);
        setActivePartner(conv.partner || null);
        setMobileShowThread(true);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        toast({
          type: 'success',
          title: 'Dispatch Channel Established',
          description: `Direct channel open with ${conv.partner?.codename || 'Fellow'}.`,
        });
      }
    } catch (err: any) {
      toast({
        type: 'error',
        title: 'Channel Error',
        description: err.message || 'Failed to establish dispatch thread.',
      });
    }
  };

  // Filtered direct conversations
  const filteredConversations = conversations.filter((c) => {
    const name = c.partner?.codename || c.partner?.username || '';
    return name.toLowerCase().includes(filterQuery.toLowerCase());
  });

  // Filtered rooms
  const filteredRooms = INSTITUTIONAL_ROOMS.filter((r) =>
    r.name.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-4.5rem)] rounded-[8px] border border-[#262C3A] bg-[#0F1218] overflow-hidden shadow-[0_16px_48px_rgba(0,0,0,0.85)] relative select-none">
      {/* ======================================================== */}
      {/* MIDDLE PANEL: Dispatches Directory & Chambers List       */}
      {/* ======================================================== */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-[#262C3A] flex flex-col bg-[#080A0E] shrink-0 transition-all ${
          mobileShowThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-[#262C3A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#C5A059]" />
            <h2 className="font-serif-formal text-sm font-bold tracking-wider text-[#D8B26E] uppercase">
              Dispatches Network
            </h2>
          </div>
          <Button
            variant="gold"
            size="sm"
            onClick={() => setIsSearchModalOpen(true)}
            title="Locate Fellow for New Dispatch"
            className="text-[0.6875rem] py-1 px-2.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Locate Fellow</span>
          </Button>
        </div>

        {/* Filter / Search Bar */}
        <div className="p-3 border-b border-[#262C3A]/60 space-y-2">
          <SearchInput
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search dispatches or chambers..."
          />

          {/* Category Tabs: All / Chambers / Fellows */}
          <div className="grid grid-cols-3 p-1 bg-[#161A22] rounded-[4px] border border-[#262C3A]/60 text-[0.625rem] font-serif-formal font-bold tracking-wider uppercase">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`py-1 rounded-[2px] transition-colors ${
                activeCategory === 'all'
                  ? 'bg-[#C5A059] text-[#080A0E]'
                  : 'text-[#858995] hover:text-[#E9E2D3]'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('rooms')}
              className={`py-1 rounded-[2px] transition-colors ${
                activeCategory === 'rooms'
                  ? 'bg-[#C5A059] text-[#080A0E]'
                  : 'text-[#858995] hover:text-[#E9E2D3]'
              }`}
            >
              Chambers
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('direct')}
              className={`py-1 rounded-[2px] transition-colors ${
                activeCategory === 'direct'
                  ? 'bg-[#C5A059] text-[#080A0E]'
                  : 'text-[#858995] hover:text-[#E9E2D3]'
              }`}
            >
              Fellows
            </button>
          </div>
        </div>

        {/* Scrollable Conversation & Chamber List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#262C3A]/40">
          {/* Institutional Conclave Chambers Section */}
          {(activeCategory === 'all' || activeCategory === 'rooms') && (
            <div className="py-2">
              <div className="px-3 py-1 font-serif-formal text-[0.625rem] font-bold text-[#858995] uppercase tracking-widest">
                Institutional Conclave Chambers
              </div>
              {filteredRooms.map((room) => {
                const isSelected = activeRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => {
                      setActiveRoom(room);
                      setActiveConversationId(null);
                      setActivePartner(null);
                      setMobileShowThread(true);
                    }}
                    className={`w-full p-3 flex items-start gap-3 text-left transition-all ${
                      isSelected
                        ? 'bg-[#1B2029] border-l-2 border-[#C5A059]'
                        : 'hover:bg-[#161A22]/70'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-[4px] bg-[#161A22] border border-[rgba(197,160,89,0.35)] flex items-center justify-center text-[#C5A059] shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-serif-formal text-xs font-bold text-[#D8B26E] truncate">
                          {room.name}
                        </span>
                        <Badge variant="gold" className="text-[0.5625rem] px-1.5 py-0">
                          Chamber
                        </Badge>
                      </div>
                      <p className="text-[0.6875rem] text-[#858995] truncate mt-0.5 leading-snug">
                        {room.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Direct Fellow Dispatches Section */}
          {(activeCategory === 'all' || activeCategory === 'direct') && (
            <div className="py-2">
              <div className="px-3 py-1 font-serif-formal text-[0.625rem] font-bold text-[#858995] uppercase tracking-widest">
                Direct Fellow Transmissions
              </div>

              {isLoadingConvs ? (
                <div className="p-8 text-center text-xs text-[#858995] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                  <span>Scanning dispatches stream...</span>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#858995] space-y-2">
                  <p>No active peer dispatches found.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSearchModalOpen(true)}
                  >
                    Locate a Fellow
                  </Button>
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const partner = conv.partner;
                  const isSelected = !activeRoom && conv.id === activeConversationId;
                  const partnerName = partner?.codename || partner?.username || 'Unknown Fellow';
                  const lastMsg = conv.latest_message?.content || 'Dispatch channel established.';
                  const unread = conv.unread_count || 0;
                  const time = conv.latest_message?.created_at
                    ? new Date(conv.latest_message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '';

                  return (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => {
                        setActiveRoom(null);
                        setActiveConversationId(conv.id);
                        setActivePartner(partner || null);
                        setMobileShowThread(true);
                      }}
                      className={`w-full p-3 flex items-start gap-3 text-left transition-all ${
                        isSelected
                          ? 'bg-[#1B2029] border-l-2 border-[#C5A059]'
                          : 'hover:bg-[#161A22]/70'
                      }`}
                    >
                      <div className="w-9 h-9 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-center justify-center font-serif-formal text-xs font-bold text-[#C5A059] shrink-0">
                        {partnerName[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-serif-formal text-xs font-bold text-[#E9E2D3] truncate">
                            {partnerName}
                          </span>
                          {time && (
                            <span className="font-mono text-[0.625rem] text-[#858995]">
                              {time}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[0.6875rem] text-[#858995] truncate max-w-[170px]">
                            {lastMsg}
                          </p>
                          {unread > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full text-[0.625rem] font-bold bg-[#C5A059] text-[#080A0E]">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* RIGHT PANEL: Active Dispatch Thread & Exceptional Composer */}
      {/* ======================================================== */}
      <div
        className={`flex-1 flex flex-col bg-[#0F1218] transition-all ${
          !mobileShowThread ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeRoom || activePartner ? (
          <>
            {/* Thread Header */}
            <div className="p-4 border-b border-[#262C3A] flex items-center justify-between bg-[#161A22]/40 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileShowThread(false)}
                  className="md:hidden p-1.5 text-[#858995] hover:text-[#E9E2D3]"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>

                <div className="w-9 h-9 rounded-[4px] bg-[#161A22] border border-[rgba(197,160,89,0.4)] flex items-center justify-center font-serif-formal text-xs font-bold text-[#D8B26E]">
                  {activeRoom ? (
                    <Users className="w-4 h-4" />
                  ) : (
                    (activePartner?.codename || 'F')[0].toUpperCase()
                  )}
                </div>

                <div>
                  <h3 className="font-serif-formal text-sm font-bold text-[#D8B26E] tracking-wide">
                    {activeRoom ? activeRoom.name : activePartner?.codename || activePartner?.username}
                  </h3>
                  <div className="flex items-center gap-2 text-[0.6875rem] text-[#858995]">
                    <span className="text-[#4ADE80] font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" /> Active Standby
                    </span>
                    <span>&bull;</span>
                    <span className="font-mono text-[#C5A059]">
                      {activeRoom
                        ? 'Sovereign Assembly Room'
                        : activePartner?.society_rank || 'Initiate Fellow'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thread Action Controls */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:inline-flex">
                  <Lock className="w-3 h-3 text-[#C5A059]" />
                  <span>Channel Protected</span>
                </Badge>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#080A0E]/70">
              {/* Date Delimiter */}
              <div className="flex items-center justify-center my-2">
                <span className="px-3 py-1 rounded-[3px] bg-[#161A22] border border-[#262C3A] text-[0.625rem] font-serif-formal tracking-widest text-[#858995] uppercase">
                  Today &bull; Encrypted Dispatches
                </span>
              </div>

              {activeRoom ? (
                // Chamber Mock Dispatches
                <div className="space-y-4">
                  <div className="flex flex-col items-start">
                    <div className="max-w-[75%] p-4 rounded-[6px] bg-[#1B2029] text-xs leading-relaxed border border-[#262C3A] text-[#E9E2D3] space-y-1">
                      <div className="flex items-center justify-between text-[0.625rem] text-[#C5A059] font-serif-formal font-bold pb-1 border-b border-[#262C3A]">
                        <span>Sovereign Founder</span>
                        <span>Official Dispatch</span>
                      </div>
                      <p className="pt-1 text-[#E9E2D3]">
                        Welcome to {activeRoom.name}. Deliberations in this chamber are preserved in the Society Archives. Maintain discretion and high standards of intellectual rigor.
                      </p>
                      <div className="text-right text-[0.625rem] text-[#858995] font-mono mt-1">
                        10:00 UTC
                      </div>
                    </div>
                  </div>
                </div>
              ) : isLoadingMsgs ? (
                <div className="flex items-center justify-center h-full text-xs text-[#858995] gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                  <span>Decrypting dispatches stream...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <Shield className="w-10 h-10 text-[#C5A059]/40" />
                  <h4 className="font-serif-formal text-sm font-bold text-[#D8B26E] uppercase tracking-wider">
                    Dispatch Channel Open
                  </h4>
                  <p className="text-xs text-[#858995] max-w-sm leading-relaxed">
                    Transmissions between you and {activePartner?.codename || 'Fellow'} are private and authenticated under the 2026 Society Protocol.
                  </p>
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
                        className={`max-w-[75%] p-3.5 rounded-[6px] text-xs leading-relaxed ${
                          isOutgoing
                            ? 'bg-[#221C12] text-[#E9E2D3] border border-[rgba(197,160,89,0.4)] shadow-[0_4px_16px_rgba(197,160,89,0.08)]'
                            : 'bg-[#1B2029] text-[#E9E2D3] border border-[#262C3A]'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <div className="flex items-center justify-end gap-1.5 mt-2 text-[0.625rem] text-[#858995] font-mono">
                          <span>{time}</span>
                          {isOutgoing && (
                            msg.is_read ? (
                              <CheckCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                            ) : (
                              <Check className="w-3 h-3 text-[#858995]" />
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

            {/* Exceptional Dispatch Composer Dock */}
            <div className="p-4 border-t border-[#262C3A] bg-[#0F1218]">
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="flex items-center gap-2 p-1.5 bg-[#161A22] border border-[#262C3A] rounded-[6px] focus-within:border-[#C5A059] focus-within:ring-1 focus-within:ring-[#C5A059] transition-all">
                  {/* Attachment Button */}
                  <button
                    type="button"
                    onClick={() =>
                      toast({
                        type: 'info',
                        title: 'Document Attachment',
                        description: 'Signed archival document sharing protocol is active.',
                      })
                    }
                    className="p-2 text-[#858995] hover:text-[#C5A059] transition-colors rounded-[3px] hover:bg-[#1B2029]"
                    title="Attach Research Document"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  {/* Text Input */}
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder={
                      activeRoom
                        ? `Broadcast to ${activeRoom.name}...`
                        : `Transmit encrypted dispatch to ${activePartner?.codename || 'Fellow'}...`
                    }
                    className="flex-1 bg-transparent text-xs text-[#E9E2D3] placeholder:text-[#858995] px-2 py-2 focus:outline-none"
                  />

                  {/* Send Button */}
                  <Button
                    type="submit"
                    variant="gold"
                    size="md"
                    disabled={!messageInput.trim() || sendMutation.isPending}
                    className="px-4 py-2 shrink-0"
                    isLoading={sendMutation.isPending}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Transmit</span>
                  </Button>
                </div>

                <div className="flex items-center justify-between text-[0.625rem] text-[#858995] px-1 font-mono">
                  <span>DISCRETION MANDATED &bull; 2026 ARCHITECTURE</span>
                  <span className="hidden sm:inline">Press Enter to transmit dispatch</span>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
            <MessageSquare className="w-12 h-12 text-[#C5A059]/30" />
            <h3 className="font-serif-formal text-lg text-[#D8B26E] font-bold uppercase tracking-wider">
              Select Dispatch Channel
            </h3>
            <p className="text-xs text-[#858995] max-w-sm leading-relaxed">
              Choose an active Fellow conversation or Conclave Chamber from the left directory to begin transmission.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: Locate Fellow for New Dispatch                    */}
      {/* ======================================================== */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="rounded-[8px] bg-[#0F1218] border border-[rgba(197,160,89,0.4)] shadow-[0_16px_48px_rgba(0,0,0,0.85)] max-w-md w-full p-6 space-y-4 relative before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:bg-gradient-to-r before:from-transparent before:via-[#C5A059] before:to-transparent">
            <div className="flex items-center justify-between border-b border-[#262C3A] pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-serif-formal text-sm font-bold text-[#D8B26E] uppercase tracking-wider">
                  Locate Fellow in Registry
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="text-[#858995] hover:text-[#E9E2D3] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <SearchInput
              value={searchQuery}
              onChange={(e) => handleSearchUsers(e.target.value)}
              placeholder="Search by conferred codename or identifier..."
              autoFocus
            />

            <div className="max-h-60 overflow-y-auto space-y-1 divide-y divide-[#262C3A]/50">
              {isSearching ? (
                <div className="p-6 text-center text-xs text-[#858995] flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#C5A059]" />
                  <span>Scanning Sovereign Roll...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#858995]">
                  {searchQuery ? 'No Fellows found matching query' : 'Type to search registered Fellows'}
                </div>
              ) : (
                searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="p-3 flex items-center justify-between hover:bg-[#161A22] rounded-[4px] cursor-pointer transition-colors"
                    onClick={() => handleStartConversation(user.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-[4px] bg-[#161A22] border border-[#262C3A] flex items-center justify-center font-serif-formal text-xs font-bold text-[#C5A059]">
                        {(user.codename || user.username || 'F')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-serif-formal text-xs font-semibold text-[#E9E2D3]">
                          {user.codename || user.username}
                        </div>
                        <div className="text-[0.625rem] text-[#858995] font-mono">
                          {user.member_number || 'SOC-FELLOW'}
                        </div>
                      </div>
                    </div>
                    <Button variant="gold" size="sm" className="text-[0.625rem] py-1 px-3">
                      Initiate
                    </Button>
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
