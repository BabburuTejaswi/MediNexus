import React from 'react';
import { AlertOctagon, PhoneCall, MapPin, X } from 'lucide-react';
import { EMERGENCY_NUMBERS } from '../utils/emergencyTriage.ts';

interface EmergencyBannerProps {
  category?: string;
  matchedText?: string;
  recommendedAction?: string;
  userRegion?: 'US_CAN' | 'INDIA' | 'UK' | 'EU' | 'AU';
  onNavigateHospitals: () => void;
  onDismiss?: () => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  category = 'Potential Medical Emergency',
  matchedText,
  recommendedAction = 'Call India National Emergency 112 immediately. For ambulance assistance, call 108 or 102 (service availability varies by state).',
  userRegion = 'INDIA',
  onNavigateHospitals,
  onDismiss,
}) => {
  const isIndia = userRegion === 'INDIA';
  const emergencyNumber = EMERGENCY_NUMBERS[userRegion] || EMERGENCY_NUMBERS.INDIA;
  const telLink = `tel:${emergencyNumber.replace(/[^0-9]/g, '')}`;

  return (
    <div className="w-full bg-red-600 text-white rounded-2xl shadow-xl border-2 border-red-700 p-5 my-4 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl shrink-0 mt-0.5">
            <AlertOctagon className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white text-red-700 text-xs font-bold uppercase tracking-wide">
              Immediate Medical Alert: {category}
            </div>
            <h3 className="text-lg md:text-xl font-bold tracking-tight">
              Please Seek Emergency Medical Assistance Immediately
            </h3>
            <p className="text-red-100 text-sm max-w-2xl leading-relaxed">
              {recommendedAction}
              {matchedText && (
                <span className="block mt-1 text-xs text-red-200 italic">
                  Triggered by symptom indication: "{matchedText}"
                </span>
              )}
            </p>
            <div className="text-xs text-red-200 mt-2 space-y-1">
              <p>
                ⚠️ MediNexus AI is purely educational and cannot provide clinical diagnosis. Emergency calls are initiated through your device upon tap and are never placed automatically. Do not delay emergency care while waiting for an AI reply.
              </p>
              {isIndia && (
                <p className="text-[11px] text-red-100/90 font-medium">
                  National emergency helpline: <strong>112</strong> (pan-India). Ambulance helpline: <strong>108</strong> or <strong>102</strong> (availability may vary by state or telecom service).
                </p>
              )}
            </div>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition"
            title="Acknowledge alert"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-red-500/60 flex flex-wrap items-center gap-3">
        <a
          href={telLink}
          className="px-5 py-2.5 bg-white text-red-700 hover:bg-red-50 rounded-xl font-bold text-sm shadow-md flex items-center gap-2 transition"
        >
          <PhoneCall className="w-4 h-4 fill-red-700" />
          Call Emergency ({emergencyNumber})
        </a>

        {isIndia && (
          <a
            href="tel:108"
            className="px-4 py-2.5 bg-red-800/90 hover:bg-red-900 text-white border border-red-400/50 rounded-xl font-bold text-sm flex items-center gap-2 transition"
          >
            <PhoneCall className="w-4 h-4 text-red-200" />
            Ambulance (108)
          </a>
        )}

        <button
          onClick={onNavigateHospitals}
          className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white border border-red-400 rounded-xl font-semibold text-sm flex items-center gap-2 transition"
        >
          <MapPin className="w-4 h-4" />
          Find Nearest Emergency Hospital
        </button>
      </div>
    </div>
  );
};
