import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { Bot, Send, X, Sparkles, Trash2, Maximize2, Minimize2 } from "lucide-react";

// A luxurious formatter component to beautifully render Haiasi AI's responses
function FormattedMessage({ text }: { text: string }) {
  const lines = (text || "").split("\n");

  const parseInlineStyles = (str: string) => {
    // Splits on markdown bold (**text**) and italic (*text*)
    const parts = (str || "").split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={index} className="text-neutral-950 font-black bg-amber-500/10 border-b border-amber-500/25 px-1 py-0.5 rounded-sm">
            {part.slice(2, -2)}
          </strong>
        );
      } else if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <em key={index} className="text-neutral-900 font-serif font-semibold italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-3.5 text-neutral-850 text-[13px] leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Horizontal Line Divider
        if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
          return <div key={idx} className="my-4 border-t border-dashed border-amber-500/30" />;
        }

        // Heading lines starting with #s or enclosed in bold (e.g., **Heading**)
        if (trimmed.startsWith("###")) {
          const clean = trimmed.replace(/^###\s*/, "");
          return (
            <h4 key={idx} className="text-xs font-serif font-black text-neutral-950 tracking-wider mt-4 mb-2 first:mt-0 flex items-center gap-1.5 border-b-2 border-amber-500/15 pb-1 uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              {parseInlineStyles(clean)}
            </h4>
          );
        }
        if (trimmed.startsWith("####") || trimmed.startsWith("##") || trimmed.startsWith("#")) {
          const clean = trimmed.replace(/^#+\s*/, "");
          return (
            <h4 key={idx} className="text-xs font-serif font-black text-neutral-950 tracking-wider mt-4 mb-2 first:mt-0 flex items-center gap-1.5 border-b border-amber-500/10 pb-0.5 uppercase">
              <Sparkles className="w-3 h-3 text-amber-500 shrink-0 animate-pulse" />
              {parseInlineStyles(clean)}
            </h4>
          );
        }

        // Bullet points
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ") || trimmed.startsWith("• ")) {
          const clean = trimmed.replace(/^[\*\-•]\s*/, "");
          return (
            <div key={idx} className="flex items-start gap-2.5 my-2 pl-1 leading-relaxed">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full shrink-0 mt-1.5 shadow shadow-amber-500/60" />
              <div className="flex-1 text-[12.5px] font-medium text-neutral-800">
                {parseInlineStyles(clean)}
              </div>
            </div>
          );
        }

        // Numbered list items
        const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numMatch) {
          const num = numMatch[1];
          const content = numMatch[2];
          return (
            <div key={idx} className="flex items-start gap-2.5 my-2.5 pl-1 leading-relaxed">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[10px] font-mono font-black shrink-0 mt-0.5">
                {num}
              </span>
              <div className="flex-1 pt-0.5 text-[12.5px] font-medium text-neutral-800">
                {parseInlineStyles(content)}
              </div>
            </div>
          );
        }

        // Blockquotes
        if (trimmed.startsWith(">")) {
          const clean = trimmed.replace(/^>\s*/, "");
          return (
            <blockquote key={idx} className="pl-3.5 border-l-2 border-amber-500 bg-amber-500/5 py-1.5 px-2.5 rounded-r-xl my-2 text-xs text-neutral-700 italic font-medium leading-relaxed">
              {parseInlineStyles(clean)}
            </blockquote>
          );
        }

        // Default: Regular text block
        return (
          <p key={idx} className="text-neutral-700 font-medium text-[13px] leading-relaxed pl-1 my-1">
            {parseInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

interface HaiasiChatbotProps {
  onLogActivity: (activity: string, type: 'login' | 'cart_addition' | 'purchase' | 'product_view' | 'inquiry' | 'admin_action' | 'user_action') => void;
  username: string;
}

export default function HaiasiChatbot({ onLogActivity, username }: HaiasiChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-1",
      sender: "bot",
      text: "Hello! I am 'Haiasi', your personal AI fashion expert. I can provide tailoring suggestions, sizing guides, help you choose fabrics, and recommend the best designs from Ella's Store catalog! How can I style you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const handleClearChat = () => {
    setMessages([
      {
        id: "init-1",
        sender: "bot",
        text: "Hello! I am 'Haiasi', your personal AI fashion expert. I can provide tailoring suggestions, sizing guides, help you choose fabrics, and recommend the best designs from Ella's Store catalog! How can I style you today?"
      }
    ]);
    onLogActivity("Cleared chat history with Haiasi AI", "user_action");
  };

  const suggestionChips = [
    { label: "Trending African Styles", prompt: "What are currently the top trending styles in Accra?" },
    { label: "Wedding Guest Outfit Help", prompt: "I need help choosing a stylish outfit to wear to an traditional wedding. What do you recommend?" },
    { label: "How to Measure Myself?", prompt: "Could you give me a simple step-by-step guide on how to measure my body for clothing?" },
    { label: "Best Fabric Care", prompt: "How should I wash and care for premium wax prints (Ankara) or Lace fabrics?" }
  ];

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      onLogActivity("Opened Haiasi Chatbot", "user_action");
    }
  };

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: trimmed
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    onLogActivity(`Asked AI Fashion Assistant: "${trimmed.substring(0, 40)}..."`, "user_action");

    try {
      // Pass the previous chat history to server (excluding system instructions or initial chatbot messages)
      const previousHistory = messages.filter(m => !m.id.startsWith("init")).map(m => ({
        sender: m.sender,
        text: m.text
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: previousHistory
        })
      });

      const data = await res.json();

      setIsTyping(false);

      if (res.ok && data.text) {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}-bot`,
          sender: 'bot',
          text: data.text
        }]);
      } else {
        throw new Error(data.error || "Failed to fetch response");
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-bot`,
        sender: 'bot',
        text: "I'm having a bit of trouble connecting to our tailoring database right now. Please try again in a moment, or visit Ella's Store in Ashaiman for direct consultation!"
      }]);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-40" id="haiasi-chatbot">
      {/* Floating Chat Trigger */}
      <button
        onClick={handleToggle}
        className="w-14 h-14 bg-neutral-900 text-white border-2 border-amber-500 rounded-full flex items-center justify-center shadow-lg hover:bg-neutral-800 transition-all duration-300 hover:scale-110 active:scale-95 group relative"
      >
        <Bot className="w-6 h-6 text-amber-500 group-hover:rotate-12 transition-transform" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-500/20 flex flex-col animate-in fade-in duration-300 ${isMaximized ? "inset-4" : "bottom-18 left-0 w-[360px] md:w-[400px] h-[520px] absolute"}`}>
          
          {/* Header */}
          <header className="bg-neutral-900 text-white p-4 flex justify-between items-center border-b-2 border-amber-500">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-neutral-900 font-bold text-sm shadow-md">
                H
              </div>
              <div>
                <h3 className="font-serif text-sm tracking-wider flex items-center gap-1">
                  Haiasi Assistant
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </h3>
                <span className="text-[10px] text-amber-500 font-mono">Real-time Gemini AI</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsMaximized(!isMaximized)}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg cursor-pointer"
                title={isMaximized ? "Minimize" : "Maximize"}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              {messages.length > 1 && (
                <button 
                  onClick={handleClearChat} 
                  className="text-gray-400 hover:text-red-400 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Delete Chat History"
                  id="delete-chat-btn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => { setIsOpen(false); setIsMaximized(false); }} className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg cursor-pointer" title="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Messages Display */}
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-50/50 space-y-4 flex flex-col">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm border ${
                  msg.sender === 'user'
                    ? 'bg-amber-500 text-neutral-900 font-medium self-end rounded-br-none border-amber-400/40 shadow-amber-500/10'
                    : 'bg-white text-neutral-800 self-start rounded-bl-none border-neutral-100'
                }`}
              >
                {msg.sender === 'user' ? (
                  <div className="whitespace-pre-line font-medium text-neutral-900">
                    {msg.text}
                  </div>
                ) : (
                  <FormattedMessage text={msg.text} />
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="bg-white border border-neutral-150 rounded-2xl rounded-bl-none px-4 py-3 self-start shadow-sm text-xs text-neutral-500 flex items-center gap-2">
                <span>Haiasi is styling...</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-neutral-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Sizing & Slogans suggestions */}
          <div className="px-4 py-2 bg-white border-t border-neutral-100 flex gap-2 overflow-x-auto scrollbar-none whitespace-nowrap scroll-smooth">
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip.prompt)}
                className="bg-neutral-100 text-neutral-700 hover:bg-amber-500 hover:text-neutral-900 px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-200 transition-colors cursor-pointer shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Chat Inputs */}
          <div className="p-3 border-t border-neutral-100 bg-white flex flex-col gap-2.5">
            <div className="flex gap-2.5">
              {messages.length > 1 && (
                <button 
                  onClick={handleClearChat} 
                  className="w-10 h-10 border border-neutral-200 text-neutral-500 hover:text-red-500 hover:bg-red-50 hover:border-red-200 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm cursor-pointer shrink-0"
                  title="Delete Chat History"
                  id="delete-chat-bottom-btn"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(input)}
                placeholder="Ask me styling, fabrics or design advice..."
                className="flex-1 px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-full text-[13px] focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-medium"
              />
              <button
                onClick={() => handleSend(input)}
                className="w-10 h-10 bg-amber-500 text-neutral-900 rounded-full flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-all duration-300 shadow shrink-0 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => { setIsOpen(false); setIsMaximized(false); }}
              className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer text-center"
            >
              Close & Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
