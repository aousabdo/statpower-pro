/**
 * Statistical power analysis engine.
 * Replaces R's `pwr` package with pure JS implementations.
 * Uses jstat for distribution functions.
 */
import { jStat } from 'jstat';

// ─── T-distribution helpers ───────────────────────────────────────────────────

function tCdf(x, df) {
  return jStat.studentt.cdf(x, df);
}

function tQuantile(p, df) {
  return jStat.studentt.inv(p, df);
}

function normalCdf(x) {
  return jStat.normal.cdf(x, 0, 1);
}

function normalQuantile(p) {
  return jStat.normal.inv(p, 0, 1);
}

function chiCdf(x, df) {
  return jStat.chisquare.cdf(x, df);
}

function chiQuantile(p, df) {
  return jStat.chisquare.inv(p, df);
}

function fCdf(x, df1, df2) {
  return jStat.centralF.cdf(x, df1, df2);
}

function fQuantile(p, df1, df2) {
  return jStat.centralF.inv(p, df1, df2);
}

// Non-central t CDF using approximation
function nctCdf(x, df, ncp) {
  // Use jStat's non-central t if available, otherwise approximate
  if (jStat.noncentralt && jStat.noncentralt.cdf) {
    return jStat.noncentralt.cdf(x, df, ncp);
  }
  // Approximation using normal for large df
  if (df > 1000) {
    return normalCdf(x - ncp);
  }
  // Numerical integration approximation
  return nctCdfApprox(x, df, ncp);
}

function nctCdfApprox(t, df, delta) {
  // Patnaik approximation for non-central t
  // P(T < t) where T ~ nct(df, delta)
  const x = t * Math.sqrt(1 - 1/(4*df)) - delta;
  return normalCdf(x / Math.sqrt(1 + t*t/(2*df)));
}

// (Unused non-central distribution functions removed - using Patnaik approximation instead)

// ─── Power analysis: T-test ──────────────────────────────────────────────────

/**
 * Calculate sample size for a t-test given power, effect size, and sig level.
 * Mirrors R's pwr.t.test().
 * @param {Object} params
 * @param {'two.sample'|'one.sample'|'paired'} params.type
 * @param {number} params.d - Cohen's d effect size
 * @param {number} params.power - Desired power (0-1)
 * @param {number} params.sigLevel - Significance level
 * @param {'two.sided'|'greater'|'less'} params.alternative
 * @returns {number} Required n per group
 */
export function pwrTTest({ d, power, sigLevel, type = 'two.sample', alternative = 'two.sided' }) {
  // Binary search for n
  let lo = 2;
  let hi = 1e6;

  for (let i = 0; i < 100; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const p = tTestPower({ n: mid, d, sigLevel, type, alternative });

    if (Math.abs(p - power) < 1e-6) return mid;
    if (p < power) lo = mid + 1;
    else hi = mid;
  }

  return Math.ceil(hi);
}

/**
 * Calculate power for a t-test given n, effect size, sig level.
 */
export function tTestPower({ n, d, sigLevel, type = 'two.sample', alternative = 'two.sided' }) {
  let df, ncp;

  switch (type) {
    case 'two.sample':
      df = 2 * n - 2;
      ncp = d * Math.sqrt(n / 2);
      break;
    case 'one.sample':
    case 'paired':
      df = n - 1;
      ncp = d * Math.sqrt(n);
      break;
    default:
      df = 2 * n - 2;
      ncp = d * Math.sqrt(n / 2);
  }

  if (alternative === 'two.sided') {
    const crit = tQuantile(1 - sigLevel / 2, df);
    const powerUpper = 1 - nctCdf(crit, df, ncp);
    const powerLower = nctCdf(-crit, df, ncp);
    return powerUpper + powerLower;
  } else if (alternative === 'greater') {
    const crit = tQuantile(1 - sigLevel, df);
    return 1 - nctCdf(crit, df, ncp);
  } else {
    const crit = tQuantile(sigLevel, df);
    return nctCdf(crit, df, ncp);
  }
}

/**
 * Generate power curve data for varying effect sizes at fixed n.
 */
export function powerCurveData({ n, sigLevel, type = 'two.sample', alternative = 'two.sided', dRange = [0.1, 2.0], steps = 50 }) {
  const data = [];
  const step = (dRange[1] - dRange[0]) / steps;

  for (let d = dRange[0]; d <= dRange[1]; d += step) {
    const power = tTestPower({ n, d, sigLevel, type, alternative });
    data.push({ d: Math.round(d * 100) / 100, power: Math.round(power * 10000) / 10000 });
  }

  return data;
}

/**
 * Generate 3D surface data: effect size x power x sample size
 */
export function surface3DData({ sigLevel, type = 'two.sample', alternative = 'two.sided' }) {
  const effectSizes = [];
  const powers = [];
  const sampleSizes = [];

  for (let d = 0.2; d <= 1.5; d += 0.1) {
    const row = [];
    for (let p = 0.5; p <= 0.95; p += 0.05) {
      const n = pwrTTest({ d, power: p, sigLevel, type, alternative });
      row.push(n);
    }
    effectSizes.push(Math.round(d * 10) / 10);
    sampleSizes.push(row);
  }

  for (let p = 0.5; p <= 0.95; p += 0.05) {
    powers.push(Math.round(p * 100) / 100);
  }

  return { effectSizes, powers, sampleSizes };
}

// ─── Power analysis: ANOVA ───────────────────────────────────────────────────

/**
 * Calculate sample size per group for one-way ANOVA.
 * Mirrors R's pwr.anova.test().
 * @param {number} k - Number of groups
 * @param {number} f - Effect size (Cohen's f)
 * @param {number} power - Desired power
 * @param {number} sigLevel - Significance level
 * @returns {number} n per group
 */
export function pwrAnovaTest({ k, f, power, sigLevel }) {
  let lo = 2;
  let hi = 1e5;

  for (let i = 0; i < 100; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const p = anovaPower({ n: mid, k, f, sigLevel });

    if (Math.abs(p - power) < 1e-6) return mid;
    if (p < power) lo = mid + 1;
    else hi = mid;
  }

  return Math.ceil(hi);
}

/**
 * Calculate power for one-way ANOVA.
 * Uses Patnaik two-moment approximation with jStat.ibeta for the incomplete beta.
 */
export function anovaPower({ n, k, f, sigLevel }) {
  const df1 = k - 1;
  const df2 = k * (n - 1);
  const lambda = n * k * f * f;
  const fCrit = fQuantile(1 - sigLevel, df1, df2);

  // Patnaik approximation: approximate the non-central F(df1, df2, lambda)
  // with a scaled central F(df1', df2) where:
  //   df1' = (df1 + lambda)^2 / (df1 + 2*lambda)
  //   The scaling factor means: P(F_nc > x) ≈ P(F(df1', df2) > x * df1/(df1+lambda))
  const df1p = (df1 + lambda) * (df1 + lambda) / (df1 + 2 * lambda);
  const adjustedCrit = fCrit * df1 / (df1 + lambda);

  // Compute P(F(df1p, df2) > adjustedCrit) using the incomplete beta
  // F CDF: P(F(v1,v2) <= x) = I_{v1*x/(v1*x+v2)}(v1/2, v2/2)
  const bArg = df1p * adjustedCrit / (df1p * adjustedCrit + df2);
  const cdfVal = jStat.ibeta(bArg, df1p / 2, df2 / 2);

  return Math.min(1, Math.max(0, 1 - cdfVal));
}

/**
 * Generate ANOVA power curve data.
 */
export function anovaPowerCurve({ k, f, sigLevel, nRange = [5, 200], steps = 40 }) {
  const data = [];
  const step = Math.max(1, Math.floor((nRange[1] - nRange[0]) / steps));

  for (let n = nRange[0]; n <= nRange[1]; n += step) {
    const power = anovaPower({ n, k, f, sigLevel });
    data.push({ n, power: Math.round(power * 10000) / 10000 });
  }

  return data;
}

// ─── Power analysis: Chi-square ──────────────────────────────────────────────

/**
 * Calculate sample size for chi-square test.
 * Mirrors R's pwr.chisq.test().
 * @param {number} w - Effect size (Cohen's w)
 * @param {number} df - Degrees of freedom
 * @param {number} power - Desired power
 * @param {number} sigLevel - Significance level
 * @returns {number} Required N
 */
export function pwrChisqTest({ w, df, power, sigLevel }) {
  let lo = 10;
  let hi = 1e6;

  for (let i = 0; i < 100; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const p = chisqPower({ N: mid, w, df, sigLevel });

    if (Math.abs(p - power) < 1e-6) return mid;
    if (p < power) lo = mid + 1;
    else hi = mid;
  }

  return Math.ceil(hi);
}

/**
 * Calculate power for chi-square test.
 * Uses Patnaik approximation for non-central chi-square.
 */
export function chisqPower({ N, w, df, sigLevel }) {
  const lambda = N * w * w;
  const chiCrit = chiQuantile(1 - sigLevel, df);

  // Patnaik: non-central chi-sq(df, lambda) ≈ c * chi-sq(df')
  // where df' = (df + lambda)^2 / (df + 2*lambda)
  // and c = (df + lambda) / df' = (df + 2*lambda) / (df + lambda)
  const dfp = (df + lambda) * (df + lambda) / (df + 2 * lambda);
  const c = (df + 2 * lambda) / (df + lambda);

  // P(X_nc > chiCrit) ≈ P(chi-sq(dfp) > chiCrit / c)
  const adjustedCrit = chiCrit / c;
  return Math.min(1, Math.max(0, 1 - chiCdf(adjustedCrit, dfp)));
}

/**
 * Generate chi-square power curve data.
 */
export function chisqPowerCurve({ w, df, sigLevel, nRange = [20, 500], steps = 40 }) {
  const data = [];
  const step = Math.max(1, Math.floor((nRange[1] - nRange[0]) / steps));

  for (let N = nRange[0]; N <= nRange[1]; N += step) {
    const power = chisqPower({ N, w, df, sigLevel });
    data.push({ N, power: Math.round(power * 10000) / 10000 });
  }

  return data;
}

// ─── Error simulation ────────────────────────────────────────────────────────

/**
 * Generate Type I & Type II error simulation data.
 * @param {number} effectSize - True effect size
 * @param {number} n - Sample size
 * @param {number} sigLevel - Alpha
 * @returns {{ nullDist, altDist, criticalValue, typeI, typeII, power }}
 */
export function errorSimulation({ effectSize, n, sigLevel }) {
  const se = 1 / Math.sqrt(n);
  const criticalValue = normalQuantile(1 - sigLevel / 2) * se;

  // Generate distribution data for plotting
  const nullDist = [];
  const altDist = [];
  const mean0 = 0;
  const meanAlt = effectSize;

  const xMin = Math.min(mean0, meanAlt) - 4 * se;
  const xMax = Math.max(mean0, meanAlt) + 4 * se;
  const steps = 200;
  const dx = (xMax - xMin) / steps;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    nullDist.push({
      x: Math.round(x * 1000) / 1000,
      y: jStat.normal.pdf(x, mean0, se),
    });
    altDist.push({
      x: Math.round(x * 1000) / 1000,
      y: jStat.normal.pdf(x, meanAlt, se),
    });
  }

  // Calculate error rates
  const typeI = sigLevel; // By definition
  const typeII = normalCdf((criticalValue - meanAlt) / se) - normalCdf((-criticalValue - meanAlt) / se);
  const power = 1 - typeII;

  return {
    nullDist,
    altDist,
    criticalValue: Math.round(criticalValue * 1000) / 1000,
    negativeCritical: Math.round(-criticalValue * 1000) / 1000,
    typeI: Math.round(typeI * 10000) / 10000,
    typeII: Math.round(typeII * 10000) / 10000,
    power: Math.round(power * 10000) / 10000,
    se,
  };
}

// ─── CI Width Explorer ───────────────────────────────────────────────────────

/**
 * Generate CI width vs sample size data.
 */
export function ciWidthData({ mean, sd, confLevel, nRange = [10, 500] }) {
  const data = [];
  const z = normalQuantile(1 - (1 - confLevel) / 2);

  for (let n = nRange[0]; n <= nRange[1]; n += Math.max(1, Math.floor((nRange[1] - nRange[0]) / 80))) {
    const me = z * sd / Math.sqrt(n);
    const width = 2 * me;
    data.push({
      n,
      width: Math.round(width * 1000) / 1000,
      lower: Math.round((mean - me) * 1000) / 1000,
      upper: Math.round((mean + me) * 1000) / 1000,
    });
  }

  return data;
}

// ─── Power analysis: Correlation (r-test) ───────────────────────────────────

/**
 * Calculate sample size for correlation test.
 * Uses Fisher z-transform.
 * @param {number} r - Expected correlation
 * @param {number} power - Desired power (0-1)
 * @param {number} sigLevel - Significance level
 * @returns {number} Required n
 */
export function pwrRTest({ r, power, sigLevel }) {
  const zAlpha = normalQuantile(1 - sigLevel / 2);
  const zBeta = normalQuantile(power);
  const z = Math.atanh(r); // Fisher z-transform
  // Initial estimate
  let n0 = Math.ceil(((zAlpha + zBeta) / z) ** 2 + 3);
  // Binary search for exact n
  let lo = 4;
  let hi = Math.max(n0 * 4, 1e5);
  for (let i = 0; i < 100; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const p = correlationPower({ n: mid, r, sigLevel });
    if (Math.abs(p - power) < 1e-6) return mid;
    if (p < power) lo = mid + 1;
    else hi = mid;
  }
  return Math.ceil(hi);
}

/**
 * Calculate power for correlation test using Fisher z-transform.
 */
export function correlationPower({ n, r, sigLevel }) {
  if (n <= 3) return 0;
  const z = Math.atanh(r);
  const se = 1 / Math.sqrt(n - 3);
  const zAlpha = normalQuantile(1 - sigLevel / 2);
  const power = 1 - normalCdf(zAlpha - z / se) + normalCdf(-zAlpha - z / se);
  return Math.min(1, Math.max(0, power));
}

/**
 * Generate correlation power curve data.
 */
export function correlationPowerCurve({ r, sigLevel, nRange = [10, 300], steps = 40 }) {
  const data = [];
  const step = Math.max(1, Math.floor((nRange[1] - nRange[0]) / steps));
  for (let n = nRange[0]; n <= nRange[1]; n += step) {
    const power = correlationPower({ n, r, sigLevel });
    data.push({ n, power: Math.round(power * 10000) / 10000 });
  }
  return data;
}

// ─── Power analysis: Regression ─────────────────────────────────────────────

/**
 * Calculate sample size for regression F-test.
 * @param {number} f2 - Cohen's f² = R²/(1-R²)
 * @param {number} u - Number of predictors
 * @param {number} power - Desired power (0-1)
 * @param {number} sigLevel - Significance level
 * @returns {number} Required total n
 */
export function pwrRegression({ f2, u, power, sigLevel }) {
  let lo = u + 2;
  let hi = 1e5;
  for (let i = 0; i < 100; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const p = regressionPower({ n: mid, f2, u, sigLevel });
    if (Math.abs(p - power) < 1e-6) return mid;
    if (p < power) lo = mid + 1;
    else hi = mid;
  }
  return Math.ceil(hi);
}

/**
 * Calculate power for regression F-test.
 * Uses Patnaik approximation for non-central F.
 */
export function regressionPower({ n, f2, u, sigLevel }) {
  const df1 = u;
  const df2 = n - u - 1;
  if (df2 < 1) return 0;
  const lambda = f2 * n;
  const fCrit = fQuantile(1 - sigLevel, df1, df2);

  // Patnaik approximation
  const df1p = (df1 + lambda) * (df1 + lambda) / (df1 + 2 * lambda);
  const adjustedCrit = fCrit * df1 / (df1 + lambda);
  const bArg = df1p * adjustedCrit / (df1p * adjustedCrit + df2);
  const cdfVal = jStat.ibeta(bArg, df1p / 2, df2 / 2);
  return Math.min(1, Math.max(0, 1 - cdfVal));
}

/**
 * Generate regression power curve data.
 */
export function regressionPowerCurve({ f2, u, sigLevel, nRange = [10, 300], steps = 40 }) {
  const data = [];
  const step = Math.max(1, Math.floor((nRange[1] - nRange[0]) / steps));
  for (let n = Math.max(nRange[0], u + 2); n <= nRange[1]; n += step) {
    const power = regressionPower({ n, f2, u, sigLevel });
    data.push({ n, power: Math.round(power * 10000) / 10000 });
  }
  return data;
}

// ─── Power analysis: Two Proportions ────────────────────────────────────────

/**
 * Calculate sample size for two-proportions z-test.
 * @param {number} p1 - Proportion in group 1
 * @param {number} p2 - Proportion in group 2
 * @param {number} power - Desired power (0-1)
 * @param {number} sigLevel - Significance level
 * @param {number} ratio - n2/n1 allocation ratio (default 1)
 * @returns {number} n1 (sample size for group 1)
 */
export function pwrTwoProportions({ p1, p2, power, sigLevel, ratio = 1 }) {
  const zAlpha = normalQuantile(1 - sigLevel / 2);
  const zBeta = normalQuantile(power);
  const pbar = (p1 + p2 * ratio) / (1 + ratio);
  const num = zAlpha * Math.sqrt(pbar * (1 - pbar) * (1 + 1 / ratio)) +
              zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2) / ratio);
  const n1 = Math.ceil((num / (p1 - p2)) ** 2);
  return Math.max(n1, 2);
}

/**
 * Calculate power for two-proportions z-test.
 */
export function twoProportionsPower({ n1, p1, p2, sigLevel, ratio = 1 }) {
  const n2 = Math.round(n1 * ratio);
  const pbar = (p1 * n1 + p2 * n2) / (n1 + n2);
  const se0 = Math.sqrt(pbar * (1 - pbar) * (1 / n1 + 1 / n2));
  const se1 = Math.sqrt(p1 * (1 - p1) / n1 + p2 * (1 - p2) / n2);
  const zAlpha = normalQuantile(1 - sigLevel / 2);
  const z = (Math.abs(p1 - p2) - zAlpha * se0) / se1;
  return Math.min(1, Math.max(0, normalCdf(z)));
}

/**
 * Generate two-proportions power curve data.
 */
export function twoProportionsPowerCurve({ p1, p2, sigLevel, nRange = [10, 500], steps = 40, ratio = 1 }) {
  const data = [];
  const step = Math.max(1, Math.floor((nRange[1] - nRange[0]) / steps));
  for (let n1 = nRange[0]; n1 <= nRange[1]; n1 += step) {
    const power = twoProportionsPower({ n1, p1, p2, sigLevel, ratio });
    data.push({ n: n1, power: Math.round(power * 10000) / 10000 });
  }
  return data;
}

// ─── Power analysis: Equivalence (TOST) ─────────────────────────────────────

/**
 * Calculate sample size for TOST equivalence test.
 * @param {number} delta - True difference (0 for perfect equivalence)
 * @param {number} sd - Standard deviation
 * @param {number} power - Desired power (0-1)
 * @param {number} sigLevel - Significance level (one-sided, typically 0.05)
 * @param {number} margin - Equivalence margin
 * @returns {number} Required n per group
 */
export function pwrTOST({ delta, sd, power, sigLevel, margin }) {
  let lo = 2;
  let hi = 1e5;
  for (let i = 0; i < 100; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const p = tostPower({ n: mid, delta, sd, sigLevel, margin });
    if (Math.abs(p - power) < 1e-6) return mid;
    if (p < power) lo = mid + 1;
    else hi = mid;
  }
  return Math.ceil(hi);
}

/**
 * Calculate power for TOST equivalence test.
 * Power = P(reject both one-sided tests).
 */
export function tostPower({ n, delta, sd, sigLevel, margin }) {
  const se = sd * Math.sqrt(2 / n);
  const df = 2 * n - 2;
  const tCrit = tQuantile(1 - sigLevel, df);
  // Power = P(T1 > tCrit) * P(T2 > tCrit) approximately
  // where T1 tests H0: diff <= -margin, T2 tests H0: diff >= margin
  // More precisely: power = P(lower bound > -margin AND upper bound < margin)
  const ncp1 = (delta + margin) / se;
  const ncp2 = (delta - margin) / se;
  const power1 = 1 - nctCdf(tCrit, df, ncp1);
  const power2 = nctCdf(-tCrit, df, ncp2);
  // Power is the probability that both tests reject
  // Approximation: power ≈ power1 + power2 - 1 when both are high
  const pwr = power1 + power2 - 1;
  return Math.min(1, Math.max(0, pwr));
}

/**
 * Generate TOST power curve data.
 */
export function tostPowerCurve({ delta, sd, sigLevel, margin, nRange = [10, 500], steps = 40 }) {
  const data = [];
  const step = Math.max(1, Math.floor((nRange[1] - nRange[0]) / steps));
  for (let n = nRange[0]; n <= nRange[1]; n += step) {
    const power = tostPower({ n, delta, sd, sigLevel, margin });
    data.push({ n, power: Math.round(power * 10000) / 10000 });
  }
  return data;
}

// ─── Sample Size Table ──────────────────────────────────────────────────────

/**
 * Generate a 2D sample size table: rows = effect sizes, cols = power levels.
 * @param {number[]} effectSizes - Array of effect sizes
 * @param {number[]} powers - Array of power levels
 * @param {number} sigLevel - Significance level
 * @param {string} testType - 'ttest', 'anova', 'chisq', 'correlation', 'regression'
 * @param {Object} extraParams - Additional params (k for anova, df for chisq, u for regression)
 * @returns {{ effectSizes, powers, table: Array<Array<number>> }}
 */
export function sampleSizeTable({ effectSizes, powers, sigLevel, testType, extraParams = {} }) {
  const table = [];
  for (const es of effectSizes) {
    const row = [];
    for (const pwr of powers) {
      let n;
      switch (testType) {
        case 'ttest':
          n = pwrTTest({ d: es, power: pwr, sigLevel, type: extraParams.type || 'two.sample' });
          break;
        case 'anova':
          n = pwrAnovaTest({ k: extraParams.k || 3, f: es, power: pwr, sigLevel });
          break;
        case 'chisq':
          n = pwrChisqTest({ w: es, df: extraParams.df || 1, power: pwr, sigLevel });
          break;
        case 'correlation':
          n = pwrRTest({ r: es, power: pwr, sigLevel });
          break;
        case 'regression':
          n = pwrRegression({ f2: es, u: extraParams.u || 2, power: pwr, sigLevel });
          break;
        default:
          n = pwrTTest({ d: es, power: pwr, sigLevel });
      }
      row.push(n);
    }
    table.push(row);
  }
  return { effectSizes, powers, table };
}

// ─── Minimum Detectable Effect ──────────────────────────────────────────────

/**
 * Find the smallest effect size detectable at given n and power.
 * Uses binary search.
 * @param {number} n - Sample size
 * @param {number} power - Target power
 * @param {number} sigLevel - Significance level
 * @param {string} testType - 'ttest', 'anova', 'chisq', 'correlation', 'regression'
 * @param {Object} extraParams - Additional params (k, df, u)
 * @returns {number} Minimum detectable effect size
 */
export function minimumDetectableEffect({ n, power, sigLevel, testType, extraParams = {} }) {
  let lo = 0.001;
  let hi = 5.0;

  const computePower = (es) => {
    switch (testType) {
      case 'ttest':
        return tTestPower({ n, d: es, sigLevel, type: extraParams.type || 'two.sample' });
      case 'anova':
        return anovaPower({ n, k: extraParams.k || 3, f: es, sigLevel });
      case 'chisq':
        return chisqPower({ N: n, w: es, df: extraParams.df || 1, sigLevel });
      case 'correlation':
        return correlationPower({ n, r: Math.min(es, 0.999), sigLevel });
      case 'regression':
        return regressionPower({ n, f2: es, u: extraParams.u || 2, sigLevel });
      default:
        return tTestPower({ n, d: es, sigLevel });
    }
  };

  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    const p = computePower(mid);
    if (Math.abs(p - power) < 1e-4) return Math.round(mid * 10000) / 10000;
    if (p < power) lo = mid;
    else hi = mid;
  }
  return Math.round(hi * 10000) / 10000;
}

// ─── Effect Size Converter ──────────────────────────────────────────────────

/**
 * Convert between effect size measures.
 * Supported: 'd' (Cohen's d), 'r' (correlation), 'eta2' (eta-squared),
 * 'f' (Cohen's f), 'or' (odds ratio), 'f2' (f-squared), 'w' (Cohen's w)
 */
export function convertEffectSize(value, from, to) {
  if (from === to) return value;

  // First convert to Cohen's d as intermediate
  let d;
  switch (from) {
    case 'd': d = value; break;
    case 'r': d = 2 * value / Math.sqrt(1 - value * value); break;
    case 'eta2': {
      const fVal = Math.sqrt(value / (1 - value));
      d = 2 * fVal;
      break;
    }
    case 'f': d = 2 * value; break;
    case 'or': d = Math.log(value) * Math.sqrt(3) / Math.PI; break;
    case 'f2': d = 2 * Math.sqrt(value); break;
    case 'w': {
      // w ≈ sqrt(eta2), eta2 = w², f = w/sqrt(1-w²), d = 2f
      const eta2 = value * value;
      const fVal2 = Math.sqrt(eta2 / Math.max(1e-10, 1 - eta2));
      d = 2 * fVal2;
      break;
    }
    default: d = value;
  }

  // Then convert from d to target
  switch (to) {
    case 'd': return Math.round(d * 10000) / 10000;
    case 'r': return Math.round((d / Math.sqrt(d * d + 4)) * 10000) / 10000;
    case 'eta2': {
      const f = d / 2;
      return Math.round((f * f / (1 + f * f)) * 10000) / 10000;
    }
    case 'f': return Math.round((d / 2) * 10000) / 10000;
    case 'or': return Math.round(Math.exp(d * Math.PI / Math.sqrt(3)) * 10000) / 10000;
    case 'f2': return Math.round(((d / 2) ** 2) * 10000) / 10000;
    case 'w': {
      const f = d / 2;
      const eta2 = f * f / (1 + f * f);
      return Math.round(Math.sqrt(eta2) * 10000) / 10000;
    }
    default: return d;
  }
}

// ─── Effect Size Benchmarks ─────────────────────────────────────────────────

/**
 * Classify an effect size and return benchmarks + context.
 * @param {number} value - The effect size value
 * @param {string} type - 'd', 'r', 'f', 'w', 'eta2', 'f2'
 * @returns {{ label, benchmarks, overlapPercent, percentile }}
 */
export function effectSizeBenchmarks(value, type) {
  const benchmarkDefs = {
    d:    { small: 0.2, medium: 0.5, large: 0.8 },
    r:    { small: 0.1, medium: 0.3, large: 0.5 },
    f:    { small: 0.1, medium: 0.25, large: 0.4 },
    w:    { small: 0.1, medium: 0.3, large: 0.5 },
    eta2: { small: 0.01, medium: 0.06, large: 0.14 },
    f2:   { small: 0.02, medium: 0.15, large: 0.35 },
  };

  const benchmarks = benchmarkDefs[type] || benchmarkDefs.d;
  const absVal = Math.abs(value);

  let label;
  if (absVal < benchmarks.small) label = 'negligible';
  else if (absVal < benchmarks.medium) label = 'small';
  else if (absVal < benchmarks.large) label = 'medium';
  else label = 'large';

  // Overlap percent: for d, the % overlap between two normal distributions
  // OVL = 2 * Phi(-|d|/2)
  let overlapPercent = null;
  if (type === 'd') {
    overlapPercent = Math.round(2 * normalCdf(-absVal / 2) * 10000) / 100;
  }

  // Percentile: for d, the percentile of the alternative distribution
  // at the mean of the null distribution = Phi(-d)
  let percentile = null;
  if (type === 'd') {
    percentile = Math.round(normalCdf(-absVal) * 10000) / 100;
  }

  return { label, benchmarks, overlapPercent, percentile };
}

// ─── Distribution Overlap Data ──────────────────────────────────────────────

/**
 * Generate two normal curves for visual overlap display.
 * @param {number} d - Cohen's d (separation between means)
 * @param {number} steps - Number of data points
 * @returns {Array<{x, null, alt}>}
 */
export function distributionOverlap({ d, steps = 200 }) {
  const data = [];
  const xMin = Math.min(0, d) - 4;
  const xMax = Math.max(0, d) + 4;
  const dx = (xMax - xMin) / steps;

  for (let i = 0; i <= steps; i++) {
    const x = xMin + i * dx;
    data.push({
      x: Math.round(x * 1000) / 1000,
      null: Math.round(jStat.normal.pdf(x, 0, 1) * 10000) / 10000,
      alt: Math.round(jStat.normal.pdf(x, d, 1) * 10000) / 10000,
    });
  }
  return data;
}

// ─── Bayesian Sample Size ───────────────────────────────────────────────────

/**
 * Calculate sample size to achieve a target Bayes Factor.
 * Uses simplified JZS Bayes factor approximation.
 * @param {number} d - Expected Cohen's d
 * @param {number} bf - Target Bayes Factor (e.g., 3 or 10)
 * @param {number} prior - Cauchy prior width (default 0.707)
 * @param {number} sigLevel - Not used directly, included for API consistency
 * @returns {number} Required n per group
 */
export function bayesianSampleSize({ d, bf, prior = 0.707, sigLevel = 0.05 }) {
  // Simplified JZS BF10 ≈ sqrt((n+1)/n) * exp(n*d²/(2*(n+1)))
  // adjusted for prior: scale by 1/sqrt(1 + n*prior²)
  const computeBF = (n) => {
    const bf10 = Math.sqrt((n + 1) / n) *
                 (1 / Math.sqrt(1 + n * prior * prior)) *
                 Math.exp(n * d * d / (2 * (1 + 1 / (n * prior * prior))));
    return bf10;
  };

  let lo = 2;
  let hi = 1e5;
  for (let i = 0; i < 100; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const currentBF = computeBF(mid);
    if (Math.abs(currentBF - bf) / bf < 0.01) return mid;
    if (currentBF < bf) lo = mid + 1;
    else hi = mid;
  }
  return Math.ceil(hi);
}

/**
 * Generate Bayes Factor curve across sample sizes.
 */
export function bayesianBFCurve({ d, prior = 0.707, nRange = [5, 300], steps = 40 }) {
  const data = [];
  const step = Math.max(1, Math.floor((nRange[1] - nRange[0]) / steps));
  for (let n = nRange[0]; n <= nRange[1]; n += step) {
    const bf10 = Math.sqrt((n + 1) / n) *
                 (1 / Math.sqrt(1 + n * prior * prior)) *
                 Math.exp(n * d * d / (2 * (1 + 1 / (n * prior * prior))));
    data.push({ n, bf10: Math.round(bf10 * 1000) / 1000 });
  }
  return data;
}

// ─── P-value Distribution ───────────────────────────────────────────────────

/**
 * Generate theoretical p-value density curves under H0 and H1.
 * @param {number} effectSize - Cohen's d under H1
 * @param {number} n - Sample size per group
 * @param {number} sigLevel - Alpha level
 * @param {number} nSim - Not used (theoretical curves), kept for API compat
 * @returns {{ h0, h1, powerArea }}
 */
export function pvalueDistribution({ effectSize, n, sigLevel, nSim = 1000 }) {
  const steps = 100;
  const h0 = [];
  const h1 = [];
  const df = 2 * n - 2;
  const ncp = effectSize * Math.sqrt(n / 2);

  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    // Under H0: p-values are uniform -> density = 1
    h0.push({ x: Math.round(p * 100) / 100, density: 1 });

    // Under H1: density of p-values from non-central t
    const dp = 0.005;
    const p1 = Math.max(0.001, p - dp);
    const p2 = Math.min(0.999, p + dp);
    const t1 = tQuantile(1 - p1 / 2, df);
    const t2 = tQuantile(1 - p2 / 2, df);
    const cdf1 = 1 - nctCdf(t1, df, ncp) + nctCdf(-t1, df, ncp);
    const cdf2 = 1 - nctCdf(t2, df, ncp) + nctCdf(-t2, df, ncp);
    const density = Math.max(0, (cdf1 - cdf2) / (p2 - p1));
    h1.push({ x: Math.round(p * 100) / 100, density: Math.round(density * 10000) / 10000 });
  }

  const power = tTestPower({ n, d: effectSize, sigLevel, type: 'two.sample' });
  return { h0, h1, powerArea: Math.round(power * 10000) / 10000 };
}

// ─── A/B Test Calculator ────────────────────────────────────────────────────

/**
 * Calculate sample size for A/B test.
 * @param {number} baseline - Baseline conversion rate (e.g., 0.05)
 * @param {number} mde - Minimum detectable effect as relative change (e.g., 0.1 for 10% lift)
 * @param {number} power - Desired power (0-1)
 * @param {number} sigLevel - Significance level
 * @param {number} ratio - n2/n1 allocation ratio (default 1)
 * @returns {{ n1, n2, totalN }}
 */
export function abTestSampleSize({ baseline, mde, power, sigLevel, ratio = 1 }) {
  const p1 = baseline;
  const p2 = baseline * (1 + mde);
  const n1 = pwrTwoProportions({ p1, p2, power, sigLevel, ratio });
  const n2 = Math.ceil(n1 * ratio);
  return { n1, n2, totalN: n1 + n2 };
}

/**
 * Calculate A/B test duration.
 * @param {number} baseline - Baseline conversion rate
 * @param {number} mde - Minimum detectable effect as relative change
 * @param {number} power - Desired power
 * @param {number} sigLevel - Significance level
 * @param {number} dailyVisitors - Daily unique visitors
 * @param {number} ratio - Allocation ratio (default 1)
 * @returns {{ n1, n2, totalN, days }}
 */
export function abTestDuration({ baseline, mde, power, sigLevel, dailyVisitors, ratio = 1 }) {
  const { n1, n2, totalN } = abTestSampleSize({ baseline, mde, power, sigLevel, ratio });
  const days = Math.ceil(totalN / dailyVisitors);
  return { n1, n2, totalN, days };
}

// ─── Survey Sample Size ─────────────────────────────────────────────────────

/**
 * Calculate survey sample size using Cochran's formula with FPC.
 * @param {number} population - Total population size (Infinity for infinite)
 * @param {number} marginOfError - Desired margin of error (e.g., 0.05 for +/-5%)
 * @param {number} confLevel - Confidence level (e.g., 0.95)
 * @param {number} proportion - Expected proportion (default 0.5 for max variability)
 * @returns {number} Required sample size
 */
export function surveySampleSize({ population = Infinity, marginOfError, confLevel, proportion = 0.5 }) {
  const z = normalQuantile(1 - (1 - confLevel) / 2);
  const p = proportion;
  const e = marginOfError;
  const n0 = (z * z * p * (1 - p)) / (e * e);

  if (!isFinite(population)) return Math.ceil(n0);
  // Finite population correction
  const n = n0 / (1 + (n0 - 1) / population);
  return Math.ceil(n);
}

/**
 * Generate margin of error curve across sample sizes.
 */
export function surveyMoECurve({ population = Infinity, confLevel, proportion = 0.5, nRange = [10, 1000], steps = 50 }) {
  const data = [];
  const z = normalQuantile(1 - (1 - confLevel) / 2);
  const p = proportion;
  const step = Math.max(1, Math.floor((nRange[1] - nRange[0]) / steps));

  for (let n = nRange[0]; n <= nRange[1]; n += step) {
    let moe = z * Math.sqrt(p * (1 - p) / n);
    if (isFinite(population) && n < population) {
      moe *= Math.sqrt((population - n) / (population - 1));
    }
    data.push({ n, marginOfError: Math.round(moe * 10000) / 10000 });
  }
  return data;
}

// ─── Reliability (Cronbach's Alpha) Power ───────────────────────────────────

/**
 * Calculate sample size for testing Cronbach's alpha.
 * @param {number} alpha0 - Null hypothesis alpha
 * @param {number} alpha1 - Expected (alternative) alpha
 * @param {number} k - Number of items
 * @param {number} power - Desired power (0-1)
 * @param {number} sigLevel - Significance level
 * @returns {number} Required n
 */
export function reliabilitySampleSize({ alpha0, alpha1, k, power, sigLevel }) {
  let lo = 3;
  let hi = 1e5;
  for (let i = 0; i < 100; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const p = reliabilityPower({ n: mid, alpha0, alpha1, k, sigLevel });
    if (Math.abs(p - power) < 1e-6) return mid;
    if (p < power) lo = mid + 1;
    else hi = mid;
  }
  return Math.ceil(hi);
}

/**
 * Calculate power for Cronbach's alpha test using F-distribution approach.
 */
export function reliabilityPower({ n, alpha0, alpha1, k, sigLevel }) {
  if (n < 3) return 0;
  const df1 = n - 1;
  const df2 = (n - 1) * (k - 1);
  // Test statistic ratio: (1-alpha0)/(1-alpha1)
  const fRatio = (1 - alpha0) / (1 - alpha1);
  const fCritVal = fQuantile(1 - sigLevel, df1, df2);
  // Non-centrality parameter
  const lambda = df1 * (fRatio - 1);
  if (lambda <= 0) return sigLevel; // No power gain

  // Patnaik approximation for non-central F
  const df1p = (df1 + lambda) * (df1 + lambda) / (df1 + 2 * lambda);
  const adjustedCrit = fCritVal * df1 / (df1 + lambda);
  const bArg = df1p * adjustedCrit / (df1p * adjustedCrit + df2);
  const cdfVal = jStat.ibeta(bArg, df1p / 2, df2 / 2);
  return Math.min(1, Math.max(0, 1 - cdfVal));
}

/**
 * Generate reliability power curve data.
 */
export function reliabilityPowerCurve({ alpha0, alpha1, k, sigLevel, nRange = [10, 300], steps = 40 }) {
  const data = [];
  const step = Math.max(1, Math.floor((nRange[1] - nRange[0]) / steps));
  for (let n = nRange[0]; n <= nRange[1]; n += step) {
    const power = reliabilityPower({ n, alpha0, alpha1, k, sigLevel });
    data.push({ n, power: Math.round(power * 10000) / 10000 });
  }
  return data;
}
