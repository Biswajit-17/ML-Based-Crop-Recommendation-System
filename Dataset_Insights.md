# ICRISAT Dataset Insights & Architecture

This document outlines the structure, history, and mathematical insights derived from the dataset powering the **NEXUS Yield — AI Crop Intelligence Engine**.

---

## 1. The Core Dataset
All primary data is sourced from the **ICRISAT District-Level Database (DLD)**.

* **Full Time Span Available:** 1966 to 2017 (51 years)
* **Active Training Window:** **2000 to 2017 (18 years)**
* **Geographic Scope:** 20 major agricultural states across India, surveying 310 independent districts.
* **Training Size:** **66,645 records** (filtered from 194,452 total)

### Why 2000–2017 and not the full 1966–2017 range?
The full dataset was deliberately trimmed to post-2000 records. Pre-2000 agricultural data reflects farming practices, fertilizer rates, and irrigation infrastructure from a fundamentally different era. Training on 1966–1999 data would teach the model patterns that are no longer representative of how Indian farmers operate today (different seed varieties, modern fertilizer usage, irrigation improvements). The 2000–2017 window keeps the model focused on the modern agricultural context.

This removed 125,807 rows (64% of total data) but significantly improved the relevance of what the model learned.

### Covered Geographies (20 States)
*Andhra Pradesh, Assam, Bihar, Chhattisgarh, Gujarat, Haryana, Himachal Pradesh, Jharkhand, Karnataka, Kerala, Madhya Pradesh, Maharashtra, Odisha, Punjab, Rajasthan, Tamil Nadu, Telangana, Uttar Pradesh, Uttarakhand, West Bengal.*

### Modeled Crops (19 Crops)
While the raw dataset tracked 25 crops, we successfully modeled **19 unique crops** that possessed sufficient high-quality biological and fertilizer data for XGBoost simulation:
*Barley, Castor, Chickpea, Cotton, Finger Millet, Groundnut, Linseed, Maize, Pearl Millet, Pigeonpea, Rapeseed & Mustard, Rice, Safflower, Sesamum, Sorghum, Soyabean, Sugarcane, Sunflower, Wheat.*

### The 5 Pillar Datasets
To build our Master Dataset, we programmatically downloaded and merged 5 independent ICRISAT data sources into a single spreadsheet:
1. **Area, Production, and Yield:** Tracks 25 unique crops, measuring total hectares sown and total physical weight produced (Yield in kg/ha).
2. **Fertilizer Consumption:** Tracks synthetic soil additions: Nitrogen (N), Phosphorus (P), and Potassium (K).
3. **Monthly Rainfall:** Tracks exact millimeters of rain for all 12 months, allowing calculation of Annual, Kharif (Monsoon), and Rabi (Winter) totals.
4. **Soil Type:** Categorizes the primary earth composition of the district (Vertisols, Alfisols, Inceptisols, etc.).
5. **Irrigation Data:** Measures the percentage of farmland artificially watered via canals/wells vs. naturally rainfed.

---

## 2. Clean Dataset Statistics (2000–2017)

| Metric | Value |
|---|---|
| Total Records | 66,645 |
| States | 20 |
| Districts | 310 |
| Crops | 19 |
| Year Range | 2000 – 2017 |
| Mean Yield | 1,474 kg/ha |
| Mean N | 74.2 kg/ha |
| Mean P | 30.0 kg/ha |
| Mean K | 12.8 kg/ha |
| Mean Annual Rainfall | 979 mm |

---

## 3. Structural Insights & Model Evolution

### The "District-Level" Trap
One of the most profound insights from this dataset was structural. Environmental variables (Rainfall, Soil, NPK) are recorded at the **District Level**, not the micro-farm level.

* **The Problem:** A massive district in Maharashtra might successfully grow Sugarcane, Cotton, and Maize in the same year. Because the dataset averages weather for the *entire district*, initial Classification Models received the same weather inputs but were expected to predict 3 different crops.
* **The Consequence:** This caused an unbreakable ~63% accuracy ceiling. The model couldn't guess the "right" crop because the math told it all 3 were correct.

### The Regression Pivot
Understanding the district-level structure forced us to pivot the entire ML architecture. Instead of asking the AI to *guess* a category (Classification), we built an **XGBoost Regressor** to predict the physical weight (Yield in kg/ha) of the harvest. The AI now reads the environment and calculates exact yield outputs.

**Current accuracy:** Test R² = **87.95%**, MAE = **323.2 kg/ha**, RMSE = **542.8 kg/ha**

### The "Biomass Bias" (Sugarcane Dominance)
By sorting the dataset by pure Yield (kg/ha), we discovered a biological reality: **Sugarcane produces astronomical biomass.**

* A failing Sugarcane crop might weigh 40,000 kg/ha.
* A perfect Wheat crop might weigh 5,000 kg/ha.

If the app recommended crops by raw weight, Sugarcane would win every time. **The Fix:** The backend dynamically calculates the **95th Percentile Maximum Yield** for every individual crop from the 2000–2017 dataset. Predictions are divided by this baseline to produce a normalized Suitability Score (%), allowing all crops to compete on equal footing against their own genetic potential.

---

## 4. Live Climate Enrichment

The 2000–2017 historical rainfall values in the dataset serve as a fallback baseline. At runtime, the backend fetches **10 years of real daily precipitation data** from the Open-Meteo Archive API using a dynamic rolling window (always ending at the last complete calendar year). This live average overwrites the historical baseline, giving farmers a climate picture that reflects the actual recent rainfall patterns of their specific district.
