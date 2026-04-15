import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import warnings

# Resolve project root relative to this script's location
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(PROJECT_ROOT)
warnings.filterwarnings('ignore')

def main():
    print("\n" + "="*70)
    print("AI YIELD SIMULATOR: FINAL EVALUATION METRICS")
    print("="*70)

    # 1. Load Data
    print("\n[STEP] Loading historical dataset and ML engine...")
    df = pd.read_csv('data/processed/master_dataset_clean.csv')
    
    features = [
        'N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 
        'Annual Rainfall (mm)', 'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)', 
        'Irrigation Ratio', 'Primary Soil Type', 'State Name', 'Crop'
    ]
    
    X = df[features]
    y = df['Yield (Kg per ha)']
    
    # 2. Load ML Components & Apply MLOps Structural Decoupling
    preprocessor = joblib.load('models/simulator_preprocessor.joblib')
    model = joblib.load('models/tuned_simulator.joblib')
    
    print("[STEP] Loading decoupled index states to guarantee flawless evaluation mapping")
    test_idx = joblib.load('models/test_indices.joblib')
    train_idx = df.index.difference(test_idx)
    
    X_processed = preprocessor.transform(X)
    X_train, X_test = X_processed[train_idx], X_processed[test_idx]
    y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
    
    # 3. Calculate Metrics
    y_pred_train = model.predict(X_train)
    y_pred_test = model.predict(X_test)
    
    r2_train = r2_score(y_train, y_pred_train)
    r2_test = r2_score(y_test, y_pred_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred_test))
    mae = mean_absolute_error(y_test, y_pred_test)

    # 4. Print Results
    print("\n" + "-"*40)
    print("1. BIAS-VARIANCE (OVERFIT ANALYSIS)")
    print("-"*40)
    print(f"Train R² (Fit Quality) : {r2_train*100:.2f}%")
    print(f"Test R² (Generalization): {r2_test*100:.2f}%")
    print(f"Generalization Gap               : {abs(r2_train - r2_test)*100:.2f}%  <-- (Healthy gap under 10%)")
    
    print("\n" + "-"*40)
    print("2. PHYSICAL ERROR MARGINS")
    print("-"*40)
    print(f"Mean Absolute Error (MAE)        : +/- {mae:.1f} kg/ha")
    print(f"Root Mean Squared Error (RMSE)   : +/- {rmse:.1f} kg/ha")

    print("\n" + "-"*40)
    print("3. LIVE RECOMMENDATION TEST")
    print("-"*40)
    
    # Live Demo using Row #8500 (A random historical data snapshot)
    sample_env = df.iloc[[8500]].copy()
    all_crops = df['Crop'].unique().tolist()
    
    print(f"Simulating a farm in {sample_env['State Name'].values[0]}...")
    print(f"Inputs -> Rain: {sample_env['Annual Rainfall (mm)'].values[0]}mm | Soil: {sample_env['Primary Soil Type'].values[0]} | Nitrogen: {sample_env['N (Kg/ha)'].values[0]:.0f} kg")
    
    # Duplicate for all 19 crops
    sim_data = pd.DataFrame(np.repeat(sample_env[features].values, len(all_crops), axis=0), columns=features)
    sim_data['Crop'] = all_crops
    
    sim_processed = preprocessor.transform(sim_data)
    sim_yields = model.predict(sim_processed)
    
    results = list(zip(all_crops, sim_yields))
    results.sort(key=lambda x: x[1], reverse=True)
    
    print("\nAI Yield Rankings:")
    print("\nAI Yield Rankings:")
    for i in range(min(3, len(results))):
        print(f" #{i+1}: {results[i][0].ljust(12)} -> {results[i][1]:.0f} kg/ha expected.")

    print("\n" + "="*70)
    print("Evaluation Complete.")
    print("="*70)

if __name__ == "__main__":
    main()
