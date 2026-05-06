# ML-Based Crop Recommendation System (Deprecated)

An intelligent crop recommendation engine built using real-world Indian agricultural data from ICRISAT, employing multiple ML models to suggest the most suitable crops based on soil nutrients, rainfall, soil type, and geographic conditions.

---

## Problem Statement

Given a district's soil nutrient levels (N, P, K), rainfall patterns, soil type, and irrigation availability — recommend the most suitable crops, estimate their expected yields, and generate personalized AI-driven farming advice to maximize yield and sustainability.

---

## Data Sources

All primary data is sourced from the **ICRISAT District-Level Database** ([data.icrisat.org](http://data.icrisat.org/)):

| Dataset | Rows | Features | Description |
|---|---|---|---|
| Crop Area/Production/Yield | 16,146 | 80 | 25 crops × (area, production, yield) across 20 states, 311 districts (1966–2017) |
| Fertilizer Consumption | 16,047 | 20 | N, P, K consumption (tons, kg/ha) per district/year |
| Monthly Rainfall | 14,527 | 18 | Jan–Dec monthly + annual rainfall (mm) per district/year |
| Soil Type | 313 | 6 | Soil classification per district |
| Irrigation | 15,943 | 25 | Crop-wise irrigated area for 20 crops |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| Data & EDA | Pandas, NumPy, Matplotlib, Seaborn |
| ML Training | Scikit-learn, XGBoost |
| Model Persistence | Joblib |
| Web Backend | FastAPI |
| Web Frontend | React (Vite) + TailwindCSS |

---

## ML Methodology

### Phase 1: Data Collection & Fusion 
- Downloaded 5 ICRISAT datasets via their DLD API and portal
- Common merge keys: `Dist Code`, `Year`, `State Name`, `Dist Name`
- Coverage: 20 states, 311 districts, 52 years (1966–2017)

### Phase 2: Data Preparation & Feature Engineering
- Merge all 5 datasets into a master dataset on district + year
- Reshape crop data from wide → long (one row per district-crop-year)
- Engineer features: annual rainfall, NPK per hectare, soil type encoding
- Handle missing values and outliers

### Phase 3: Exploratory Data Analysis
- Generated 8 publication-quality predictive plots.
- Discovered high correlation between Nitrogen levels and historical yields.
- Mapped 50-year yield upward trends (Green Revolution impact).
- Created visual correlations between soil types, regions, and optimal crop productivity.

### Phase 4: Model Training ('The Yield Simulator')
1.  **Mathematical Pivot (Classification to Regression):** We discovered that modeling recommendation as a purely single-label classification problem is flawed due to the multi-label nature of agriculture (multiple crops can thrive in the exact same environment). To objectively rank multiple crops simultaneously, we abandoned Classification and built a regression-based **Simulation Engine**.
2.  **The XGBoost Regressor:** Trained a powerful XGBoost regression engine on all 188k historical rows.
3.  **Simulation Pipeline:** When recommending crops, the AI artificially copies the user's weather inputs 19 times into an array. It predicts the expected yield for all 19 crops over those identical conditions, and objectively ranks the Top 3 winners.
- **Evaluation:** The XGBoost Simulator achieved **88.48% R-Squared Accuracy** with an MAE of 295kg/ha, proving it is highly accurate at mathematically mirroring the physical reality of the ecosystem.

### Phase 5: Web Application, GenAI & The Suitability Score
- **FastAPI Backend:** A highly-performant Python API designed to orchestrate the machine learning predictions.
- **The Suitability Score:** A pure Regressor suffers from "Biomass Bias" (e.g. Sugarcane naturally weighs 80,000kg/ha, easily beating a perfect Wheat crop weighing 5,000kg/ha). To fix this, the backend dynamically calculates the historical **95th Percentile Maximum Yield** for every crop from our 188k row dataset. The API then calculates a **Suitability Percentage** `(Simulated Yield / Perfect Historical Baseline)` and sorts the recommendations by Suitability. If multiple crops tie at 100%, a secondary tie-breaker automatically breaks the tie using raw physical weight!
- **GenAI Advisory:** Raw statistical outputs and the Suitability Scores are securely proxied through an **Open Router** API integration. The LLM acts as an expert agronomist, translating technical metrics (like mm of rainfall) into plain English and generating a strict, concise 2-paragraph advisory report.
- **Waterfall LLM Fallback:** The backend implements a robust 3-tier fallback loop. If the primary OpenRouter model hits a rate limit or queue timeout, the API instantly and seamlessly catches the exception and attempts to generate the report using highly-available backup models (Llama 3, Gemma 2), ensuring near 100% GenAI uptime.
- **React Frontend:** A minimalist, highly intuitive Glassmorphism dashboard built with React and TailwindCSS.

### Phase 6: Documentation & Deployment
- Complete README with results
- Docker containerization
- Deploy to Render / Railway

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
│   └── processed/                   # Cleaned & merged data
│       └── master_dataset_clean.csv # 188k row final dataset
├── src/
│   ├── archive/                         # Deprecated classification experiments
│   ├── 1_fetch_and_merge_data.py        # API-based data downloader & compiler
│   ├── 2_clean_and_format_data.py       # Data cleaning, normalization, structure
│   ├── 3_generate_visualizations.py     # Exploratory Data Analysis & Plotting
│   ├── 4_train_yield_simulator.py       # ML Pipeline, XGBoost tuning & export
│   └── 5_evaluate_model.py              # Generates Train/Test metrics & Live Demo
├── models/                          # Saved models & artifacts
├── app/                             # FastAPI Python Backend
│   └── main.py                      # Main API logic & Suitability Score Engine
├── frontend/                        # React (Vite) Application
│   ├── src/                         # React components and styling
│   ├── index.html
│   └── tailwind.config.js
├── plots/                           # Saved visualizations (generated by eda.py)
├── requirements.txt
└── README.md
```

---

## Phased Roadmap

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Data collection from ICRISAT | ✅ Complete |
| 2 | Data preparation & fusion | ✅ Complete |
| 3 | EDA on enriched dataset | ✅ Complete |
| 4 | Model training (XGBoost Yield Simulator) | ✅ Complete |
| 5 | FastAPI + React Web App | 🔄 Active |
| 6 | Documentation & deployment | ⬜ Pending |

---

## Installation

```bash
# Clone the repository
git clone <repo-url>
cd "ML Based Crop Recommendation System"

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install Python dependencies
pip install -r requirements.txt

# Install React dependencies
cd frontend
npm install
```

---

## How to Run the Application

Because this is a decoupled architecture, you will need to open **two separate terminal windows** (one for the backend, one for the frontend).

### 1. Start the FastAPI Backend
Open a terminal in the root project folder:
```bash
# Activate the environment (Windows)
.\BCAvenv\Scripts\activate

# Start the Python AI Engine
uvicorn app.main:app --reload
```
*The backend API will run at `http://localhost:8000`. You can view the testing interface at `http://localhost:8000/docs`.*

### 2. Start the React Frontend
Open a **second** terminal in the root project folder:
```bash
# Navigate to the frontend folder
cd frontend

# Start the Vite React server
npm run dev
```
*The beautiful user interface will run at `http://localhost:5173`.*

---

## License

This project uses publicly available agricultural data from ICRISAT (International Crops Research Institute for the Semi-Arid Tropics).
