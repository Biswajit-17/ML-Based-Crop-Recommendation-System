# Harvest ML — AI Crop Intelligence Engine

An intelligent, multilingual crop recommendation engine built on real-world Indian agricultural data from ICRISAT. The system uses an XGBoost regression simulator to predict expected crop yields across 19 crops, 20 states, and 310 districts — enriched with live 10-year satellite climate data and a generative AI advisory layer.

---

## Problem Statement

Given a district's soil nutrient levels (N, P, K), rainfall patterns, soil type, and irrigation availability — recommend the most suitable crops, estimate their expected yields, calculate a Suitability Score, and generate a personalized AI-driven farming advisory in any language.

---

## Data Sources

All primary data is sourced from the **ICRISAT District-Level Database** ([data.icrisat.org](http://data.icrisat.org/)):

| Dataset | Features | Description |
|---|---|---|
| Crop Area/Production/Yield | 80 | 25 crops × (area, production, yield) across 20 states, 310 districts |
| Fertilizer Consumption | 20 | N, P, K consumption (tons, kg/ha) per district/year |
| Monthly Rainfall | 18 | Jan–Dec monthly + annual rainfall (mm) per district/year |
| Soil Type | 6 | Soil classification per district |
| Irrigation | 25 | Crop-wise irrigated area for 20 crops |

**Active Training Window: 2000–2017 (18 years, 66,645 records)**
The dataset was deliberately trimmed to the modern era (post-2000) to remove outdated pre-Green Revolution agricultural practices that no longer reflect current farming conditions.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| Data & EDA | Pandas, NumPy, Matplotlib, Seaborn |
| ML Training | Scikit-learn, XGBoost |
| Model Persistence | Joblib |
| Web Backend | FastAPI + Uvicorn |
| Web Frontend | React (Vite) + TailwindCSS |
| Live Climate | Open-Meteo Archive API (10-year rolling window) |
| Geocoding | OpenStreetMap Nominatim |
| Generative AI | OpenRouter (multi-model LLM orchestration) |

---

## ML Methodology

### Phase 1: Data Collection & Fusion
- Downloaded 5 ICRISAT datasets via their DLD API and portal
- Common merge keys: `Dist Code`, `Year`, `State Name`, `Dist Name`
- Coverage: 20 states, 310 districts

### Phase 2: Data Preparation & Feature Engineering
- Merged all 5 datasets into a master dataset on district + year
- Reshaped crop data from wide → long (one row per district-crop-year)
- **Filtered to 2000–2017:** Removed 125,807 pre-2000 rows to focus on the modern agricultural era
- Engineered features: annual rainfall, NPK per hectare, irrigation ratio
- Handled missing values, ICRISAT `-1` markers, and yield outliers (>12,000 kg/ha)
- Final clean dataset: **66,645 rows × 18 columns**

### Phase 3: Exploratory Data Analysis
- Generated 8 publication-quality plots across crop distribution, yield trends, soil type correlations, NPK scatter analysis, and state-wise comparisons.
- All plots reflect the 2000–2017 training window.

### Phase 4: Model Training — The Yield Simulator
1. **Mathematical Pivot (Classification → Regression):** We discovered that modeling recommendation as a single-label classification problem is flawed. Multiple crops can thrive under the exact same district-level conditions. We abandoned classification and built a regression-based **Simulation Engine** instead.
2. **The XGBoost Regressor:** Trained on 66,645 modern-era records. `Crop` is used as an **input feature** (not a label), allowing the model to predict yield for any crop in any environment.
3. **Simulation Pipeline:** The user's environment is duplicated 19 times (one per crop). The model predicts yield for all 19 simultaneously, then ranks the Top 5 by Suitability Score.
4. **Tuned Hyperparameters:** `max_depth=6`, `n_estimators=500`, `learning_rate=0.15`, `subsample=0.8`, `min_child_weight=3`, `colsample_bytree=1.0` (20-iteration RandomizedSearchCV, 5-fold CV)
5. **Evaluation:** Test R² = **87.95%**, MAE = **323.2 kg/ha**, RMSE = **542.8 kg/ha**, Generalization Gap = **7.35%** (healthy).

### Phase 5: Web Application, GenAI & The Suitability Score
- **FastAPI Backend:** A high-performance Python API orchestrating ML predictions, live climate fetching, and AI advisory generation.
- **The Suitability Score (Bayesian Prior):** A pure ML Regressor suffers from "Biomass Bias" (Sugarcane always beats Wheat) and "Out-of-Distribution Hallucinations" (blindly over-predicting non-native crops). To fix this, the backend calculates a **Relative Suitability Score** by dividing predicted yield by the crop's Global 95th Percentile baseline, and mathematically penalizing it using a **Bayesian Acreage Prior** (a log1p normalization of the crop's historically planted area in the selected state). This forces the ML engine to scientifically cross-validate its predictions against real-world ecological viability without using hardcoded rules.
- **Adaptive UI & Dark Mode:** A premium, responsive interface featuring global class-based Dark Mode integrated with TailwindCSS, dynamically styled native webkit scrollbars, and seamless color transitions.
- **Live Climate (10-Year Rolling Window):** The backend fetches daily precipitation data from the Open-Meteo Archive API for a dynamic 10-year window ending at the last complete calendar year (e.g., 2016–2025 in 2026). This window advances automatically each year with no code changes.
- **Dual-Mode Soil Input (Trust but Verify):** Users can either use historical district-average NPK values or manually enter their own values from a Soil Health Card for more precise simulation.
- **Season-Aware Crop Badges:** Each recommendation card displays an advisory badge showing whether the crop is in its optimal planting season, using a three-tier classification (strict Kharif/Rabi crops vs. multi-season flexible crops) based on ICAR crop calendar guidelines.
- **GenAI Advisory:** Top 5 results and Suitability Scores are sent to an LLM via OpenRouter. The model acts as an expert agronomist, generating a strict, 3-paragraph advisory in plain language.
- **Waterfall LLM Fallback:** A 3-tier fallback loop catches rate limits/timeouts and seamlessly retries with backup models, ensuring near-100% AI advisory uptime.
- **Multilingual Support:** The entire UI (labels, buttons, advisory report) can be translated to any language at runtime via a single LLM API call, with English, Hindi, and Marathi available as one-click options.

---

## Project Structure

```
ML Based Crop Recommendation System/
├── data/
│   ├── raw/                         # Original ICRISAT downloads
│   │   ├── area_production_yield.csv
│   │   ├── fertilizer_consumption.csv
│   │   ├── monthly_rainfall.csv
│   │   ├── soil_type_percent.csv
│   │   └── irrigation_data.csv
│   └── processed/
│       └── master_dataset_clean.csv # 66,645 row clean dataset (2000-2017)
├── src/
│   ├── 1_fetch_and_merge_data.py        # API-based data downloader & compiler
│   ├── 2_clean_and_format_data.py       # Cleaning, year filter (2000–2017), normalization
│   ├── 3_generate_visualizations.py     # Exploratory Data Analysis & Plotting (8 plots)
│   ├── 4_train_yield_simulator.py       # XGBoost tuning, preprocessing pipeline & export
│   └── 5_evaluate_model.py              # Train/Test metrics, generalization gap, live demo
├── models/                          # Saved models & artifacts (.joblib)
├── app/
│   └── main.py                      # FastAPI backend: API routes, simulation, climate fetch
├── frontend/                        # React (Vite) Application
│   ├── src/App.jsx                  # Main UI: simulation form, crop cards, season badges
│   └── public/crops/                # Crop imagery
├── plots/                           # EDA visualizations (generated by script 3)
├── requirements.txt                 # Runtime Python dependencies
├── dev-requirements.txt             # Development-only (Jupyter, ipykernel)
└── README.md
```

---

## Phased Roadmap

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Data collection from ICRISAT | ✅ Complete |
| 2 | Data preparation & fusion (2000–2017 filter) | ✅ Complete |
| 3 | EDA on modern-era dataset | ✅ Complete |
| 4 | XGBoost Yield Simulator (retrained, regularized) | ✅ Complete |
| 5 | FastAPI + React Web App + GenAI + Multilingual | ✅ Complete |
| 6 | Documentation & Deployment | ✅ Complete |

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd "ML Based Crop Recommendation System"

# Create virtual environment
python -m venv venv
venv\Scripts\activate     # Windows
source venv/bin/activate  # Linux/Mac

# Install Python dependencies
pip install -r requirements.txt

# Install React dependencies
cd frontend
npm install
```

---

## How to Run

Open **two terminal windows** in the project root.

### 1. Start the FastAPI Backend
```bash
# Activate the environment (Windows)
venv\Scripts\activate

# Start the Python AI Engine
uvicorn app.main:app --reload
```
*Backend API runs at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.*

### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```
*UI runs at `http://localhost:5173`. Accessible on local network via your machine's IP.*

### 3. Retraining the Model (if needed)
Run scripts in order from the `src/` directory:
```bash
cd src
python 2_clean_and_format_data.py   # Rebuild clean dataset
python 3_generate_visualizations.py # Regenerate EDA plots
python 4_train_yield_simulator.py   # Retrain XGBoost model
python 5_evaluate_model.py          # Evaluate & print metrics
```

---

## Environment Variables

Create a `.env` file in the project root:
```
OPENROUTER_API_KEY=your_key_here
```
Get a free key at [openrouter.ai](https://openrouter.ai).

---

## License

This project uses publicly available agricultural data from ICRISAT (International Crops Research Institute for the Semi-Arid Tropics). Data is freely available for research and non-commercial use.
