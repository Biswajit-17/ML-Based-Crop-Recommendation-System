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
- Correlation heatmaps between features and crop yield
- Region-wise and crop-wise distribution analysis
- Feature importance ranking
- Outlier detection

### Phase 4: Model Training (Hybrid Approach)
1. **Classification Model (Crop Recommendation):** 
   - Trained *only* on sub-samples where crops achieved high historical yields.
   - Outputs Top 3 most suitable crops with probability scores.
2. **Regression Model (Yield Estimation):**
   - Trained on the complete dataset.
   - Estimates expected yield (kg/ha) for the recommended crops.
- Models: Random Forest, XGBoost
- Stratified 5-fold cross-validation and Hyperparameter tuning.

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
├── notebooks/                       # Jupyter notebooks for EDA & experiments
├── src/
│   ├── download_icrisat.py          # API-based data downloader
│   ├── parse_icrisat.py             # JSON → CSV parser
│   ├── preprocess.py                # Scaling, encoding pipeline
│   ├── train.py                     # Model training
│   ├── predict.py                   # Inference logic
│   └── evaluate.py                  # Evaluation metrics & plots
├── models/                          # Saved models & artifacts
├── app/                             # Flask web application
│   ├── app.py
│   ├── templates/
│   └── static/
├── plots/                           # Saved visualizations
├── Crop_recommendation.csv          # Original Kaggle dataset (reference)
├── requirements.txt
└── README.md
```

---

## 🚀 Phased Roadmap

| Phase | Deliverable | Status |
|---|---|---|
| 1 | Data collection from ICRISAT | ✅ Complete |
| 2 | Data preparation & fusion | 🔄 Next |
| 3 | EDA on enriched dataset | ⬜ Pending |
| 4 | Model training & evaluation | ⬜ Pending |
| 5 | Flask web app + API | ⬜ Pending |
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
