import os
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import warnings

# Resolve project root relative to this script's location
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(PROJECT_ROOT)
warnings.filterwarnings('ignore')

def main():
    print("="*70)
    print("PHASE 4 D&E: THE YIELD SIMULATOR (XGBOOST REGRESSION ENGINE)")
    print("="*70)

    # -------------------------------------------------------------------
    # 1. LOAD AND PREPARE UNIFIED DATASET
    # -------------------------------------------------------------------
    print("\n[STEP 1] Loading modern era dataset (2000-2017)...")
    df = pd.read_csv('data/processed/master_dataset_clean.csv')
    
    # 💡 Crucial Architectural Change: CROP is now an INPUT feature!
    # The regressor needs to know what crop we are asking about to predict its yield.
    all_crops = df['Crop'].unique().tolist()
    
    features = [
        'N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 
        'Annual Rainfall (mm)', 'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)', 
        'Irrigation Ratio', 'Primary Soil Type', 'State Name', 'Crop'
    ]
    
    X = df[features]
    y = df['Yield (Kg per ha)']
    
    print(f"         Total valid agricultural records loaded: {len(df):,}")

    # -------------------------------------------------------------------
    # 2. PREPROCESSING PIPELINE
    # -------------------------------------------------------------------
    print("\n[STEP 2] Building Preprocessing Pipeline (Scaling & OneHot Encoding)...")
    numeric_features = ['N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 'Annual Rainfall (mm)', 
                        'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)', 'Irrigation Ratio']
    categorical_features = ['Primary Soil Type', 'State Name', 'Crop']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ])

    X_processed = np.asarray(preprocessor.fit_transform(X))  # sparse_output=False → dense; asarray() is a no-op here
    
    # Save the preprocessor so Phase 5 web app can use it
    joblib.dump(preprocessor, 'models/simulator_preprocessor.joblib')
    
    # Save physical row indices to prevent "Metric Bleeding" in the evaluation pipeline 
    train_idx, test_idx = train_test_split(df.index, test_size=0.2, random_state=42)
    joblib.dump(test_idx, 'models/test_indices.joblib')
    
    # Apply the index cuts
    X_train, X_test = X_processed[train_idx], X_processed[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]

    # -------------------------------------------------------------------
    # 3. HYPERPARAMETER TUNING (XGBOOST)
    # -------------------------------------------------------------------
    print("\n[STEP 3] Tuning the Simulation Engine (Randomized Search over XGBoost)...")
    
    param_dist = {
        'max_depth': [4, 5, 6],             # CAPPED at 6: prevents memorizing 66K row dataset
        'learning_rate': [0.05, 0.1, 0.15], # How aggressively learning corrects errors
        'n_estimators': [300, 400, 500],    # More trees to compensate for shallower depth
        'subsample': [0.7, 0.8, 0.9],       # Row sampling for variance reduction
        'min_child_weight': [3, 5, 7],      # Minimum samples per leaf (regularization)
        'colsample_bytree': [0.7, 0.8, 1.0] # Feature sampling per tree
    }
    
    base_xgb = xgb.XGBRegressor(random_state=42, n_jobs=-1, objective='reg:squarederror')
    
    # 20 iterations over a deeper regularized search space
    random_search = RandomizedSearchCV(
        estimator=base_xgb,
        param_distributions=param_dist,
        n_iter=20, 
        cv=5,              # 5-fold CV for more reliable generalization estimate
        scoring='r2', 
        n_jobs=-1,
        verbose=1,
        random_state=42
    )
    
    random_search.fit(X_train, y_train)
    
    print("         Best Engine Parameters Discovered:")
    for key, val in random_search.best_params_.items():
        print(f"           -> {key}: {val}")

    # -------------------------------------------------------------------
    # 4. FINAL EVALUATION (R-SQUARED AND RMSE)
    # -------------------------------------------------------------------
    print("\n[STEP 4] Evaluating Final Simulation Math on Hidden Test Set...")
    best_simulator = random_search.best_estimator_
    
    y_pred = best_simulator.predict(X_test)  # type: ignore[union-attr]
    
    r2 = r2_score(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    
    print("="*70)
    print("OFFICIAL YIELD SIMULATOR RESULTS:")
    print("="*70)
    print(f"Overall Accuracy (R-Squared)   : {r2*100:.2f}%")
    print(f"Average Error Margin (RMSE)    : +/-{rmse:.1f} kg/ha")
    print(f"Absolute Mean Error (MAE)      : +/-{mae:.1f} kg/ha")
    print("="*70)
    
    joblib.dump(best_simulator, 'models/tuned_simulator.joblib')
    print("\n[RESULT] Master Simulation engine secured and saved to 'models/'")

    # -------------------------------------------------------------------
    # 5. LIVE DEMO: PROVING THE RECOMMENDATION LOGIC
    # -------------------------------------------------------------------
    print("\n[STEP 5] LIVE DEMONSTRATION OF HOW THE WEB APP WILL WORK:")
    # Let's pull a random environment from the dataset (row 50000)
    sample_env = df.iloc[[5000]].copy()
    print(f"-> A farmer in {sample_env['State Name'].values[0]} exactly replicates this environment:")
    print(f"   Rainfall: {sample_env['Annual Rainfall (mm)'].values[0]}mm | Soil: {sample_env['Primary Soil Type'].values[0]} | N: {sample_env['N (Kg/ha)'].values[0]:.0f}")
    
    # Simulate all 19 crops for this identical environment
    sim_data = pd.DataFrame(np.repeat(sample_env[features].values, len(all_crops), axis=0), columns=features)
    sim_data['Crop'] = all_crops
    
    # Process through our pipeline and predict
    sim_processed = preprocessor.transform(sim_data)
    sim_yields = best_simulator.predict(sim_processed)  # type: ignore[union-attr]
    
    # Zip together and rank
    results = list(zip(all_crops, sim_yields))
    results.sort(key=lambda x: x[1], reverse=True)
    
    print("\n    THE SIMULATOR'S TOP 3 RECOMMENDATIONS:")
    for i in range(3):
        print(f"    #{i+1}: {results[i][0].ljust(12)} (Expected Yield: {results[i][1]:.0f} kg/ha)")

if __name__ == "__main__":
    main()
