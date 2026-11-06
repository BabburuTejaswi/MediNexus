import React, { useState, useEffect } from 'react';
import {
  LineChart,
  PlusCircle,
  Activity,
  Heart,
  Droplet,
  Scale,
  Calendar,
  Trash2,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react';
import { UserProfile, HealthMeasurement, MeasurementType } from '../types/index.ts';
import { storageService } from '../services/storageService.ts';

interface HealthHistoryPageProps {
  currentUser: UserProfile;
}

export const HealthHistoryPage: React.FC<HealthHistoryPageProps> = ({ currentUser }) => {
  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [selectedType, setSelectedType] = useState<MeasurementType>('blood_pressure');

  // Form states
  const [showAddModal, setShowAddModal] = useState(false);
  const [formType, setFormType] = useState<MeasurementType>('blood_pressure');
  const [formTitle, setFormTitle] = useState('');
  const [primaryVal, setPrimaryVal] = useState('');
  const [secondaryVal, setSecondaryVal] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  const loadData = () => {
    const list = storageService.getMeasurements(currentUser.uid);
    setMeasurements(list);
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const num1 = parseFloat(primaryVal);
    if (isNaN(num1) || num1 <= 0) {
      setError('Please provide a valid positive reading.');
      return;
    }

    let num2: number | undefined = undefined;
    if (formType === 'blood_pressure') {
      num2 = parseFloat(secondaryVal);
      if (isNaN(num2) || num2 <= 0) {
        setError('Please enter a valid diastolic blood pressure value.');
        return;
      }
    }

    const unitMap: Record<MeasurementType, string> = {
      blood_pressure: 'mmHg',
      blood_glucose: 'mg/dL',
      heart_rate: 'bpm',
      weight: 'kg',
    };

    const titleMap: Record<MeasurementType, string> = {
      blood_pressure: 'Blood Pressure Reading',
      blood_glucose: 'Blood Glucose Reading',
      heart_rate: 'Heart Rate Reading',
      weight: 'Body Weight',
    };

    storageService.saveMeasurement(currentUser.uid, {
      type: formType,
      title: formTitle.trim() || titleMap[formType],
      primaryValue: num1,
      secondaryValue: num2,
      unit: unitMap[formType],
      recordedAt: new Date(date).toISOString(),
      notes: notes.trim() || undefined,
    });

    setShowAddModal(false);
    setPrimaryVal('');
    setSecondaryVal('');
    setNotes('');
    loadData();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this health measurement?')) {
      storageService.deleteMeasurement(currentUser.uid, id);
      loadData();
    }
  };

  const filteredMeasurements = measurements
    .filter((m) => m.type === selectedType)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

  // Simple clean SVG trend chart calculation
  const chartPoints = filteredMeasurements.map((m, idx) => ({
    x: idx,
    y: m.primaryValue,
    date: new Date(m.recordedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    label: `${m.primaryValue} ${m.unit}`,
  }));

  const minY = chartPoints.length > 0 ? Math.min(...chartPoints.map((p) => p.y)) * 0.9 : 0;
  const maxY = chartPoints.length > 0 ? Math.max(...chartPoints.map((p) => p.y)) * 1.1 : 100;
  const rangeY = maxY - minY || 1;

  const width = 600;
  const height = 180;
  const padding = 30;

  const svgPoints = chartPoints.map((p, idx) => {
    const x = chartPoints.length > 1
      ? padding + (idx / (chartPoints.length - 1)) * (width - padding * 2)
      : width / 2;
    const y = height - padding - ((p.y - minY) / rangeY) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <LineChart className="w-6 h-6 text-teal-600" />
            <span>Health History & Vital Trends</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track daily physiological measurements, review chronological progress, and share trend charts with your physician.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Log New Measurement</span>
        </button>
      </div>

      {/* Metric Type Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { type: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', icon: Heart },
          { type: 'blood_glucose', label: 'Blood Glucose', unit: 'mg/dL', icon: Droplet },
          { type: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: Activity },
          { type: 'weight', label: 'Body Weight', unit: 'kg', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = selectedType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => setSelectedType(tab.type as MeasurementType)}
              className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                isSelected
                  ? 'bg-teal-50/70 border-teal-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{tab.label}</p>
                <p className="text-[10px] text-slate-600">Unit: {tab.unit}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Trend Chart View */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 capitalize">
              {selectedType.replace('_', ' ')} Trend Overview
            </h3>
            <p className="text-xs text-slate-600">
              {chartPoints.length} logged data points in chronological sequence
            </p>
          </div>
        </div>

        {chartPoints.length > 0 ? (
          <div className="w-full overflow-x-auto py-2">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-2xl mx-auto h-44">
              {/* Grid lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#f1f5f9" strokeWidth="1" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#f1f5f9" strokeWidth="1" />

              {/* Trend line */}
              {chartPoints.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#0d9488"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={svgPoints}
                />
              )}

              {/* Data points */}
              {chartPoints.map((p, idx) => {
                const x = chartPoints.length > 1
                  ? padding + (idx / (chartPoints.length - 1)) * (width - padding * 2)
                  : width / 2;
                const y = height - padding - ((p.y - minY) / rangeY) * (height - padding * 2);

                return (
                  <g key={idx} className="group cursor-pointer">
                    <circle cx={x} cy={y} r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
                    <text
                      x={x}
                      y={y - 10}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      fill="#0f172a"
                    >
                      {p.label}
                    </text>
                    <text
                      x={x}
                      y={height - 10}
                      fontSize="8"
                      textAnchor="middle"
                      fill="#94a3b8"
                    >
                      {p.date}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-600">
            No readings recorded for {selectedType.replace('_', ' ')}. Click "Log New Measurement" to start.
          </div>
        )}
      </div>

      {/* Measurement History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Logged Measurements History ({measurements.length})
          </h3>
        </div>

        {measurements.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {measurements.map((m, idx) => (
              <div
                key={`${m.id}-${idx}`}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                    <Activity className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {new Date(m.recordedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      {m.notes && <span className="ml-2 italic text-slate-600">• "{m.notes}"</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">
                      {m.type === 'blood_pressure' ? `${m.primaryValue}/${m.secondaryValue}` : m.primaryValue}
                    </span>
                    <span className="text-xs text-slate-600 ml-1 font-semibold">{m.unit}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(m.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete reading"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-600">
            No health measurements on file yet.
          </div>
        )}
      </div>

      {/* Add Measurement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Log Health Measurement</h3>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleAddMeasurement} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Measurement Category
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as MeasurementType)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  <option value="blood_pressure">Blood Pressure (Systolic / Diastolic)</option>
                  <option value="blood_glucose">Blood Glucose (mg/dL)</option>
                  <option value="heart_rate">Resting Heart Rate (BPM)</option>
                  <option value="weight">Body Weight (kg)</option>
                </select>
              </div>

              {formType === 'blood_pressure' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Systolic (Upper)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 120"
                      value={primaryVal}
                      onChange={(e) => setPrimaryVal(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 uppercase mb-1">
                      Diastolic (Lower)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 80"
                      value={secondaryVal}
                      onChange={(e) => setSecondaryVal(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Value ({formType === 'blood_glucose' ? 'mg/dL' : formType === 'heart_rate' ? 'bpm' : 'kg'})
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Enter measured value"
                    value={primaryVal}
                    onChange={(e) => setPrimaryVal(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Morning fasting, post workout, resting"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  Save Measurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
