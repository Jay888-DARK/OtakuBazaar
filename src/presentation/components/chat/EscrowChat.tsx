'use client';

/**
 * @file src/presentation/components/chat/EscrowChat.tsx
 *
 * Real-Time Post-Bid Escrow Chat Component for OtakuBazaar.
 * Connects to Pusher client channels for instant message synchronization.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Pusher from 'pusher-js';
import { sendMessage, fetchOrderMessages, type ChatMessageRecord } from '@/app/actions/chatActions';

export interface EscrowChatProps {
  /** The Escrow Order or Transaction ID */
  readonly orderId: string;
  /** Current authenticated user's ID */
  readonly currentUserId: string;
  /** Optional title or collectible name associated with the transaction */
  readonly orderTitle?: string;
  /** Optional counterparty name */
  readonly counterpartyName?: string;
}

export function EscrowChat({
  orderId,
  currentUserId,
  orderTitle = 'Escrow Collectible Order',
  counterpartyName = 'Collector',
}: EscrowChatProps): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessageRecord[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // -------------------------------------------------------------------------
  // 1. Initial Message History Retrieval
  // -------------------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;

    async function loadHistory() {
      const res = await fetchOrderMessages(orderId);
      if (isMounted && res.success && res.data) {
        setMessages(res.data);
        setTimeout(scrollToBottom, 100);
      }
    }

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [orderId, scrollToBottom]);

  // -------------------------------------------------------------------------
  // 2. Pusher Client Channel Subscription & Real-Time Binding
  // -------------------------------------------------------------------------
  useEffect(() => {
    const pusherKey =
      process.env.NEXT_PUBLIC_PUSHER_APP_KEY ||
      process.env.NEXT_PUBLIC_PUSHER_KEY ||
      '781968040588c465b8d4';
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

    const pusherClient = new Pusher(pusherKey, {
      cluster: pusherCluster,
      forceTLS: true,
    });

    pusherClient.connection.bind('connected', () => {
      setIsLiveConnected(true);
    });

    pusherClient.connection.bind('disconnected', () => {
      setIsLiveConnected(false);
    });

    const channel = pusherClient.subscribe(orderId);

    channel.bind('new-message', (incomingMessage: ChatMessageRecord) => {
      setMessages((prev) => {
        // Prevent duplicate if message was already appended locally
        if (prev.some((m) => m.id === incomingMessage.id)) {
          return prev;
        }
        return [...prev, incomingMessage];
      });
      setTimeout(scrollToBottom, 50);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusherClient.disconnect();
    };
  }, [orderId, scrollToBottom]);

  // -------------------------------------------------------------------------
  // 3. Send Message Action
  // -------------------------------------------------------------------------
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || isSending) return;

    setInputText('');
    setIsSending(true);

    try {
      const result = await sendMessage(orderId, textToSend, currentUserId);
      if (result.success && result.data) {
        const saved = result.data;
        setMessages((prev) => {
          if (prev.some((m) => m.id === saved.id)) return prev;
          return [...prev, saved];
        });
        setTimeout(scrollToBottom, 50);
      }
    } catch (err) {
      console.error('[EscrowChat] Send error:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] w-full max-w-2xl mx-auto bg-[#0c0c0e] border border-zinc-800 text-[#F0E8DA]">
      {/* ----------------------------------------------------------------- */}
      {/* Top Header: Escrow Status, Order Title & Live Indicator           */}
      {/* ----------------------------------------------------------------- */}
      <header className="p-3.5 sm:p-4 bg-[#141416] border-b border-zinc-800 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-bold text-[#E8C36A]">
            ESC
          </div>
          <div className="flex flex-col">
            <h3 className="text-xs sm:text-sm font-bold text-zinc-100 truncate max-w-[220px] sm:max-w-xs uppercase tracking-[0.15em]">
              {orderTitle}
            </h3>
            <span className="text-[10px] text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span>Order #{orderId.substring(0, 10)}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">48H Escrow Active</span>
            </span>
          </div>
        </div>

        {/* Live Pusher Presence Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-zinc-900 border border-zinc-700">
          <span
            className={`w-2 h-2 ${
              isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-200 uppercase">
            {isLiveConnected ? 'LIVE SYNC' : 'ESCROW READY'}
          </span>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* Messages Scroll Container                                         */}
      {/* ----------------------------------------------------------------- */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0c0c0e] border-y border-zinc-800 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
            <p className="text-xs font-bold text-zinc-200 mb-1 uppercase tracking-[0.2em]">
              Encrypted Post-Bid Escrow Channel
            </p>
            <p className="text-[11px] max-w-xs leading-relaxed font-normal">
              Coordinate collector packaging, unboxing tracking, and physical inspection milestones directly with {counterpartyName}.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            const timeString = msg.createdAt
              ? new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Tag */}
                <span className="text-[9px] text-zinc-400 mb-1 px-1 uppercase tracking-wider font-medium">
                  {isMe ? 'You (Verified)' : msg.sender?.displayName || msg.sender?.name || counterpartyName}
                </span>

                {/* Message Bubble */}
                <div
                  className={`p-3 text-xs max-w-[82%] sm:max-w-[75%] break-words leading-relaxed border ${
                    isMe
                      ? 'bg-zinc-100 text-black border-zinc-100'
                      : 'bg-zinc-900 text-zinc-100 border-zinc-800'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`text-[9px] mt-1 text-right uppercase tracking-wider ${
                      isMe ? 'text-zinc-600' : 'text-zinc-400'
                    }`}
                  >
                    {timeString}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* ----------------------------------------------------------------- */}
      {/* Message Input & Send Form                                         */}
      {/* ----------------------------------------------------------------- */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 sm:p-4 bg-[#111114] flex items-center gap-2.5 z-10 border-t border-zinc-800"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Message ${counterpartyName} regarding escrow order...`}
          disabled={isSending}
          className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-xs text-zinc-100 placeholder:text-zinc-500 transition-colors"
        />

        <button
          type="submit"
          disabled={isSending || inputText.trim().length === 0}
          className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-black font-bold text-xs tracking-[0.2em] uppercase transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <span>{isSending ? 'Sending...' : 'Send'}</span>
        </button>
      </form>
    </div>
  );
}

export default EscrowChat;
