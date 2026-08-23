import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import { 
  MessageCircle, X, Send, Bot, Sparkles, 
  RotateCcw, Check, ChevronRight, User, ShoppingBag
} from 'lucide-react';

const WhatsappSvg = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
  </svg>
);

const MessengerSvg = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.077.298 2.222.463 3.443.463 6.627 0 12-4.975 12-11.11C24 4.974 18.627 0 12 0zm1.191 14.963l-3.056-3.259-5.963 3.259 6.556-6.963 3.13 3.259 5.889-3.259-6.556 6.963z"/>
  </svg>
);

export default function ChatWidgetV3({ settings = {} }) {
  const { auth } = usePage().props;
  const [open, setOpen] = useState(false);
  const [activeMode, setActiveMode] = useState('menu'); // 'menu' or 'ai_chat'
  
  // AI Chat States
  const [sessionToken, setSessionToken] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const rawPhone = settings.whatsapp_number || settings.support_phone || settings.hotline || '880170000000';
  const whatsappNumber = rawPhone.replace(/[^0-9]/g, '');
  const messengerUrl = settings.messenger_url || settings.facebook_url || 'https://m.me/techmarketbd';

  // Initialize AI session
  useEffect(() => {
    let token = localStorage.getItem('techmarket_chat_session');
    if (!token) {
      token = 'sess_' + Math.random().toString(36).substring(2, 12);
      localStorage.setItem('techmarket_chat_session', token);
    }
    setSessionToken(token);

    if (messages.length === 0) {
      setMessages([
        {
          id: 'init-1',
          sender: 'bot',
          message: `👋 Hello! I am your **TechMarket AI Assistant**.\n\nAsk me about latest gadgets, prices, stock availability, or warranty assistance!`,
          suggestions: ['Top Trending Fans', '20000mAh Powerbanks', 'Original X10 Flashlight', 'Delivery Info'],
        }
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage.trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      message: text,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_token: sessionToken,
          message: text,
        }),
      });
      const data = await res.json();

      const botMsg = {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        message: data.reply || data.message || "I'm checking our catalog for you. You can also connect with our live agents on WhatsApp!",
        suggestions: data.suggestions || ['Check Powerbanks', 'Rechargeable Fans', 'Track Order'],
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          id: 'bot_err_' + Date.now(),
          sender: 'bot',
          message: "I am ready to assist! For immediate agent help, please tap our direct WhatsApp chat below.",
          suggestions: ['WhatsApp Chat', 'Messenger Chat'],
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 font-sans select-none flex flex-col items-end">
      
      {/* 1. EXPANDED CHAT POPOVER / MODAL */}
      {open && (
        <div className="bg-white rounded-3xl p-4 shadow-[0_20px_60px_rgba(0,34,104,0.25)] border border-[#8BB1FF]/60 w-[320px] sm:w-[350px] mb-3 animate-in fade-in slide-in-from-bottom-3 text-slate-800 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <div className="relative flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
              </div>
              <div>
                <h4 className="font-black text-xs text-slate-900 leading-none">Live Customer Support</h4>
                <span className="text-[10px] text-emerald-600 font-bold">Online &bull; Instant Reply</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setOpen(false); setActiveMode('menu'); }}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode 1: 3 Support Options (WhatsApp, Messenger, AI Chatbot) */}
          {activeMode === 'menu' ? (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 leading-relaxed">
                How would you like to connect with our team today?
              </p>

              <div className="space-y-2">
                {/* 1. WhatsApp Live Chat */}
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-between shadow-md hover:shadow-lg transition-all font-bold text-xs group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <WhatsappSvg className="w-4 h-4 text-white" />
                    </div>
                    <span>WhatsApp Live Chat</span>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* 2. Facebook Messenger */}
                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-[#0084FF] hover:bg-[#0073E6] text-white flex items-center justify-between shadow-md hover:shadow-lg transition-all font-bold text-xs group"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <MessengerSvg className="w-4 h-4 text-white" />
                    </div>
                    <span>Facebook Messenger</span>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </a>

                {/* 3. TechMarket AI Assistant */}
                <button
                  type="button"
                  onClick={() => setActiveMode('ai_chat')}
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-gradient-to-r from-[#0153FD] to-[#002268] hover:from-[#0042cf] hover:to-[#001746] text-white flex items-center justify-between shadow-md hover:shadow-lg transition-all font-bold text-xs group cursor-pointer"
                >
                  <div className="flex items-center space-x-2.5">
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-left">
                      <span>TechMarket AI Assistant</span>
                      <span className="block text-[9px] text-sky-200 font-normal">Instant product finder & answers</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ) : (
            /* Mode 2: Interactive AI Assistant Window */
            <div className="flex flex-col h-72">
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-slate-200">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-2.5 ${
                        m.sender === 'user'
                          ? 'bg-[#0153FD] text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed text-[11px]">{m.message}</p>
                      
                      {/* Suggestion Pills */}
                      {m.suggestions && m.suggestions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {m.suggestions.map((sug, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSendMessage(sug)}
                              className="px-2 py-0.5 bg-white hover:bg-blue-50 text-[#0153FD] rounded-full text-[10px] font-bold border border-blue-200 shadow-2xs transition-colors"
                            >
                              {sug}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center space-x-1.5 text-slate-400 text-xs py-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input & Back */}
              <div className="pt-2 border-t border-slate-100 flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={() => setActiveMode('menu')}
                  className="px-2 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 shrink-0"
                >
                  &larr; Options
                </button>
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="flex-1 flex items-center bg-slate-100 rounded-full pl-3 pr-1 py-1"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full bg-transparent text-xs text-slate-800 focus:outline-none placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="w-6 h-6 rounded-full bg-[#0153FD] text-white flex items-center justify-center hover:bg-[#0042cf] shrink-0"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. FLOATING LIVE CHAT PILL BUTTON WITH ACTIVE RIPPLE ANIMATION */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-900 py-1.5 pl-3.5 pr-1.5 rounded-full border border-[#8BB1FF]/80 shadow-[0_8px_25px_rgba(1,83,253,0.22)] hover:shadow-2xl transition-all duration-300 group cursor-pointer active:scale-95 ring-2 ring-blue-500/20"
        aria-label="Open Live Chat"
      >
        {/* Pulsing Live Dot Animation */}
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping absolute" />
        </div>

        <span className="text-xs font-black text-slate-800 tracking-tight">Chat With Us ✌️</span>

        {/* Circular Blue Icon */}
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-[#002268] to-[#0153FD] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
          <MessageCircle className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white text-[8px] font-black flex items-center justify-center text-white">
            1
          </span>
        </div>
      </button>

    </div>
  );
}
