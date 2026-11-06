import React from 'react';
import {
  FileText,
  Activity,
  Heart,
  TrendingUp,
  AlertTriangle,
  FolderPlus,
  ArrowUpRight,
  Shield,
  MessageSquareHeart,
  MapPin,
  Calendar,
  Clock
} from 'lucide-react';
import { UserProfile, MedicalRecord, HealthMeasurement } from '../types/index.ts';
import { storageService } from '../services/storageService.ts';

interface DashboardPageProps {
  currentUser: UserProfile;
  onNavigate: (tab: string) => void;
  onSelectRecord: (recordId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  currentUser,
  onNavigate,
  onSelectRecord,
}) => {
  const records = storageService.getRecords(currentUser.uid);
  const measurements = storageService.getMeasurements(currentUser.uid);
  const chatMessages = storageService.getChatMessages(currentUser.uid);

  // Filter latest vital measurements
  const bpMeasurements = measurements.filter((m) => m.type === 'blood_pressure');
  const latestBP = bpMeasurements[0];

  const glucoseMeasurements = measurements.filter((m) => m.type === 'blood_glucose');
  const latestGlucose = glucoseMeasurements[0];

  const weightMeasurements = measurements.filter((m) => m.type === 'weight');
  const latestWeight = weightMeasurements[0];

  const isDemoUser = currentUser.uid === 'usr_sarah_jenkins_101';

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-teal-200 text-xs font-semibold backdrop-blur-xs">
            <Activity className="w-3.5 h-3.5" />
            <span>Patient Portal Dashboard</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.displayName}!
          </h1>

          <p className="text-teal-100 text-sm leading-relaxed">
            Manage your medical documents, review AI clinical insights, track your vital statistics, and prepare questions for your next doctor consultation.
          </p>

          {isDemoUser && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/30 text-amber-200 rounded-lg text-xs font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Demonstration Account — Pre-loaded with illustrative laboratory and blood pressure records.</span>
            </div>
          )}
        </div>

        {/* Action quick links */}
        <div className="relative z-10 mt-6 pt-5 border-t border-teal-600/60 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('report-analysis')}
            className="px-4 py-2 bg-white text-teal-800 hover:bg-teal-50 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
          >
            <FolderPlus className="w-4 h-4 text-teal-600" />
            Upload & Analyze Report
          </button>

          <button
            onClick={() => onNavigate('assistant')}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 transition"
          >
            <MessageSquareHeart className="w-4 h-4" />
            Ask Health Assistant
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Activity className="w-4 h-4" />
            Log Vital Sign
          </button>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Stored Records</p>
            <p className="text-2xl font-extrabold text-slate-900">{records.length}</p>
            <p className="text-[11px] text-teal-700 font-medium">Strict user-isolated</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Latest Blood Pressure</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {latestBP ? `${latestBP.primaryValue}/${latestBP.secondaryValue}` : '--/--'}
            </p>
            <p className="text-[11px] text-slate-500">{latestBP ? 'mmHg (Resting)' : 'No entries yet'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Fasting Glucose</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {latestGlucose ? `${latestGlucose.primaryValue}` : '--'}
            </p>
            <p className="text-[11px] text-slate-500">{latestGlucose ? 'mg/dL' : 'No entries yet'}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Current Weight</p>
            <p className="text-2xl font-extrabold text-slate-900">
              {latestWeight ? `${latestWeight.primaryValue}` : '--'}
            </p>
            <p className="text-[11px] text-slate-500">{latestWeight ? 'kg' : 'No entries yet'}</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Recent Records & Recent Health History */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Medical Records */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <h2 className="text-lg font-bold text-slate-900">Recent Medical Documents</h2>
            </div>
            <button
              onClick={() => onNavigate('records')}
              className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View All ({records.length})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {records.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {records.slice(0, 4).map((rec, idx) => (
                  <div
                    key={`${rec.id}-${idx}`}
                    onClick={() => onSelectRecord(rec.id)}
                    className="p-4 sm:p-5 hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 hover:text-teal-700 transition">
                          {rec.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {rec.date}
                          </span>
                          <span>•</span>
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                            {rec.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {rec.analysis ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                          AI Analyzed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
                          Processing
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No medical reports uploaded yet</p>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  Upload a laboratory or clinical report PDF or image to get an immediate AI explanation and build your record library.
                </p>
                <button
                  onClick={() => onNavigate('report-analysis')}
                  className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition inline-flex items-center gap-1.5"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  Upload First Report
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Vitals Quick-Log & Emergency Quick-Info */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Vitals Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-bold text-slate-900">Recent Vitals Activity</h3>
              </div>
              <button
                onClick={() => onNavigate('history')}
                className="text-xs font-bold text-teal-700 hover:text-teal-800"
              >
                Log New Vital
              </button>
            </div>

            {measurements.length > 0 ? (
              <div className="space-y-3">
                {measurements.slice(0, 3).map((m, idx) => (
                  <div key={`${m.id}-${idx}`} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{m.title}</p>
                      <p className="text-[10px] text-slate-600 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(m.recordedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 text-sm">
                        {m.type === 'blood_pressure' ? `${m.primaryValue}/${m.secondaryValue}` : m.primaryValue}
                      </span>
                      <span className="text-[10px] text-slate-600 ml-1">{m.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 text-center py-4">
                No health measurements logged yet. Start recording your daily readings.
              </p>
            )}
          </div>

          {/* Emergency Safety Protocol Card */}
          <div className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <Shield className="w-4 h-4 text-rose-600" />
              <span>Emergency Safety Protocols</span>
            </div>
            <p className="text-xs text-rose-900/80 leading-relaxed">
              MediNexus actively screens all health inquiries for acute emergencies (chest pain, stroke signs, breathing arrest). If you or a loved one requires immediate care, do not wait for AI responses.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <button
                onClick={() => onNavigate('hospitals')}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <MapPin className="w-3.5 h-3.5" />
                Find Emergency ER Near Me
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
