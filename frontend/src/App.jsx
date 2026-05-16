import React, { useState, useEffect } from 'react';

const STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab", "Rajasthan",
  "Tamil Nadu", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const SOIL_TYPES = [
  { key: "blackSoil", label: "Black Soil (Vertisols)", value: "VERTISOLS" },
  { key: "redSoil", label: "Red Soil (Alfisols)", value: "ALFISOLS" },
  { key: "desertSoil", label: "Desert Soil (Aridisols)", value: "ARIDISOLS" },
  { key: "alluvialSoil", label: "Alluvial Soil (Entisols)", value: "ENTISOLS" },
  { key: "forestSoil", label: "Forest Soil (Udalfs)", value: "UDALFS" },
  { key: "sandySoil", label: "Sandy Soil (Psamments)", value: "PSAMMENTS" },
  { key: "youngSoil", label: "Young Soil (Inceptisols)", value: "INCEPTISOLS" }
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

const CROP_TRANSLATION_KEYS = {
  "Barley": "cropBarley",
  "Castor": "cropCastor",
  "Chickpea": "cropChickpea",
  "Cotton": "cropCotton",
  "Ragi": "cropRagi",
  "Groundnut": "cropGroundnut",
  "Flaxseed / Alsi": "cropFlaxseedAlsi",
  "Corn": "cropCorn",
  "Bajra": "cropBajra",
  "Tur Dal / Arhar": "cropTurDalArhar",
  "Mustard / Sarson": "cropMustardSarson",
  "Rice": "cropRice",
  "Kusum": "cropKusum",
  "Til": "cropTil",
  "Jowar": "cropJowar",
  "Soyabean": "cropSoyabean",
  "Sugarcane": "cropSugarcane",
  "Sunflower": "cropSunflower",
  "Wheat": "cropWheat",
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

const getSeasonBadge = (cropName, tr) => {
  const key = cropName.toUpperCase();
  const info = CROP_SEASONS[key];
  const currentSeason = getCurrentSeason();
  const currentSeasonLabel = tr(currentSeason.toLowerCase(), currentSeason);
  const currentMonths = SEASON_MONTHS[currentSeason];
  if (!info) return null;

  if (info.tier === 3) {
    return {
      dot: 'bg-slate-400',
      title: tr('flexiblePlanting', 'Flexible Planting'),
      window: tr('canBeGrownYearRound', 'Can be grown year-round'),
      hint: tr('suitableForCurrentSeason', 'Suitable for the current {season} season').replace('{season}', currentSeasonLabel),
      cls: 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
      titleCls: 'text-slate-700 dark:text-slate-200',
      hintCls: 'text-slate-500 dark:text-slate-400',
    };
  }

  const months = SEASON_MONTHS[info.season] || info.season;
  const seasonLabel = tr(info.season.toLowerCase(), info.season);

  if (info.season === currentSeason) {
    return {
      dot: 'bg-emerald-500',
      title: tr('plantNow', 'Plant Now'),
      window: `${seasonLabel} · ${months}`,
      hint: tr('rightTimeToSow', 'This is the right time to sow'),
      cls: 'text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200',
      titleCls: 'text-emerald-800 dark:text-emerald-400',
      hintCls: 'text-emerald-600 dark:text-emerald-400',
    };
  }

  const nextSeasonStart = {
    'Kharif': 'June',
    'Rabi': 'November',
    'Zaid': 'April',
  };
  return {
    dot: 'bg-slate-400',
    title: tr('offSeason', 'Off-Season'),
    window: tr('bestInSeason', 'Best in {season} ({months})').replace('{season}', seasonLabel).replace('{months}', months),
    hint: tr('sowFrom', 'Sow from {month}').replace('{month}', nextSeasonStart[info.season] || info.season),
    cls: 'text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
    titleCls: 'text-slate-700 dark:text-slate-200',
    hintCls: 'text-slate-500 dark:text-slate-400',
  };
};

const SliderInput = ({ label, name, value, min, max, step, unit, onChange }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{label}</label>
      <div className="flex items-center gap-1 shrink-0 ml-2">
        <input
          type="number" name={name} value={value} onChange={onChange} min={min} max={max}
          className="w-14 text-right text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded border border-emerald-200 outline-none focus:ring-1 focus:ring-emerald-800"
        />
        <span className="text-[10px] font-bold text-slate-400">{unit}</span>
      </div>
    </div>
    <input
      type="range" name={name} min={min} max={max} step={step} value={value}
      onChange={onChange}
      className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer outline-none focus:ring-2 focus:ring-emerald-800/20 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-emerald-800 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-emerald-800 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-sm"
    />
  </div>
);

export default function App() {
  const [lang, setLang] = useState("English");
  const [darkMode, setDarkMode] = useState(false);
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
  const tr = (key, fallback) => t[key] || fallback;
  const cropLabel = (cropName) => tr(CROP_TRANSLATION_KEYS[cropName], cropName);

  useEffect(() => {
    // Attempt to load Indian states from GeoJSON to populate district dropdowns later
    // In a real app this would be dynamically fetched
  }, []);

  // Apply dark mode class to html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.backgroundColor = '#0f172a'; // slate-900
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.backgroundColor = '#f4f7f6'; // app base off-white
    }
  }, [darkMode]);

  useEffect(() => {
    let cancel = false;
    const fetchDistricts = async () => {
      try {
        const res = await fetch(`http://${window.location.hostname}:8000/api/districts/${formData.state_name}`);
        if (!res.ok) throw new Error(tr("couldNotFetchDistricts", "Could not fetch districts"));
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
        if (!res.ok) throw new Error(tr("couldNotFetchClimate", "Could not fetch climate data."));
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
        setError(tr("connectionError", "Connection error. Is the backend running?"));
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
      if (!res.ok) throw new Error(tr("simulationFailed", "Simulation failed."));
      setResults(await res.json());
    } catch (err) { setError(err.message); }
    finally { setSimulating(false); }
  };

  const handleLanguageSelect = async (selectedLang) => {
    if (!selectedLang.trim()) return;
    setLang(selectedLang); setLoadingUi(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:8000/api/ui-language/${selectedLang}`);
      if (!res.ok) throw new Error(tr("translationFailed", "Translation failed"));
      setUiDict(await res.json());
      setLanguageSelected(true);
    } catch (err) { console.error("Translation failed: ", err); setLanguageSelected(true); }
    finally { setLoadingUi(false); }
  };



  if (!languageSelected) {
    return (
      <div className="min-h-screen bg-[#f4f7f6] dark:bg-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-10 max-w-md w-full shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm border border-emerald-100">🌱</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{tr('appName', 'HarvestML')}</h1>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">{tr('languagePrompt', 'Please select your preferred interface language to continue.')}</p>

          {loadingUi ? (
            <div className="py-8 space-y-4 flex flex-col items-center">
              <svg className="w-8 h-8 animate-spin text-emerald-800 dark:text-emerald-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              <p className="text-emerald-800 dark:text-emerald-400 font-bold animate-pulse">{tr('initializingInterface', 'Initializing Interface...')}</p>
            </div>
          ) : (
            <div className="space-y-5 text-left">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{tr('selectLanguage', 'Select Language')}</label>
                <div className="relative">
                  <select
                    value={lang}
                    onChange={(e) => setLang(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm font-bold px-4 py-3.5 rounded-xl outline-none focus:ring-2 focus:ring-emerald-800 appearance-none"
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
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button onClick={() => handleLanguageSelect(lang)} className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 rounded-xl shadow-md transition-all">
                  {tr('launchPlatform', 'Launch Platform')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f4f7f6] dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-sans overflow-hidden">

      {/* ─── SIDEBAR (Data Input) ─── */}
      <aside className="w-[22rem] bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-sm z-10 shrink-0">

        {/* Branding */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center text-sm shadow-sm shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tight text-slate-900 dark:text-white leading-none">{tr('appName', 'HarvestML')}</h1>
            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-1">{tr('appSubtitle', 'AI Yield Simulator')}</p>
          </div>
        </div>

        {/* Top Action */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <button onClick={handleSimulate} disabled={simulating || loadingClimate} className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3.5 px-4 rounded-xl shadow-sm transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 text-sm uppercase tracking-wider">
            {simulating ? <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg> : null}
            {simulating ? tr('generating', 'Generating...') : tr('generateForecast', 'Generate Forecast')}
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

          {/* Section: Location */}
          <section>
            <h2 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-4 h-px bg-slate-200"></span> {tr('location', 'Location')}
            </h2>
            <div className="space-y-3">
              <div className="relative">
                <select name="state_name" value={formData.state_name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white text-sm font-semibold hover:border-slate-300 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 outline-none truncate appearance-none transition-colors">
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
              </div>
              {districtsList.length > 0 && (
                <div className="relative">
                  <select name="district_name" value={formData.district_name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white text-sm font-semibold hover:border-slate-300 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 outline-none truncate appearance-none transition-colors">
                    {districtsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                </div>
              )}
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Section: Climate */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-px bg-slate-200"></span> {tr('climate', 'Climate')}
              </h2>
              {loadingClimate ? (
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping shrink-0"></span>
              ) : climate && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
              {loadingClimate || !climate ? (
                <div className="h-12 flex items-center justify-center text-xs text-slate-400 font-semibold animate-pulse">{tr('syncingApiData', 'Syncing API data...')}</div>
              ) : (
                <div className="flex justify-between text-center divide-x divide-slate-200">
                  <div className="px-2 w-1/3">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate">{tr('annual', 'Annual')}</div>
                    <div className="text-sm font-black text-emerald-800 dark:text-emerald-400 truncate">{climate.annual}<span className="text-[9px] text-slate-500 dark:text-slate-400 ml-0.5">mm</span></div>
                  </div>
                  <div className="px-2 w-1/3">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate">{tr('kharif', 'Kharif')}</div>
                    <div className="text-sm font-black text-emerald-800 dark:text-emerald-400 truncate">{climate.kharif}<span className="text-[9px] text-slate-500 dark:text-slate-400 ml-0.5">mm</span></div>
                  </div>
                  <div className="px-2 w-1/3">
                    <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase truncate">{tr('rabi', 'Rabi')}</div>
                    <div className="text-sm font-black text-emerald-800 dark:text-emerald-400 truncate">{climate.rabi}<span className="text-[9px] text-slate-500 dark:text-slate-400 ml-0.5">mm</span></div>
                  </div>
                </div>
              )}
            </div>
          </section>

          <hr className="border-slate-100 dark:border-slate-700" />

          {/* Section: Soil */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-px bg-slate-200"></span> {tr('soilNutrients', 'Soil Chemistry')}
              </h2>
            </div>
            <div className="relative mb-3">
              <select name="soil_type" value={formData.soil_type} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-slate-900 dark:text-white text-sm font-semibold hover:border-slate-300 focus:ring-2 focus:ring-emerald-800 focus:border-emerald-800 outline-none truncate appearance-none transition-colors">
                {SOIL_TYPES.map(s => <option key={s.value} value={s.value}>{tr(s.key, s.label)}</option>)}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"><svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
            </div>

            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg mb-4 border border-slate-200 dark:border-slate-700">
              <button onClick={() => setSoilInputMode('estimate')} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${soilInputMode === 'estimate' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'}`}>{tr('estimatedAverage', 'Est. Average')}</button>
              <button onClick={() => setSoilInputMode('manual')} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${soilInputMode === 'manual' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'}`}>{tr('customInput', 'Custom Input')}</button>
            </div>

            {soilInputMode === 'estimate' ? (
              <div className="space-y-4">
                <SliderInput label={tr('nitrogen', 'Nitrogen (N)')} name="n" value={formData.n} min={0} max={300} step={1} unit="kg" onChange={handleChange} />
                <SliderInput label={tr('phosphorus', 'Phosphorus (P)')} name="p" value={formData.p} min={0} max={150} step={1} unit="kg" onChange={handleChange} />
                <SliderInput label={tr('potassium', 'Potassium (K)')} name="k" value={formData.k} min={0} max={150} step={1} unit="kg" onChange={handleChange} />
              </div>
            ) : (
              <div className="space-y-3">
                {['n', 'p', 'k'].map(key => (
                  <div key={key} className="flex items-center gap-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase w-6">{key}</label>
                    <input type="number" name={key} value={formData[key]} min={0} max={300} onChange={handleChange} className="flex-1 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-mono font-bold px-2 py-1.5 rounded-lg outline-none hover:border-slate-300 focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 transition-colors" />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold shrink-0">kg/ha</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="pt-4 pb-2 flex flex-col items-center justify-center gap-1 opacity-60">
            <p className="text-[9px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">{tr('source', 'Source: ICRISAT (2000-2017)')}</p>
            <p className="text-[9px] text-slate-400 font-medium">{tr('lastUpdated', 'Last updated: May 15, 2026')}</p>
          </div>

        </div>
      </aside>

      {/* ─── MAIN CONTENT (Dashboard) ─── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-bold text-slate-800 dark:text-slate-100">{tr('analyticsDashboard', 'Analytics Dashboard')}</h2>
            {loadingUi && <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded border border-emerald-100 animate-pulse">{tr('translating', 'Translating...')}</span>}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLanguageSelected(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 text-xs font-bold hover:text-slate-800 dark:hover:text-white transition-colors"
            >
              {tr('changeLanguage', 'Change Language')}
            </button>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
              title="Toggle Dark Mode"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </header>

        {/* Dashboard Body */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto space-y-6">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl text-sm font-bold shadow-sm flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                {error}
              </div>
            )}

            {/* Empty State */}
            {!results && !simulating && !error && (
              <div className="mt-20 flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm rounded-full flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">{tr('engineReady', 'Engine Ready')}</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed font-medium">
                  {tr('engineReadyDescription', 'Adjust the farm parameters in the left sidebar and click "Generate Forecast" to generate an AI-powered yield forecast.')}
                </p>
              </div>
            )}

            {/* Skeleton Loading */}
            {simulating && (
              <div className="space-y-4 animate-pulse">
                <div className="h-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm" />
                <div className="h-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm" />
                <div className="h-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm" />
                <div className="h-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm" />
              </div>
            )}

            {/* Results Render */}
            {results && !simulating && (
              <>
                {/* Forecast Confidence Metrics */}
                {results.metadata && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-center">
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1.5">{tr('predictionConfidence', 'Prediction Confidence')}</div>
                      <div className={`text-lg font-black tracking-tight mb-1 ${results.metadata.confidence_level === 'High' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`}>{tr(results.metadata.confidence_level.toLowerCase(), results.metadata.confidence_level)}</div>
                      <p className="text-[10px] text-slate-400 font-medium leading-snug pr-4">{tr('predictionConfidenceDescription', 'Robustness based on localized soil matches and historical yield thresholds.')}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-center">
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-1.5">{tr('rainfallVariability', 'Rainfall Variability')}</div>
                      <div className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight mb-1">{tr(results.metadata.rainfall_variability.toLowerCase(), results.metadata.rainfall_variability)}</div>
                      <p className="text-[10px] text-slate-400 font-medium leading-snug pr-4">{tr('rainfallVariabilityDescription', 'Historical district deviation tracking how unpredictable the monsoon is here.')}</p>
                    </div>
                  </div>
                )}

                {/* Executive Summary (AI Report) */}
                <div className="bg-emerald-50/50 dark:bg-emerald-900/20 border-l-[6px] border-emerald-700 rounded-r-2xl p-6 mb-8 shadow-sm">
                  <h3 className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-widest mb-3">
                    {tr('agronomicInsights', 'Agronomic Insights')}
                  </h3>
                  <div className="text-[13px] text-slate-800 dark:text-slate-100 leading-snug font-medium">
                    <ul className="space-y-2.5 list-disc pl-4 marker:text-emerald-500">
                      {results.ai_advisory.split('\n').filter(p => p.trim()).map((p, i) => (
                        <li key={i} className="pl-1">{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Analytical Grid Label */}
                <div className="flex items-center justify-between pt-4">
                  <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-widest">{tr('yieldForecastRankings', 'Yield Forecast Rankings')}</h3>
                  {/* Current Season Chip */}
                  {(() => {
                    const s = getCurrentSeason();
                    const seasonStyles = {
                      'Kharif': { bg: 'bg-cyan-50 border-cyan-200 text-cyan-800', dot: 'bg-cyan-500', label: `${tr('kharifSeason', 'Kharif Season')} (Jun–Oct)` },
                      'Rabi': { bg: 'bg-blue-50 border-blue-200 text-blue-800', dot: 'bg-blue-500', label: `${tr('rabiSeason', 'Rabi Season')} (Nov–Mar)` },
                      'Zaid': { bg: 'bg-yellow-50 border-yellow-200 text-yellow-800', dot: 'bg-yellow-500', label: `${tr('zaidSeason', 'Zaid Season')} (Apr–May)` },
                    };
                    const style = seasonStyles[s] || seasonStyles['Zaid'];
                    return (
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                        <span className={`w-1.5 h-1.5 rounded-full ${style.dot} animate-pulse`}></span>
                        {tr('currentSeasonPrefix', 'Now:')} {style.label}
                      </div>
                    );
                  })()}
                </div>

                {/* Horizontal Crop Cards */}
                <div className="space-y-3">
                  {results.recommendations.map((rec, i) => {
                    const badge = getSeasonBadge(rec.crop, tr) || { icon: '', title: 'Unknown', cls: 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400' };
                    const isHero = i === 0;
                    const barColor = rec.suitability_percentage >= 65 ? 'bg-emerald-500' : (rec.suitability_percentage >= 50 ? 'bg-amber-400' : 'bg-slate-300');
                    const baseYield = Math.round(rec.expected_yield_kg_per_ha);
                    const yieldRange = `${Math.round(baseYield * 0.95).toLocaleString()} – ${Math.round(baseYield * 1.05).toLocaleString()}`;

                    return (
                      <div key={rec.crop} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-stretch overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow min-h-[6rem]">

                        {/* 1. Large Distinct Image */}
                        <div className={`${isHero ? 'w-48' : 'w-28'} bg-slate-100 dark:bg-slate-700 relative shrink-0`}>
                          <img src={`/crops/${CROP_IMAGES[rec.crop] || 'placeholder.jpg'}`} className="w-full h-full object-cover min-h-[100px]" />
                          <div className={`absolute top-3 left-3 bg-white dark:bg-slate-800/95 backdrop-blur-sm border border-white/50 text-slate-800 dark:text-slate-100 font-extrabold px-2.5 py-0.5 rounded shadow-sm ${isHero ? 'text-xs' : 'text-[10px]'}`}>
                            #{i + 1}
                          </div>
                        </div>

                        <div className={`flex-1 flex items-center ${isHero ? 'p-6 gap-6' : 'p-4 gap-4'}`}>
                          {/* 2. Crop Details */}
                          <div className="flex-[1] min-w-0">
                            <h4 className={`font-extrabold text-slate-900 dark:text-white leading-tight capitalize whitespace-normal break-words [overflow-wrap:anywhere] ${isHero ? 'text-xl xl:text-2xl' : 'text-base xl:text-lg'}`}>{cropLabel(rec.crop)}</h4>
                            {isHero && <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mt-1 block">{tr('recommended', 'Recommended')}</span>}
                          </div>

                          {/* 3. Expected Yield */}
                          <div className="flex-[1.2] border-l border-slate-100 dark:border-slate-700 pl-4 sm:pl-6 min-w-0">
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 truncate">{tr('yieldRange', 'Yield Range')}</div>
                            <div className={`font-extrabold text-emerald-800 dark:text-emerald-400 tabular-nums tracking-tight whitespace-nowrap ${isHero ? 'text-xl xl:text-2xl' : 'text-lg xl:text-xl'}`}>
                              {yieldRange}
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 mt-1">{tr('kgPerHa', 'kg/ha')} <span className="font-medium opacity-75">{tr('estimateSuffix', '(±5% est.)')}</span></div>
                          </div>

                          {/* 4. Suitability */}
                          <div className="flex-[1.5] border-l border-slate-100 dark:border-slate-700 pl-4 sm:pl-6 min-w-0">
                            <div className="flex justify-between items-end mb-1.5">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{tr('suitability', 'Suitability')}</span>
                              <span className={`${isHero ? 'text-sm' : 'text-xs'} font-black text-slate-800 dark:text-slate-100 tabular-nums`}>{rec.suitability_percentage.toFixed(1)}%</span>
                            </div>
                            <div className={`w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden ${isHero ? 'h-1.5 mb-3' : 'h-1 mb-2'}`}>
                              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(rec.suitability_percentage, 100)}%` }}></div>
                            </div>
                            {isHero ? (
                              <div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-bold mb-0.5">{tr('recordedBestYield', 'Recorded best yield')}</div>
                                <div className="text-slate-800 dark:text-slate-100 font-black text-sm tabular-nums">
                                  {rec.max_potential_yield?.toLocaleString() ?? '—'} <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{tr('kgPerHa', 'kg/ha')}</span>
                                </div>
                                <div className="text-slate-600 dark:text-slate-300 italic text-[10px] mt-0.5 font-medium leading-tight">
                                  {tr('sourceData', 'Source: ICRISAT data (2000-2017)')}
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase truncate pr-2">{tr('bestYield', 'Best Yield:')}</span>
                                <span className="text-slate-700 dark:text-slate-200 font-black tabular-nums shrink-0">{rec.max_potential_yield?.toLocaleString() ?? '—'} {tr('kgPerHa', 'kg/ha')}</span>
                              </div>
                            )}
                          </div>

                          {/* 5. Season Context */}
                          <div className="flex-[1.2] pl-2 sm:pl-4 flex justify-end shrink-0 min-w-0">
                            <div className={`px-3 ${isHero ? 'py-3' : 'py-2'} rounded-lg border flex flex-col gap-1 w-full max-w-[160px] ${badge.cls}`}>
                              <span className={`text-[10px] font-black uppercase tracking-wider leading-tight flex items-center gap-1.5 ${badge.titleCls} truncate`}>
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`}></span>
                                {badge.title}
                              </span>
                              <span className="text-[9px] font-bold leading-tight opacity-90 truncate">
                                {badge.window}
                              </span>
                              {isHero && badge.hint && (
                                <span className={`text-[9px] font-semibold leading-tight italic mt-0.5 line-clamp-2 ${badge.hintCls}`}>
                                  {badge.hint}
                                </span>
                              )}
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
