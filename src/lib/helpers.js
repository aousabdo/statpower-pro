/**
 * Get human-readable effect size label based on Cohen's conventions.
 * @param {number} value - The effect size value
 * @param {'d'|'f'|'w'} type - The type of effect size
 * @returns {string} "small", "medium", "large", or "small-to-medium" etc.
 */
export function getEffectLabel(value, type) {
  const thresholds = {
    d: { small: 0.2, medium: 0.5, large: 0.8 },
    f: { small: 0.1, medium: 0.25, large: 0.4 },
    w: { small: 0.1, medium: 0.3, large: 0.5 },
  };

  const t = thresholds[type];
  if (!t) return '';

  if (value <= t.small) return 'small';
  if (value < (t.small + t.medium) / 2) return 'small';
  if (value < t.medium) return 'small-to-medium';
  if (Math.abs(value - t.medium) < 0.001) return 'medium';
  if (value < t.large) return 'medium-to-large';
  if (Math.abs(value - t.large) < 0.001) return 'large';
  return 'large';
}

/**
 * Generate validation warnings based on current parameters.
 */
export function getValidationWarnings({ power, effectSize, effectType, sampleSize, sigLevel }) {
  const warnings = [];

  if (power !== undefined && power < 0.7) {
    warnings.push('Power below 70% is generally considered inadequate for research.');
  }

  if (effectSize !== undefined && effectType) {
    const verySmall = { d: 0.2, f: 0.1, w: 0.1 };
    if (effectSize < (verySmall[effectType] || 0.2)) {
      warnings.push('Very small effect sizes require very large samples and may not be practically meaningful.');
    }
  }

  if (sampleSize !== undefined && sampleSize > 1000) {
    warnings.push('Consider whether this sample size is feasible for your study design.');
  }

  if (sigLevel !== undefined && sigLevel > 0.05) {
    warnings.push('Using \u03b1 > 0.05 increases the risk of false positives.');
  }

  return warnings;
}

/**
 * Effect size presets for Cohen's conventions.
 */
export const PRESETS_D = [
  { label: 'Small', value: 0.2 },
  { label: 'Medium', value: 0.5 },
  { label: 'Large', value: 0.8 },
];

export const PRESETS_F = [
  { label: 'Small', value: 0.1 },
  { label: 'Medium', value: 0.25 },
  { label: 'Large', value: 0.4 },
];

export const PRESETS_W = [
  { label: 'Small', value: 0.1 },
  { label: 'Medium', value: 0.3 },
  { label: 'Large', value: 0.5 },
];
