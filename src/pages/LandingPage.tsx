import React from 'react';
import {
  ShieldCheck,
  Activity,
  FileSearch,
  FolderLock,
  HeartPulse,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Clock,
  Compass
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onSelectDemoUser?: (email: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
}) => {
  const handleScrollToFeatures = () => {
    const el = document.getElementById('features-overview');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Patient Health Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Your Health, <span className="text-teal-600">Better Understood</span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                A simpler way to explore health information, understand medical reports, and keep your health information organized.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={onGetStarted}
                  className="w-full sm:w-auto px-7 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-base shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition group cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={handleScrollToFeatures}
                  className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl font-semibold text-base shadow-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Compass className="w-5 h-5 text-teal-600" />
                  <span>Explore Features</span>
                </button>
              </div>

              {/* Trust & Reassurance Badges */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Private & Confidential</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-600" />
                  <span>Plain-Language Insights</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-teal-600" />
                  <span>Emergency Safety Guidance</span>
                </div>
              </div>
            </div>

            {/* Right Hero Overview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-6 space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      MN
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">MediNexus Health Hub</h4>
                      <p className="text-[11px] text-slate-600">Patient Clarity & Guidance</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-[11px] font-bold">
                    Active Care
                  </span>
                </div>

                {/* Four Core Pillars Preview */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">AI Health Information</p>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Ask health questions anytime and receive clear, educational answers to discuss with your doctor.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                      <FileSearch className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Medical Report Explanations</p>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Translate complex lab tests and medical terminology into everyday language with reference ranges.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <FolderLock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Personal Health Records</p>
                      <p className="text-[11px] text-slate-600 leading-snug">
                        Keep all your health records, lab documents, and wellness measurements organized in one secure place.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-rose-900">Emergency Guidance</p>
                      <p className="text-[11px] text-rose-700 leading-snug">
                        Immediate recognition of critical warning signs with prompt 112 emergency calling assistance.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900 text-white rounded-2xl text-xs space-y-1 shadow-md">
                  <div className="flex items-center gap-2 text-teal-300 font-semibold text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Always Prepared for Your Doctor's Visit</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-snug">
                    Generate thoughtful questions and clinical summaries to make every doctor appointment more productive.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features Overview */}
      <section id="features-overview" className="py-16 bg-white border-y border-slate-200 scroll-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-2">Designed for Clarity</h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              A Complete Platform Built for Patient Understanding and Safety
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Everything you need to navigate your health records, understand medical concepts, and prepare for clinical visits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: AI Health Information */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Health Information</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Have questions about symptoms, medications, or wellness? Engage in supportive, educational health dialogue to help you prepare thoughtful questions for your next doctor's visit.
              </p>
            </div>

            {/* Feature 2: Medical Report Explanations */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                <FileSearch className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Medical Report Explanations</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Upload lab reports, blood panels, and test results. MediNexus translates complex clinical terminology into clear, everyday language with reference ranges so you can understand your results.
              </p>
            </div>

            {/* Feature 3: Personal Health Records */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <FolderLock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Personal Health Records</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Organize your medical records, test results, and health history in one secure, convenient place. Search, categorize, and access your previous report summaries whenever you need them.
              </p>
            </div>

            {/* Feature 4: Emergency Guidance */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <HeartPulse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Emergency Guidance</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Recognizes urgent warning signs such as acute chest pain, stroke signs (FAST), or severe breathing distress, offering immediate guidance and emergency contact numbers (112).
              </p>
            </div>

            {/* Feature 5: Health Vitals Tracking */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Health Vitals Tracking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Log and monitor essential health numbers like blood pressure, glucose, heart rate, and weight over time with easy-to-read charts and chronological trends.
              </p>
            </div>

            {/* Feature 6: Nearby Care Finder */}
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Nearby Care Finder</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Quickly locate nearby hospitals and emergency care centers with one-tap directions, contact numbers, and turn-by-turn navigation.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Safety & Medical Disclaimer Banner */}
      <section className="bg-slate-100 py-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Important Healthcare Information</span>
              </h4>
              <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
                MediNexus is an educational and informational platform designed to help you organize health records and understand medical terminology. It does not provide medical diagnoses, treatment plans, or clinical prescriptions. Always consult a qualified healthcare professional for medical concerns. For immediate life-threatening emergencies in India, call 112 (or 108/102 for ambulance assistance).
              </p>
            </div>
            <button
              onClick={onGetStarted}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shrink-0 transition cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-300 font-bold text-sm">
            <Activity className="w-4 h-4 text-teal-400" />
            <span>MediNexus</span>
          </div>
          <div className="text-center sm:text-right text-slate-400">
            <p>© 2026 MediNexus. Built for patient health understanding.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Not an emergency diagnostic device. For medical emergencies in India, call 112 (or 108/102 for ambulance).</p>
          </div>
        </div>
      </footer>

    </div>
  );
};
