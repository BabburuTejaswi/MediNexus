/**
 * MediNexus Deterministic Emergency Triage & Symptom Evaluation Engine
 * 
 * Evaluates user input against acute life-threatening emergency triggers.
 * Handles negation (e.g. "no chest pain", "I don't have shortness of breath")
 * and historical/hypothetical queries (e.g. "I had surgery 3 years ago", "What causes strokes?").
 */

export interface EmergencyCheckResult {
  isEmergency: boolean;
  triggerCategory?: string;
  matchedPhrase?: string;
  recommendedAction?: string;
  severity: 'CRITICAL' | 'NORMAL';
}

export const EMERGENCY_NUMBERS = {
  INDIA: '112',
  US_CAN: '911',
  UK: '999',
  EU: '112',
  AU: '000',
};

export const AMBULANCE_NUMBERS_INDIA = {
  PRIMARY: '112', // Unified national emergency helpline across India
  AMBULANCE_EMERGENCY: '108', // Emergency medical / ambulance service (varies by state)
  AMBULANCE_REFERRAL: '102', // Free transport / referral ambulance (varies by state)
};

// Patterns representing acute emergency complaints
const ACUTE_EMERGENCY_PATTERNS: { category: string; regex: RegExp; action: string }[] = [
  {
    category: 'Cardiovascular / Heart Attack',
    regex: /\b(crushing\s+(chest\s+pain|chest\s+pressure)|chest\s+pain\s+radiating|heart\s+attack\s+symptoms|severe\s+chest\s+(pain|tightness|pressure)|pain\s+in\s+my\s+chest\s+and\s+(arm|jaw|neck))\b/i,
    action: 'Immediately call India National Emergency 112. For state ambulance, call 108 or 102 (availability varies by state). Seek immediate cardiology evaluation.',
  },
  {
    category: 'Respiratory Distress / Asphyxiation',
    regex: /\b(can't\s+breathe|cannot\s+breathe|unable\s+to\s+catch\s+my\s+breath|severe\s+(difficulty\s+breathing|shortness\s+of\s+breath)|gasping\s+for\s+air|throat\s+is\s+closing\s+up|blue\s+lips|turning\s+blue)\b/i,
    action: 'Severe respiratory distress is life-threatening. Immediately dial India Emergency 112 (or ambulance 108/102 where available).',
  },
  {
    category: 'Neurological / Stroke (FAST)',
    regex: /\b(face\s+drooping|slurred\s+speech|sudden\s+weakness\s+on\s+one\s+side|arm\s+weakness|possible\s+stroke|having\s+a\s+stroke|sudden\s+loss\s+of\s+vision|worst\s+headache\s+of\s+my\s+life|thunderclap\s+headache)\b/i,
    action: 'Possible stroke warning signs detected. Time is critical for brain tissue. Call India Emergency 112 immediately or proceed to the nearest emergency hospital.',
  },
  {
    category: 'Loss of Consciousness / Unresponsive',
    regex: /\b(unconscious|passed\s+out\s+and\s+not\s+waking|collapsed\s+and\s+unresponsive|not\s+waking\s+up|loss\s+of\s+consciousness|seizure\s+lasting\s+more\s+than)\b/i,
    action: 'Unconsciousness requires immediate on-site resuscitation. Immediately dial India Emergency 112 (or ambulance 108/102).',
  },
  {
    category: 'Severe Bleeding / Hemorrhage',
    regex: /\b(bleeding\s+heavily|uncontrolled\s+bleeding|gushing\s+blood|spurting\s+blood|vomiting\s+blood|coughing\s+up\s+large\s+amounts\s+of\s+blood)\b/i,
    action: 'Apply firm direct pressure to the wound with a clean cloth and call India Emergency 112 (or ambulance 108/102) immediately.',
  },
  {
    category: 'Severe Anaphylaxis / Allergic Shock',
    regex: /\b(anaphylaxis|throat\s+swelling\s+shut|severe\s+allergic\s+reaction\s+can't\s+breathe|tongue\s+swelling\s+rapidly)\b/i,
    action: 'Administer Epinephrine auto-injector if available, and immediately dial India Emergency 112 (or state ambulance 108).',
  },
  {
    category: 'Severe Poisoning / Overdose',
    regex: /\b(swallowed\s+poison|drank\s+bleach|overdosed\s+on\s+(pills|medication)|ingested\s+toxic|carbon\s+monoxide\s+poisoning)\b/i,
    action: 'Immediately call India Emergency 112 (or National Poison Information Centre / 108). Do not induce vomiting unless directed by emergency medical staff.',
  },
];

// Patterns that indicate negation ("I do not have chest pain", "patient has no shortness of breath")
const NEGATION_PATTERNS = [
  /\b(no|not|don't|do\s+not|doesn't|does\s+not|never|without|denies|ruled\s+out|free\s+of)\s+([a-z\s]{0,20})\b/i,
];

// Patterns that indicate theoretical, educational, or past events
const HISTORICAL_OR_HYPOTHETICAL_PATTERNS = [
  /\b(years\s+ago|months\s+ago|in\s+the\s+past|when\s+I\s+was\s+a\s+child|history\s+of\s+chest\s+pain|what\s+causes|why\s+do\s+people\s+get|difference\s+between|hypothetically|reading\s+an\s+article|for\s+a\s+class|biology\s+project|researching)\b/i,
];

/**
 * Evaluates whether text describes an active medical emergency
 */
export function evaluateEmergencySymptoms(input: string): EmergencyCheckResult {
  if (!input || typeof input !== 'string') {
    return { isEmergency: false, severity: 'NORMAL' };
  }

  const cleanText = input.trim();

  // Check if query is explicitly historical or educational/hypothetical
  const isHypotheticalOrPast = HISTORICAL_OR_HYPOTHETICAL_PATTERNS.some((pat) => pat.test(cleanText));
  
  // Test each acute pattern
  for (const item of ACUTE_EMERGENCY_PATTERNS) {
    const match = cleanText.match(item.regex);
    if (match) {
      const matchedPhrase = match[0];
      
      // Check negation surrounding the matched phrase
      // Check the 40 characters preceding the match
      const matchIndex = match.index || 0;
      const precedingContext = cleanText.slice(Math.max(0, matchIndex - 35), matchIndex).toLowerCase();
      
      const isNegated = /\b(no|not|neither|nor|without|never|don't|do not|denies|ruled out)\b/i.test(precedingContext);

      if (isNegated) {
        // Negated symptom: e.g. "I do not have crushing chest pain"
        continue;
      }

      if (isHypotheticalOrPast && !/\b(now|today|suddenly|right\s+now|currently|help)\b/i.test(cleanText)) {
        // Educational query or past condition without acute active sign
        continue;
      }

      return {
        isEmergency: true,
        triggerCategory: item.category,
        matchedPhrase: matchedPhrase,
        recommendedAction: item.action,
        severity: 'CRITICAL',
      };
    }
  }

  return { isEmergency: false, severity: 'NORMAL' };
}
