# Crop Prediction Model Documentation: The AI Journey

This document explains the iterative mathematical journey of building the Weather-Aware Crop Recommendation System, starting from an initial baseline classifier and evolving into a production-grade predictive simulator.

---

## 1. The Initial Approach: Classification Models (Guessing)
Initially, we approached crop recommendation as a **Classification Problem**. A classifier's job is to look at input features (Rainfall, NPK, Soil) and assign a single category (e.g., "Wheat").

To build our baseline, we raced three vastly different mathematical algorithms:
1. **Random Forest Classifier:** A tree-based ensemble approach. It performed poorly (~16% Accuracy), struggling to distinguish between crops due to the overlapping nature of district-level environmental data.
2. **Linear Support Vector Machine (SVC):** A geometric algorithm that attempts to draw straight mathematical lines between crop classes. It achieved ~22% accuracy, proving that agricultural boundaries are highly non-linear.
3. **Multi-Layer Perceptron (Neural Network):** A brain-inspired network of artificial neurons. It was the clear winner, achieving nearly 30% strict Top-1 Accuracy, and proving its intelligence with a **~61.8% Top-3 Accuracy**.

## 2. Pushing the Limits: Tuning the Neural Network
Because the Neural Network was the definitive winner, we optimized its architecture:
- **The Tuning Engine:** Used `RandomizedSearchCV` with 30 different Neural Network architectures.
- **The Findings:** `hidden_layer_sizes=(50, 50)`, `activation='tanh'`, `alpha=0.01`, `learning_rate_init=0.001`
- **The Ceiling:** Despite aggressive tuning, the final Top-3 Accuracy only rose to **63.3%**.

## 3. The Architectural Pivot: Classification vs. Reality
The **63% accuracy ceiling was structural**. Environmental variables are recorded at the *district* level. A single district could successfully grow Wheat, Rice, and Maize under the exact same aggregated weather conditions — making it mathematically impossible for a classifier to learn the "correct" answer.

To solve this, we pivoted to an advanced **Regression Architecture**. Instead of asking the AI to *guess* a category, we asked it to *calculate* a continuous number: **exactly how many kilograms of food will grow**.

---

## 4. The Final Model: 'The Yield Simulator'

### What it is
The final model is an **XGBoost Regressor**. Instead of one massive equation, XGBoost builds hundreds of sequential decision trees using *Gradient Boosting*: each tree is built specifically to detect and correct the errors of the previous tree. This compounds corrections hundreds of times, rapidly reducing error margins.

### Dataset
The model is trained on the **2000–2017 modern-era slice** of the ICRISAT dataset:
- **Training records:** 66,645 rows (filtered from 194,452 total)
- **Reason for filtering:** Pre-2000 data reflects outdated pre-modern agricultural practices. The 2000–2017 window captures contemporary farming patterns with current fertilizer usage and irrigation technology.
- **Crops modeled:** 19 unique crops

### How it was Trained (Detailed)
1. **Data Formatting:** `StandardScaler` normalizes all numerical features (prevents `1200mm` of rain from dominating `45kg` of Nitrogen purely by numeric magnitude). Categorical variables (States, Soils, and **Crops as input features**) are binary-encoded via `OneHotEncoder`.
2. **Dataset Division (MLOps Standard):** Strict 80/20 train-test split. The exact row indices of the 20% test set are permanently saved to a `.joblib` file so evaluation scripts are structurally decoupled and always test on unseen data.
3. **Model Hyper-Tuning:** `RandomizedSearchCV` with **20 iterations** across **5-fold cross-validation** over a regularized parameter search space:
   - `max_depth`: [4, 5, 6] — capped at 6 to prevent overfitting on the 66K-row dataset
   - `n_estimators`: [300, 400, 500] — more shallow trees compensate for reduced depth
   - `learning_rate`: [0.05, 0.1, 0.15]
   - `subsample`: [0.7, 0.8, 0.9]
   - `min_child_weight`: [3, 5, 7] — minimum samples per leaf (regularization)
   - `colsample_bytree`: [0.7, 0.8, 1.0]
4. **Best Parameters Found:** `max_depth=6`, `n_estimators=500`, `learning_rate=0.15`, `subsample=0.8`, `min_child_weight=3`, `colsample_bytree=1.0`
5. **The "Simulation" Engine Logic:** `Crop` is used as an **input feature**, not a prediction target. The backend copies the user's environment 19 times (one per crop), runs all 19 in parallel, and ranks recommendations by Suitability Score.

### The Final Outputs
The Simulation Engine achieved strong statistical significance on the hidden test set:
- **Test R-Squared:** 0.8795 (87.95% of yield variance explained)
- **Mean Absolute Error (MAE):** 323.2 kg/ha
- **Root Mean Squared Error (RMSE):** 542.8 kg/ha
- **Generalization Gap (Train R² − Test R²):** 7.35% ✅ Healthy (below 10% threshold)

The gap between Train R² (95.30%) and Test R² (87.95%) confirms the model generalizes well to unseen data without memorizing the training set.

---

## 5. The Suitability Score System

A pure Regressor suffers from "Biomass Bias": Sugarcane produces ~80,000 kg/ha even in mediocre conditions, which would always beat a perfect Wheat crop at ~5,000 kg/ha.

**The Fix:** At startup, the backend scans the full dataset and calculates the **95th Percentile Yield** for every crop individually. This represents an "ideal historical harvest" for that specific crop.

```
Suitability Score = (Predicted Yield / 95th Percentile Baseline) × 100
```

This normalizes crops against their own genetic potential rather than against each other, allowing Sesamum and Sugarcane to compete fairly.

---

## Glossary of Technical Terms

| Term | Definition |
| :--- | :--- |
| **Classification** | A type of ML that predicts a category/label (e.g., Apple, Orange, Wheat). |
| **Regression** | A type of ML that predicts a continuous, numeric quantity (e.g., 2000 kg, $500). |
| **XGBoost** | *Extreme Gradient Boosting*. Builds sequential decision trees that correct each other's errors. Dominates on structured tabular data. |
| **R-Squared (R²)** | Measures how well a regression model explains the variance in data. R² of 0.88 means the model explains 88% of the real-world yield variation. |
| **MAE** | *Mean Absolute Error*. The average absolute deviation between predictions and actual values. |
| **RMSE** | *Root Mean Squared Error*. Like MAE but penalizes large individual errors more heavily. |
| **Generalization Gap** | The difference between Train R² and Test R². A gap >10% indicates overfitting. |
| **One-Hot Encoding** | Converts categorical text (e.g., "Alfisols") into binary vectors so the AI can process strings without assuming fake alphabetical rankings. |
| **Top-K Accuracy** | A scoring metric that counts a prediction as correct if the true label appears anywhere in the top K choices. |