import React, { useState } from 'react';
import {
  Activity,
  MessageSquareHeart,
  FileText,
  FolderHeart,
  LineChart,
  MapPin,
  User,
  LogOut,
  Menu,
  X,
  PhoneCall,
  Shield,
  UserCheck
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';
import { authService } from '../services/authService.ts';
import { EMERGENCY_NUMBERS } from '../utils/emergencyTriage.ts';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  currentUser: UserProfile | null;
  onOpenDisclaimerReview: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onNavigate,
  currentUser,
  onOpenDisclaimerReview,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'assistant', label: 'AI Health Assistant', icon: MessageSquareHeart },
    { id: 'report-analysis', label: 'Report Analysis', icon: FileText },
    { id: 'records', label: 'Medical Records', icon: FolderHeart },
    { id: 'history', label: 'Health History', icon: LineChart },
    { id: 'hospitals', label: 'Nearby Hospitals', icon: MapPin },
  ];

  const handleNavClick = (tabId: string) => {
    onNavigate(tabId);
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    onNavigate('landing');
    setUserDropdownOpen(false);
  };

  const emergencyNumber = currentUser
    ? EMERGENCY_NUMBERS[currentUser.emergencyRegion] || EMERGENCY_NUMBERS.INDIA
    : '112';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div
            onClick={() => onNavigate(currentUser ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 text-white flex items-center justify-center shadow-md shadow-teal-700/20 group-hover:scale-105 transition">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center">
                Medi<span className="text-teal-600">Nexus</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-wider text-slate-600 -mt-1">
                Clinical AI & Records
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          {currentUser && (
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition ${
                      isActive
                        ? 'bg-teal-50 text-teal-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* Action buttons / User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Quick Emergency Call Button */}
            <button
              onClick={() => setShowSosModal(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition shadow-2xs cursor-pointer"
              title="Emergency Hotline (112)"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>SOS: 112</span>
            </button>

            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[120px]">
                      {currentUser.displayName}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5 truncate max-w-[120px]">
                      {currentUser.email}
                    </p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{currentUser.displayName}</p>
                      <p className="text-xs text-slate-600 truncate">{currentUser.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-[10px] font-semibold">
                        Region: {currentUser.emergencyRegion}
                      </span>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleNavClick('profile');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        Profile & Settings
                      </button>

                      <button
                        onClick={() => {
                          onOpenDisclaimerReview();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-slate-400" />
                        Review AI Medical Disclaimer
                      </button>
                    </div>

                    {/* Evaluator Quick Switch Tool */}
                    <div className="px-4 py-2 bg-slate-50/80 border-t border-b border-slate-100">
                      <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <UserCheck className="w-3 h-3 text-teal-600" /> Evaluator Quick-Switch
                      </p>
                      <div className="space-y-1">
                        <button
                          onClick={async () => {
                            await authService.login('sarah.patient@medinexus.org');
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 text-[11px] rounded transition ${
                            currentUser.email.includes('sarah')
                              ? 'bg-teal-600 text-white font-medium'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          👤 Sarah Jenkins (Pre-loaded data)
                        </button>
                        <button
                          onClick={async () => {
                            await authService.login('alex.evaluator@medinexus.org');
                            setUserDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2 py-1 text-[11px] rounded transition ${
                            currentUser.email.includes('alex')
                              ? 'bg-teal-600 text-white font-medium'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          👤 Dr. Alex Rivera (Empty account for test)
                        </button>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('auth')}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
                >
                  Sign In / Register
                </button>
              </div>
            )}

            {/* Mobile menu trigger */}
            {currentUser && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && currentUser && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                onOpenDisclaimerReview();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              <Shield className="w-4 h-4 text-slate-400" />
              Review AI Medical Disclaimer
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* SOS 112 Confirmation Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-700">
                <div className="p-2 bg-rose-100 rounded-xl">
                  <PhoneCall className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Emergency Assistance (India)</h3>
                  <p className="text-[11px] text-slate-500">Initiate call via your device dialer</p>
                </div>
              </div>
              <button
                onClick={() => setShowSosModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Tapping a number below will open your device telephone dialer to place the call. MediNexus does not automatically place emergency calls.
            </p>

            <div className="space-y-2.5 pt-1">
              <a
                href="tel:112"
                onClick={() => setShowSosModal(false)}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 fill-white" />
                  <span>Call National Emergency (112)</span>
                </div>
                <span className="text-[10px] bg-rose-700/80 px-2 py-0.5 rounded-full font-semibold">
                  Primary Helpline
                </span>
              </a>

              <a
                href="tel:108"
                onClick={() => setShowSosModal(false)}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs transition flex items-center justify-between border border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-teal-700" />
                  <span>Call Ambulance (108)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  State Emergency Medical
                </span>
              </a>

              <a
                href="tel:102"
                onClick={() => setShowSosModal(false)}
                className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl font-bold text-xs transition flex items-center justify-between border border-slate-200"
              >
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-teal-700" />
                  <span>Call Referral Ambulance (102)</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium">
                  Pregnancy / Infant Transport
                </span>
              </a>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900 leading-normal">
              💡 <strong>112</strong> is India's single unified national emergency helpline. 108 and 102 operate as state ambulance services; service availability can vary by state or district.
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSosModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
