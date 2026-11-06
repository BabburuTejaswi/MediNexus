import React, { useState, useEffect } from 'react';
import {
  FolderHeart,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  FileText,
  Calendar,
  ExternalLink,
  PlusCircle,
  Eye,
  X,
  AlertTriangle,
  Info
} from 'lucide-react';
import { UserProfile, MedicalRecord, RecordCategory } from '../types/index.ts';
import { storageService } from '../services/storageService.ts';

interface MedicalRecordsPageProps {
  currentUser: UserProfile;
  onNavigateUpload: () => void;
  selectedRecordId?: string | null;
}

export const MedicalRecordsPage: React.FC<MedicalRecordsPageProps> = ({
  currentUser,
  onNavigateUpload,
  selectedRecordId,
}) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Modal inspection of record
  const [activeRecord, setActiveRecord] = useState<MedicalRecord | null>(null);

  // Deletion confirmation
  const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null);

  const loadRecords = () => {
    const list = storageService.getRecords(currentUser.uid);
    setRecords(list);

    if (selectedRecordId) {
      const match = list.find((r) => r.id === selectedRecordId);
      if (match) setActiveRecord(match);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [currentUser, selectedRecordId]);

  // Filter & Sort
  const filteredRecords = records
    .filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.extractedText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });

  const handleDeleteConfirm = () => {
    if (!recordToDelete) return;
    storageService.deleteRecord(currentUser.uid, recordToDelete.id);
    if (activeRecord?.id === recordToDelete.id) {
      setActiveRecord(null);
    }
    setRecordToDelete(null);
    loadRecords();
  };

  const handleDownloadReport = (rec: MedicalRecord) => {
    let textToDownload = `MEDINEXUS MEDICAL RECORD ARCHIVE\nTitle: ${rec.title}\nCategory: ${rec.category}\nDate: ${rec.date}\nOwner: ${currentUser.displayName}\n\nCONTENT:\n${rec.extractedText}`;

    if (rec.analysis) {
      textToDownload += `\n\nAI CLINICAL SUMMARY:\n${rec.analysis.summary}\n\nBIOMARKER METRICS:\n` +
        rec.analysis.metrics
          .map((m) => `${m.name}: ${m.value} ${m.unit} (Ref: ${m.referenceRange}) [${m.status.toUpperCase()}]`)
          .join('\n');
    }

    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rec.title.replace(/\s+/g, '_')}_Record.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FolderHeart className="w-6 h-6 text-teal-600" />
            <span>Personal Medical Records Library</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Encrypted, user-scoped repository of all your uploaded diagnostic tests, lab results, and AI clinical summaries.
          </p>
        </div>

        <button
          onClick={onNavigateUpload}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload New Record</span>
        </button>
      </div>

      {/* Search, Filter, Sort Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center gap-3">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by test name, biomarkers, or condition..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 w-full md:w-auto"
          >
            <option value="All">All Categories</option>
            <option value="Lab Report">Lab Report</option>
            <option value="Radiology / X-Ray">Radiology</option>
            <option value="Prescription">Prescription</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Vaccination">Vaccination</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
            className="text-xs py-2 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-700 transition w-full md:w-auto"
          >
            {sortOrder === 'newest' ? 'Sort: Newest First' : 'Sort: Oldest First'}
          </button>
        </div>

      </div>

      {/* Records Grid */}
      {filteredRecords.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((rec, idx) => (
            <div
              key={`${rec.id}-${idx}`}
              className="bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-lg transition p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase">
                    {rec.category}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-teal-700 transition cursor-pointer"
                      onClick={() => setActiveRecord(rec)}>
                    {rec.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Report Date: {rec.date}</span>
                  </div>
                </div>

                {rec.analysis ? (
                  <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {rec.analysis.summary}
                  </p>
                ) : (
                  <p className="text-xs text-slate-600 italic">No AI breakdown generated yet.</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setActiveRecord(rec)}
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownloadReport(rec)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                    title="Download summary"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRecordToDelete(rec)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <FolderHeart className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-800">No medical records match your criteria</h3>
            <p className="text-xs text-slate-600">
              Upload your lab panels, prescriptions, or clinical notes to organize your records.
            </p>
          </div>
          <button
            onClick={onNavigateUpload}
            className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition"
          >
            Upload a Medical Document
          </button>
        </div>
      )}

      {/* Record Inspection Modal */}
      {activeRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-base font-bold tracking-tight">{activeRecord.title}</h3>
                  <p className="text-xs text-slate-400">
                    Category: {activeRecord.category} • Date: {activeRecord.date}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveRecord(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
              
              {activeRecord.analysis ? (
                <div className="space-y-5">
                  <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 space-y-1">
                    <h4 className="text-xs font-bold text-teal-900 uppercase">AI Clinical Summary</h4>
                    <p className="text-xs text-teal-950 leading-relaxed">
                      {activeRecord.analysis.summary}
                    </p>
                  </div>

                  {activeRecord.analysis.metrics?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase">
                        Biomarkers & Test Metrics
                      </h4>
                      <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                            <tr>
                              <th className="p-2.5">Test</th>
                              <th className="p-2.5">Measured</th>
                              <th className="p-2.5">Reference</th>
                              <th className="p-2.5">Flag</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {activeRecord.analysis.metrics.map((m, idx) => (
                              <tr key={idx}>
                                <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                                <td className="p-2.5 font-semibold text-slate-800">{m.value} {m.unit}</td>
                                <td className="p-2.5 text-slate-600">{m.referenceRange}</td>
                                <td className="p-2.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                      m.status === 'normal'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : m.status === 'abnormal'
                                        ? 'bg-amber-50 text-amber-700'
                                        : 'bg-rose-50 text-rose-700'
                                    }`}
                                  >
                                    {m.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {activeRecord.analysis.questionsForDoctor?.length > 0 && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase">
                        Questions for Your Clinician
                      </h4>
                      <ul className="text-xs text-slate-600 space-y-1 list-disc pl-4">
                        {activeRecord.analysis.questionsForDoctor.map((q, idx) => (
                          <li key={idx}>{q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl text-xs text-slate-500">
                  This document was saved without an AI breakdown.
                </div>
              )}

              {/* Raw extracted text preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase">Source Text</h4>
                <pre className="p-4 bg-slate-900 text-slate-200 text-xs rounded-xl overflow-x-auto whitespace-pre-wrap font-mono max-h-48">
                  {activeRecord.extractedText || 'No extracted text available.'}
                </pre>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => handleDownloadReport(activeRecord)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>

              <button
                onClick={() => setActiveRecord(null)}
                className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700 font-bold">
              <div className="p-2 bg-rose-50 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <span>Delete Medical Record?</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete <strong>"{recordToDelete.title}"</strong>?
              This will remove all associated AI breakdowns and extracted biomarkers from your account. This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRecordToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
