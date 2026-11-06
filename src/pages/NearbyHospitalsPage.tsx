import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  PhoneCall,
  Search,
  ExternalLink,
  ShieldAlert,
  Hospital,
  AlertOctagon,
  Clock,
  Compass
} from 'lucide-react';
import { UserProfile } from '../types/index.ts';
import { EMERGENCY_NUMBERS } from '../utils/emergencyTriage.ts';

interface NearbyHospitalsPageProps {
  currentUser: UserProfile;
}

interface HospitalData {
  name: string;
  category: string;
  address: string;
  phone: string;
  emergencyDepartment: boolean;
  distanceEstimate: string;
  searchQuery: string;
}

// Curated verified healthcare hubs and emergency facilities
const POPULAR_CITY_HOSPITALS: Record<string, HospitalData[]> = {
  default: [
    {
      name: 'Central Emergency Trauma Center & General Hospital',
      category: 'Level 1 Trauma Center',
      address: 'Metropolitan Healthcare Plaza, Emergency Wing',
      phone: '112',
      emergencyDepartment: true,
      distanceEstimate: 'Nearest Emergency Care',
      searchQuery: 'emergency+hospital+near+me',
    },
    {
      name: 'Regional Cardiology & Urgent Care Institute',
      category: 'Urgent Care & Specialty Clinic',
      address: 'Main Health Corridor',
      phone: '112',
      emergencyDepartment: true,
      distanceEstimate: 'Primary Care Area',
      searchQuery: 'urgent+care+hospital+near+me',
    },
  ],
};

export const NearbyHospitalsPage: React.FC<NearbyHospitalsPageProps> = ({ currentUser }) => {
  const [cityQuery, setCityQuery] = useState('');
  const [geoLocating, setGeoLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Use browser Geolocation API
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser. Please search by city or district below.');
      return;
    }

    setGeoLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setGeoLocating(false);
      },
      (err) => {
        console.warn('Geolocation denied or timed out:', err);
        setGeoError('Location permission denied or unavailable. You can search directly by entering your city or area below.');
        setGeoLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const getDirectMapsUrl = (query: string) => {
    if (userCoords) {
      return `https://www.google.com/maps/search/hospitals/@${userCoords.lat},${userCoords.lng},14z`;
    }
    const cleanQuery = cityQuery.trim() ? `hospitals+near+${encodeURIComponent(cityQuery)}` : query;
    return `https://www.google.com/maps/search/${cleanQuery}`;
  };

  const emergencyNumber = EMERGENCY_NUMBERS[currentUser.emergencyRegion] || EMERGENCY_NUMBERS.INDIA;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Hospital className="w-6 h-6 text-teal-600" />
            <span>Emergency Facilities & Hospital Finder</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Free Google Maps navigation to emergency rooms, trauma centers, and medical clinics worldwide.
          </p>
        </div>

        {/* Rapid Call Emergency Banner */}
        <a
          href={`tel:${emergencyNumber.replace(/[^0-9]/g, '')}`}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition"
        >
          <PhoneCall className="w-4 h-4 fill-white" />
          <span>Call Dispatch ({emergencyNumber})</span>
        </a>
      </div>

      {/* Zero Cost Banner */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl text-xs text-teal-900 flex items-start gap-3">
        <Compass className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Zero-Cost Google Maps Platform Integration</p>
          <p className="text-teal-800 text-[11px] mt-0.5">
            MediNexus uses direct universal Google Maps navigation and routing links. This keeps your application 100% free with no expensive Places API billing requirements.
          </p>
        </div>
      </div>

      {/* Search / Geolocation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          <button
            onClick={handleGetLocation}
            disabled={geoLocating}
            className="w-full sm:w-auto px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 ${geoLocating ? 'animate-spin' : ''}`} />
            <span>{geoLocating ? 'Acquiring GPS...' : 'Use My Current Location'}</span>
          </button>

          <span className="text-xs font-bold text-slate-400 uppercase">Or</span>

          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              placeholder="Search by city, town, or zip code (e.g., Boston, Mumbai, London, Dallas)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <a
            href={getDirectMapsUrl(cityQuery || 'hospital+near+me')}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shrink-0"
          >
            <span>Search in Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

        </div>

        {userCoords && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center justify-between">
            <span>
              GPS Coordinates locked: {userCoords.lat.toFixed(4)}°, {userCoords.lng.toFixed(4)}°
            </span>
            <a
              href={`https://www.google.com/maps/search/hospitals/@${userCoords.lat},${userCoords.lng},14z`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline text-emerald-900"
            >
              Open Live Local Map &rarr;
            </a>
          </div>
        )}

        {geoError && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            {geoError}
          </div>
        )}
      </div>

      {/* Suggested Emergency Facilities Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Card 1: Nearest Emergency Room Search */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 transition flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                24/7 Emergency Care
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nearest Hospital Emergency Room (ER)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                For acute chest pain, trauma, suspected stroke, loss of consciousness, or severe distress.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <a
              href={`https://www.google.com/maps/search/emergency+room+hospital+${encodeURIComponent(cityQuery || 'near me')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Get Directions</span>
            </a>

            <a
              href={`tel:${emergencyNumber.replace(/[^0-9]/g, '')}`}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call {emergencyNumber}</span>
            </a>
          </div>
        </div>

        {/* Card 2: Urgent Care & Outpatient Clinic Search */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-teal-300 transition flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700">
                <Hospital className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-[10px] font-bold uppercase">
                Walk-In / Same Day
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">
                Urgent Care & Medical Walk-In Clinics
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                For minor injuries, infections, simple sprains, flu symptoms, and non-life-threatening concerns.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <a
              href={`https://www.google.com/maps/search/urgent+care+clinics+${encodeURIComponent(cityQuery || 'near me')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Find Urgent Care</span>
            </a>
          </div>
        </div>

      </div>

      {/* Verified Official Emergency Hotlines Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Verified Regional Emergency Hotline Directory
          </h3>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {[
            { region: 'India (National Helpline)', number: '112', service: 'Unified Emergency Response Service (Police, Fire, Ambulance). State ambulance services: 108 / 102 (availability varies by state/service).' },
            { region: 'United Kingdom', number: '999', service: 'National Emergency Dispatch (or 111 for NHS Non-Emergency)' },
            { region: 'European Union', number: '112', service: 'Pan-European Emergency Hotline' },
            { region: 'United States & Canada', number: '911', service: 'Emergency Dispatch (Police, Fire, Medical)' },
            { region: 'Australia', number: '000', service: 'Triple Zero Emergency Medical Services' },
          ].map((item, idx) => (
            <div key={idx} className="p-4 sm:p-5 flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">{item.region}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{item.service}</p>
              </div>
              <a
                href={`tel:${item.number.split(' ')[0]}`}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-800 rounded-lg font-bold text-xs flex items-center gap-1.5 transition"
              >
                <PhoneCall className="w-3 h-3" />
                <span>Call {item.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
