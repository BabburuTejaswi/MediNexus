import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { authService } from '../services/authService.ts';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAcknowledged: () => void;
  onCancel?: () => void;
  isReviewMode?: boolean; // When viewed through the permanent "AI Disclaimer" link
}

export const DISCLAIMER_VERSION = 'v1.2-2026';

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({
  isOpen,
  onAcknowledged,
  onCancel,
  isReviewMode = false,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (!agreed && !isReviewMode) return;
    
    if (isReviewMode) {
      onAcknowledged();
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await authService.saveDisclaimerAck(DISCLAIMER_VERSION);
      onAcknowledged();
    } catch (err: any) {
      console.error('Error saving disclaimer acknowledgment:', err);
      setError('Unable to save acknowledgment due to a network or storage failure. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white px-6 py-5 flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-xl">
            <ShieldAlert className="w-6 h-6 text-teal-200" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Before you start chatting</h2>
            <p className="text-xs text-teal-100 mt-0.5">MediNexus Safety Guidelines & AI Transparency ({DISCLAIMER_VERSION})</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-slate-700 text-sm leading-relaxed">
          <div className="p-4 bg-teal-50/70 border border-teal-100 rounded-xl">
            <p className="font-medium text-teal-950">
              I'm your MediNexus AI Health Assistant. I can help you understand general health information and medical terminology in simple language.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              Please keep in mind:
            </h4>
            <ul className="space-y-2 pl-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                <span><strong>AI Limitations:</strong> AI-generated responses can be inaccurate, incomplete, or misleading.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                <span><strong>Not a Doctor:</strong> I am not a physician and cannot diagnose medical conditions, formulate therapeutic regimes, or replace professional medical advice.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0"></span>
                <span><strong>Consult Healthcare Providers:</strong> Always consult a qualified healthcare professional before making decisions about your health, tests, or medication dosages.</span>
              </li>
              <li className="flex items-start gap-2 text-rose-800 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-2 shrink-0"></span>
                <span><strong>Emergency Protocol:</strong> If you experience potentially life-threatening symptoms, such as severe chest pain or difficulty breathing, seek emergency medical help immediately. Do not wait for an AI response.</span>
              </li>
            </ul>
          </div>

          {/* Privacy Notice */}
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <p className="font-medium text-slate-700">Privacy & Data Handling Notice:</p>
            <p>
              Your queries are processed through encrypted server-side channels to Google Gemini models to generate educational summaries. Identifiable patient metadata is stripped prior to AI ingestion. You can clear your conversation history at any time.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Checkbox */}
          {!isReviewMode ? (
            <div className="pt-2">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-teal-200 bg-teal-50/50 hover:bg-teal-50 cursor-pointer transition select-none">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-slate-800">
                  I understand that this is an AI assistant and its responses may contain mistakes.
                </span>
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-xl text-xs text-slate-600">
              <CheckCircle className="w-4 h-4 text-teal-600" />
              <span>You previously acknowledged this disclaimer. It remains on file in your account settings.</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium"
            >
              Cancel & Exit
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={(!agreed && !isReviewMode) || saving}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
                agreed || isReviewMode
                  ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {saving ? 'Recording Consent...' : isReviewMode ? 'Close' : 'Continue to Assistant'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
