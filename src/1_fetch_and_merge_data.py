"""
Phase 2: Data Preparation & Fusion Pipeline
Merges all 5 ICRISAT datasets into a single master dataset for ML training.

Strategy:
1. Reshape crop data from WIDE (one col per crop) → LONG (one row per district-crop-year)
2. Merge with fertilizer (NPK), rainfall, soil type, and irrigation data
3. Engineer features and clean the dataset
4. Output: master_dataset.csv ready for EDA and model training
"""

import pandas as pd
import numpy as np
import os
import warnings
warnings.filterwarnings('ignore')

RAW_DIR = "data/raw"
PROCESSED_DIR = "data/processed"
os.makedirs(PROCESSED_DIR, exist_ok=True)


def load_datasets():
    """Load all raw ICRISAT datasets."""
    print("=" * 60)
    print("📂 Loading raw datasets...")
    print("=" * 60) 
    
    crop = pd.read_csv(os.path.join(RAW_DIR, "area_production_yield.csv"))
    fert = pd.read_csv(os.path.join(RAW_DIR, "fertilizer_consumption.csv"))
    rain = pd.read_csv(os.path.join(RAW_DIR, "monthly_rainfall.csv"))
    soil = pd.read_csv(os.path.join(RAW_DIR, "soil_type_percent.csv"))
    irr  = pd.read_csv(os.path.join(RAW_DIR, "irrigation_data.csv"))
    
    datasets = {'crop': crop, 'fert': fert, 'rain': rain, 'soil': soil, 'irr': irr}
    for name, df in datasets.items():
        states = df["State Name"].nunique()
        dists = df["Dist Name"].nunique()
        print(f"  {name:8s}: {df.shape[0]:>6,} rows × {df.shape[1]:>3} cols | {states} states, {dists} districts")
    
    return datasets


def reshape_crop_data(crop_df):
    """
    Reshape crop data from WIDE format to LONG format.
    Wide: each row = district-year, with columns for each crop's area/production/yield
    Long: each row = district-crop-year, with columns: area, production, yield
    """
    print("\n" + "=" * 60)
    print("🔄 Reshaping crop data: wide → long")
    print("=" * 60)
    
    # Identify metadata columns (common keys)
    meta_cols = ['Dist Code', 'Year', 'State Code', 'State Name', 'Dist Name']
    
    # Find all crop names by parsing column names
    # Pattern: "CROP_NAME AREA (1000 ha)", "CROP_NAME PRODUCTION (1000 tons)", "CROP_NAME YIELD (Kg per ha)"
    crop_cols = [c for c in crop_df.columns if c not in meta_cols]
    
    # Extract unique crop names
    crop_names = set()
    for col in crop_cols:
        for suffix in [' AREA (1000 ha)', ' PRODUCTION (1000 tons)', ' YIELD (Kg per ha)']:
            if col.endswith(suffix):
                crop_name = col.replace(suffix, '')
                crop_names.add(crop_name)
    
    # Remove aggregate categories and keep individual crops
    skip_crops = {
        'OILSEEDS', 'FRUITS', 'VEGETABLES', 'FRUITS AND VEGETABLES',
        'POTATOES', 'ONION', 'FODDER', 'MINOR PULSES',
        'KHARIF SORGHUM', 'RABI SORGHUM'  # Keep total SORGHUM instead
    }
    crop_names = sorted(crop_names - skip_crops)
    print(f"  Found {len(crop_names)} individual crops: {crop_names}")
    
    # Reshape: melt each crop into rows
    records = []
    for _, row in crop_df.iterrows():
        meta = {col: row[col] for col in meta_cols}
        for crop_name in crop_names:
            area_col = f"{crop_name} AREA (1000 ha)"
            prod_col = f"{crop_name} PRODUCTION (1000 tons)"
            yield_col = f"{crop_name} YIELD (Kg per ha)"
            
            area = row.get(area_col, np.nan)
            prod = row.get(prod_col, np.nan)
            yld = row.get(yield_col, np.nan)
            
            # Only include rows where the crop is actually grown (area > 0)
            try:
                area_val = float(area)
                if area_val > 0:
                    record = meta.copy()
                    record['Crop'] = crop_name
                    record['Area (1000 ha)'] = area_val
                    record['Production (1000 tons)'] = float(prod) if pd.notna(prod) else np.nan
                    record['Yield (Kg per ha)'] = float(yld) if pd.notna(yld) else np.nan
                    records.append(record)
            except (ValueError, TypeError):
                continue
    
    long_df = pd.DataFrame(records)
    print(f"  Reshaped: {crop_df.shape[0]:,} rows → {long_df.shape[0]:,} rows (district-crop-year)")
    print(f"  Crops with data: {long_df['Crop'].nunique()}")
    print(f"  Distribution:")
    print(long_df['Crop'].value_counts().to_string())
    
    return long_df


def merge_fertilizer(master_df, fert_df):
    """Merge fertilizer (NPK) data on Dist Code + Year."""
    print("\n" + "=" * 60)
    print("🧪 Merging fertilizer data (N, P, K)...")
    print("=" * 60)
    
    # Select key columns
    fert_cols = ['Dist Code', 'Year',
                 'NITROGEN PER HA OF GCA (Kg per ha)',
                 'PHOSPHATE PER HA OF GCA (Kg per ha)',
                 'POTASH PER HA OF GCA (Kg per ha)',
                 'TOTAL PER HA OF GCA (Kg per ha)']
    
    fert_subset = fert_df[fert_cols].copy()
    fert_subset.columns = ['Dist Code', 'Year', 'N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 'NPK Total (Kg/ha)']
    
    before = master_df.shape[0]
    master_df = master_df.merge(fert_subset, on=['Dist Code', 'Year'], how='left')
    print(f"  Merged: {before:,} rows → {master_df.shape[0]:,} rows")
    print(f"  NPK coverage: {master_df['N (Kg/ha)'].notna().sum():,}/{master_df.shape[0]:,} ({master_df['N (Kg/ha)'].notna().mean()*100:.1f}%)")
    
    return master_df


def merge_rainfall(master_df, rain_df):
    """Merge rainfall data on Dist Code + Year."""
    print("\n" + "=" * 60)
    print("🌧️ Merging rainfall data...")
    print("=" * 60)
    
    # Select key columns
    rain_cols = ['Dist Code', 'Year', 'ANNUAL RAINFALL (Millimeters)']
    
    # Also compute seasonal rainfall
    rain_subset = rain_df.copy()
    
    # Kharif season: June-September (monsoon)
    kharif_months = ['JUNE RAINFALL (Millimeters)', 'JULY RAINFALL (Millimeters)',
                     'AUGUST RAINFALL (Millimeters)', 'SEPTEMBER RAINFALL (Millimeters)']
    # Rabi season: October-March (winter)
    rabi_months = ['OCTOBER RAINFALL (Millimeters)', 'NOVEMBER RAINFALL (Millimeters)',
                   'DECEMBER RAINFALL (Millimeters)', 'JANUARY RAINFALL (Millimeters)',
                   'FEBRUARY RAINFALL (Millimeters)', 'MARCH RAINFALL (Millimeters)']
    
    # Convert to numeric
    for col in kharif_months + rabi_months + ['ANNUAL RAINFALL (Millimeters)']:
        rain_subset[col] = pd.to_numeric(rain_subset[col], errors='coerce')
    
    rain_subset['Kharif Rainfall (mm)'] = rain_subset[kharif_months].sum(axis=1, min_count=1)
    rain_subset['Rabi Rainfall (mm)'] = rain_subset[rabi_months].sum(axis=1, min_count=1)
    
    rain_final = rain_subset[['Dist Code', 'Year', 'ANNUAL RAINFALL (Millimeters)',
                               'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)']].copy()
    rain_final.columns = ['Dist Code', 'Year', 'Annual Rainfall (mm)',
                          'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)']
    
    before = master_df.shape[0]
    master_df = master_df.merge(rain_final, on=['Dist Code', 'Year'], how='left')
    print(f"  Merged: {before:,} rows → {master_df.shape[0]:,} rows")
    print(f"  Rainfall coverage: {master_df['Annual Rainfall (mm)'].notna().sum():,}/{master_df.shape[0]:,} ({master_df['Annual Rainfall (mm)'].notna().mean()*100:.1f}%)")
    
    return master_df


def merge_soil(master_df, soil_df):
    """Merge soil type data on Dist Code."""
    print("\n" + "=" * 60)
    print("🏔️ Merging soil type data...")
    print("=" * 60)
    
    soil_subset = soil_df[['Dist Code', 'SOIL TYPE PERCENT (Percent)']].copy()
    soil_subset.columns = ['Dist Code', 'Soil Type']
    
    # Extract primary soil type (first one listed, before the percentage)
    def extract_primary_soil(s):
        if pd.isna(s) or s == 'Not Applicable':
            return 'Unknown'
        # Take the first soil type mentioned
        s = str(s).strip()
        # Common patterns: "VERTISOLS - 50% ; ALFISOLS - 30%"
        parts = s.split(';')[0].strip()
        # Remove percentage
        parts = parts.split('-')[0].strip().split(' - ')[0].strip()
        # Clean up
        parts = parts.replace('LOAMY ', '').replace('CLAYEY ', '').replace('SANDY ', '')
        return parts.upper()
    
    soil_subset['Primary Soil Type'] = soil_subset['Soil Type'].apply(extract_primary_soil)
    soil_final = soil_subset[['Dist Code', 'Primary Soil Type']].drop_duplicates(subset='Dist Code')
    
    print(f"  Soil types found: {soil_final['Primary Soil Type'].nunique()}")
    print(f"  Distribution:\n{soil_final['Primary Soil Type'].value_counts().to_string()}")
    
    before = master_df.shape[0]
    master_df = master_df.merge(soil_final, on='Dist Code', how='left')
    print(f"\n  Merged: {before:,} rows → {master_df.shape[0]:,} rows")
    
    return master_df


def merge_irrigation(master_df, irr_df):
    """Merge irrigation data on Dist Code + Year."""
    print("\n" + "=" * 60)
    print("💧 Merging irrigation data...")
    print("=" * 60)
    
    # Create a mapping from crop name to irrigation column
    irr_crop_map = {
        'RICE': 'RICE IRRIGATED AREA (1000 ha)',
        'WHEAT': 'WHEAT IRRIGATED AREA (1000 ha)',
        'SORGHUM': 'SORGHUM IRRIGATED AREA (1000 ha)',
        'PEARL MILLET': 'PEARL MILLET IRRIGATED AREA (1000 ha)',
        'MAIZE': 'MAIZE IRRIGATED AREA (1000 ha)',
        'FINGER MILLET': 'FINGER MILLET IRRIGATED AREA (1000 ha)',
        'BARLEY': 'BARLEY IRRIGATED AREA (1000 ha)',
        'CHICKPEA': 'CHICKPEA IRRIGATED AREA (1000 ha)',
        'PIGEONPEA': 'PIGEONPEA IRRIGATED AREA (1000 ha)',
        'GROUNDNUT': 'GROUNDNUT IRRIGATED AREA (1000 ha)',
        'SESAMUM': 'SESAMUM IRRIGATED AREA (1000 ha)',
        'LINSEED': 'LINSEED IRRIGATED AREA (1000 ha)',
        'SUGARCANE': 'SUGARCANE IRRIGATED AREA (1000 ha)',
        'COTTON': 'COTTON IRRIGATED AREA (1000 ha)',
    }
    
    # For each district-year, get irrigation area per crop
    irr_records = []
    for _, row in irr_df.iterrows():
        for crop_name, irr_col in irr_crop_map.items():
            if irr_col in irr_df.columns:
                try:
                    val = float(row[irr_col])
                    if not np.isnan(val):
                        irr_records.append({
                            'Dist Code': row['Dist Code'],
                            'Year': row['Year'],
                            'Crop': crop_name,
                            'Irrigated Area (1000 ha)': val
                        })
                except (ValueError, TypeError):
                    continue
    
    irr_long = pd.DataFrame(irr_records)
    
    before = master_df.shape[0]
    master_df = master_df.merge(irr_long, on=['Dist Code', 'Year', 'Crop'], how='left')
    
    # Calculate irrigation ratio (irrigated area / total area)
    master_df['Irrigation Ratio'] = (
        master_df['Irrigated Area (1000 ha)'] / master_df['Area (1000 ha)']
    ).clip(0, 1)  # Cap at 1.0 (100% irrigated)
    
    print(f"  Merged: {before:,} rows → {master_df.shape[0]:,} rows")
    print(f"  Irrigation coverage: {master_df['Irrigated Area (1000 ha)'].notna().sum():,}/{master_df.shape[0]:,}")
    
    return master_df


def clean_and_finalize(master_df):
    """Final cleaning, feature engineering, and output."""
    print("\n" + "=" * 60)
    print("🧹 Cleaning & finalizing master dataset...")
    print("=" * 60)
    
    # Convert numeric columns
    numeric_cols = ['Area (1000 ha)', 'Production (1000 tons)', 'Yield (Kg per ha)',
                    'N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 'NPK Total (Kg/ha)',
                    'Annual Rainfall (mm)', 'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)',
                    'Irrigated Area (1000 ha)', 'Irrigation Ratio']
    for col in numeric_cols:
        if col in master_df.columns:
            master_df[col] = pd.to_numeric(master_df[col], errors='coerce')
    
    print(f"  Before cleaning: {master_df.shape[0]:,} rows")
    
    # Drop rows where key features are all missing
    key_features = ['N (Kg/ha)', 'Annual Rainfall (mm)', 'Yield (Kg per ha)']
    master_df = master_df.dropna(subset=['Yield (Kg per ha)'])
    print(f"  After dropping rows without yield: {master_df.shape[0]:,} rows")
    
    # Fill missing irrigation with 0 (no data = likely rainfed)
    master_df['Irrigated Area (1000 ha)'] = master_df['Irrigated Area (1000 ha)'].fillna(0)
    master_df['Irrigation Ratio'] = master_df['Irrigation Ratio'].fillna(0)
    
    # Fill missing soil type
    master_df['Primary Soil Type'] = master_df['Primary Soil Type'].fillna('Unknown')
    
    # Select and reorder final columns
    final_cols = [
        # Location & time
        'State Name', 'Dist Name', 'Dist Code', 'Year',
        # Target
        'Crop',
        # Crop metrics
        'Area (1000 ha)', 'Production (1000 tons)', 'Yield (Kg per ha)',
        # Soil nutrients (NPK)
        'N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 'NPK Total (Kg/ha)',
        # Climate
        'Annual Rainfall (mm)', 'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)',
        # Soil
        'Primary Soil Type',
        # Irrigation
        'Irrigated Area (1000 ha)', 'Irrigation Ratio',
    ]
    
    master_df = master_df[[c for c in final_cols if c in master_df.columns]]
    
    # Summary statistics
    print(f"\n  Final dataset: {master_df.shape[0]:,} rows × {master_df.shape[1]} columns")
    print(f"  States: {master_df['State Name'].nunique()}")
    print(f"  Districts: {master_df['Dist Name'].nunique()}")
    print(f"  Crops: {master_df['Crop'].nunique()}")
    print(f"  Year range: {master_df['Year'].min()} - {master_df['Year'].max()}")
    
    print(f"\n  Crop distribution:")
    print(master_df['Crop'].value_counts().to_string())
    
    print(f"\n  Missing values:")
    missing = master_df.isnull().sum()
    missing = missing[missing > 0]
    if len(missing) > 0:
        for col, count in missing.items():
            pct = count / master_df.shape[0] * 100
            print(f"    {col}: {count:,} ({pct:.1f}%)")
    else:
        print("    None!")
    
    print(f"\n  Feature statistics:")
    print(master_df.describe().round(2).to_string())
    
    return master_df


def main():
    print("=" * 60)
    print("🌾 PHASE 2: DATA PREPARATION & FUSION PIPELINE")
    print("=" * 60)
    
    # Step 1: Load all datasets
    datasets = load_datasets()
    
    # Step 2: Reshape crop data (wide → long)
    master = reshape_crop_data(datasets['crop'])
    
    # Step 3: Merge fertilizer (NPK)
    master = merge_fertilizer(master, datasets['fert'])
    
    # Step 4: Merge rainfall
    master = merge_rainfall(master, datasets['rain'])
    
    # Step 5: Merge soil type
    master = merge_soil(master, datasets['soil'])
    
    # Step 6: Merge irrigation
    master = merge_irrigation(master, datasets['irr'])
    
    # Step 7: Clean and finalize
    master = clean_and_finalize(master)
    
    # Step 8: Save
    output_path = os.path.join(PROCESSED_DIR, "master_dataset.csv")
    master.to_csv(output_path, index=False)
    
    size_mb = os.path.getsize(output_path) / (1024 * 1024)
    print(f"\n{'=' * 60}")
    print(f"✅ MASTER DATASET SAVED")
    print(f"   Path: {output_path}")
    print(f"   Size: {size_mb:.1f} MB")
    print(f"   Shape: {master.shape[0]:,} rows × {master.shape[1]} columns")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
