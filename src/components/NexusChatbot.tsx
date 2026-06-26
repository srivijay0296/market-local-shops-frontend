import { useState, useRef, useEffect } from "react";
import { backendApi } from '../lib/api/client';
import { 
  MessageSquare, Send, X, Bot, User, Zap, ShoppingBag, MapPin, ArrowRight 
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  results?: {
    products?: any[];
    shops?: any[];
  };
  loading?: boolean;
}

export default function NexusChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'bot', 
      content: "Namaste! I'm your Namma Market Assistant. How can I help you explore local shops today? Try asking 'Find sarees under ₹2000' or 'Shops in Bargur'." 
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const parseQuery = (text: string) => {
    const lowercase = text.toLowerCase();
    let priceLimit = null;
    let category = null;
    let location = null;

    const priceMatch = lowercase.match(/(?:under|below|<|₹)\s*(\d+)/) || lowercase.match(/(\d+)\s*(?:under|below)/);
    if (priceMatch) priceLimit = parseInt(priceMatch[1]);

    const categories = ['saree', 'textile', 'cotton', 'shirt', 'dress', 'fabric', 'silk'];
    category = categories.find(c => lowercase.includes(c));

    const locations = ['bargur', 'chennai', 'salem', 'erode', 'tirupur'];
    location = locations.find(l => lowercase.includes(l));

    return { priceLimit, category, location, raw: text };
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");

    const botMsgId = (Date.now() + 1).toString();
    const botLoadingMsg: Message = { 
      id: botMsgId, 
      role: 'bot', 
      content: "Scanning Namma Market network...", 
      loading: true 
    };
    setMessages(prev => [...prev, botLoadingMsg]);

    const params = parseQuery(input);
    
    try {
      let productResults: any[] = [];
      let shopResults: any[] = [];

      const pParams = new URLSearchParams();
      if (params.category) pParams.append('category', params.category);
      if (params.priceLimit) pParams.append('maxPrice', params.priceLimit.toString());
      pParams.append('limit', '3');
      
      const { data: pData } = await backendApi.get(`/products?${pParams.toString()}`);
      productResults = pData || [];

      const sParams = new URLSearchParams();
      if (params.location) sParams.append('location', params.location);
      if (params.category) sParams.append('category', params.category);
      sParams.append('limit', '3');
      
      const { data: sData } = await backendApi.get(`/shops?${sParams.toString()}`);
      shopResults = sData || [];

      let responseContent = "";
      if (productResults.length === 0 && shopResults.length === 0) {
        responseContent = "I couldn't find exactly what you're looking for. Can you try different keywords?";
      } else {
        responseContent = `I found some matches for you! Tap to explore:`;
      }

      setMessages(prev => prev.map(m => m.id === botMsgId ? {
        ...m,
        content: responseContent,
        loading: false,
        results: { products: productResults, shops: shopResults }
      } : m));

    } catch (err) {
      setMessages(prev => prev.map(m => m.id === botMsgId ? {
        ...m,
        content: "I'm having trouble connecting to the marketplace core. Please try again in a moment.",
        loading: false
      } : m));
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#2a4f5f] text-white rounded-[2rem] shadow-2xl z-[100] flex items-center justify-center group"
      >
        <div className="absolute inset-0 bg-white/20 rounded-[2rem] animate-ping opacity-0 group-hover:opacity-40" />
        <MessageSquare className="w-8 h-8" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100, x: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100, x: 100 }}
            className="fixed bottom-6 right-6 w-full max-w-[400px] h-[600px] bg-white rounded-[3rem] shadow-2xl z-[110] flex flex-col overflow-hidden border border-slate-100"
          >
            <div className="p-6 bg-[#2a4f5f] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Bot className="w-6 h-6 text-[#ffe11b]" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-widest italic">Nexus Assistant</h3>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scrollbar-hide">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm
                      ${m.role === 'bot' ? 'bg-[#2a4f5f] text-white' : 'bg-white text-[#2a4f5f]'}`}>
                      {m.role === 'bot' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className="space-y-2">
                       <div className={`p-4 rounded-[1.5rem] shadow-sm text-sm font-medium leading-relaxed
                        ${m.role === 'bot' ? 'bg-white text-slate-700 rounded-tl-none' : 'bg-[#2a4f5f] text-white rounded-tr-none'}`}>
                        {m.loading ? (
                          <div className="flex gap-1.5">
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
                          </div>
                        ) : m.content}
                      </div>

                      {!m.loading && m.results && (
                        <div className="space-y-3 pt-2">
                           {m.results.products?.map((p: any) => (
                             <Link 
                                key={p.id}
                                to={`/product/${p.id}`}
                                className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-slate-100 hover:border-[#2a4f5f] transition hover:shadow-lg group"
                             >
                               <img src={p.image_url} className="w-12 h-12 rounded-xl object-cover" />
                               <div className="flex-1 min-w-0">
                                 <p className="text-[10px] font-black uppercase text-slate-800 truncate">{p.name}</p>
                                 <p className="text-[10px] font-bold text-blue-600">₹{p.price}</p>
                               </div>
                               <Zap className="w-4 h-4 text-amber-500 opacity-0 group-hover:opacity-100 transition" />
                             </Link>
                           ))}

                           {m.results.shops?.map((s: any) => (
                             <Link 
                                key={s.id}
                                to={`/seller/${s.id}`}
                                className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 hover:border-indigo-400 transition hover:shadow-lg group"
                             >
                               <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600">
                                 <ShoppingBag className="w-5 h-5" />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <p className="text-[10px] font-black uppercase text-indigo-900 truncate">{s.name}</p>
                                 <p className="text-[9px] font-bold text-indigo-400 flex items-center gap-1">
                                   <MapPin className="w-2.5 h-2.5" /> {s.location}
                                 </p>
                               </div>
                               <ArrowRight className="w-4 h-4 text-indigo-300 group-hover:text-indigo-600" />
                             </Link>
                           ))}
                        </div>
                       )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Nexus anything..."
                className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-[#2a4f5f]/10"
              />
              <button 
                type="submit"
                className="w-12 h-12 bg-[#2a4f5f] text-white rounded-2xl shadow-xl shadow-[#2a4f5f]/20 flex items-center justify-center hover:scale-105 active:scale-95 transition"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
