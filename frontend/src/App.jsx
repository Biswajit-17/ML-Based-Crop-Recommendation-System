import React, { useState, useEffect } from 'react';

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
  "Barley": "barley.jpg", "Castor": "castor.jpg", "Chickpea": "chickpea.jpg",
  "Cotton": "cotton.jpg", "Ragi": "finger_millet.jpg", "Groundnut": "groundnut.jpg",
  "Flaxseed / Alsi": "linseed.jpg", "Corn": "maize.jpg", "Bajra": "pearl_millet.jpg",
  "Tur Dal / Arhar": "pigeonpea.jpg", "Mustard / Sarson": "mustard.jpg",
  "Rice": "rice.jpg", "Kusum": "safflower.jpg", "Til": "sesamum.jpg",
  "Jowar": "sorghum.jpg", "Soyabean": "soyabean.jpg", "Sugarcane": "sugarcane.jpg",
  "Sunflower": "sunflower.jpg", "Wheat": "wheat.jpg",
};

const CROP_SEASONS = {
  'COTTON': { tier: 1, season: 'Kharif' }, 'FINGER MILLET': { tier: 1, season: 'Kharif' },
  'PEARL MILLET': { tier: 1, season: 'Kharif' }, 'PIGEONPEA': { tier: 1, season: 'Kharif' },
  'RICE': { tier: 1, season: 'Kharif' }, 'SOYABEAN': { tier: 1, season: 'Kharif' },
  'BARLEY': { tier: 2, season: 'Rabi' }, 'CHICKPEA': { tier: 2, season: 'Rabi' },
  'LINSEED': { tier: 2, season: 'Rabi' }, 'RAPESEED AND MUSTARD': { tier: 2, season: 'Rabi' },
  'SAFFLOWER': { tier: 2, season: 'Rabi' }, 'WHEAT': { tier: 2, season: 'Rabi' },
  'CASTOR': { tier: 3, season: 'Flexible' }, 'GROUNDNUT': { tier: 3, season: 'Flexible' },
  'MAIZE': { tier: 3, season: 'Flexible' }, 'SESAMUM': { tier: 3, season: 'Flexible' },
  'SORGHUM': { tier: 3, season: 'Flexible' }, 'SUNFLOWER': { tier: 3, season: 'Flexible' },
  'SUGARCANE': { tier: 3, season: 'Flexible' },
  'CORN': { tier: 3, season: 'Flexible' }, 'JOWAR': { tier: 3, season: 'Flexible' },
  'TIL': { tier: 3, season: 'Flexible' }, 'RAGI': { tier: 1, season: 'Kharif' },
  'BAJRA': { tier: 1, season: 'Kharif' }, 'TUR DAL / ARHAR': { tier: 1, season: 'Kharif' },
  'KUSUM': { tier: 2, season: 'Rabi' }, 'MUSTARD / SARSON': { tier: 2, season: 'Rabi' },
  'FLAXSEED / ALSI': { tier: 2, season: 'Rabi' },
};

const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  if (month >= 6 && month <= 10) return 'Kharif';
  if (month >= 11 || month <= 3) return 'Rabi';
  return 'Zaid';
};

const SEASON_MONTHS = {
  'Kharif': 'Jun-Oct',
  'Rabi': 'Nov-Mar',
  'Zaid': 'Apr-May',
};

const getSeasonBadge = (cropName) => {
  const key = cropName.toUpperCase();
  const info = CROP_SEASONS[key];
  const currentSeason = getCurrentSeason();
  if (!info) return null;
  if (info.tier === 3) {
    return { icon: '🗺️', title: 'Multi-season', sub: 'Flexible planting', cls: 'text-slate-700 bg-slate-50 border-slate-200' };
  }
  const months = SEASON_MONTHS[info.season] || info.season;
  if (info.season === currentSeason) {
    return { icon: '🌱', title: 'Optimal Now', sub: months, cls: 'text-emerald-800 bg-emerald-50 border-emerald-200' };
  }
  return { icon: '📅', title: `${info.season} Crop`, sub: months, cls: 'text-amber-800 bg-amber-50 border-amber-200' };
};

const SliderInput = ({ label, name, value, min, max, step, unit, onChange }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</label>
      <span className="text-[11px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 ml-2">
        {value} {unit}
      </span>
    </div>
    <input
      type="range" name={name} min={min} max={max} step={step} value={value}
      onChange={onChange}
      className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer"
      style={{ accentColor: '#065f46' }}
    />
  </div>
);

export default function App() {
  const [lang, setLang] = useState("English");
  const [languageSelected, setLanguageSelected] = useState(false);
  const [uiDict, setUiDict] = useState(null);
  const [loadingUi, setLoadingUi] = useState(false);

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
  const [soilInputMode, setSoilInputMode] = useState('estimate');

  const [climate, setClimate] = useState(null);
  const [loadingClimate, setLoadingClimate] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState("");

  const t = uiDict || {};

  useEffect(() => {
    let cancel = false;
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8000/api/districts/${formData.state_name}`);
        if (!res.ok) throw new Error("Could not fetch districts");
        const data = await res.json();
        if (cancel) return;
        setDistrictsList(data);
        if (data.length > 0) setFormData(prev => ({ ...prev, district_name: data[0] }));
      } catch (err) { console.error(err); }
    };
    fetchDistricts();
    return () => { cancel = true; };
  }, [formData.state_name]);

  useEffect(() => {
    let cancel = false;
    const fetchDefaults = async () => {
      if (districtsList.length > 0 && formData.district_name && !districtsList.includes(formData.district_name)) return;
      setLoadingClimate(true); setClimate(null); setError("");
      try {
        let url = `http://${window.location.hostname}:8000/api/defaults/${formData.state_name}`;
        if (formData.district_name) url += `?district=${encodeURIComponent(formData.district_name)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Could not fetch climate data.");
        const data = await res.json();
        if (cancel) return;

        setClimate({
          annual: Math.round(data.annual_rainfall_avg),
          kharif: Math.round(data.kharif_rainfall_avg),
          rabi: Math.round(data.rabi_rainfall_avg),
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
        setError("⚠️ Connection error. Is the backend running?");
      } finally {
        if (!cancel) setLoadingClimate(false);
      }
    };
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
    setSimulating(true); setError(""); setResults(null);
    try {
      const payload = { ...formData, language: lang };
      const res = await fetch(`http://${window.location.hostname}:8000/api/simulate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error("Simulation failed.");
      setResults(await res.json());
    } catch (err) { setError(err.message); } 
    finally { setSimulating(false); }
  };

  const handleLanguageSelect = async (selectedLang) => {
    if (!selectedLang.trim()) return;
    setLang(selectedLang); setLoadingUi(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/ui-language/${selectedLang}`);
      if (!res.ok) throw new Error("Translation failed");
      setUiDict(await res.json());
      setLanguageSelected(true);
    } catch (err) { console.error("Translation failed: ", err); setLanguageSelected(true); } 
    finally { setLoadingUi(false); }
  };

  const getRankConfig = () => [
    { label: t.rank1 || "1st Choice", bar: "bg-amber-400" },
    { label: t.rank2 || "2nd Choice", bar: "bg-slate-400" },
    { label: t.rank3 || "3rd Choice", bar: "bg-orange-500" },
    { label: t.rank4 || "4th Choice", bar: "bg-emerald-600" },
    { label: t.rank5 || "5th Choice", bar: "bg-cyan-600" },
  ];

  if (!languageSelected) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-slate-200 rounded-2xl p-10 max-w-md w-full shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm border border-emerald-100">🌱</div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">HarvestML</h1>
          <p className="text-sm font-medium text-slate-500 mb-8">Please select your preferred interface language to continue.</p>
          
          {loadingUi ? (
            <div className="py-8 space-y-4 flex flex-col items-center">
              <svg className="w-8 h-8 animate-spin text-emerald-800" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-emerald-800 font-bold animate-pulse">Initializing Interface...</p>
            </div>
          ) : (
            <div className="space-y-5 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Select Language</label>
                <div className="relative">
                  <select 
                    value={lang} 
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-800 appearance-none"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Marathi">Marathi (मराठी)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                    <option value="Tamil">Tamil (தமிழ்)</option>
                    <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
                    <option value="Gujarati">Gujarati (ગુજરાતી)</option>
                    <option value="Bengali">Bengali (বাংলা)</option>
                    <option value="Assamese">Assamese (অসমীয়া)</option>
                    <option value="Malayalam">Malayalam (മലയാളം)</option>
                    <option value="Odia">Odia (ଓଡ଼ିଆ)</option>
                    <option value="Punjabi">Punjabi (ਪੰਜਾਬੀ)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <button onClick={() => handleLanguageSelect(lang)} className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl shadow-md transition-all">
                  Launch Platform
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f7f6] text-slate-800 font-sans overflow-hidden">
      
      {/* ─── SIDEBAR (Data Input) ─── */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm z-10 shrink-0">
        
        {/* Branding */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center text-sm shadow-sm shrink-0">🌱</div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-slate-900 leading-none">HarvestML</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI Yield Simulator</p>
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section: Location */}
          <section>
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-slate-200"></span> Location
            </h2>
            <div className="space-y-3">
              <div>
                <select name="state_name" value={formData.state_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 outline-none truncate">
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {districtsList.length > 0 && (
                <div>
                  <select name="district_name" value={formData.district_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 outline-none truncate">
                    {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              )}
            </div>
          </section>

          {/* Section: Climate */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-px bg-slate-200"></span> Climate Data
              </h2>
              {loadingClimate ? (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0"></span>
              ) : climate && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              )}
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              {loadingClimate || !climate ? (
                <div className="h-12 flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse">Syncing satellite data...</div>
              ) : (
                <div className="flex justify-between text-center divide-x divide-slate-200">
                  <div className="px-2 w-1/3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase truncate">Annual</div>
                    <div className="text-sm font-black text-emerald-800 truncate">{climate.annual}<span className="text-[9px] text-slate-500 ml-0.5">mm</span></div>
                  </div>
                  <div className="px-2 w-1/3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase truncate">Kharif</div>
                    <div className="text-sm font-black text-emerald-800 truncate">{climate.kharif}<span className="text-[9px] text-slate-500 ml-0.5">mm</span></div>
                  </div>
                  <div className="px-2 w-1/3">
                    <div className="text-[10px] font-bold text-slate-400 uppercase truncate">Rabi</div>
                    <div className="text-sm font-black text-emerald-800 truncate">{climate.rabi}<span className="text-[9px] text-slate-500 ml-0.5">mm</span></div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section: Soil */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-px bg-slate-200"></span> Soil Chemistry
              </h2>
            </div>
            <select name="soil_type" value={formData.soil_type} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-sm font-semibold focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 outline-none mb-3 truncate">
              {SOIL_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>

            <div className="flex bg-slate-100 p-0.5 rounded-lg mb-4 border border-slate-200">
              <button onClick={() => setSoilInputMode('estimate')} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${soilInputMode === 'estimate' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500'}`}>Est. Average</button>
              <button onClick={() => setSoilInputMode('manual')} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${soilInputMode === 'manual' ? 'bg-white text-slate-900 shadow-sm border border-slate-200' : 'text-slate-500'}`}>Custom Input</button>
            </div>

            {soilInputMode === 'estimate' ? (
              <div className="space-y-4">
                <SliderInput label="Nitrogen (N)" name="n" value={formData.n} min={0} max={300} step={1} unit="kg" onChange={handleChange} />
                <SliderInput label="Phosphorus (P)" name="p" value={formData.p} min={0} max={150} step={1} unit="kg" onChange={handleChange} />
                <SliderInput label="Potassium (K)" name="k" value={formData.k} min={0} max={150} step={1} unit="kg" onChange={handleChange} />
              </div>
            ) : (
              <div className="space-y-3">
                {['n', 'p', 'k'].map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-600 uppercase w-6">{key}</label>
                    <input type="number" name={key} value={formData[key]} min={0} max={300} onChange={handleChange} className="flex-1 bg-slate-50 border border-slate-200 text-slate-900 text-sm font-mono font-bold px-2 py-1.5 rounded-lg outline-none focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800" />
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">kg/ha</span>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button onClick={handleSimulate} disabled={simulating || loadingClimate} className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-[0_4px_10px_rgba(6,95,70,0.2)] transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm uppercase tracking-wider">
            {simulating ? <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : null}
            {simulating ? "Generating..." : "Generate Forecast"}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT (Dashboard) ─── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-800">Analytics Dashboard</h2>
            {loadingUi && <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 animate-pulse">Translating...</span>}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Language:</span>
            
            <select value={lang} onChange={(e) => handleLanguageSelect(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:border-slate-300">
              <option value="English">🇬🇧 English</option>
              <option value="Hindi">🇮🇳 Hindi</option>
              <option value="Marathi">🇮🇳 Marathi</option>
              <option value="Telugu">🇮🇳 Telugu</option>
              <option value="Tamil">🇮🇳 Tamil</option>
              <option value="Kannada">🇮🇳 Kannada</option>
              <option value="Gujarati">🇮🇳 Gujarati</option>
              <option value="Bengali">🇮🇳 Bengali</option>
              <option value="Assamese">🇮🇳 Assamese</option>
              <option value="Malayalam">🇮🇳 Malayalam</option>
              <option value="Odia">🇮🇳 Odia</option>
              <option value="Punjabi">🇮🇳 Punjabi</option>
            </select>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-bold shadow-sm">
                🚨 {error}
              </div>
            )}

            {/* Empty State */}
            {!results && !simulating && !error && (
              <div className="mt-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white border border-slate-200 shadow-sm rounded-full flex items-center justify-center text-4xl mb-6">📊</div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Engine Ready</h3>
                <p className="text-slate-500 max-w-sm leading-relaxed font-medium">
                  Adjust the farm parameters in the left sidebar and click "Run Simulation" to generate an AI-powered yield forecast.
                </p>
              </div>
            )}

            {/* Skeleton Loading */}
            {simulating && (
              <div className="space-y-4 animate-pulse">
                <div className="h-32 bg-white border border-slate-200 rounded-2xl shadow-sm" />
                <div className="h-20 bg-white border border-slate-200 rounded-2xl shadow-sm" />
                <div className="h-20 bg-white border border-slate-200 rounded-2xl shadow-sm" />
                <div className="h-20 bg-white border border-slate-200 rounded-2xl shadow-sm" />
              </div>
            )}

            {/* Results Render */}
            {results && !simulating && (
              <>
                {/* Executive Summary (AI Report) */}
                <div className="bg-emerald-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🤖</div>
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span> Executive Summary
                  </h3>
                  <div className="text-sm text-slate-100 leading-relaxed space-y-3 font-medium relative z-10 max-w-3xl">
                    {results.ai_advisory.split('\n').filter(p => p.trim()).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Analytical Grid Label */}
                <div className="flex items-center justify-between pt-4">
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Yield Forecast Rankings</h3>
                </div>

                {/* Horizontal Crop Cards */}
                <div className="space-y-3">
                  {results.recommendations.map((rec, i) => {
                    const cfg = getRankConfig()[i];
                    const badge = getSeasonBadge(rec.crop) || { icon: '', title: 'Unknown', cls: 'bg-slate-100 border-slate-200 text-slate-500' };
                    
                    return (
                      <div key={rec.crop} className="bg-white border border-slate-200 rounded-xl flex items-stretch h-32 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        
                        {/* 1. Large Distinct Image */}
                        <div className="w-32 bg-slate-100 relative shrink-0">
                          <img src={`/crops/${CROP_IMAGES[rec.crop] || 'placeholder.jpg'}`} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm border border-white/50 text-slate-800 text-[10px] font-black px-2 py-0.5 rounded shadow-sm">
                            #{i + 1}
                          </div>
                        </div>

                        <div className="flex-1 flex items-center p-4">
                          {/* 2. Crop Details */}
                          <div className="w-[28%] pr-4 shrink-0">
                            <h4 className="font-black text-slate-900 leading-tight uppercase text-lg truncate">{rec.crop}</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate block">{cfg.label}</span>
                          </div>

                          {/* 3. Expected Yield */}
                          <div className="w-[24%] border-l border-slate-100 pl-5 shrink-0">
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5 truncate">Forecast Yield</div>
                            <div className="text-xl font-black text-emerald-800 truncate">
                              {rec.expected_yield_kg_per_ha.toLocaleString()} <span className="text-[10px] font-bold text-slate-500 ml-0.5">kg/ha</span>
                            </div>
                          </div>

                          {/* 4. Suitability */}
                          <div className="w-[24%] border-l border-slate-100 pl-5 shrink-0">
                            <div className="flex justify-between items-end mb-1.5">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suitability</span>
                              <span className="text-xs font-black text-slate-800">{rec.suitability_percentage.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${cfg.bar}`} style={{ width: `${Math.min(rec.suitability_percentage, 100)}%` }}></div>
                            </div>
                          </div>

                          {/* 5. Season Context */}
                          <div className="w-[24%] pl-5 flex justify-end shrink-0">
                            <div className={`px-2 py-1.5 rounded-lg border flex flex-col items-center justify-center w-full text-center ${badge.cls}`}>
                              <span className="text-[10px] font-bold uppercase tracking-wider truncate w-full">{badge.title}</span>
                              <span className="text-xs shrink-0 mt-0.5 font-medium">{badge.icon}</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </>
            )}

          </div>
        </div>
      </main>

    </div>
  );
}
