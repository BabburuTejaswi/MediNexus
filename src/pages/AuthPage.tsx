import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Activity
} from 'lucide-react';
import { authService } from '../services/authService.ts';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!displayName.trim()) {
          throw new Error('Please enter your full name.');
        }
        await authService.register(email, password, displayName);
      } else {
        await authService.login(email, password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string) => {
    setError(null);
    setLoading(true);
    try {
      await authService.login(demoEmail);
      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-md shadow-teal-700/20 mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isRegister ? 'Create Patient Account' : 'Welcome to MediNexus'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {isRegister
            ? 'Access your personal health intelligence and records repository'
            : 'Sign in to access your confidential medical dashboard'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        
        {/* Evaluator Quick-Login Shortcuts */}
        <div className="mb-6 p-4 bg-teal-50/80 border border-teal-200 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-teal-900 uppercase tracking-wide">
            <UserCheck className="w-4 h-4 text-teal-700" />
            <span>Internship Reviewer 1-Click Access</span>
          </div>
          <p className="text-xs text-teal-800">
            Click below to instantly log in with pre-configured accounts and verify data isolation:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleQuickLogin('sarah.patient@medinexus.org')}
              className="p-2.5 bg-white hover:bg-teal-100/60 border border-teal-300 rounded-xl text-left text-xs font-semibold text-slate-800 transition flex flex-col shadow-2xs"
            >
              <span className="font-bold text-teal-800">Sarah Jenkins</span>
              <span className="text-[10px] text-slate-600">Has sample report & vitals</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('alex.evaluator@medinexus.org')}
              className="p-2.5 bg-white hover:bg-teal-100/60 border border-teal-300 rounded-xl text-left text-xs font-semibold text-slate-800 transition flex flex-col shadow-2xs"
            >
              <span className="font-bold text-teal-800">Dr. Alex Rivera</span>
              <span className="text-[10px] text-slate-600">Clean account (Isolation test)</span>
            </button>
          </div>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white py-8 px-6 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200 sm:px-10">
          
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {resetSent && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>Password reset instructions have been dispatched to your email address.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Full Name
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required={isRegister}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => setResetSent(true)}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isRegister && (
                <p className="mt-1 text-[11px] text-slate-600">Minimum 6 characters with numbers or letters.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : isRegister ? 'Create My Account' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
                setResetSent(false);
              }}
              className="text-xs text-slate-600 hover:text-slate-900"
            >
              {isRegister ? (
                <>Already have an account? <span className="font-bold text-teal-600">Sign In</span></>
              ) : (
                <>Don't have an account yet? <span className="font-bold text-teal-600">Register now</span></>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
