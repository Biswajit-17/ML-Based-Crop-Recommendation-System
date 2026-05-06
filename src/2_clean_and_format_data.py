"""
Phase 2 (Part 2): Data Cleaning
- Filter dataset to modern era: Year 2000-2017
- Replace ICRISAT's -1 missing markers with NaN
- Impute or drop based on feature importance
- Normalize soil type labels
- Save final clean dataset
"""

import pandas as pd
import numpy as np
import os

# Resolve project root relative to this script's location
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(PROJECT_ROOT)

PROCESSED_DIR = "data/processed"

def clean_master(df):
    print("=" * 60)
    print("PHASE 2 (Part 2): CLEANING MASTER DATASET (2000-2017)")
    print("=" * 60)
    print(f"\n  Input: {df.shape[0]:,} rows x {df.shape[1]} cols")

    # -------------------------------------------------------
    # 1. Replace -1 (ICRISAT missing marker) with NaN
    # -------------------------------------------------------
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    before_neg = (df[numeric_cols] < 0).sum().sum()
    df[numeric_cols] = df[numeric_cols].where(df[numeric_cols] >= 0, np.nan)
    print(f"\n  [1] Replaced {before_neg:,} negative (missing marker) values with NaN")

    # -------------------------------------------------------
    # 2. Drop rows missing Yield (our key signal)
    # -------------------------------------------------------
    before = len(df)
    df = df.dropna(subset=["Yield (Kg per ha)"])
    print(f"  [2] Dropped rows without Yield: {before - len(df):,} removed -> {len(df):,} remain")

    # -------------------------------------------------------
    # 3. Drop rows missing NPK (critical features)
    # -------------------------------------------------------
    before = len(df)
    df = df.dropna(subset=["N (Kg/ha)", "P (Kg/ha)", "K (Kg/ha)"])
    print(f"  [3] Dropped rows without NPK:   {before - len(df):,} removed -> {len(df):,} remain")

    # -------------------------------------------------------
    # 4. Impute Annual Rainfall with district median
    # -------------------------------------------------------
    before_missing = df["Annual Rainfall (mm)"].isna().sum()
    df["Annual Rainfall (mm)"] = df.groupby("Dist Code")["Annual Rainfall (mm)"].transform(
        lambda x: x.fillna(x.median())
    )
    # Second pass: fill remaining with state median
    df["Annual Rainfall (mm)"] = df.groupby("State Name")["Annual Rainfall (mm)"].transform(
        lambda x: x.fillna(x.median())
    )
    after_missing = df["Annual Rainfall (mm)"].isna().sum()
    print(f"  [4] Imputed rainfall: {before_missing - after_missing:,} filled, {after_missing} remain")

    # -------------------------------------------------------
    # 5. Impute seasonal rainfall similarly
    # -------------------------------------------------------
    for col in ["Kharif Rainfall (mm)", "Rabi Rainfall (mm)"]:
        df[col] = df.groupby("Dist Code")[col].transform(lambda x: x.fillna(x.median()))
        df[col] = df.groupby("State Name")[col].transform(lambda x: x.fillna(x.median()))

    # -------------------------------------------------------
    # 6. Fill irrigation with 0 (rainfed if unknown)
    # -------------------------------------------------------
    df["Irrigated Area (1000 ha)"] = df["Irrigated Area (1000 ha)"].fillna(0)
    df["Irrigation Ratio"]         = df["Irrigation Ratio"].fillna(0).clip(0, 1)

    # -------------------------------------------------------
    # 7. Normalize soil type labels (consolidate typos/variants)
    # -------------------------------------------------------
    soil_map = {
        "INCEPTISOLS": "INCEPTISOLS",
        "INNCEPTISOLS": "INCEPTISOLS",
        "VERTIC SOILS": "VERTISOLS",
        "VERTIC SOLS":  "VERTISOLS",
        "VRTICSOLS":    "VERTISOLS",
        "ALFISOL":      "ALFISOLS",
        "ALFISOLS":     "ALFISOLS",
        "USTALF/USTOLLS": "USTALF/USTOLLS",
        "UDALFS":       "UDALFS",
        "UDOLLS/UDALFS":"UDALFS",
        "USTALFS":      "ALFISOLS",
        "PSSAMENTS":    "PSAMMENTS",
        "PSSAMNETS":    "PSAMMENTS",
        "PSAMMENT":     "PSAMMENTS",
        "ORTHIDS":      "ARIDISOLS",
        "ORTHENTS":     "ENTISOLS",
        "FLUVENTS":     "ENTISOLS",
        "DYSTROPEPTS":  "INCEPTISOLS",
        "UDULTS/UDALFS":"ULTISOLS",
        "UDAPTS/UDALFS":"ULTISOLS",
        "Unknown":      "Unknown",
    }
    df["Primary Soil Type"] = (
        df["Primary Soil Type"]
        .str.upper()
        .str.strip()
        .map(soil_map)
        .fillna(df["Primary Soil Type"].str.upper().str.strip())
    )
    print(f"  [7] Soil types after normalization:")
    print(df["Primary Soil Type"].value_counts().to_string())

    # -------------------------------------------------------
    # 8. Drop remaining rows with any NaN in core features
    # -------------------------------------------------------
    core_features = [
        "Yield (Kg per ha)", "N (Kg/ha)", "P (Kg/ha)", "K (Kg/ha)",
        "Annual Rainfall (mm)", "Kharif Rainfall (mm)", "Rabi Rainfall (mm)"
    ]
    before = len(df)
    df = df.dropna(subset=core_features)
    print(f"\n  [8] Dropped rows still missing core features: {before - len(df):,} -> {len(df):,} remain")

    # -------------------------------------------------------
    # 9. Remove extreme outliers (yield > 99.9th percentile)
    # -------------------------------------------------------
    before = len(df)
    upper = df["Yield (Kg per ha)"].quantile(0.999)
    df = df[df["Yield (Kg per ha)"] <= upper]
    print(f"  [9] Removed extreme yield outliers (>{upper:.0f} kg/ha): {before - len(df):,} rows")

    # -------------------------------------------------------
    # 10. Final stats
    # -------------------------------------------------------
    print(f"\n{'='*60}")
    print(f"  FINAL CLEAN DATASET")
    print(f"{'='*60}")
    print(f"  Shape    : {df.shape[0]:,} rows x {df.shape[1]} columns")
    print(f"  States   : {df['State Name'].nunique()}")
    print(f"  Districts: {df['Dist Name'].nunique()}")
    print(f"  Crops    : {df['Crop'].nunique()} -> {sorted(df['Crop'].unique())}")
    print(f"  Years    : {int(df['Year'].min())} - {int(df['Year'].max())}")
    print(f"\n  Crop distribution:")
    print(df["Crop"].value_counts().to_string())
    print(f"\n  Missing values remaining:")
    miss = df.isnull().sum()
    miss = miss[miss > 0]
    print(miss.to_string() if len(miss) > 0 else "    None - dataset is clean!")
    print(f"\n  Key feature ranges:")
    for col in ["Yield (Kg per ha)", "N (Kg/ha)", "P (Kg/ha)", "K (Kg/ha)",
                "Annual Rainfall (mm)", "Irrigation Ratio"]:
        if col in df.columns:
            print(f"    {col:35s}: min={df[col].min():.2f}, max={df[col].max():.2f}, mean={df[col].mean():.2f}")

    return df


def main():
    path_in  = os.path.join(PROCESSED_DIR, "master_dataset.csv")
    path_out = os.path.join(PROCESSED_DIR, "master_dataset_clean.csv")

    df = pd.read_csv(path_in)

    # -------------------------------------------------------
    # 0. Filter to Modern Era: Year 2000 - 2017
    # -------------------------------------------------------
    before = len(df)
    df = df[df['Year'] >= 2000]
    print(f"\n  [0] Year filter (>= 2000): {before - len(df):,} pre-2000 rows removed -> {len(df):,} remain")

    df = clean_master(df)

    df.to_csv(path_out, index=False)
    size_mb = os.path.getsize(path_out) / (1024 * 1024)
    print(f"\n  Saved -> {path_out}  ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
