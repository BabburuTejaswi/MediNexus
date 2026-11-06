import React, { useState } from 'react';
import {
  User,
  Shield,
  PhoneCall,
  Save,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  LogOut,
  FolderLock
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';
import { authService } from '../services/authService.ts';
import { storageService } from '../services/storageService.ts';

interface ProfileSettingsPageProps {
  currentUser: UserProfile;
  onOpenDisclaimerReview: () => void;
  onLogout: () => void;
}

export const ProfileSettingsPage: React.FC<ProfileSettingsPageProps> = ({
  currentUser,
  onOpenDisclaimerReview,
  onLogout,
}) => {
  const [displayName, setDisplayName] = useState(currentUser.displayName || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser.bloodGroup || 'O+');
  const [emergencyContactName, setEmergencyContactName] = useState(currentUser.emergencyContactName || '');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(currentUser.emergencyContactPhone || '');
  const [emergencyRegion, setEmergencyRegion] = useState(currentUser.emergencyRegion || 'US_CAN');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await authService.updateProfile({
        displayName,
        phone,
        bloodGroup,
        emergencyContactName,
        emergencyContactPhone,
        emergencyRegion,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.error('Failed to update profile:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    storageService.deleteAllUserData(currentUser.uid);
    await authService.deleteAccount();
    onLogout();
  };

  const recordsCount = storageService.getRecords(currentUser.uid).length;
  const vitalsCount = storageService.getMeasurements(currentUser.uid).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <User className="w-6 h-6 text-teal-600" />
            <span>Patient Profile & Emergency Preferences</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure your personal medical details, emergency contact information, and regional safety hotlines.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="px-4 py-2 border border-slate-200 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-xs font-bold text-slate-700 transition flex items-center gap-1.5"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Patient profile and emergency preferences successfully updated.</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
          Personal Information
        </h3>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Full Legal Name
            </label>
            <input
              type="text"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Email Address (Account ID)
            </label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full p-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Primary Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Blood Type
            </label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Emergency Contact & Region */}
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider pt-4 pb-2 border-b border-slate-100">
          Emergency Contact & Dispatch Region
        </h3>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Emergency Contact Name & Relationship
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe (Spouse / Guardian)"
              value={emergencyContactName}
              onChange={(e) => setEmergencyContactName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Emergency Contact Telephone
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 999-9999"
              value={emergencyContactPhone}
              onChange={(e) => setEmergencyContactPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase mb-1">
              Regional Emergency Services Hotline
            </label>
            <select
              value={emergencyRegion}
              onChange={(e) => setEmergencyRegion(e.target.value as any)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
            >
              <option value="INDIA">India (National Emergency 112 • Ambulance 108 / 102)</option>
              <option value="US_CAN">United States & Canada (Dial 911)</option>
              <option value="UK">United Kingdom (Dial 999)</option>
              <option value="EU">European Union (Dial 112)</option>
              <option value="AU">Australia (Dial 000)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>

      {/* AI Disclaimer & Compliance Details */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">AI Medical Disclaimer Status</h3>
          </div>
          <button
            onClick={onOpenDisclaimerReview}
            className="text-xs font-bold text-teal-700 hover:text-teal-800"
          >
            Review Terms
          </button>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2">
          {currentUser.disclaimerAck?.acknowledged ? (
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>
                Acknowledged on {new Date(currentUser.disclaimerAck.timestamp).toLocaleDateString()} (Version: {currentUser.disclaimerAck.version})
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-800 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Pending acknowledgment on next assistant conversation.</span>
            </div>
          )}
          <p className="text-slate-500 text-[11px] leading-relaxed">
            MediNexus complies with strict ethical AI transparency principles: non-diagnostic scope, emergency prioritization, and complete user ownership of health records.
          </p>
        </div>
      </div>

      {/* Account Deletion & Data Privacy Card */}
      <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3 text-rose-800">
          <div className="p-2 bg-rose-100 rounded-xl">
            <Trash2 className="w-5 h-5 text-rose-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Permanently Delete Account & Health Records</h3>
            <p className="text-xs text-rose-900/70 mt-0.5">
              Current account has {recordsCount} stored records and {vitalsCount} logged measurements.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Deleting your MediNexus account will permanently purge all stored documents, extracted laboratory biomarkers, trend measurements, and conversation sessions. This action is irreversible.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          Proceed to Account Deletion
        </button>
      </div>

      {/* Deletion Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-700 font-bold">
              <AlertTriangle className="w-6 h-6 text-rose-600" />
              <span>Confirm Permanent Account Deletion</span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To confirm that you wish to permanently delete your MediNexus patient profile and all {recordsCount} associated medical records, please type <strong>DELETE</strong> below:
            </p>

            <input
              type="text"
              placeholder="Type DELETE"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteInput('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteInput !== 'DELETE'}
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
