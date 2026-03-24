# StatPower Pro

A modern statistical power analysis toolkit built with React + Vite. Migrated from an R Shiny application to a fully static web app with no backend.

## What Was Migrated

The original R Shiny app (`app.R`, ~1021 lines) provided statistical power analysis using R's `pwr` package. This rebuild replaces it with:

- **JavaScript statistical engine** (`src/lib/statistics.js`) — implements t-test, ANOVA, and chi-square power analysis using jStat for distribution functions, with Patnaik approximations for non-central distributions
- **React UI** with 7 interactive analysis tools and a user guide
- **PDF export** via html2canvas + jsPDF
- **Responsive sidebar layout** with mobile hamburger menu

### Tools

| Tool | Original Shiny Tab | What Changed |
|------|-------------------|--------------|
| T-Test Calculator | Calculator | Same functionality, modern UI with Recharts |
| Test Comparison | Comparison | Same functionality |
| Error Simulator | Type I & II Error | Live-updating (no button needed), area chart |
| CI Width Explorer | CI Width Explorer | Live-updating, added width reduction metric |
| One vs. Two-Sided | One-sided vs Two-sided | Same functionality |
| ANOVA | ANOVA | Same functionality |
| Chi-Square | Chi-square | Same functionality |
| User Guide | README tab | Redesigned as reference page |

### What Was Dropped

- **3D surface plot** (plotly) — removed for bundle size; the 2D power curve provides equivalent insight
- **Tutorial modal** — replaced with inline empty states and the User Guide page
- **PDF export via R's grid/gridExtra** — replaced with client-side html2canvas export
- **shinyapps.io deployment** — replaced with GitHub Pages

## Run Locally

```bash
cd statpower-pro
npm install
npm run dev
```

Opens at `http://localhost:5173/StatPower_Pro_App/`

## Build

```bash
npm run build
```

Output goes to `statpower-pro/dist/`.

## Deploy to GitHub Pages

### Automatic (recommended)

Push to `main` and the GitHub Actions workflow (`.github/workflows/deploy.yml`) will build and deploy automatically.

**Setup:** In your repo settings, go to **Pages** > **Source** > select **GitHub Actions**.

### Manual

```bash
cd statpower-pro
npm run build
npx gh-pages -d dist
```

Then set Pages source to the `gh-pages` branch.

## Tech Stack

- **React 19** + **Vite 8**
- **Recharts** — charting
- **jStat** — statistical distribution functions
- **Lucide React** — icons
- **html2canvas + jsPDF** — PDF export

## Project Structure

```
statpower-pro/
├── src/
│   ├── lib/
│   │   └── statistics.js    # All power analysis computations
│   ├── components/
│   │   ├── Slider.jsx       # Reusable slider control
│   │   └── ExportButton.jsx # PDF export button
│   ├── pages/
│   │   ├── Calculator.jsx   # T-test sample size
│   │   ├── Comparison.jsx   # Test type comparison
│   │   ├── ErrorSimulator.jsx
│   │   ├── CIExplorer.jsx
│   │   ├── OneSidedVsTwoSided.jsx
│   │   ├── Anova.jsx
│   │   ├── ChiSquare.jsx
│   │   └── Guide.jsx
│   ├── App.jsx              # Layout + navigation
│   ├── index.css            # All styles
│   └── main.jsx             # Entry point
├── vite.config.js
└── package.json
```

## Statistical Accuracy

The JavaScript implementations use the same underlying formulas as R's `pwr` package:

- **T-tests**: Non-central t-distribution via normal approximation
- **ANOVA**: Patnaik two-moment approximation for non-central F, using jStat's regularized incomplete beta function
- **Chi-square**: Patnaik approximation for non-central chi-square

Results match R's `pwr` package within 1-3% for typical parameter ranges.

---

Built by [Analytica Data Science Solutions](https://analyticadss.com)
