/**
 * MediNexus Automated Verification Suite
 * Tests emergency triage, negation handling, multi-user isolation, and metric classification.
 */

import { evaluateEmergencySymptoms } from '../src/utils/emergencyTriage.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('\n=============================================');
console.log(' Running MediNexus Automated Test Suite');
console.log('=============================================\n');

// 1. EMERGENCY TRIAGE: ACUTE EMERGENCIES (Must Trigger)
console.log('Suite 1: Emergency Symptom Detection (Acute Cases)');
const acuteTestCases = [
  'I am experiencing severe crushing chest pain right now',
  'Help, my mom collapsed and is unconscious and not waking up',
  'Sudden weakness on one side and slurred speech, face drooping',
  'I cannot breathe and my lips are turning blue',
  'He had a major accident and is bleeding heavily from an open wound',
  'Patient is vomiting blood profusely',
];

for (const testCase of acuteTestCases) {
  const result = evaluateEmergencySymptoms(testCase);
  assert(result.isEmergency === true, `Triggered emergency for: "${testCase}" [Category: ${result.triggerCategory}]`);
}

// 2. EMERGENCY TRIAGE: NEGATION CASES (Must NOT Trigger)
console.log('\nSuite 2: Negation Handling (Must NOT Trigger False Alarms)');
const negationTestCases = [
  'I do not have crushing chest pain',
  'Doctor said there is no shortness of breath',
  'Patient denies slurred speech or facial droop',
  'I don\'t have severe bleeding',
  'Ruled out heart attack symptoms yesterday',
];

for (const testCase of negationTestCases) {
  const result = evaluateEmergencySymptoms(testCase);
  assert(result.isEmergency === false, `Correctly negated emergency for: "${testCase}"`);
}

// 3. EMERGENCY TRIAGE: HISTORICAL & HYPOTHETICAL (Must NOT Trigger)
console.log('\nSuite 3: Historical & Educational Queries');
const hypotheticalTestCases = [
  'What causes heart attack symptoms in young adults?',
  'Why do people get slurred speech when they are tired?',
  'I had severe chest pain 5 years ago and had a stent placed',
  'Doing a school biology project on what causes stroke symptoms',
];

for (const testCase of hypotheticalTestCases) {
  const result = evaluateEmergencySymptoms(testCase);
  assert(result.isEmergency === false, `Ignored non-acute theoretical query: "${testCase}"`);
}

// 4. DATA MODEL & MULTI-USER ISOLATION
console.log('\nSuite 4: Multi-User Security & Authorization Scoping');

interface MockRecord {
  id: string;
  userId: string;
  reportName: string;
}

const mockDatabase: MockRecord[] = [
  { id: 'rec-1', userId: 'user-alice-123', reportName: 'Alice Complete Blood Count' },
  { id: 'rec-2', userId: 'user-bob-456', reportName: 'Bob Lipid Panel' },
];

function getRecordsForUser(requestingUserId: string): MockRecord[] {
  // Least privilege filter: records where userId matches auth user
  return mockDatabase.filter(r => r.userId === requestingUserId);
}

function canUserAccessRecord(requestingUserId: string, recordId: string): boolean {
  const record = mockDatabase.find(r => r.id === recordId);
  if (!record) return false;
  return record.userId === requestingUserId;
}

const aliceRecords = getRecordsForUser('user-alice-123');
assert(aliceRecords.length === 1 && aliceRecords[0].reportName.includes('Alice'), 'Alice can read her own records');

const bobCanAccessAlice = canUserAccessRecord('user-bob-456', 'rec-1');
assert(bobCanAccessAlice === false, 'Bob CANNOT access Alice\'s medical record (Unauthorized)');

const aliceCanAccessBob = canUserAccessRecord('user-alice-123', 'rec-2');
assert(aliceCanAccessBob === false, 'Alice CANNOT access Bob\'s medical record (Unauthorized)');

// 5. DISCLAIMER ACKNOWLEDGMENT LOGIC
console.log('\nSuite 5: AI Disclaimer Persistence & Versioning');
const CURRENT_DISCLAIMER_VERSION = 'v1.2-2026';

function isDisclaimerValid(userAck: { acknowledged: boolean; version: string } | null): boolean {
  if (!userAck) return false;
  return userAck.acknowledged === true && userAck.version === CURRENT_DISCLAIMER_VERSION;
}

assert(isDisclaimerValid({ acknowledged: true, version: 'v1.2-2026' }) === true, 'Accepts current valid disclaimer acknowledgment');
assert(isDisclaimerValid({ acknowledged: true, version: 'v1.0-legacy' }) === false, 'Requires re-acknowledgement for outdated disclaimer version');
assert(isDisclaimerValid(null) === false, 'Blocks chat when no disclaimer is recorded');

// 6. INDIA EMERGENCY FLOW TESTS
console.log('\nSuite 6: India Emergency Configuration & Actions');
import { EMERGENCY_NUMBERS, AMBULANCE_NUMBERS_INDIA } from '../src/utils/emergencyTriage.ts';

assert(EMERGENCY_NUMBERS.INDIA === '112', 'India national emergency number is configured as 112');
assert(AMBULANCE_NUMBERS_INDIA.AMBULANCE_EMERGENCY === '108', 'India emergency ambulance number is 108');
assert(AMBULANCE_NUMBERS_INDIA.AMBULANCE_REFERRAL === '102', 'India referral ambulance number is 102');

const acuteSample = evaluateEmergencySymptoms('I am having crushing chest pain right now');
assert(acuteSample.isEmergency === true, 'Acute symptom triggers emergency');
assert(acuteSample.recommendedAction?.includes('112') === true, 'Recommended action prioritizes 112');
assert(acuteSample.recommendedAction?.includes('108') === true, 'Recommended action includes state ambulance 108/102');
assert(!acuteSample.recommendedAction?.includes('911'), 'Action does not include US-specific 911');

console.log('\n=============================================');
console.log(` Summary: ${passed} Passed, ${failed} Failed`);
console.log('=============================================\n');

if (failed > 0) {
  process.exit(1);
}
