"""
Phase 3: Exploratory Data Analysis
Generates all key plots for the master_dataset_clean.csv
Saves plots to plots/
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend for Windows
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
import os
import warnings
warnings.filterwarnings('ignore')
 
# Style
sns.set_theme(style="darkgrid", palette="muted")
plt.rcParams.update({
    'figure.facecolor': '#1a1a2e',
    'axes.facecolor':   '#16213e',
    'axes.edgecolor':   '#4a4a6a',
    'axes.labelcolor':  '#e0e0e0',
    'xtick.color':      '#c0c0c0',
    'ytick.color':      '#c0c0c0',
    'text.color':       '#e0e0e0',
    'grid.color':       '#2a2a4a',
    'grid.alpha':       0.5,
    'font.family':      'DejaVu Sans',
    'figure.titlesize': 16,
    'axes.titlesize':   13,
    'axes.labelsize':   11,
})

PLOTS_DIR = "plots"
os.makedirs(PLOTS_DIR, exist_ok=True)

ACCENT = "#00d4ff"
PALETTE = ["#00d4ff","#ff6b6b","#ffd166","#06d6a0","#a29bfe",
           "#fd79a8","#e17055","#74b9ff","#55efc4","#fdcb6e",
           "#b2bec3","#636e72","#2d3436","#0984e3","#e84393",
           "#00b894","#d63031","#6c5ce7","#fab1a0"]

CROP_COLORS = {crop: PALETTE[i % len(PALETTE)]
               for i, crop in enumerate([
                   'BARLEY','CASTOR','CHICKPEA','COTTON','FINGER MILLET',
                   'GROUNDNUT','LINSEED','MAIZE','PEARL MILLET','PIGEONPEA',
                   'RAPESEED AND MUSTARD','RICE','SAFFLOWER','SESAMUM',
                   'SORGHUM','SOYABEAN','SUGARCANE','SUNFLOWER','WHEAT'
               ])}

def save(fig, name):
    path = os.path.join(PLOTS_DIR, name)
    fig.savefig(path, dpi=150, bbox_inches='tight',
                facecolor=fig.get_facecolor())
    plt.close(fig)
    print(f"  Saved: {path}")


# ──────────────────────────────────────────────────────────
#  PLOT 1  Crop frequency distribution
# ──────────────────────────────────────────────────────────
def plot_crop_distribution(df):
    counts = df['Crop'].value_counts()
    fig, ax = plt.subplots(figsize=(13, 6), facecolor='#1a1a2e')
    bars = ax.barh(counts.index, counts.values,
                   color=[CROP_COLORS[c] for c in counts.index],
                   edgecolor='none', height=0.7)
    for bar, val in zip(bars, counts.values):
        ax.text(val + 300, bar.get_y() + bar.get_height()/2,
                f'{val:,}', va='center', ha='left',
                color='#e0e0e0', fontsize=9)
    ax.set_xlabel("Number of District-Year Records")
    year_min, year_max = df['Year'].min(), df['Year'].max()
    ax.set_title(f"Crop Distribution across Indian Districts ({year_min}-{year_max})",
                 pad=14, fontweight='bold', color=ACCENT)
    ax.invert_yaxis()
    ax.xaxis.set_major_formatter(mticker.StrMethodFormatter('{x:,.0f}'))
    fig.tight_layout()
    save(fig, "01_crop_distribution.png")


# ──────────────────────────────────────────────────────────
#  PLOT 2  Yield distribution by crop (violin)
# ──────────────────────────────────────────────────────────
def plot_yield_by_crop(df):
    order = df.groupby('Crop')['Yield (Kg per ha)'].median().sort_values(ascending=False).index
    fig, ax = plt.subplots(figsize=(16, 7), facecolor='#1a1a2e')
    sns.violinplot(data=df, x='Crop', y='Yield (Kg per ha)',
                   order=order, palette=PALETTE, inner='quartile',
                   cut=0, ax=ax, linewidth=0.8)
    ax.set_xticklabels(ax.get_xticklabels(), rotation=40, ha='right', fontsize=9)
    ax.set_title("Yield Distribution by Crop (Kg/ha)", pad=14,
                 fontweight='bold', color=ACCENT)
    ax.set_xlabel("")
    ax.set_ylabel("Yield (Kg per ha)")
    fig.tight_layout()
    save(fig, "02_yield_by_crop.png")


# ──────────────────────────────────────────────────────────
#  PLOT 3  Correlation heatmap (numeric features vs yield)
# ──────────────────────────────────────────────────────────
def plot_correlation(df):
    num_cols = ['Yield (Kg per ha)', 'N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)',
                'NPK Total (Kg/ha)', 'Annual Rainfall (mm)',
                'Kharif Rainfall (mm)', 'Rabi Rainfall (mm)',
                'Irrigation Ratio', 'Area (1000 ha)', 'Year']
    corr = df[num_cols].corr()
    mask = np.triu(np.ones_like(corr, dtype=bool))

    fig, ax = plt.subplots(figsize=(12, 10), facecolor='#1a1a2e')
    cmap = sns.diverging_palette(220, 20, as_cmap=True)
    sns.heatmap(corr, mask=mask, cmap=cmap, center=0, vmin=-1, vmax=1,
                annot=True, fmt='.2f', annot_kws={'size': 9},
                linewidths=0.5, linecolor='#2a2a4a', ax=ax,
                cbar_kws={'shrink': 0.8})
    ax.set_title("Feature Correlation Heatmap", pad=14,
                 fontweight='bold', color=ACCENT)
    fig.tight_layout()
    save(fig, "03_correlation_heatmap.png")


# ──────────────────────────────────────────────────────────
#  PLOT 4  Feature distributions (8-panel)
# ──────────────────────────────────────────────────────────
def plot_feature_distributions(df):
    features = ['N (Kg/ha)', 'P (Kg/ha)', 'K (Kg/ha)', 'NPK Total (Kg/ha)',
                'Annual Rainfall (mm)', 'Kharif Rainfall (mm)',
                'Irrigation Ratio', 'Yield (Kg per ha)']
    fig, axes = plt.subplots(2, 4, figsize=(18, 8), facecolor='#1a1a2e')
    axes = axes.flatten()
    for i, feat in enumerate(features):
        data = df[feat].dropna()
        axes[i].hist(data, bins=60, color=PALETTE[i], edgecolor='none', alpha=0.85)
        axes[i].axvline(data.median(), color='white', linestyle='--', linewidth=1.2,
                        label=f'Median: {data.median():.1f}')
        axes[i].set_title(feat, fontsize=10, fontweight='bold', color=ACCENT)
        axes[i].legend(fontsize=8, framealpha=0.3)
        axes[i].set_ylabel("Count")
    fig.suptitle("Feature Distributions", fontsize=15, fontweight='bold',
                 color=ACCENT, y=1.01)
    fig.tight_layout()
    save(fig, "04_feature_distributions.png")


# ──────────────────────────────────────────────────────────
#  PLOT 5  Average yield trend over years (top 8 crops)
# ──────────────────────────────────────────────────────────
def plot_yield_trend(df):
    top8 = df['Crop'].value_counts().head(8).index.tolist()
    fig, ax = plt.subplots(figsize=(14, 6), facecolor='#1a1a2e')
    for crop in top8:
        sub = df[df['Crop'] == crop].groupby('Year')['Yield (Kg per ha)'].mean()
        ax.plot(sub.index, sub.values, label=crop,
                color=CROP_COLORS[crop], linewidth=2, alpha=0.9)
    ax.set_title("Average Yield Trend (1966–2017) – Top 8 Crops",
                 pad=14, fontweight='bold', color=ACCENT)
    ax.set_xlabel("Year")
    ax.set_ylabel("Average Yield (Kg/ha)")
    ax.legend(loc='upper left', fontsize=9, framealpha=0.3, ncol=2)
    fig.tight_layout()
    save(fig, "05_yield_trend_over_years.png")


# ──────────────────────────────────────────────────────────
#  PLOT 6  State-wise average yield for top 5 crops
# ──────────────────────────────────────────────────────────
def plot_state_yield(df):
    top5 = df['Crop'].value_counts().head(5).index.tolist()
    fig, axes = plt.subplots(1, 5, figsize=(22, 7), facecolor='#1a1a2e')
    for i, crop in enumerate(top5):
        sub = (df[df['Crop'] == crop]
               .groupby('State Name')['Yield (Kg per ha)']
               .mean()
               .sort_values(ascending=True))
        axes[i].barh(sub.index, sub.values,
                     color=CROP_COLORS[crop], edgecolor='none', height=0.7)
        axes[i].set_title(crop, fontweight='bold', color=CROP_COLORS[crop], fontsize=10)
        axes[i].set_xlabel("Avg Yield (Kg/ha)", fontsize=8)
        axes[i].tick_params(labelsize=8)
    fig.suptitle("State-wise Average Yield (Top 5 Crops)",
                 fontsize=14, fontweight='bold', color=ACCENT, y=1.01)
    fig.tight_layout()
    save(fig, "06_statewise_yield.png")


# ──────────────────────────────────────────────────────────
#  PLOT 7  Soil type vs yield box plot
# ──────────────────────────────────────────────────────────
def plot_soil_yield(df):
    valid_soils = df['Primary Soil Type'].value_counts()
    valid_soils = valid_soils[valid_soils > 1000].index.tolist()
    sub = df[df['Primary Soil Type'].isin(valid_soils)]
    order = sub.groupby('Primary Soil Type')['Yield (Kg per ha)'].median().sort_values(ascending=False).index

    fig, ax = plt.subplots(figsize=(13, 6), facecolor='#1a1a2e')
    sns.boxplot(data=sub, x='Primary Soil Type', y='Yield (Kg per ha)',
                order=order, palette=PALETTE[:len(order)],
                flierprops={'marker': '.', 'markersize': 2, 'alpha': 0.3},
                ax=ax)
    ax.set_xticklabels(ax.get_xticklabels(), rotation=30, ha='right')
    ax.set_title("Yield Distribution by Soil Type", pad=14,
                 fontweight='bold', color=ACCENT)
    ax.set_xlabel("")
    fig.tight_layout()
    save(fig, "07_soil_vs_yield.png")


# ──────────────────────────────────────────────────────────
#  PLOT 8  NPK vs Yield scatter (mean per district)
# ──────────────────────────────────────────────────────────
def plot_npk_yield(df):
    agg = df.groupby('Dist Code').agg(
        N=('N (Kg/ha)', 'mean'),
        P=('P (Kg/ha)', 'mean'),
        K=('K (Kg/ha)', 'mean'),
        Yield=('Yield (Kg per ha)', 'mean')
    ).reset_index()

    fig, axes = plt.subplots(1, 3, figsize=(16, 5), facecolor='#1a1a2e')
    for ax, nutrient, color in zip(axes, ['N', 'P', 'K'], [PALETTE[0], PALETTE[1], PALETTE[2]]):
        ax.scatter(agg[nutrient], agg['Yield'], alpha=0.5, s=20,
                   color=color, edgecolors='none')
        valid = agg[[nutrient, 'Yield']].dropna()
        if len(valid) > 1:
            m, b = np.polyfit(valid[nutrient], valid['Yield'], 1)
            x_line = np.linspace(valid[nutrient].min(), valid[nutrient].max(), 100)
            ax.plot(x_line, m * x_line + b, color='white', linewidth=1.5, linestyle='--')
        ax.set_xlabel(f'{nutrient} (Kg/ha)')
        ax.set_ylabel('Avg Yield (Kg/ha)')
        ax.set_title(f'{nutrient} vs Yield', fontweight='bold', color=color)
    fig.suptitle("Fertilizer Nutrients vs Average Yield (District-level)",
                 fontsize=14, fontweight='bold', color=ACCENT)
    fig.tight_layout()
    save(fig, "08_npk_vs_yield.png")


# ──────────────────────────────────────────────────────────
#  MAIN
# ──────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("PHASE 3: EXPLORATORY DATA ANALYSIS")
    print("=" * 60)
    df = pd.read_csv("data/processed/master_dataset_clean.csv")
    print(f"  Loaded: {df.shape[0]:,} rows x {df.shape[1]} cols\n")

    print("[1/8] Crop distribution...")
    plot_crop_distribution(df)

    print("[2/8] Yield by crop (violin)...")
    plot_yield_by_crop(df)

    print("[3/8] Correlation heatmap...")
    plot_correlation(df)

    print("[4/8] Feature distributions...")
    plot_feature_distributions(df)

    print("[5/8] Yield trends over years...")
    plot_yield_trend(df)

    print("[6/8] State-wise yield (top 5 crops)...")
    plot_state_yield(df)

    print("[7/8] Soil type vs yield...")
    plot_soil_yield(df)

    print("[8/8] NPK vs Yield scatter...")
    plot_npk_yield(df)

    print("\n" + "=" * 60)
    print("  EDA complete! All 8 plots saved to plots/")
    print("=" * 60)


if __name__ == "__main__":
    main()
