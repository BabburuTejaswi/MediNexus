/**
 * MediNexus Storage Service
 * Strict user-scoped persistent storage for Medical Records, Health Measurements, and Chat Sessions.
 */

import { MedicalRecord, HealthMeasurement, ChatMessage, ReportAnalysis } from '../types/index.ts';

const RECORDS_STORAGE_KEY = 'medinexus_records_db';
const MEASUREMENTS_STORAGE_KEY = 'medinexus_measurements_db';
const CHAT_STORAGE_KEY = 'medinexus_chats_db';

// Seeded sample report for Sarah Jenkins (demonstrates real AI breakdown)
const SEEDED_RECORDS: MedicalRecord[] = [
  {
    id: 'rec_sample_cbc_01',
    userId: 'usr_sarah_jenkins_101',
    title: 'Comprehensive Metabolic & Lipid Panel',
    category: 'Lab Report',
    date: '2026-03-12',
    fileName: 'Quest_Diagnostics_Metabolic_Panel.pdf',
    fileSize: 248102,
    fileType: 'application/pdf',
    status: 'analyzed',
    createdAt: '2026-03-12T14:30:00.000Z',
    extractedText: `QUEST DIAGNOSTICS - CLINICAL REPORT
Patient Name: Sarah Jenkins | DOB: 1988-06-14 | Sex: Female
Date Collected: 2026-03-12 | Ordering Physician: Dr. Robert Vance, MD

TEST NAME                  RESULT    REFERENCE INTERVAL   FLAG
--------------------------------------------------------------
Fasting Blood Glucose       108       70 - 99 mg/dL        HIGH
Hemoglobin A1c              5.8       4.0 - 5.6 %          HIGH
Total Cholesterol           214       <200 mg/dL           HIGH
HDL Cholesterol              54       >50 mg/dL            NORMAL
LDL Cholesterol (Calc)      138       <100 mg/dL           HIGH
Triglycerides               110       <150 mg/dL           NORMAL
Serum Creatinine           0.82      0.50 - 1.10 mg/dL    NORMAL
eGFR (CKD-EPI)             94        >60 mL/min/1.73m2    NORMAL
Alanine Aminotransferase    22        7 - 35 U/L           NORMAL`,
    analysis: {
      reportType: 'Comprehensive Metabolic & Lipid Profile',
      reportDate: '2026-03-12',
      summary: 'This report evaluates blood sugar regulation, kidney function, and cardiovascular lipid markers. Several markers (Fasting Glucose, Hemoglobin A1c, and LDL cholesterol) are slightly elevated above the standard laboratory baseline, indicating mild pre-diabetic tendency and borderline high cholesterol.',
      metrics: [
        {
          name: 'Fasting Blood Glucose',
          value: '108',
          unit: 'mg/dL',
          referenceRange: '70 - 99',
          status: 'abnormal',
          explanation: 'Amount of sugar circulating in blood after fasting. 108 mg/dL is mildly above standard fasting thresholds (pre-diabetes range: 100-125 mg/dL).',
        },
        {
          name: 'Hemoglobin A1c',
          value: '5.8',
          unit: '%',
          referenceRange: '4.0 - 5.6',
          status: 'abnormal',
          explanation: 'Estimates average blood sugar over the preceding 2 to 3 months. 5.8% reflects early pre-diabetes range.',
        },
        {
          name: 'Total Cholesterol',
          value: '214',
          unit: 'mg/dL',
          referenceRange: '<200',
          status: 'abnormal',
          explanation: 'Combined measure of circulating blood lipids. Slightly above recommended 200 mg/dL baseline.',
        },
        {
          name: 'HDL Cholesterol',
          value: '54',
          unit: 'mg/dL',
          referenceRange: '>50',
          status: 'normal',
          explanation: '"Good" cholesterol that clears excess lipids from artery walls.',
        },
        {
          name: 'LDL Cholesterol',
          value: '138',
          unit: 'mg/dL',
          referenceRange: '<100',
          status: 'abnormal',
          explanation: '"Bad" cholesterol. Target is typically <100 mg/dL to maintain optimal cardiovascular health.',
        },
        {
          name: 'Serum Creatinine',
          value: '0.82',
          unit: 'mg/dL',
          referenceRange: '0.50 - 1.10',
          status: 'normal',
          explanation: 'Waste product filtered by kidneys; healthy values indicate effective renal filtration.',
        },
      ],
      medicalTerms: [
        {
          term: 'Hemoglobin A1c',
          plainDefinition: 'A 90-day snapshot of blood sugar levels bound to red blood cells.',
        },
        {
          term: 'eGFR (Estimated Glomerular Filtration Rate)',
          plainDefinition: 'A score showing how efficiently kidneys remove waste from blood.',
        },
        {
          term: 'LDL (Low-Density Lipoprotein)',
          plainDefinition: 'Cholesterol particles that can deposit in arterial walls if elevated.',
        },
      ],
      questionsForDoctor: [
        'Would you recommend dietary modifications or an exercise routine to bring my fasting glucose and A1c back below 5.6%?',
        'Do you advise initiating statin therapy or should we re-check my lipid panel in 3 to 6 months?',
        'Are there any specific lifestyle or carbohydrate management tips you suggest for pre-diabetes prevention?',
      ],
      potentialConcerns: [
        'Mild hyperglycemia (Glucose 108 mg/dL & HbA1c 5.8%)',
        'Mild hyperlipidemia (Total Cholesterol 214 mg/dL & LDL 138 mg/dL)',
      ],
      uncertaintiesOrNotes: 'None. All values and reference ranges were clearly extracted from the clinical report.',
      analyzedAt: '2026-03-12T14:32:10.000Z',
    },
  },
];

// Seeded sample measurements for Sarah Jenkins
const SEEDED_MEASUREMENTS: HealthMeasurement[] = [
  {
    id: 'm_01',
    userId: 'usr_sarah_jenkins_101',
    type: 'blood_pressure',
    title: 'Morning Resting BP',
    primaryValue: 124, // Systolic
    secondaryValue: 82, // Diastolic
    unit: 'mmHg',
    recordedAt: '2026-03-10T08:15:00.000Z',
    notes: 'Measured sitting quietly for 5 minutes',
  },
  {
    id: 'm_02',
    userId: 'usr_sarah_jenkins_101',
    type: 'blood_pressure',
    title: 'Evening Check',
    primaryValue: 118,
    secondaryValue: 78,
    unit: 'mmHg',
    recordedAt: '2026-03-12T19:30:00.000Z',
    notes: 'After light walking',
  },
  {
    id: 'm_03',
    userId: 'usr_sarah_jenkins_101',
    type: 'blood_pressure',
    title: 'Post-Workout BP',
    primaryValue: 122,
    secondaryValue: 80,
    unit: 'mmHg',
    recordedAt: '2026-03-15T11:00:00.000Z',
    notes: 'Resting after yoga session',
  },
  {
    id: 'm_04',
    userId: 'usr_sarah_jenkins_101',
    type: 'blood_glucose',
    title: 'Fasting Blood Glucose',
    primaryValue: 108,
    unit: 'mg/dL',
    recordedAt: '2026-03-12T07:30:00.000Z',
    notes: 'Morning fasting blood sugar test',
  },
  {
    id: 'm_05',
    userId: 'usr_sarah_jenkins_101',
    type: 'weight',
    title: 'Weekly Weigh-in',
    primaryValue: 65.5,
    unit: 'kg',
    recordedAt: '2026-03-15T08:00:00.000Z',
    notes: 'Empty stomach',
  },
];

class StorageService {
  private records: MedicalRecord[] = [];
  private measurements: HealthMeasurement[] = [];
  private chatSessions: Map<string, ChatMessage[]> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    try {
      const storedRecords = localStorage.getItem(RECORDS_STORAGE_KEY);
      if (storedRecords) {
        this.records = JSON.parse(storedRecords);
      } else {
        this.records = [...SEEDED_RECORDS];
        this.saveRecords();
      }

      const storedMeasurements = localStorage.getItem(MEASUREMENTS_STORAGE_KEY);
      if (storedMeasurements) {
        this.measurements = JSON.parse(storedMeasurements);
      } else {
        this.measurements = [...SEEDED_MEASUREMENTS];
        this.saveMeasurements();
      }

      const storedChats = localStorage.getItem(CHAT_STORAGE_KEY);
      if (storedChats) {
        const parsed = JSON.parse(storedChats);
        Object.entries(parsed).forEach(([uid, msgs]) => {
          if (Array.isArray(msgs)) {
            const seen = new Set<string>();
            const uniqueMsgs: ChatMessage[] = [];
            for (const m of msgs as ChatMessage[]) {
              if (m && m.id && !seen.has(m.id)) {
                seen.add(m.id);
                uniqueMsgs.push(m);
              }
            }
            this.chatSessions.set(uid, uniqueMsgs);
          }
        });
        this.saveChats();
      }
    } catch (e) {
      console.warn('Storage init fallback:', e);
      this.records = [...SEEDED_RECORDS];
      this.measurements = [...SEEDED_MEASUREMENTS];
    }
  }

  private saveRecords() {
    try {
      localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(this.records));
    } catch (e) {
      console.error('Failed to save records to storage:', e);
    }
  }

  private saveMeasurements() {
    try {
      localStorage.setItem(MEASUREMENTS_STORAGE_KEY, JSON.stringify(this.measurements));
    } catch (e) {
      console.error('Failed to save measurements to storage:', e);
    }
  }

  private saveChats() {
    try {
      const obj: Record<string, ChatMessage[]> = {};
      this.chatSessions.forEach((msgs, uid) => {
        obj[uid] = msgs;
      });
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.error('Failed to save chats to storage:', e);
    }
  }

  // --- MEDICAL RECORDS API (User Scoped) ---

  public getRecords(userId: string): MedicalRecord[] {
    if (!userId) return [];
    return this.records
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public getRecordById(userId: string, recordId: string): MedicalRecord | null {
    if (!userId || !recordId) return null;
    const match = this.records.find((r) => r.id === recordId);
    if (!match || match.userId !== userId) {
      return null; // Strict authorization check
    }
    return match;
  }

  public saveRecord(userId: string, recordData: Omit<MedicalRecord, 'id' | 'userId' | 'createdAt'>): MedicalRecord {
    if (!userId) throw new Error('Authorization error: Missing user ID');

    const newRecord: MedicalRecord = {
      ...recordData,
      id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
      createdAt: new Date().toISOString(),
    };

    this.records.unshift(newRecord);
    this.saveRecords();
    return newRecord;
  }

  public updateRecordAnalysis(userId: string, recordId: string, analysis: ReportAnalysis): MedicalRecord {
    const record = this.getRecordById(userId, recordId);
    if (!record) throw new Error('Record not found or unauthorized');

    record.analysis = analysis;
    record.status = 'analyzed';
    this.saveRecords();
    return record;
  }

  public deleteRecord(userId: string, recordId: string): boolean {
    const index = this.records.findIndex((r) => r.id === recordId && r.userId === userId);
    if (index === -1) return false;

    this.records.splice(index, 1);
    this.saveRecords();
    return true;
  }

  // --- HEALTH MEASUREMENTS API (User Scoped) ---

  public getMeasurements(userId: string): HealthMeasurement[] {
    if (!userId) return [];
    return this.measurements
      .filter((m) => m.userId === userId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
  }

  public saveMeasurement(userId: string, measurement: Omit<HealthMeasurement, 'id' | 'userId'>): HealthMeasurement {
    if (!userId) throw new Error('Authorization error: Missing user ID');

    const newM: HealthMeasurement = {
      ...measurement,
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      userId,
    };

    this.measurements.unshift(newM);
    this.saveMeasurements();
    return newM;
  }

  public deleteMeasurement(userId: string, measurementId: string): boolean {
    const index = this.measurements.findIndex((m) => m.id === measurementId && m.userId === userId);
    if (index === -1) return false;

    this.measurements.splice(index, 1);
    this.saveMeasurements();
    return true;
  }

  // --- CHAT SESSIONS API (User Scoped) ---

  public getChatMessages(userId: string): ChatMessage[] {
    if (!userId) return [];
    const msgs = this.chatSessions.get(userId) || [];
    return [...msgs];
  }

  public addChatMessage(userId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
    if (!userId) throw new Error('Authorization error: Missing user ID');

    const chatMsg: ChatMessage = {
      ...message,
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };

    const existing = this.chatSessions.get(userId) || [];
    // Ensure no duplicate IDs
    const updated = [...existing.filter((m) => m.id !== chatMsg.id), chatMsg];
    this.chatSessions.set(userId, updated);
    this.saveChats();
    return chatMsg;
  }

  public clearChatMessages(userId: string): void {
    if (!userId) return;
    this.chatSessions.delete(userId);
    this.saveChats();
  }

  // Delete all records & data belonging to a user (account deletion)
  public deleteAllUserData(userId: string): void {
    this.records = this.records.filter((r) => r.userId !== userId);
    this.measurements = this.measurements.filter((m) => m.userId !== userId);
    this.chatSessions.delete(userId);
    this.saveRecords();
    this.saveMeasurements();
    this.saveChats();
  }
}

export const storageService = new StorageService();
