import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { getProblemData } from '@/utils/scraper';
import { chatWithSocraticTutor, analyzeCodeComplexity, getFollowUpChallenge } from '@/utils/ai';
import { Flame, X, Send, Key, User, Sparkles, Zap, Target } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(450);
  const [height, setHeight] = useState(600); // 1. NEW HEIGHT STATE
  
  // We now track direction: 'x' (width), 'y' (height), or 'xy' (corner)
  const [resizeDir, setResizeDir] = useState<null | 'x' | 'y' | 'xy'>(null);
  
  const [apiKey, setApiKey] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "I discuss **concepts**, not code. Ask me a question, and I will guide you to the answer ideologically." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.code === 'KeyL' || e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  // 2. UNIVERSAL RESIZE LOGIC
  const startResizing = useCallback((dir: 'x' | 'y' | 'xy') => (e: React.MouseEvent) => {
    e.preventDefault();
    setResizeDir(dir);
  }, []);

  const stopResizing = useCallback(() => {
    setResizeDir(null);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (!resizeDir) return;

    requestAnimationFrame(() => {
      // Horizontal (Left Handle)
      if (resizeDir === 'x' || resizeDir === 'xy') {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth > 300 && newWidth < window.innerWidth - 50) setWidth(newWidth);
      }
      // Vertical (Top Handle)
      if (resizeDir === 'y' || resizeDir === 'xy') {
        // Height = Screen Height - Mouse Y Position - Bottom Margin (16px)
        const newHeight = window.innerHeight - e.clientY - 16;
        if (newHeight > 300 && newHeight < window.innerHeight - 50) setHeight(newHeight);
      }
    });
  }, [resizeDir]);

  useEffect(() => {
    if (resizeDir) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [resizeDir, resize, stopResizing]);


  const handleAction = async (actionType: 'complexity' | 'followup' | 'chat', userText: string = input) => {
    if (!apiKey) {
      alert("Please enter your API Key first.");
      return;
    }
    
    let displayUserText = userText;
    if (actionType === 'complexity') displayUserText = "Check Complexity";
    if (actionType === 'followup') displayUserText = "Follow Up?";

    const newMessages = [...messages, { role: 'user', text: displayUserText } as Message];
    setMessages(newMessages);
    if (actionType === 'chat') setInput('');
    setLoading(true);

    try {
      const problemData = getProblemData();
      let response = "";

      if (actionType === 'complexity') {
        response = await analyzeCodeComplexity(apiKey, problemData.code);
      } else if (actionType === 'followup') {
        response = await getFollowUpChallenge(apiKey, problemData);
      } else {
        const historyForAI = newMessages.slice(1);
        response = await chatWithSocraticTutor(apiKey, problemData, historyForAI, userText);
      }

      setMessages([...newMessages, { role: 'ai', text: response }]);
    } catch (error: any) {
      setMessages([...newMessages, { role: 'ai', text: "Error: " + error.message }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-[9999] group flex items-center gap-2 pr-6 pl-2 py-2 bg-zinc-900 text-white rounded-full shadow-2xl border border-zinc-800 hover:border-orange-500/50 transition-all hover:scale-105"
      >
        <div className="w-10 h-10 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:animate-pulse">
          <Flame size={20} className="text-white fill-white" />
        </div>
        <span className="font-bold text-sm tracking-wide">LitCode</span>
        <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700">Alt+L</span>
      </button>
    );
  }

  return (
    <div 
      style={{ 
        width: `${width}px`,
        height: `${height}px`, // Apply dynamic height
        transition: resizeDir ? 'none' : 'width 0.2s ease-out, height 0.2s ease-out' 
      }}
      // Removed 'top-4' class so height is manual
      className="fixed right-4 bottom-4 bg-zinc-950 text-zinc-100 shadow-2xl z-[10000] rounded-2xl border border-zinc-800 flex flex-col font-sans overflow-hidden animate-fade-in"
    >
      
      {/* --- RESIZE HANDLES --- */}

      {/* 1. Width Handle (Left) */}
      <div 
        onMouseDown={startResizing('x')}
        className="absolute top-0 bottom-0 left-0 w-3 cursor-ew-resize hover:bg-orange-500/10 transition-colors z-50 group touch-none flex items-center justify-center"
      >
        <div className="h-8 w-1 rounded-full bg-zinc-700 group-hover:bg-orange-500 transition-colors" />
      </div>

      {/* 2. Height Handle (Top) */}
      <div 
        onMouseDown={startResizing('y')}
        className="absolute top-0 left-0 right-0 h-3 cursor-ns-resize hover:bg-orange-500/10 transition-colors z-50 group touch-none flex items-center justify-center"
      >
        <div className="w-8 h-1 rounded-full bg-zinc-700 group-hover:bg-orange-500 transition-colors" />
      </div>

      {/* 3. Corner Handle (Top-Left) */}
      <div
        onMouseDown={startResizing('xy')}
        className="absolute top-0 left-0 w-6 h-6 z-[60] cursor-nwse-resize hover:bg-orange-500/20 rounded-br-full transition-colors"
      />


      {/* --- MAIN CONTENT --- */}

      {/* Header */}
      <div className="p-4 pl-6 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 flex justify-between items-center select-none pt-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-orange-500/20 shadow-lg">
            <Flame size={18} className="text-white fill-white/20" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-wide">LitCode</h2>
            <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Socratic Assistant</p>
          </div>
        </div>
        <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* API Key Section */}
      <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Key size={14} className="text-orange-500 shrink-0" />
          <input 
            type="password" 
            placeholder="Enter Gemini API Key"
            className="bg-transparent outline-none text-xs w-full text-zinc-300 placeholder-zinc-600 focus:text-white transition-all"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        {/* Security Disclaimer */}
        <p className="text-[10px] text-zinc-500 leading-tight ml-6">
          Your key is stored locally on your device and never sent to our servers.
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-zinc-950">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${msg.role === 'user' ? 'bg-zinc-800 border-zinc-700' : 'bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20'}`}>
              {msg.role === 'user' ? <User size={14} className="text-zinc-400" /> : <Flame size={14} className="text-orange-500" />}
            </div>
            <div className={`p-3 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-sm ${
              msg.role === 'user' 
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700 rounded-tr-none' 
                : 'bg-zinc-900/80 text-zinc-300 border border-zinc-800/50 rounded-tl-none'
            }`}>
              <div className="markdown-content">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({node, inline, className, children, ...props}: any) {
                      const match = /language-(\w+)/.exec(className || '')
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 animate-pulse">
             <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Sparkles size={14} className="text-orange-500" />
            </div>
            <div className="text-xs text-zinc-500 flex items-center">Analysing logic...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Buttons */}
      <div className="px-4 py-3 bg-zinc-900/50 border-t border-zinc-800 grid grid-cols-2 gap-3">
        <button onClick={() => handleAction('followup')} className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-lg border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all">
          <Target size={14} />
          Follow Up
        </button>
        <button onClick={() => handleAction('complexity')} className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500/10 text-green-400 text-xs font-medium rounded-lg border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 transition-all">
          <Zap size={14} />
          Analyze Complexity
        </button>
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800">
        <div className="relative flex items-center">
          <input 
            className="w-full bg-zinc-950 border border-zinc-700 text-zinc-200 text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-all placeholder-zinc-600"
            placeholder="Ask a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAction('chat')}
          />
          <button 
            onClick={() => handleAction('chat')}
            disabled={loading || !input.trim()}
            className="absolute right-2 p-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}