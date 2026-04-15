import os
import joblib
import pandas as pd
import numpy as np
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import RandomizedSearchCV
from sklearn.metrics import classification_report, f1_score, accuracy_score, top_k_accuracy_score
import warnings

# Set working directory to project root (detect from script location)
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.chdir(PROJECT_ROOT)
warnings.filterwarnings('ignore')

def main():
    print("="*60)
    print("PHASE 4C: HYPERPARAMETER TUNING (NEURAL NETWORK)")
    print("="*60)

    print("\n[STEP 1] Loading preprocessed data splits...")
    X_train, X_test, y_train, y_test = joblib.load('data/processed/classification_splits.joblib')
    
    # We will use a 25% sub-sample of the training data purely for the tuning phase to save computing time
    # (Since there are 75k rows, running dozens of Neural Networks for CV on full data would take hours)
    np.random.seed(42)
    sample_indices = np.random.choice(X_train.shape[0], size=int(X_train.shape[0]*0.25), replace=False)
    X_tune = X_train[sample_indices]
    y_tune = y_train.iloc[sample_indices] if isinstance(y_train, pd.Series) else y_train[sample_indices]

    print(f"    Full Training set: {X_train.shape}")
    print(f"    Tuning Sub-sample: {X_tune.shape}")

    print("\n[STEP 2] Initializing RandomizedSearchCV for MLPClassifier...")
    
    base_mlp = MLPClassifier(max_iter=150, random_state=42)
    
    # The grid of combinations to test
    param_dist = {
        'hidden_layer_sizes': [(50,), (100,), (50, 50), (100, 50), (100, 100)],
        'activation': ['relu', 'tanh'],
        'alpha': [0.0001, 0.001, 0.01],
        'learning_rate_init': [0.001, 0.01]
    }
    
    random_search = RandomizedSearchCV(
        estimator=base_mlp,
        param_distributions=param_dist,
        n_iter=10,  # Try 10 unique, random architectural combinations
        cv=3,       # 3-Fold Cross validation
        n_jobs=-1,  # Use all system CPU cores to run them in parallel
        verbose=1,
        random_state=42,
        scoring='accuracy'
    )
    
    print("\n[STEP 3] Running hyperparameter optimization (combating combinations in parallel)...")
    random_search.fit(X_tune, y_tune)
    
    print("\n[RESULT] BEST PARAMETERS FOUND:")
    for param, value in random_search.best_params_.items():
        print(f"    {param}: {value}")
        
    print("\n[STEP 4] Re-training final model with best parameters on FULL dataset...")
    best_model = random_search.best_estimator_
    best_model.fit(X_train, y_train)
    
    print("\n[STEP 5] Final Evaluation on hidden test set...")
    y_pred = best_model.predict(X_test)
    y_scores = best_model.predict_proba(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    top3_acc = top_k_accuracy_score(y_test, y_scores, k=3, labels=best_model.classes_)
    f1 = f1_score(y_test, y_pred, average='macro')
    
    print("="*60)
    print("TUNED NEURAL NETWORK RESULTS:")
    print("="*60)
    print(f"    Top-1 Accuracy : {acc*100:.2f}%")
    print(f"    Top-3 Accuracy : {top3_acc*100:.2f}%")
    print(f"    F1-Score (Macro): {f1*100:.2f}%")
    print("="*60)
    
    # Save tuned model
    joblib.dump(best_model, 'models/tuned_recommender.joblib')
    print("\n[RESULT] Saved optimal model to 'models/tuned_recommender.joblib'")

if __name__ == "__main__":
    main()
