import os
import joblib
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics import classification_report, accuracy_score, top_k_accuracy_score, r2_score, mean_squared_error
from sklearn.ensemble import RandomForestClassifier
from sklearn.neural_network import MLPClassifier
import warnings

# Force working directory to the project root for local AI testing
os.chdir(r"c:\Users\Biswajitrk\Documents\Visual Studio Code\ML Based Crop Recommendation System")
warnings.filterwarnings('ignore')

def main():
    print("="*60)
    print("EXPERIMENTING WITH ADVANCED RECOMMENDATION ARCHITECTURES")
    print("="*60)

    # -------------------------------------------------------------
    # LOAD BASE DATA
    # -------------------------------------------------------------
    df = pd.read_csv('data/processed/master_dataset_clean.csv')
    
    features_to_use = [
        'N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 
        'Annual Rainfall (mm)', 'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)', 
        'Irrigation Ratio', 'Primary Soil Type', 'State Name'
    ]

    print("\n-----------------------------------------------------------")
    print("IDEA 1: Z-SCORE WINNER CLASSIFICATION")
    print("-----------------------------------------------------------")
    # Calculate Mean and Std for each crop
    crop_stats = df.groupby('Crop')['Yield (Kg per ha)'].agg(['mean', 'std']).reset_index()
    df_z = df.merge(crop_stats, on='Crop')
    df_z['Z-Score'] = (df_z['Yield (Kg per ha)'] - df_z['mean']) / (df_z['std'] + 1e-9)
    
    # Keep only the #1 top performing crop per District + Year
    idx = df_z.groupby(['Dist Code', 'Year'])['Z-Score'].idxmax()
    best_crops_df = df_z.loc[idx]
    
    print(f"Original Rows: {len(df):,}")
    print(f"Optimal 'Winner Only' Rows: {len(best_crops_df):,}")
    
    X_z = best_crops_df[features_to_use]
    y_z = best_crops_df['Crop']
    
    numeric_features = ['N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 'Annual Rainfall (mm)', 
                        'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)', 'Irrigation Ratio']
    categorical_features = ['Primary Soil Type', 'State Name']

    preprocessor_z = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), categorical_features)
        ])

    X_z_processed = preprocessor_z.fit_transform(X_z)
    X_train_z, X_test_z, y_train_z, y_test_z = train_test_split(X_z_processed, y_z, test_size=0.2, random_state=42)
    
    mlp_z = MLPClassifier(hidden_layer_sizes=(50, 50), activation='tanh', max_iter=150, random_state=42)
    mlp_z.fit(X_train_z, y_train_z)
    
    try:
        y_scores_z = mlp_z.predict_proba(X_test_z)
        top3_z = top_k_accuracy_score(y_test_z, y_scores_z, k=3, labels=mlp_z.classes_)
        print(f"Z-Score MLP Top-3 Accuracy: {top3_z*100:.2f}%")
        y_pred_z = mlp_z.predict(X_test_z)
        print(f"Z-Score MLP Top-1 Accuracy: {accuracy_score(y_test_z, y_pred_z)*100:.2f}%")
    except Exception as e:
        print("Error evaluating Idea 1:", str(e))

    print("\n-----------------------------------------------------------")
    print("IDEA 2: XGBOOST CLASSIFIER ON STANDARD HIGH-YIELD DATA")
    print("-----------------------------------------------------------")
    # Load the exact splits from Phase 4A
    X_train, X_test, y_train, y_test = joblib.load('data/processed/classification_splits.joblib')
    
    # XGBoost requires labels to be integer encoded (0 to num_classes-1)
    le = LabelEncoder()
    y_train_encoded = le.fit_transform(y_train)
    y_test_encoded = le.transform(y_test)
    
    xgb_clf = xgb.XGBClassifier(n_estimators=100, max_depth=6, learning_rate=0.1, n_jobs=-1, random_state=42, use_label_encoder=False, eval_metric='mlogloss')
    xgb_clf.fit(X_train, y_train_encoded)
    
    y_pred_xgb = xgb_clf.predict(X_test)
    y_scores_xgb = xgb_clf.predict_proba(X_test)
    
    acc_xgb = accuracy_score(y_test_encoded, y_pred_xgb)
    top3_xgb = top_k_accuracy_score(y_test_encoded, y_scores_xgb, k=3, labels=xgb_clf.classes_)
    print(f"XGBoost Top-1 Accuracy: {acc_xgb*100:.2f}%")
    print(f"XGBoost Top-3 Accuracy: {top3_xgb*100:.2f}%")

    print("\n-----------------------------------------------------------")
    print("IDEA 3: 'THE SIMULATOR' - XGBOOST REGRESSION")
    print("-----------------------------------------------------------")
    # For regression, target is Yield.
    # Feature set must include CROP NAME because it defines the object of prediction.
    features_reg = features_to_use + ['Crop']
    X_reg = df[features_reg]
    y_reg = df['Yield (Kg per ha)']
    
    cat_features_reg = categorical_features + ['Crop']
    preprocessor_reg = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), cat_features_reg)
        ])
    
    X_reg_processed = preprocessor_reg.fit_transform(X_reg)
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(X_reg_processed, y_reg, test_size=0.2, random_state=42)
    
    xgb_reg = xgb.XGBRegressor(n_estimators=150, max_depth=8, learning_rate=0.1, n_jobs=-1, random_state=42)
    xgb_reg.fit(X_train_r, y_train_r)
    
    y_pred_r = xgb_reg.predict(X_test_r)
    r2 = r2_score(y_test_r, y_pred_r)
    rmse = np.sqrt(mean_squared_error(y_test_r, y_pred_r))
    
    print(f"Simulator R-Squared (Accuracy of yield prediction): {r2*100:.2f}%")
    print(f"Simulator RMSE: {rmse:.2f} kg/ha error margin")
    
    print("\nSimulation Engine Verdict:")
    if r2 > 0.8:
        print("-> The Regression engine is highly accurate. We can simulate all 19 crops, predict their exact yields, and objectively sort the ultimate winner. This makes the classification model mathematically obsolete for optimality.")
    else:
        print("-> The Regression engine has too much error to safely rank crops. We should stick to Classification.")

    print("\n===========================================================")
    print("EXPERIMENTS COMPLETE.")

if __name__ == "__main__":
    main()
