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
