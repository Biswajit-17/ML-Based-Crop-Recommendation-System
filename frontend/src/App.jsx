import React, { useState, useEffect } from 'react';

// Dynamic UI Dictionary will be fetched from backend.

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const SOIL_TYPES = [
  { label: "Black Soil (Vertisols)", value: "VERTISOLS" },
  { label: "Red Soil (Alfisols)", value: "ALFISOLS" },
  { label: "Desert Soil (Aridisols)", value: "ARIDISOLS" },
  { label: "Alluvial Soil (Entisols)", value: "ENTISOLS" },
  { label: "Forest Soil (Udalfs)", value: "UDALFS" },
  { label: "Sandy Soil (Psamments)", value: "PSAMMENTS" },
  { label: "Young Soil (Inceptisols)", value: "INCEPTISOLS" }
];

const CROP_IMAGES = {
  "Barley": "barley.jpg",
  "Castor": "castor.jpg",
  "Chickpea": "chickpea.jpg",
  "Cotton": "cotton.jpg",
  "Ragi": "finger_millet.jpg",
  "Groundnut": "groundnut.jpg",
  "Flaxseed / Alsi": "linseed.jpg",
  "Corn": "maize.jpg",
  "Bajra": "pearl_millet.jpg",
  "Tur Dal / Arhar": "pigeonpea.jpg",
  "Mustard / Sarson": "mustard.jpg",
  "Rice": "rice.jpg",
  "Kusum": "safflower.jpg",
  "Til": "sesamum.jpg",
  "Jowar": "sorghum.jpg",
  "Soyabean": "soyabean.jpg",
  "Sugarcane": "sugarcane.jpg",
  "Sunflower": "sunflower.jpg",
  "Wheat": "wheat.jpg",
};

// ─── Season Awareness System ─────────────────────────────────────────────────
// Three-tier classification based on ICAR crop calendar guidelines.
// Tier 1/2: Strict Kharif or Rabi. Tier 3: Flexible / region-dependent.
const CROP_SEASONS = {
  // Tier 1: Strict Kharif (Jun – Nov)
  'COTTON': { tier: 1, season: 'Kharif' },
  'FINGER MILLET': { tier: 1, season: 'Kharif' },
  'PEARL MILLET': { tier: 1, season: 'Kharif' },
  'PIGEONPEA': { tier: 1, season: 'Kharif' },
  'RICE': { tier: 1, season: 'Kharif' },
  'SOYABEAN': { tier: 1, season: 'Kharif' },
  // Tier 2: Strict Rabi (Nov – Apr)
  'BARLEY': { tier: 2, season: 'Rabi' },
  'CHICKPEA': { tier: 2, season: 'Rabi' },
  'LINSEED': { tier: 2, season: 'Rabi' },
  'RAPESEED AND MUSTARD': { tier: 2, season: 'Rabi' },
  'SAFFLOWER': { tier: 2, season: 'Rabi' },
  'WHEAT': { tier: 2, season: 'Rabi' },
  // Tier 3: Flexible / Multi-season / Region-dependent
  'CASTOR': { tier: 3, season: 'Flexible' },
  'GROUNDNUT': { tier: 3, season: 'Flexible' },
  'MAIZE': { tier: 3, season: 'Flexible' },
  'SESAMUM': { tier: 3, season: 'Flexible' },
  'SORGHUM': { tier: 3, season: 'Flexible' },
  'SUNFLOWER': { tier: 3, season: 'Flexible' },
  'SUGARCANE': { tier: 3, season: 'Flexible' },
  // Display-name aliases (backend maps dataset names to local Indian names)
  'CORN': { tier: 3, season: 'Flexible' },   // MAIZE
  'JOWAR': { tier: 3, season: 'Flexible' },   // SORGHUM
  'TIL': { tier: 3, season: 'Flexible' },   // SESAMUM
  'RAGI': { tier: 1, season: 'Kharif' },    // FINGER MILLET
  'BAJRA': { tier: 1, season: 'Kharif' },    // PEARL MILLET
  'TUR DAL / ARHAR': { tier: 1, season: 'Kharif' },    // PIGEONPEA
  'KUSUM': { tier: 2, season: 'Rabi' },      // SAFFLOWER
  'MUSTARD / SARSON': { tier: 2, season: 'Rabi' },      // RAPESEED AND MUSTARD
  'FLAXSEED / ALSI': { tier: 2, season: 'Rabi' },      // LINSEED
};

// Returns the current Indian agricultural season based on calendar month.
const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1; // 1=Jan, 12=Dec
  if (month >= 6 && month <= 10) return 'Kharif';
  if (month >= 11 || month <= 3) return 'Rabi';
  return 'Zaid'; // Apr–May transition window
};

const SEASON_MONTHS = {
  'Kharif': 'June - October',
  'Rabi': 'November - March',
  'Zaid': 'April - May',
};

// Returns a soft advisory badge config for a given crop name (from API).
const getSeasonBadge = (cropName) => {
  const key = cropName.toUpperCase();
  const info = CROP_SEASONS[key];
  const currentSeason = getCurrentSeason();
  if (!info) return null;
  if (info.tier === 3) {
    return {
      icon: '🗺️',
      title: 'Multi-season crop',
      sub: 'Can be grown in multiple seasons, check your local planting calendar',
      cls: 'text-slate-300 border-slate-600/40 bg-slate-700/20',
      subCls: 'text-slate-400',
    };
  }
  const months = SEASON_MONTHS[info.season] || info.season;
  if (info.season === currentSeason) {
    return {
      icon: '🌱',
      title: `Now is the right time to plant!`,
      sub: `This is a ${info.season} crop · Planting window: ${months}`,
      cls: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      subCls: 'text-emerald-400/70',
    };
  }
  return {
    icon: '📅',
    title: `Best planted in ${info.season} season`,
    sub: `Optimal planting window: ${months}`,
    cls: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    subCls: 'text-amber-400/60',
  };
};

const SliderInput = ({ label, name, value, min, max, step, unit, color, onChange }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-center">
      <label className={`text-sm font-semibold ${color}`}>{label}</label>
      <span className="text-sm font-mono bg-slate-900/80 border border-slate-700 text-white px-2 py-0.5 rounded-md">
        {value} <span className="text-slate-500">{unit}</span>
      </span>
    </div>
    <input
      type="range" name={name} min={min} max={max} step={step} value={value}
      onChange={onChange}
      className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-slate-700"
      style={{ accentColor: color.replace('text-', '') }}
    />
  </div>
);

export default function App() {
  const [lang, setLang] = useState("");
  const [languageSelected, setLanguageSelected] = useState(false);
  const [uiDict, setUiDict] = useState(null);
  const [loadingUi, setLoadingUi] = useState(false);
  const [customLang, setCustomLang] = useState("");

  const [formData, setFormData] = useState({
    state_name: 'Maharashtra',
    district_name: '',
    soil_type: 'VERTISOLS',
    n: 50, p: 20, k: 20,
    annual_rainfall: 1000,
    kharif_rainfall: 800,
    rabi_rainfall: 100,
    irrigation_ratio: 0.5
  });

  const [districtsList, setDistrictsList] = useState([]);
  const [soilInputMode, setSoilInputMode] = useState('estimate'); // 'estimate' | 'manual'

  const [climate, setClimate] = useState(null);
  const [loadingClimate, setLoadingClimate] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const t = uiDict || {};

  // 1. Fetch Districts when State changes
  useEffect(() => {
    let cancel = false;
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8000/api/districts/${formData.state_name}`);
        if (!res.ok) throw new Error("Could not fetch districts");
        const data = await res.json();
        if (cancel) return;
        setDistrictsList(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, district_name: data[0] }));
        } else {
          setFormData(prev => ({ ...prev, district_name: "" }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDistricts();
    return () => { cancel = true; };
  }, [formData.state_name]);

  // 2. Fetch Default Climate & Soil data when State OR District changes
  useEffect(() => {
    let cancel = false;
    const fetchDefaults = async () => {
      // Prevent fetching if the district name hasn't updated to match the new district list yet
      if (districtsList.length > 0 && formData.district_name && !districtsList.includes(formData.district_name)) return;

      setLoadingClimate(true);
      setClimate(null);
      setError("");
      try {
        let url = `http://${window.location.hostname}:8000/api/defaults/${formData.state_name}`;
        if (formData.district_name) {
          url += `?district=${encodeURIComponent(formData.district_name)}`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Could not fetch climate data for this location.");
        const data = await res.json();
        if (cancel) return;

        setClimate({
          annual: Math.round(data.annual_rainfall_avg),
          kharif: Math.round(data.kharif_rainfall_avg),
          rabi: Math.round(data.rabi_rainfall_avg),
          irrigation: data.irrigation_ratio_avg
        });
        setFormData(prev => ({
          ...prev,
          n: data.n_avg, p: data.p_avg, k: data.k_avg,
          annual_rainfall: data.annual_rainfall_avg,
          kharif_rainfall: data.kharif_rainfall_avg,
          rabi_rainfall: data.rabi_rainfall_avg,
          irrigation_ratio: data.irrigation_ratio_avg
        }));
      } catch (err) {
        setError("⚠️ Could not connect to backend. Is uvicorn running?");
      } finally {
        if (!cancel) setLoadingClimate(false);
      }
    };

    // Only fetch if we have either a list of districts resolved, or we don't have any districts
    fetchDefaults();
    return () => { cancel = true; };
  }, [formData.state_name, formData.district_name, districtsList]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["state_name", "district_name", "soil_type"].includes(name) ? value : parseFloat(value) || 0
    }));
  };

  const handleSimulate = async (e) => {
    e.preventDefault();
    setSimulating(true);
    setError("");
    setResults(null);
    try {
      const payload = { ...formData, language: lang };
      const res = await fetch(`http://${window.location.hostname}:8000/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Simulation failed. Check backend connection.");
      setResults(await res.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleLanguageSelect = async (selectedLang) => {
    if (!selectedLang.trim()) return;
    setLang(selectedLang);
    setLoadingUi(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/ui-language/${selectedLang}`);
      if (!res.ok) throw new Error("Translation failed");
      const data = await res.json();
      setUiDict(data);
      setLanguageSelected(true);
    } catch (err) {
      alert("Failed to load translation: " + err.message);
    } finally {
      setLoadingUi(false);
    }
  };

  const getRankConfig = () => [
    { medal: "🥇", label: t.rank1, border: "border-amber-400/60", glow: "shadow-amber-500/20", bar: "from-amber-400 to-yellow-500" },
    { medal: "🥈", label: t.rank2, border: "border-slate-400/40", glow: "shadow-slate-400/10", bar: "from-slate-400 to-slate-500" },
    { medal: "🥉", label: t.rank3, border: "border-orange-700/40", glow: "shadow-orange-700/10", bar: "from-orange-600 to-orange-700" },
    { medal: "🏅", label: t.rank4 || "4th Choice", border: "border-emerald-700/40", glow: "shadow-emerald-700/10", bar: "from-emerald-600 to-emerald-700" },
    { medal: "🏅", label: t.rank5 || "5th Choice", border: "border-cyan-700/40", glow: "shadow-cyan-700/10", bar: "from-cyan-600 to-cyan-700" },
  ];

  if (!languageSelected) {
    return (
      <div className="min-h-screen bg-[#070d1a] text-white flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-slate-900 z-0"></div>
        <div className="relative z-10 w-full max-w-md bg-slate-800/40 border border-slate-700/50 p-10 rounded-3xl shadow-2xl backdrop-blur-xl text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-lg shadow-emerald-500/30">🌿</div>
          <h1 className="text-3xl font-black mb-2 tracking-tight">NEXUS <span className="text-emerald-400">Yield</span></h1>
          <p className="text-slate-400 mb-8 text-sm">Please select your preferred language<br />अपनी पसंदीदा भाषा चुनें</p>

          {loadingUi ? (
            <div className="py-8 space-y-4 flex flex-col items-center">
              <svg className="w-10 h-10 animate-spin text-emerald-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-emerald-400 font-medium animate-pulse">Translating Interface...</p>
              <p className="text-xs text-slate-500">Powered by Google Gemma</p>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => handleLanguageSelect("English")}
                className="w-full bg-slate-900/60 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-between group"
              >
                <span>🇬🇧 English</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400">→</span>
              </button>
              <button
                onClick={() => handleLanguageSelect("Hindi")}
                className="w-full bg-slate-900/60 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-between group"
              >
                <span>🇮🇳 हिंदी (Hindi)</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400">→</span>
              </button>
              <button
                onClick={() => handleLanguageSelect("Marathi")}
                className="w-full bg-slate-900/60 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-between group"
              >
                <span>🇮🇳 मराठी (Marathi)</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400">→</span>
              </button>

              <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#0b1526] px-2 text-slate-500">OR TYPE ANY LANGUAGE</span>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Telugu, Spanish, Japanese..."
                  value={customLang}
                  onChange={(e) => setCustomLang(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLanguageSelect(customLang)}
                  className="flex-1 bg-slate-900/80 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 text-white placeholder-slate-600"
                />
                <button
                  onClick={() => handleLanguageSelect(customLang)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 px-5 rounded-xl transition-colors"
                >
                  Go
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070d1a] text-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Top Nav Bar */}
      <nav className="border-b border-slate-800/60 backdrop-blur-md sticky top-0 z-50 bg-[#070d1a]/80">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-sm">🌿</div>
            <span className="font-bold text-lg tracking-tight">NEXUS <span className="text-emerald-400">Yield</span></span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline-block text-xs text-slate-500 font-mono border border-slate-800 px-3 py-1 rounded-full">
              XGBoost + GenAI Engine
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-4 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {t.heroTag}
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 leading-tight">
          {t.heroTitle1}<br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            {t.heroTitle2}
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto">
          {t.heroSub}
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ─── LEFT PANEL ─── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Location & Soil Card */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5">{t.farmProfile}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.state}</label>
                  <select
                    name="state_name" value={formData.state_name} onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-600/60 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all hover:border-slate-500"
                  >
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {districtsList.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.district || "Geographic District"}</label>
                    <select
                      name="district_name" value={formData.district_name} onChange={handleChange}
                      className="w-full bg-slate-900 border border-slate-600/60 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all hover:border-slate-500"
                    >
                      {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">{t.soil}</label>
                  <select
                    name="soil_type" value={formData.soil_type} onChange={handleChange}
                    className="w-full bg-slate-900 border border-slate-600/60 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all hover:border-slate-500"
                  >
                    {SOIL_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Live Climate Readout */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.liveClimate}</h2>
                {loadingClimate ? (
                  <span className="text-xs text-emerald-400 animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping"></span> {t.fetching}
                  </span>
                ) : climate ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span> {t.loaded}
                  </span>
                ) : null}
              </div>

              {loadingClimate ? (
                <div className="grid grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-slate-700/50 rounded-xl h-16 animate-pulse" />
                  ))}
                </div>
              ) : climate ? (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: t.annual, value: climate.annual, unit: "mm" },
                    { label: t.kharif, value: climate.kharif, unit: "mm" },
                    { label: t.rabi, value: climate.rabi, unit: "mm" },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-900/60 rounded-xl p-3 text-center border border-slate-700/30">
                      <div className="text-xl font-bold text-cyan-400">{item.value}</div>
                      <div className="text-xs text-slate-500">{item.unit} {item.label}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">{t.noClimate}</p>
              )}
              <p className="text-xs text-slate-600 mt-3 text-center">{t.autoFetch}</p>
            </div>

            {/* Soil Chemistry Card */}
            <div className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-6 backdrop-blur-sm">
              {/* Header + Mode Toggle */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">{t.soilChem}</h2>
                <div className="flex items-center bg-slate-900/60 border border-slate-700/40 rounded-lg p-0.5">
                  <button
                    onClick={() => setSoilInputMode('estimate')}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${soilInputMode === 'estimate'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    📊 Estimate
                  </button>
                  <button
                    onClick={() => {
                      setSoilInputMode('manual');
                      setFormData(prev => ({ ...prev, n: 0, p: 0, k: 0 }));
                    }}
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-md transition-all ${soilInputMode === 'manual'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    🧪 My Soil Card
                  </button>
                </div>
              </div>

              {/* Estimate Mode Warning */}
              {soilInputMode === 'estimate' && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2.5 mb-4">
                  <span className="text-amber-400 text-sm mt-0.5">⚠️</span>
                  <p className="text-[11px] text-amber-300/80 leading-relaxed">
                    Using <strong>district historical averages</strong>. For precise results, switch to <strong>My Soil Card</strong> and enter values from your Government Soil Health Card report.
                  </p>
                </div>
              )}

              {/* Manual Mode Instructions */}
              {soilInputMode === 'manual' && (
                <div className="flex items-start gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-xl px-3 py-2.5 mb-4">
                  <span className="text-emerald-400 text-sm mt-0.5">✅</span>
                  <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                    Enter the <strong>N, P, K values</strong> exactly as printed on your <strong>Soil Health Card</strong> report from the Government test centre.
                  </p>
                </div>
              )}

              {soilInputMode === 'estimate' ? (
                <div className="space-y-5">
                  <SliderInput label={t.n} name="n" value={formData.n} min={0} max={300} step={1} unit="kg/ha" color="text-blue-400" onChange={handleChange} />
                  <SliderInput label={t.p} name="p" value={formData.p} min={0} max={150} step={1} unit="kg/ha" color="text-rose-400" onChange={handleChange} />
                  <SliderInput label={t.k} name="k" value={formData.k} min={0} max={150} step={1} unit="kg/ha" color="text-yellow-400" onChange={handleChange} />
                </div>
              ) : (
                <div className="space-y-4">
                  {[
                    { key: 'n', label: 'Nitrogen (N)', color: 'text-blue-400', accent: 'focus:border-blue-500/60 focus:ring-blue-500/20' },
                    { key: 'p', label: 'Phosphorus (P)', color: 'text-rose-400', accent: 'focus:border-rose-500/60 focus:ring-rose-500/20' },
                    { key: 'k', label: 'Potassium (K)', color: 'text-yellow-400', accent: 'focus:border-yellow-500/60 focus:ring-yellow-500/20' },
                  ].map(({ key, label, color, accent }) => (
                    <div key={key} className="flex items-center gap-3">
                      <label className={`text-sm font-semibold ${color} w-36 shrink-0`}>{label}</label>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          name={key}
                          value={formData[key]}
                          min={0}
                          max={key === 'n' ? 300 : 150}
                          onChange={handleChange}
                          className={`w-full bg-slate-900/80 border border-slate-700 ${accent} text-white text-sm font-mono px-3 py-2 rounded-xl outline-none ring-0 focus:ring-2 transition-all`}
                          placeholder="0"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">kg/ha</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Simulate Button */}
            <button
              onClick={handleSimulate}
              disabled={simulating || loadingClimate}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex justify-center items-center gap-3 text-sm tracking-wide"
            >
              {simulating ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> {t.runningSim}</>
              ) : t.runSim}
            </button>
          </div>

          {/* ─── RIGHT PANEL ─── */}
          <div className="lg:col-span-3 space-y-6">

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-2xl text-sm">
                {error}
              </div>
            )}

            {/* Empty State */}
            {!results && !simulating && !error && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-800/10 p-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-5">🌾</div>
                <h3 className="text-xl font-bold text-slate-300 mb-2">{t.readyTitle}</h3>
                <p className="text-slate-500 text-sm text-center max-w-xs">
                  {t.readySub}
                </p>
              </div>
            )}

            {/* Loading Skeleton */}
            {simulating && (
              <div className="space-y-4 animate-pulse">
                <div className="h-48 bg-slate-800/60 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(5)].map((_, i) => <div key={i} className="h-52 bg-slate-800/60 rounded-2xl" />)}
                </div>
              </div>
            )}

            {/* Results */}
            {results && !simulating && (
              <div className="space-y-6">

                {/* AI Advisory Card */}
                <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900 border border-emerald-500/20 rounded-2xl p-7 overflow-hidden shadow-xl shadow-emerald-900/20">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-lg">🤖</div>
                    <div>
                      <h2 className="font-bold text-white text-base">{t.aiReport}</h2>
                      <p className="text-xs text-slate-500">{t.generatedBy} · {results.state_simulated}</p>
                    </div>
                  </div>
                  <div className="text-slate-300 text-sm leading-relaxed space-y-3">
                    {results.ai_advisory.split('\n').filter(p => p.trim()).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Top 5 Crop Cards */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">{t.simResults}</h3>
                    {/* Live Season Indicator */}
                    {(() => {
                      const s = getCurrentSeason();
                      const cfg = s === 'Kharif'
                        ? { icon: '🌧️', color: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10' }
                        : s === 'Rabi'
                          ? { icon: '❄️', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' }
                          : { icon: '☀️', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' };
                      return (
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${cfg.color}`}>
                          {cfg.icon} Current Season: {s}
                        </span>
                      );
                    })()}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.recommendations.map((rec, i) => {
                      const cfg = getRankConfig()[i];
                      return (
                        <div key={rec.crop} className={`relative bg-slate-800/40 border ${cfg.border} rounded-2xl overflow-hidden shadow-xl ${cfg.glow} backdrop-blur-sm hover:-translate-y-1 transition-transform`}>

                          {/* Crop Image */}
                          <div className="w-full h-36 bg-slate-900/80 relative overflow-hidden">
                            <img
                              src={`/crops/${CROP_IMAGES[rec.crop] || 'placeholder.jpg'}`}
                              alt={rec.crop}
                              className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity duration-300"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                            {/* Rank Medal overlay */}
                            <div className="absolute top-2 left-2 text-2xl drop-shadow-lg">{cfg.medal}</div>
                            {/* Gradient fade at bottom of image */}
                            <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-slate-800/90 to-transparent" />
                          </div>

                          <div className="p-5">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <h3 className="text-lg font-black text-white uppercase tracking-wide leading-tight">{rec.crop}</h3>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border shrink-0 ${i === 0 ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 'text-slate-400 border-slate-600 bg-slate-800'}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <div className="flex flex-col gap-0.5 mb-3">
                              <p className="text-xs text-slate-400">
                                <span className="text-sm font-bold text-slate-200">{rec.expected_yield_kg_per_ha.toLocaleString()}</span> kg/ha
                              </p>
                              <p className="text-[10px] text-slate-500">
                                / {rec.max_potential_yield?.toLocaleString()} kg/ha {t.maxPotential || "(Max Potential)"}
                              </p>
                            </div>

                            {/* Season Advisory Badge */}
                            {(() => {
                              const badge = getSeasonBadge(rec.crop);
                              return badge ? (
                                <div className={`flex items-start gap-2 px-3 py-2 rounded-xl border mb-3 ${badge.cls}`}>
                                  <span className="text-base mt-0.5 shrink-0">{badge.icon}</span>
                                  <div>
                                    <p className="text-[11px] font-semibold leading-tight">{badge.title}</p>
                                    <p className={`text-[10px] leading-snug mt-0.5 ${badge.subCls}`}>{badge.sub}</p>
                                  </div>
                                </div>
                              ) : null;
                            })()}
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-500">{t.suitability}</span>
                                <span className="font-bold text-white">{rec.suitability_percentage.toFixed(1)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${cfg.bar}`}
                                  style={{ width: `${Math.min(rec.suitability_percentage, 100)}%`, transition: 'width 1s ease' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
