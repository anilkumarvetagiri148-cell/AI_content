import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { Conversation, Message } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const MessagesPage: React.FC = () => {
  const { user, showToast } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const res = await apiRequest<{ conversations: Conversation[] }>('/api/conversations');
      setConversations(res.conversations || []);
      if (!selectedConvId && res.conversations?.[0]) {
        setSelectedConvId(res.conversations[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoadingConvs(false);
    }
  }, [selectedConvId]);

  const loadMessages = useCallback(async (convId: string) => {
    if (!convId) return;
    setLoadingMsgs(true);
    try {
      const res = await apiRequest<{ conversation: Conversation; messages: Message[] }>(
        `/api/conversations/${convId}/messages`
      );
      setMessages(res.messages || []);
      // Clear unread indicator locally
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, unread_count: 0 } : c))
      );
    } catch {
      // ignore
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (selectedConvId) {
      loadMessages(selectedConvId);
    }
  }, [selectedConvId, loadMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConvId || !newMessage.trim()) return;
    setSending(true);
    try {
      const res = await apiRequest<{ message: Message }>(
        `/api/conversations/${selectedConvId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({ body: newMessage.trim() }),
        }
      );
      setMessages((prev) => [...prev, res.message]);
      setNewMessage('');
      loadConversations();
    } catch (err: any) {
      showToast(err.message || 'Failed to send message.', 'error');
    } finally {
      setSending(false);
    }
  };

  const activeConversation = conversations.find((c) => c.id === selectedConvId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#9D7BFF] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#FF7A1A]" /> Collaboration Workspace
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-white">
            Messages & Campaign Collaboration
          </h1>
        </div>
        <button
          onClick={() => {
            loadConversations();
            if (selectedConvId) loadMessages(selectedConvId);
          }}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#17132E] hover:bg-[#211C40] text-[#B9B3D0] hover:text-white border border-white/10 flex items-center gap-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      <div className="glass-card rounded-3xl border border-white/15 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[560px]">
        {/* Left 4 Cols: Conversation List */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#0B081D]/60 flex flex-col">
          <div className="p-4 border-b border-white/10 text-xs font-semibold uppercase tracking-wider text-[#B9B3D0]">
            Active Threads ({conversations.length})
          </div>

          {loadingConvs ? (
            <div className="p-6 space-y-3">
              <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
              <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#B9B3D0] space-y-3">
              <MessageSquare className="w-8 h-8 text-[#7C4DFF] mx-auto" />
              <p>No conversations started yet.</p>
              <Link to="/creators" className="text-[#9D7BFF] font-semibold hover:underline block">
                Explore Creators to Start Collaborating →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/5 overflow-y-auto">
              {conversations.map((conv) => {
                const isBrand = user?.id === conv.brand_id;
                const partnerName = isBrand ? conv.creator_name : conv.brand_name;
                const partnerAvatar = isBrand ? conv.creator_avatar : conv.brand_avatar;
                const selected = conv.id === selectedConvId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={`w-full p-4 text-left flex items-start gap-3 transition ${
                      selected ? 'bg-[#7C4DFF]/20' : 'hover:bg-white/5'
                    }`}
                  >
                    <img
                      src={partnerAvatar}
                      alt={partnerName}
                      className="w-11 h-11 rounded-xl object-cover border border-white/15 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-sm text-white truncate">{partnerName}</span>
                        {conv.unread_count > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF7A1A] text-white">
                            {conv.unread_count} new
                          </span>
                        )}
                      </div>
                      {conv.campaign_title && (
                        <div className="text-[11px] text-[#9D7BFF] truncate">
                          Brief: {conv.campaign_title}
                        </div>
                      )}
                      <p className="text-xs text-[#B9B3D0] truncate mt-1">{conv.last_message}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 8 Cols: Active Chat Window */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-[#17132E]/40">
          {!activeConversation ? (
            <div className="flex-1 flex items-center justify-center p-8 text-center text-sm text-[#B9B3D0]">
              Select a conversation from the left to view message history.
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="px-6 py-4 border-b border-white/10 bg-[#0B081D]/60 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-base text-white">
                    {user?.id === activeConversation.brand_id
                      ? activeConversation.creator_name
                      : activeConversation.brand_name}
                  </h2>
                  {activeConversation.campaign_title && (
                    <span className="text-xs text-[#9D7BFF]">
                      Campaign: {activeConversation.campaign_title}
                    </span>
                  )}
                </div>
                {activeConversation.campaign_id && (
                  <Link
                    to={`/campaigns/${activeConversation.campaign_id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center gap-1"
                  >
                    View Brief <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              {/* Message History */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[400px]">
                {loadingMsgs ? (
                  <div className="text-xs text-[#B9B3D0] text-center py-8">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-xs text-[#B9B3D0] text-center py-8">
                    No messages in this thread yet. Say hello below!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-3 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        <img
                          src={msg.sender_avatar}
                          alt={msg.sender_name}
                          className="w-8 h-8 rounded-full object-cover shrink-0 mt-1"
                        />
                        <div
                          className={`max-w-lg p-3.5 rounded-2xl text-xs sm:text-sm space-y-1 ${
                            isMe
                              ? 'bg-[#7C4DFF] text-white rounded-tr-none'
                              : 'bg-[#0B081D]/90 text-white border border-white/10 rounded-tl-none'
                          }`}
                        >
                          <p className="leading-relaxed">{msg.body}</p>
                          <div
                            className={`text-[10px] flex items-center gap-1 ${
                              isMe ? 'text-white/70 justify-end' : 'text-[#B9B3D0]'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Compose Input */}
              <form
                onSubmit={handleSend}
                className="p-4 border-t border-white/10 bg-[#0B081D]/80 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a message, share styleframe feedback, or discuss deliverables..."
                  className="input-dark flex-1 text-sm"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="btn-primary-orange px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shrink-0"
                >
                  <Send className="w-4 h-4" /> Send
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
