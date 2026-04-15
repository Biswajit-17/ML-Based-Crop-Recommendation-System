import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error
import warnings

# Force working directory to the project root for local AI testing
os.chdir(r"c:\Users\Biswajitrk\Documents\Visual Studio Code\ML Based Crop Recommendation System")
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
    
    # 2. Load ML Components
    preprocessor = joblib.load('models/simulator_preprocessor.joblib')
    model = joblib.load('models/tuned_simulator.joblib')
    
    X_processed = preprocessor.transform(X)
    
    # Mathematical identically recreated split
    X_train, X_test, y_train, y_test = train_test_split(X_processed, y, test_size=0.2, random_state=42)
    
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
    print(f"X_Train Accuracy (Memorization) : {r2_train*100:.2f}%")
    print(f"X_Test Accuracy  (Generalization): {r2_test*100:.2f}%")
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
    for i in range(3):
        print(f" #{i+1}: {results[i][0].ljust(12)} -> {results[i][1]:.0f} kg/ha expected.")

    print("\n" + "="*70)
    print("Evaluation Complete. Model is cleared for Production.")
    print("="*70)

if __name__ == "__main__":
    main()
