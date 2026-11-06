import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Download,
  ShieldCheck,
  RefreshCw,
  FolderPlus,
  Info,
  Check,
  FileCheck
} from 'lucide-react';
import { UserProfile, ReportAnalysis, MedicalRecord, RecordCategory } from '../types/index.ts';
import { analyzeMedicalReport } from '../services/geminiService.ts';
import { storageService } from '../services/storageService.ts';

interface ReportAnalysisPageProps {
  currentUser: UserProfile;
  onNavigateRecords: () => void;
}

// Sample clinical laboratory text presets so users can test immediately without uploading a local file
const SAMPLE_REPORTS = [
  {
    title: 'Complete Blood Count (CBC) with Differential',
    category: 'Lab Report' as RecordCategory,
    text: `LABORATORY TESTING INC. - PATIENT REPORT
Patient: Sarah Jenkins | Age: 37 | Gender: F
Collected: 2026-03-14 08:30 AM | Status: Final

TEST NAME                  RESULT     UNITS        REFERENCE INTERVAL   FLAG
-------------------------------------------------------------------------
White Blood Cell (WBC)      6.4       x10^3/uL     4.0 - 11.0          NORMAL
Red Blood Cell (RBC)        4.15      x10^6/uL     3.80 - 5.20         NORMAL
Hemoglobin                 11.2       g/dL         12.0 - 15.5         LOW
Hematocrit                 33.8       %            37.0 - 48.0         LOW
Mean Corpuscular Vol (MCV)  76.2       fL           80.0 - 100.0        LOW
Platelets                   245       x10^3/uL     150 - 450           NORMAL
Neutrophils                 62        %            40 - 70             NORMAL
Lymphocytes                 28        %            20 - 40             NORMAL
Serum Ferritin             12         ng/mL        15 - 150            LOW`,
  },
  {
    title: 'Comprehensive Lipid & Cardiovascular Panel',
    category: 'Lab Report' as RecordCategory,
    text: `METRO HEALTH PATHOLOGY LAB
Patient: Sarah Jenkins | Date: 2026-03-12 | Specimen: Serum

TEST                       RESULT     UNITS        DESIRABLE RANGE      INTERPRETATION
--------------------------------------------------------------------------------------
Total Cholesterol           224       mg/dL        < 200                ELEVATED
HDL ("Good") Cholesterol     44       mg/dL        > 50                 LOW
LDL ("Bad") Cholesterol     148       mg/dL        < 100                BORDERLINE HIGH
Triglycerides               160       mg/dL        < 150                MILDLY HIGH
Cholesterol / HDL Ratio     5.09                   < 4.5                ELEVATED
Fasting Blood Sugar         104       mg/dL        70 - 99              MILDLY ELEVATED`,
  },
  {
    title: 'Renal Function & Electrolyte Profile',
    category: 'Lab Report' as RecordCategory,
    text: `UNIVERSITY MEDICAL CENTER - BIOCHEMISTRY
Patient: Sarah Jenkins | Date: 2026-03-08

ANALYTE                    VALUE      UNITS        REFERENCE RANGE      FLAGS
-----------------------------------------------------------------------------
Blood Urea Nitrogen (BUN)   16         mg/dL        7 - 20              NORMAL
Serum Creatinine           0.88       mg/dL        0.57 - 1.11         NORMAL
eGFR (CKD-EPI)             92         mL/min       > 60                NORMAL
Sodium                     139        mmol/L       136 - 145           NORMAL
Potassium                  4.3        mmol/L       3.5 - 5.1           NORMAL
Chloride                   102        mmol/L       98 - 107            NORMAL
Calcium                     9.4        mg/dL        8.6 - 10.2          NORMAL`,
  },
];

export const ReportAnalysisPage: React.FC<ReportAnalysisPageProps> = ({
  currentUser,
  onNavigateRecords,
}) => {
  const [reportTitle, setReportTitle] = useState('');
  const [category, setCategory] = useState<RecordCategory>('Lab Report');
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [reportText, setReportText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
  const [mimeType, setMimeType] = useState<string | undefined>(undefined);

  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [analysisResult, setAnalysisResult] = useState<ReportAnalysis | null>(null);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consentGranted, setConsentGranted] = useState(true);

  // Load a preset template
  const handleSelectPreset = (preset: (typeof SAMPLE_REPORTS)[0]) => {
    setReportTitle(preset.title);
    setCategory(preset.category);
    setReportText(preset.text);
    setFileName(`${preset.title.replace(/\s+/g, '_')}.txt`);
    setFileSize(preset.text.length);
    setImageBase64(undefined);
    setMimeType('text/plain');
    setAnalysisResult(null);
    setSavedRecordId(null);
  };

  // Handle local file upload (PDF or Image)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setAnalysisResult(null);
    setSavedRecordId(null);

    // Validate size (max 15MB)
    const MAX_SIZE = 15 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setError('File size exceeds the 15MB limit. Please upload a smaller document.');
      return;
    }

    // Validate type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a PDF, PNG, JPEG, or WebP document.');
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);
    setReportTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    setMimeType(file.type);

    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = () => {
        setImageBase64(reader.result as string);
        setReportText(`[Image Document Attached: ${file.name} - Will be analyzed visually by Gemini multimodal engine]`);
      };
      reader.readAsDataURL(file);
    } else if (file.type === 'text/plain') {
      reader.onload = () => {
        setReportText(reader.result as string);
      };
      reader.readAsText(file);
    } else if (file.type === 'application/pdf') {
      // For PDFs in this browser environment, read basic text or provide dataUrl
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImageBase64(dataUrl);
        setReportText(
          `[PDF Document Attached: ${file.name}]\nNote: MediNexus will analyze the text content and clinical parameters directly.`
        );
      };
      reader.readAsDataURL(file);
    }
  };

  // Run AI Analysis
  const handleAnalyze = async () => {
    if (!reportText.trim() && !imageBase64) {
      setError('Please provide report text or upload a medical document first.');
      return;
    }

    if (!consentGranted) {
      setError('Please review and check the data processing consent before proceeding.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setUploadProgress(20);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => (prev < 80 ? prev + 15 : prev));
      }, 400);

      const response = await analyzeMedicalReport(
        reportText,
        reportTitle || fileName || 'Medical Report',
        imageBase64,
        mimeType
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      setAnalysisResult(response.analysis);

      // Save automatically into user's persistent records library
      const savedRecord = storageService.saveRecord(currentUser.uid, {
        title: reportTitle || response.analysis.reportType || 'Medical Report',
        category,
        date: reportDate,
        fileName: fileName || 'Clinical_Report.txt',
        fileSize: fileSize || 1024,
        fileType: mimeType || 'text/plain',
        extractedText: reportText,
        analysis: response.analysis,
        status: 'analyzed',
      });

      setSavedRecordId(savedRecord.id);
    } catch (err: any) {
      console.error('Error in analyze report:', err);
      setError(err.message || 'Failed to complete AI report breakdown. Check server logs.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDownloadSummary = () => {
    if (!analysisResult) return;
    const textContent = `MEDINEXUS MEDICAL REPORT BREAKDOWN
Document: ${reportTitle || fileName}
Date: ${reportDate}
Patient: ${currentUser.displayName}

SUMMARY:
${analysisResult.summary}

EXTRACTED TEST BIOMARKERS:
${analysisResult.metrics
  .map(
    (m) =>
      `- ${m.name}: ${m.value} ${m.unit} (Ref: ${m.referenceRange}) [${m.status.toUpperCase()}]\n  ${m.explanation}`
  )
  .join('\n\n')}

POTENTIAL CONCERNS:
${analysisResult.potentialConcerns.map((c) => `• ${c}`).join('\n')}

QUESTIONS FOR YOUR DOCTOR:
${analysisResult.questionsForDoctor.map((q) => `• ${q}`).join('\n')}

---
DISCLAIMER: This summary is generated for educational purposes by MediNexus AI. It does not constitute a medical diagnosis. Always consult your personal doctor.`;

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(reportTitle || 'Report').replace(/\s+/g, '_')}_MediNexus_Summary.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-600" />
            <span>AI Medical Report Analysis</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Transform complex laboratory values, biomarkers, and clinical notes into clear, patient-friendly guidance.
          </p>
        </div>

        <button
          onClick={onNavigateRecords}
          className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
        >
          <FileText className="w-4 h-4 text-teal-600" />
          <span>View Saved Library</span>
        </button>
      </div>

      {/* Main Upload & Configuration Grid */}
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Left Column: Upload / Text input */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick-test Presets Card */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Instant Evaluator Test Presets</span>
            </div>
            <p className="text-xs text-teal-800">
              No report PDF at hand? Load an authentic clinical lab panel below in 1-click:
            </p>
            <div className="space-y-1.5 pt-1">
              {SAMPLE_REPORTS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="w-full text-left p-2.5 bg-white hover:bg-teal-100/60 border border-teal-200 rounded-xl text-xs text-slate-800 font-semibold transition flex items-center justify-between shadow-2xs"
                >
                  <span>{preset.title}</span>
                  <span className="text-[10px] text-teal-700 font-bold">Load &rarr;</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Upload Report File (PDF / Images)</h3>

            <label className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-teal-50/30 transition group">
              <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-teal-600 transition" />
              <p className="mt-2 text-xs font-bold text-slate-700">
                Click to browse or drop file here
              </p>
              <p className="text-[11px] text-slate-600 mt-1">
                Supports PDF, PNG, JPEG, WebP (Max 15MB)
              </p>
              <input
                type="file"
                accept=".pdf,image/png,image/jpeg,image/webp,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {fileName && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <FileCheck className="w-4 h-4 text-teal-600 shrink-0" />
                  <span className="font-bold text-teal-900 truncate">{fileName}</span>
                  <span className="text-teal-600 shrink-0">({(fileSize / 1024).toFixed(1)} KB)</span>
                </div>
              </div>
            )}

            {/* Document Metadata Form */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="e.g. Annual Blood Panel"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as RecordCategory)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Lab Report">Lab Report</option>
                    <option value="Radiology / X-Ray">Radiology / X-Ray</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Report Date
                  </label>
                  <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Extracted / Manual Report Text
                </label>
                <textarea
                  rows={6}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder="Paste or edit the text of the laboratory report here..."
                  className="w-full text-xs p-3 font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1 select-none">
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span>
                I consent to submitting this document text to Google Gemini for educational explanation.
              </span>
            </label>

            {error && (
              <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing || (!reportText.trim() && !imageBase64)}
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {analyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing with Gemini ({uploadProgress}%)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Report Explanation</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Column: AI Analysis Results */}
        <div className="lg:col-span-7 space-y-6">
          
          {analysisResult ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              {/* Report Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200">
                    {analysisResult.reportType}
                  </span>
                  <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                    {reportTitle || 'Clinical Diagnostic Report'}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Dated: {analysisResult.reportDate} • Analyzed by MediNexus AI
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadSummary}
                    className="px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                    title="Download summary file"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Color Code Legend Banner */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="font-bold text-slate-700">Flag Indicator Legend:</span>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-600">Normal</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="text-slate-600">Abnormal / Borderline</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-slate-600">Critical / Marked Flag</span>
                  </span>
                </div>
              </div>

              {/* Plain-Language Summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-teal-600" />
                  Plain-Language Summary
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-teal-50/40 p-4 rounded-2xl border border-teal-100">
                  {analysisResult.summary}
                </p>
              </div>

              {/* Extracted Metrics Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-600" />
                  Extracted Biomarkers & Reference Ranges ({analysisResult.metrics?.length || 0})
                </h3>

                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Biomarker</th>
                        <th className="p-3">Measured Value</th>
                        <th className="p-3">Reference Interval</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Clinical Meaning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysisResult.metrics?.map((metric, idx) => {
                        const statusColors = {
                          normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          abnormal: 'bg-amber-50 text-amber-700 border-amber-200',
                          critical: 'bg-rose-50 text-rose-700 border-rose-200',
                        };

                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 transition">
                            <td className="p-3 font-bold text-slate-900">{metric.name}</td>
                            <td className="p-3 font-semibold text-slate-800">
                              {metric.value} <span className="text-[10px] text-slate-600">{metric.unit}</span>
                            </td>
                            <td className="p-3 text-slate-600">{metric.referenceRange || 'N/A'}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  statusColors[metric.status] || statusColors.normal
                                }`}
                              >
                                {metric.status}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600 text-[11px] max-w-xs">{metric.explanation}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Doctor Consultation Questions */}
              {analysisResult.questionsForDoctor?.length > 0 && (
                <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2">
                  <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4" />
                    Recommended Questions for Your Doctor
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-300 pl-1">
                    {analysisResult.questionsForDoctor.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-teal-400 font-bold">&bull;</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Medical Terms Glossary */}
              {analysisResult.medicalTerms?.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Medical Terms Glossary
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {analysisResult.medicalTerms.map((t, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <p className="font-bold text-teal-800">{t.term}</p>
                        <p className="text-slate-600 text-[11px] mt-0.5">{t.plainDefinition}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Safety Footnote */}
              <div className="text-[11px] text-slate-600 bg-amber-50/60 p-3 rounded-xl border border-amber-200/60">
                ⚠️ Color flags (Green, Amber, Red) are informational visual aids based on published reference ranges, not clinical diagnoses. Never alter prescribed treatments without direct physician guidance.
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-bold text-slate-900">No Report Currently Displayed</h3>
                <p className="text-xs text-slate-500">
                  Select an instant evaluator preset on the left or upload a file to view a complete breakdown of biomarkers and physician questions.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
