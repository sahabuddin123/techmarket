import React, { useState, useEffect, useRef } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { 
  MessageSquare, X, Send, Bot, User, Sparkles, ShoppingCart, 
  RotateCcw, ShieldCheck, Truck, CreditCard, ChevronRight, Phone, Check,
  AlertCircle, Package, ArrowRight, ExternalLink, Headphones
} from 'lucide-react';

export default function ChatbotWidget() {
  const { auth, settings = {} } = usePage().props;
  
  // Widget Open/Close State
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  
  // Chat Conversation State
  const [sessionToken, setSessionToken] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Escalation Form State
  const [escalationForm, setEscalationForm] = useState({
    customer_name: auth?.user?.name || '',
    customer_phone: auth?.user?.phone || '',
    customer_email: auth?.user?.email || '',
    inquiry_text: '',
  });
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(null);
  const [addedProductId, setAddedProductId] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize or restore session from localStorage
  useEffect(() => {
    let token = localStorage.getItem('techland_chat_session_token');
    if (!token) {
      token = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('techland_chat_session_token', token);
    }
    setSessionToken(token);

    // Fetch initial chat history
    fetch(`/api/chatbot/history?session_token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          // Default initial greeting message
          setMessages([
            {
              id: 'init-1',
              sender: 'bot',
              type: 'text',
              message: `👋 Hello${auth?.user ? ' ' + auth.user.name.split(' ')[0] : ''}! I am your **TechMarket AI Assistant**.\n\nI can help you search products, check live prices & stock, track orders, or answer questions about warranty & 0% EMI.`,
              payload: {
                suggestions: [
                  'Search Laptops under 60k',
                  'Gree Inverter AC Deals',
                  'Track My Order',
                  '0% EMI Facilities',
                  'Official Warranty Policy',
                  'Talk to Support Team'
                ]
              },
              created_at: new Date().toISOString()
            }
          ]);
        }
      })
      .catch(() => {
        // Fallback
      });
  }, [auth?.user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      setHasUnread(false);
    }
  }, [isOpen]);

  // Send message to server
  const sendMessage = async (textToSend = null) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage('');
    setIsLoading(true);

    // Optimistic user message
    const tempUserMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      message: text,
      type: 'text',
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch('/api/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          message: text,
          session_token: sessionToken
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data.success && data.response) {
        if (data.session_token) {
          localStorage.setItem('techland_chat_session_token', data.session_token);
          setSessionToken(data.session_token);
        }
        setMessages(prev => [...prev, data.response]);
        if (!isOpen) setHasUnread(true);
      }
    } catch (err) {
      console.error('Chatbot API error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'bot',
          message: "I'm having a brief connection issue. You can still reach our support hotline directly at 09612-888888.",
          type: 'text',
          payload: { suggestions: ['Call Hotline', 'Talk to Support Team'] },
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit human support ticket escalation
  const handleEscalateSubmit = async (e) => {
    e.preventDefault();
    if (!escalationForm.customer_name || !escalationForm.customer_phone || isSubmittingTicket) return;

    setIsSubmittingTicket(true);
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch('/api/chatbot/escalate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          session_token: sessionToken,
          customer_name: escalationForm.customer_name,
          customer_phone: escalationForm.customer_phone,
          customer_email: escalationForm.customer_email,
          inquiry_text: escalationForm.inquiry_text || 'Customer requested human support assistance from AI Chatbot.'
        })
      });

      const data = await res.json();
      if (data.success) {
        setTicketSuccess(data.ticket_number);
        // Refresh history to show confirmation message
        const histRes = await fetch(`/api/chatbot/history?session_token=${sessionToken}`);
        const histData = await histRes.json();
        if (histData.messages) setMessages(histData.messages);
      }
    } catch (err) {
      alert('Could not submit support ticket. Please call our hotline directly at 09612-888888.');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // In-chat add to cart
  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    router.post('/cart/add', { product_id: product.id, quantity: 1 }, {
      preserveScroll: true,
      onSuccess: () => {
        setAddedProductId(product.id);
        setTimeout(() => setAddedProductId(null), 1800);
      }
    });
  };

  // Clear & reset chat
  const handleResetChat = () => {
    const newToken = 'sess_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('techland_chat_session_token', newToken);
    setSessionToken(newToken);
    setTicketSuccess(null);
    setMessages([
      {
        id: 'init-new',
        sender: 'bot',
        type: 'text',
        message: "Chat session refreshed! How can I assist you now?",
        payload: {
          suggestions: [
            'Search Laptops under 60k',
            'Air Conditioner Deals',
            'Track Order',
            'EMI Facilities',
            'Talk to Support'
          ]
        },
        created_at: new Date().toISOString()
      }
    ]);
  };

  return (
    <>
      {/* 1. FLOATING CHAT TRIGGER BUTTON (Compact Circular Icon on Mobile, Pill on Desktop) */}
      <div className="fixed bottom-20 sm:bottom-6 left-3.5 sm:left-6 z-40 sm:z-50 flex items-center select-none">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-[#0084ff] hover:bg-[#0084ff] text-white rounded-full shadow-2xl hover:scale-105 transition-all duration-300 font-sans border-2 border-white/20 cursor-pointer shadow-blue-950/40 w-11 h-11 sm:w-auto sm:h-auto"
            title="Live Support & AI Assistant"
            aria-label="Open Live Support AI Assistant"
          >
            {/* Blinking Live Green Status Dot */}
            <div className="absolute -top-0.5 -right-0.5 sm:static sm:relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-emerald-400 opacity-90"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
            </div>

            {/* Icon */}
            <div className="flex items-center justify-center sm:pl-2">
              <Headphones className="w-5 h-5 sm:w-4 sm:h-4 text-amber-300 animate-pulse" />
            </div>

            {/* Text Labels (Hidden on Phone, visible on Desktop) */}
            <div className="hidden sm:flex flex-col text-left leading-tight pl-2 pr-1">
              <span className="text-[10px] text-emerald-400 font-black tracking-wider uppercase flex items-center gap-1">
                <span>LIVE SUPPORT</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              </span>
              <span className="font-bold text-xs text-white">AI Assistant</span>
            </div>

            {/* Unread badge */}
            {hasUnread && (
              <span className="absolute -top-1.5 -left-1 bg-red-600 text-white text-[10px] font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-white animate-bounce">
                1
              </span>
            )}
          </button>
        )}
      </div>

      {/* 2. CHAT MODAL / DRAWER (Opens on Bottom-Left) */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:left-6 z-50 flex flex-col w-full sm:w-[410px] h-full sm:h-[620px] max-h-[100vh] sm:max-h-[85vh] bg-white sm:rounded-2xl shadow-2xl border border-gray-200 overflow-hidden font-sans animate-in slide-in-from-bottom-left duration-200 selection:bg-blue-600 selection:text-white">
          
          {/* HEADER */}
          <div className="bg-[#0084ff] text-white p-3.5 flex items-center justify-between shadow-md select-none shrink-0">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-900 border border-blue-400/40 flex items-center justify-center relative shadow-xs">
                <Bot className="w-5 h-5 text-amber-300" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-black text-sm tracking-tight leading-tight flex items-center gap-1.5">
                  <span>TechMarket AI Assistant</span>
                  <Sparkles className="w-3 h-3 text-amber-300 fill-current" />
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/60 transition-colors"
                title="Reset Conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/60 transition-colors"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* MESSAGE STREAM FEED */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#f8fafc] text-xs leading-relaxed custom-scrollbar">
            
            {messages.map((msg, index) => {
              const isBot = msg.sender === 'bot';

              return (
                <div
                  key={msg.id || index}
                  className={`flex items-start gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {/* Bot Avatar */}
                  {isBot && (
                    <div className="w-7 h-7 rounded-full bg-[#0084ff] text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <Bot className="w-4 h-4 text-amber-300" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[85%] space-y-2`}>
                    
                    {/* Text Message */}
                    <div
                      className={`p-3 rounded-2xl shadow-xs ${
                        isBot
                          ? 'bg-white text-gray-800 border border-gray-200 rounded-tl-xs'
                          : 'bg-[#0084ff] text-white rounded-tr-xs ml-auto'
                      }`}
                    >
                      <p className="whitespace-pre-line leading-relaxed font-normal">
                        {msg.message}
                      </p>
                    </div>

                    {/* PAYLOAD TYPE 1: RICH PRODUCT CARDS */}
                    {msg.type === 'products' && msg.payload?.products && msg.payload.products.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {msg.payload.products.map((prod) => (
                          <div
                            key={prod.id}
                            className="bg-white border border-gray-200 rounded-xl p-2.5 shadow-xs hover:shadow-md transition-shadow flex items-center gap-3"
                          >
                            <img
                              src={prod.image}
                              alt={prod.title}
                              className="w-14 h-14 object-contain rounded bg-white p-1 shrink-0 border border-gray-100"
                            />
                            <div className="flex-1 min-w-0">
                              <Link
                                href={prod.url}
                                className="font-bold text-gray-900 hover:text-blue-700 line-clamp-1 block text-xs"
                                title={prod.title}
                              >
                                {prod.title}
                              </Link>
                              
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-black text-red-600 text-xs">
                                  ৳{Number(prod.price).toLocaleString()}
                                </span>
                                {prod.regular_price > prod.price && (
                                  <span className="text-[10px] text-gray-400 line-through">
                                    ৳{Number(prod.regular_price).toLocaleString()}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between mt-1.5 pt-1 border-t border-gray-100">
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  prod.in_stock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                                }`}>
                                  {prod.in_stock ? 'In Stock' : 'Out of Stock'}
                                </span>

                                {prod.in_stock && (
                                  <button
                                    onClick={(e) => handleAddToCart(e, prod)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                      addedProductId === prod.id
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-[#0084ff] hover:bg-[#0084ff] text-white'
                                    }`}
                                  >
                                    {addedProductId === prod.id ? <Check className="w-2.5 h-2.5" /> : <ShoppingCart className="w-2.5 h-2.5" />}
                                    <span>{addedProductId === prod.id ? 'Added' : 'Add'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* PAYLOAD TYPE 2: ORDER TRACKING CARD */}
                    {msg.type === 'order_status' && msg.payload && (
                      <div className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-xs space-y-2">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase font-bold">Order Number</span>
                            <span className="font-mono font-black text-xs text-gray-900">#{msg.payload.order_number}</span>
                          </div>
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider"
                            style={{ backgroundColor: msg.payload.color || '#3b82f6' }}
                          >
                            {msg.payload.status_formatted}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 pt-1">
                          <div>
                            <span className="text-gray-400 block text-[9px]">Courier:</span>
                            <span className="font-semibold">{msg.payload.courier}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px]">Tracking Code:</span>
                            <span className="font-mono font-bold text-gray-800">{msg.payload.tracking_number}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px]">Total Amount:</span>
                            <span className="font-black text-red-600">৳{Number(msg.payload.total).toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block text-[9px]">Date:</span>
                            <span>{msg.payload.created_at}</span>
                          </div>
                        </div>

                        <Link
                          href={`/track-order?order=${msg.payload.order_number}`}
                          className="w-full mt-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-center flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>View Live Tracking</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    )}

                    {/* PAYLOAD TYPE 3: IN-CHAT SUPPORT ESCALATION FORM */}
                    {msg.type === 'escalation_prompt' && (
                      <form
                        onSubmit={handleEscalateSubmit}
                        className="bg-white border border-blue-200 rounded-xl p-3.5 shadow-sm space-y-2.5 text-xs mt-1"
                      >
                        <div className="flex items-center gap-1.5 text-blue-900 font-black">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          <span>Connect with Human Support Agent</span>
                        </div>

                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="Your Full Name *"
                            required
                            value={escalationForm.customer_name}
                            onChange={(e) => setEscalationForm({ ...escalationForm, customer_name: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-gray-300 focus:outline-none focus:border-blue-600"
                          />
                          <input
                            type="tel"
                            placeholder="Mobile / WhatsApp Number *"
                            required
                            value={escalationForm.customer_phone}
                            onChange={(e) => setEscalationForm({ ...escalationForm, customer_phone: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-gray-300 focus:outline-none focus:border-blue-600"
                          />
                          <input
                            type="email"
                            placeholder="Email Address (Optional)"
                            value={escalationForm.customer_email}
                            onChange={(e) => setEscalationForm({ ...escalationForm, customer_email: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-gray-300 focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmittingTicket}
                          className="w-full py-2 bg-[#0084ff] hover:bg-[#0084ff] text-white font-bold rounded shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {isSubmittingTicket ? (
                            <span>Submitting Inquiry...</span>
                          ) : (
                            <>
                              <Send className="w-3 h-3" />
                              <span>Submit to Support Team</span>
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    {/* SUGGESTION CHIP PILLS */}
                    {isBot && msg.payload?.suggestions && msg.payload.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.payload.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => sendMessage(sug)}
                            className="px-2.5 py-1 rounded-full bg-white hover:bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-semibold transition-colors shadow-xs hover:border-blue-300"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {!isBot && (
                    <div className="w-7 h-7 rounded-full bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#0084ff] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 text-amber-300" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-xs px-3.5 py-2 shadow-xs flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* INPUT BAR */}
          <div className="p-3 bg-white border-t border-gray-200 shrink-0 space-y-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Ask about products, orders, specs, EMI..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-none focus:border-blue-600 font-medium text-gray-800 disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="p-2 rounded-xl bg-[#0084ff] hover:bg-[#0084ff] text-white font-bold transition-colors shadow-xs disabled:opacity-40 cursor-pointer"
                title="Send Message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex items-center justify-end text-[10px] text-gray-400 px-1 select-none">
              <button
                onClick={() => sendMessage('Talk to Support')}
                className="text-blue-600 hover:underline font-bold"
              >
                Human Support
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
