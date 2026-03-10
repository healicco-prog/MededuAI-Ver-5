"use client";

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, AlertCircle, Lock, Coins, Volume2, VolumeX, Mic, Square, Loader2 } from 'lucide-react';
import { useUserStore } from '../../../../store/userStore';
import { tokenService } from '../../../../lib/tokenService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIMentorPage() {
  const currentUser = useUserStore(state => state.users[0]);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([
    { role: 'ai', content: 'Hello! I am your MedEduAI Mentor. How can I help you with your medical studies today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const recognitionRef = useRef<any>(null);

  const tokenCheck = currentUser ? tokenService.checkAvailability(currentUser.id, 'AI Mentor') : { allowed: false, required: 0, remaining: 0 };

  useEffect(() => {
      setMounted(true);
      if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
          const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
          recognitionRef.current = new SpeechRecognition();
          recognitionRef.current.continuous = true;
          recognitionRef.current.interimResults = true;

          recognitionRef.current.onresult = (event: any) => {
              let currentTranscript = '';
              for (let i = event.resultIndex; i < event.results.length; ++i) {
                  currentTranscript += event.results[i][0].transcript;
              }
              setInput(currentTranscript);
          };

          recognitionRef.current.onerror = (event: any) => {
              console.error("Speech recognition error", event.error);
              setIsListening(false);
          };
      }
  }, []);

  const handleToggleListening = () => {
      if (isListening) {
          recognitionRef.current?.stop();
          setIsListening(false);
      } else {
          setInput('');
          recognitionRef.current?.start();
          setIsListening(true);
      }
  };

  const playAudio = (text: string) => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(text.replace(/[*#]/g, ''));
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
          if (preferredVoice) utterance.voice = preferredVoice;

          utterance.onstart = () => setIsPlayingAudio(true);
          utterance.onend = () => setIsPlayingAudio(false);
          utterance.onerror = () => setIsPlayingAudio(false);

          window.speechSynthesis.speak(utterance);
      }
  };

  const stopAudio = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          setIsPlayingAudio(false);
      }
  };

  const handleSend = async () => {
    if ((!input.trim() && !isListening) || !tokenCheck.allowed) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const userInput = input;
    const newMessages = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages as any);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/mentor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      
      if (currentUser) {
        tokenService.processTransaction(currentUser.id, 'AI Mentor', 'gemini-2.5-flash');
      }

      const aiText = data.response;
      setMessages(prev => [...prev, { role: 'ai', content: aiText }]);
      playAudio(aiText);
    } catch(err) {
      setMessages(prev => [...prev, { role: 'ai', content: "Failed to fetch response. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">MedEduAI Mentor</h2>
          <p className="text-slate-500">24/7 AI-powered medical study companion.</p>
        </div>
        <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${!mounted ? 'bg-slate-50 border-slate-100 text-slate-400' : tokenCheck.allowed ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'}`}>
          <Coins className={`w-5 h-5 ${!mounted ? 'text-slate-400' : tokenCheck.allowed ? 'text-emerald-600' : 'text-red-600'}`} />
          <span className="font-bold">
            {!mounted ? 'Loading Tokens...' : tokenCheck.allowed ? `${tokenCheck.remaining} Tokens Available (Cost: ${tokenCheck.required})` : 'Insufficient Tokens'}
          </span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 relative group ${msg.role === 'user'
                ? 'bg-emerald-600 text-white rounded-br-sm'
                : 'bg-slate-50 text-slate-700 border border-slate-200 rounded-bl-sm prose prose-sm prose-slate max-w-none'
                }`}>
                {msg.role === 'user' ? msg.content : <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>}
                
                {msg.role === 'ai' && (
                    <button 
                       onClick={() => playAudio(msg.content)} 
                       className="absolute -right-12 bottom-0 p-2 text-slate-400 hover:text-emerald-600 bg-white border border-slate-200 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                       title="Read aloud"
                    >
                        <Volume2 className="w-5 h-5" />
                    </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
             <div className="flex justify-start">
               <div className="bg-slate-50 text-slate-500 border border-slate-200 rounded-2xl p-4 italic text-sm flex items-center gap-2 shadow-sm rounded-bl-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" /> AI Mentor is thinking...
               </div>
             </div>
          )}

          {isPlayingAudio && (
              <div className="flex justify-center sticky bottom-2 z-10 animate-in fade-in zoom-in duration-300">
                  <button 
                      onClick={stopAudio}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all text-sm border border-slate-700"
                  >
                      <VolumeX className="w-4 h-4" /> Stop Audio
                  </button>
              </div>
          )}

          {mounted && !tokenCheck.allowed && (
            <div className="flex justify-center mt-8 p-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center max-w-md w-full shadow-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="font-bold text-amber-900 mb-2">Token Limit Reached</h3>
                <p className="text-sm text-amber-700/80 mb-4">You have exhausted your available tokens. AI processing costs {tokenCheck.required} tokens per query.</p>
                <button className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl hover:bg-emerald-600 transition-colors w-full shadow-lg">
                  Purchase Token Pack
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <div className="flex items-end gap-2 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={!mounted ? "Loading..." : tokenCheck.allowed ? (isListening ? "Listening... Speak now..." : "Ask a medical question...") : "Tokens exhausted..."}
              className={`flex-1 resize-none h-14 rounded-xl border p-4 pr-16 outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition-colors ${isListening ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200'}`}
              disabled={!mounted || !tokenCheck.allowed}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
            />
            
            <button
                onClick={handleToggleListening}
                disabled={!tokenCheck.allowed}
                className={`absolute right-[4.5rem] bottom-2 w-10 h-10 rounded-lg flex items-center justify-center transition-all ${isListening ? 'bg-red-100 text-red-600 hover:bg-red-200 scale-105' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                title={isListening ? "Stop Listening" : "Start Voice Input"}
            >
                {isListening ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
            </button>

            <button
              onClick={handleSend}
              disabled={!mounted || (!input.trim() && !isListening) || !tokenCheck.allowed || loading}
              className="w-14 h-14 bg-emerald-600 text-white rounded-xl flex items-center justify-center hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-sm relative overflow-hidden group"
            >
              <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
