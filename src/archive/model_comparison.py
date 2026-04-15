import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import LinearSVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import classification_report, f1_score, accuracy_score, top_k_accuracy_score
import warnings

# Force working directory to the project root for local AI testing
os.chdir(r"c:\Users\Biswajitrk\Documents\Visual Studio Code\ML Based Crop Recommendation System")

warnings.filterwarnings('ignore')

# Setup directories
os.makedirs('data/processed', exist_ok=True)
os.makedirs('models', exist_ok=True)
os.makedirs('evaluation_plots', exist_ok=True)

def main():
    print("="*60)
    print("PHASE 4 A&B: PREPROCESSING & BASELINE CLASSIFICATION")
    print("="*60)

    # ---------------------------------------------------------
    # 1. LOAD DATA & HIGH-YIELD FILTERING
    # ---------------------------------------------------------
    print("\n[STEP] 1. Loading and filtering data...")
    df = pd.read_csv('data/processed/master_dataset_clean.csv')
    
    # Calculate median yield per crop to define "High Yield"
    median_yields = df.groupby('Crop')['Yield (Kg per ha)'].median()
    
    # Filter: Keep rows where a crop performed >= its historical median
    high_yield_df = df[df.apply(lambda row: row['Yield (Kg per ha)'] >= median_yields[row['Crop']], axis=1)]
    
    print(f"    Original Rows: {len(df):,}")
    print(f"    High-Yield Rows (Training Data): {len(high_yield_df):,}")
    
    # Define Features and Target
    # We drop 'Dist Code' & 'Dist Name' to prevent massive one-hot explosion (State works as regional proxy)
    features_to_use = [
        'N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 
        'Annual Rainfall (mm)', 'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)', 
        'Irrigation Ratio', 'Primary Soil Type', 'State Name'
    ]
    
    X = high_yield_df[features_to_use]
    y = high_yield_df['Crop']

    # ---------------------------------------------------------
    # 2. PREPROCESSING PIPELINE
    # ---------------------------------------------------------
    print("\n[STEP] 2. Building Preprocessing & Encoding Pipeline...")
    numeric_features = ['N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 'Annual Rainfall (mm)', 
                        'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)', 'Irrigation Ratio']
    categorical_features = ['Primary Soil Type', 'State Name']

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ])

    # Transform the data
    X_processed = preprocessor.fit_transform(X)
    
    # Save the preprocessor for the Web App later
    joblib.dump(preprocessor, 'models/preprocessor.joblib')

    # Train/Test Split (80/20, Stratified so all crops are represented equally)
    X_train, X_test, y_train, y_test = train_test_split(
        X_processed, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"    Training Data Shape: {X_train.shape}")
    print(f"    Testing Data Shape:  {X_test.shape}")
    
    # Save splits so Phase 4C (Tuning) can use the EXACT same data
    joblib.dump((X_train, X_test, y_train, y_test), 'data/processed/classification_splits.joblib')
    print("    [Saved] 'classification_splits.joblib' and 'preprocessor.joblib' for Phase 4C/D/E.")

    # ---------------------------------------------------------
    # 3. BASELINE MODEL TRAINING
    # ---------------------------------------------------------
    print("\n[STEP] 3. Training Baseline Models (Untuned)...")
    
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=50, random_state=42, n_jobs=-1),
        "Neural Network (MLP)": MLPClassifier(hidden_layer_sizes=(50,), max_iter=100, random_state=42),
        "Support Vector Machine (LinearSVC)": LinearSVC(max_iter=1000, random_state=42)
    }

    results = []

    for name, model in models.items():
        print(f"\n    Training {name}...")
        model.fit(X_train, y_train)
        
        y_pred = model.predict(X_test)
        
        acc = accuracy_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred, average='macro')
        
        # Calculate Top-3 Accuracy
        try:
            if hasattr(model, "predict_proba"):
                y_scores = model.predict_proba(X_test)
            else:
                y_scores = model.decision_function(X_test)
            top3_acc = top_k_accuracy_score(y_test, y_scores, k=3, labels=model.classes_)
        except Exception as e:
            top3_acc = 0.0

        results.append({"Model": name, "Top-1 Acc": acc*100, "Top-3 Acc": top3_acc*100, "F1-Score": f1*100})
        
        print(f"    -> Done. Top-1 Acc: {acc*100:.2f}% | Top-3 Acc: {top3_acc*100:.2f}% | F1-Score: {f1*100:.2f}%")

    print("\n" + "="*60)
    print("BASELINES COMPLETE. WINNER RANKING:")
    print("="*60)
    results_df = pd.DataFrame(results).sort_values(by="Top-3 Acc", ascending=False)
    print(results_df.to_string(index=False))

if __name__ == "__main__":
    main()
