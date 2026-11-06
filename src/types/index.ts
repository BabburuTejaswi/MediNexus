export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRegion: 'US_CAN' | 'INDIA' | 'UK' | 'EU' | 'AU';
  disclaimerAck?: {
    acknowledged: boolean;
    timestamp: string;
    version: string;
  };
  createdAt: string;
}

export type RecordCategory = 'Lab Report' | 'Radiology / X-Ray' | 'Prescription' | 'Cardiology' | 'Vaccination' | 'Other';

export interface MedicalMetric {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'abnormal' | 'critical';
  explanation: string;
}

export interface MedicalTermExplanation {
  term: string;
  plainDefinition: string;
}

export interface ReportAnalysis {
  reportType: string;
  reportDate: string;
  summary: string;
  metrics: MedicalMetric[];
  medicalTerms: MedicalTermExplanation[];
  questionsForDoctor: string[];
  potentialConcerns: string[];
  uncertaintiesOrNotes: string;
  analyzedAt: string;
}

export interface MedicalRecord {
  id: string;
  userId: string;
  title: string;
  category: RecordCategory;
  date: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileDataUrl?: string; // Stored locally/in-memory or cloud storage URL
  extractedText: string;
  analysis?: ReportAnalysis;
  status: 'uploaded' | 'analyzed' | 'error';
  createdAt: string;
}

export type MeasurementType = 'blood_pressure' | 'blood_glucose' | 'heart_rate' | 'weight';

export interface HealthMeasurement {
  id: string;
  userId: string;
  type: MeasurementType;
  title: string;
  primaryValue: number; // e.g. systolic or glucose or bpm or kg
  secondaryValue?: number; // e.g. diastolic for BP
  unit: string;
  recordedAt: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isEmergencyAlert?: boolean;
  emergencyCategory?: string;
}

export interface HospitalFacility {
  id: string;
  name: string;
  address: string;
  phone: string;
  distanceKm: string;
  hasEmergencyDepartment: boolean;
  type: string;
  mapsQuery: string;
}
