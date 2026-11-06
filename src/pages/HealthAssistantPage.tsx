import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Shield,
  Trash2,
  RefreshCw,
  AlertTriangle,
  FileQuestion,
  PhoneCall,
  MapPin,
  Info
} from 'lucide-react';
import { UserProfile, ChatMessage } from '../types/index.ts';
import { storageService } from '../services/storageService.ts';
import { sendChatMessage } from '../services/geminiService.ts';
import { evaluateEmergencySymptoms, EmergencyCheckResult } from '../utils/emergencyTriage.ts';
import { EmergencyBanner } from '../components/EmergencyBanner.tsx';
import { DisclaimerModal, DISCLAIMER_VERSION } from '../components/DisclaimerModal.tsx';

interface HealthAssistantPageProps {
  currentUser: UserProfile;
  onNavigateHospitals: () => void;
  onOpenDisclaimerReview: () => void;
}

export const HealthAssistantPage: React.FC<HealthAssistantPageProps> = ({
  currentUser,
  onNavigateHospitals,
  onOpenDisclaimerReview,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  
  // Emergency alert state
  const [activeEmergency, setActiveEmergency] = useState<EmergencyCheckResult | null>(null);

  // First chat disclaimer requirement
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if user has acknowledged the latest disclaimer
    const ack = currentUser.disclaimerAck;
    if (!ack || !ack.acknowledged || ack.version !== DISCLAIMER_VERSION) {
      setShowDisclaimerModal(true);
    }

    // Load existing messages with duplicate protection
    const stored = storageService.getChatMessages(currentUser.uid);
    const seen = new Set<string>();
    const unique = stored.filter((m) => {
      if (!m || !m.id || seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    setMessages(unique);
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (queryText?: string, isRetry = false) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || loading) return;

    // Check if disclaimer is needed first
    const ack = currentUser.disclaimerAck;
    if (!ack || !ack.acknowledged || ack.version !== DISCLAIMER_VERSION) {
      setShowDisclaimerModal(true);
      return;
    }

    const cleanInput = textToSend.trim();
    if (!isRetry) {
      setInputText('');
    }
    setError(null);
    setLastFailedQuery(cleanInput);

    // 1. DETERMINISTIC EMERGENCY CHECK (Runs immediately, independent of AI network request)
    const triageResult = evaluateEmergencySymptoms(cleanInput);
    if (triageResult.isEmergency) {
      setActiveEmergency(triageResult);
    }

    // 2. Save user message to persistent storage (only if not a retry)
    if (!isRetry) {
      const userMsg = storageService.addChatMessage(currentUser.uid, {
        role: 'user',
        content: cleanInput,
        isEmergencyAlert: triageResult.isEmergency,
        emergencyCategory: triageResult.triggerCategory,
      });
      setMessages((prev) => {
        if (prev.some((m) => m.id === userMsg.id)) return prev;
        return [...prev, userMsg];
      });
    }

    // 3. Dispatch to Gemini Backend Endpoint
    setLoading(true);
    try {
      // Build conversation history for context
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));
      if (!isRetry) {
        historyPayload.push({ role: 'user', content: cleanInput });
      }

      const response = await sendChatMessage(historyPayload, cleanInput);

      // Save assistant response
      const assistantMsg = storageService.addChatMessage(currentUser.uid, {
        role: 'assistant',
        content: response.reply,
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === assistantMsg.id)) return prev;
        return [...prev, assistantMsg];
      });
      setLastFailedQuery(null);
    } catch (err: any) {
      console.error('Error fetching AI health assistant reply:', err);
      setError(
        err.message || 'The AI assistant is temporarily unavailable. Please click Retry in a few seconds.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (lastFailedQuery) {
      handleSendMessage(lastFailedQuery, true);
    } else if (messages.length > 0) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        handleSendMessage(lastUserMsg.content, true);
      }
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      storageService.clearChatMessages(currentUser.uid);
      setMessages([]);
      setActiveEmergency(null);
    }
  };

  const starterPrompts = [
    'What is the difference between LDL and HDL cholesterol?',
    'Explain what fasting blood glucose measures in simple terms.',
    'What questions should I ask my doctor about slightly elevated blood pressure?',
    'What does an elevated erythrocyte sedimentation rate (ESR) usually mean?',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Disclaimer Modal (Blocks first chat until acknowledged) */}
      <DisclaimerModal
        isOpen={showDisclaimerModal}
        onAcknowledged={() => setShowDisclaimerModal(false)}
      />

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>MediNexus AI Health Assistant</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Gemini AI (Online)
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              Plain-language health education & medical terminology clarification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={onOpenDisclaimerReview}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs text-slate-600 font-medium flex items-center gap-1.5 transition"
            title="Read full AI safety disclaimer"
          >
            <Shield className="w-3.5 h-3.5 text-teal-600" />
            <span>AI Disclaimer</span>
          </button>

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-xs text-slate-600 font-medium flex items-center gap-1.5 transition"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Deterministic Emergency Alert Banner */}
      {activeEmergency && (
        <EmergencyBanner
          category={activeEmergency.triggerCategory}
          matchedText={activeEmergency.matchedPhrase}
          recommendedAction={activeEmergency.recommendedAction}
          userRegion={currentUser.emergencyRegion}
          onNavigateHospitals={onNavigateHospitals}
          onDismiss={() => setActiveEmergency(null)}
        />
      )}

      {/* Chat Messages Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col h-[580px] overflow-hidden">
        
        {/* Messages List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Bot className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="font-bold text-slate-900 text-base">How can I assist your health literacy today?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Ask questions about medical terms, lab biomarkers, nutrition concepts, or general wellness.
                </p>
              </div>

              {/* Starter Prompt Badges */}
              <div className="w-full max-w-lg space-y-2 pt-2 text-left">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">
                  Suggested inquiries
                </p>
                {starterPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="w-full p-2.5 bg-slate-50 hover:bg-teal-50/70 border border-slate-200 hover:border-teal-200 rounded-xl text-xs text-slate-700 font-medium flex items-center gap-2 transition text-left"
                  >
                    <FileQuestion className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m, idx) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={`${m.id || 'msg'}-${idx}`}
                    className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-900 text-teal-300'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-2xs ${
                        isUser
                          ? 'bg-teal-600 text-white rounded-tr-none'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                      }`}
                    >
                      {m.isEmergencyAlert && isUser && (
                        <div className="mb-2 p-2 bg-red-800/80 rounded-lg text-xs font-bold flex items-center gap-1.5 text-white">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Emergency Protocol Activated</span>
                        </div>
                      )}
                      
                      <div className="whitespace-pre-wrap">{m.content}</div>

                      <div
                        className={`mt-2 text-[10px] flex items-center justify-between ${
                          isUser ? 'text-teal-100' : 'text-slate-400'
                        }`}
                      >
                        <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {!isUser && (
                          <span className="text-[9px] font-medium text-slate-400">
                            Educational only • Not a diagnosis
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-teal-300 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-4 text-xs text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-teal-600" />
                    <span>Analyzing clinical concepts with Gemini AI...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={handleRetry}
                    disabled={loading}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 self-end sm:self-auto shadow-2xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Retry Request</span>
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}

        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask about symptoms, lab results, medications, or health guidelines..."
              disabled={loading}
              className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="px-5 py-3 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <div className="mt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>
              MediNexus AI Assistant does not provide clinical diagnosis. In emergencies, call India National Emergency 112 (or ambulance 108/102) immediately. Calls are not placed automatically.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
