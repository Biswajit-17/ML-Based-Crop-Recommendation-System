# 🌾 ML-Based Crop Recommendation System

An intelligent crop recommendation engine built using real-world Indian agricultural data from ICRISAT, employing multiple ML models to suggest the most suitable crops based on soil nutrients, rainfall, soil type, and geographic conditions.

---

## 📌 Problem Statement

Given a district's soil nutrient levels (N, P, K), rainfall patterns, soil type, and irrigation availability — recommend the most suitable crops, estimate their expected yields, and generate personalized AI-driven farming advice to maximize yield and sustainability.

---

## 📊 Data Sources

All primary data is sourced from the **ICRISAT District-Level Database** ([data.icrisat.org](http://data.icrisat.org/)):

| Dataset | Rows | Features | Description |
|---|---|---|---|
| Crop Area/Production/Yield | 16,146 | 80 | 25 crops × (area, production, yield) across 20 states, 311 districts (1966–2017) |
| Fertilizer Consumption | 16,047 | 20 | N, P, K consumption (tons, kg/ha) per district/year |
| Monthly Rainfall | 14,527 | 18 | Jan–Dec monthly + annual rainfall (mm) per district/year |
| Soil Type | 313 | 6 | Soil classification per district |
| Irrigation | 15,943 | 25 | Crop-wise irrigated area for 20 crops |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | Python 3.10+ |
| Data & EDA | Pandas, NumPy, Matplotlib, Seaborn |
| ML Training | Scikit-learn, XGBoost |
| Model Persistence | Joblib |
| Web Backend | Flask |
| Web Frontend | HTML / CSS / JS |

---

## 🧪 ML Methodology

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

### Phase 5: Web Application & Generative AI
- Flask REST API for handling predictions.
- **LLM Integration:** Raw statistical outputs (Top 3 crops + estimated yields) are passed to an LLM API (Groq/Gemini).
- The LLM generates a personalized, conversational advisory report containing actionable farming tips tailored to the user's specific inputs.
- Beautiful, responsive web frontend.

### Phase 6: Documentation & Deployment
- Complete README with results
- Docker containerization
- Deploy to Render / Railway

---

## 📁 Project Structure

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
├── app/                             # Flask web application
│   ├── app.py
│   ├── templates/
│   └── static/
├── plots/                           # Saved visualizations (generated by eda.py)
├── requirements.txt
└── README.md
```

---

## 🚀 Phased Roadmap

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Data collection from ICRISAT | ✅ Complete |
| 2 | Data preparation & fusion | ✅ Complete |
| 3 | EDA on enriched dataset | ✅ Complete |
| 4 | Model training (XGBoost Yield Simulator) | ✅ Complete |
| 5 | Flask web app + API | 🔄 Next |
| 6 | Documentation & deployment | ⬜ Pending |

---

## 📦 Installation

```bash
# Clone the repository
git clone <repo-url>
cd "ML Based Crop Recommendation System"

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

---

## 📄 License

This project uses publicly available agricultural data from ICRISAT (International Crops Research Institute for the Semi-Arid Tropics).
