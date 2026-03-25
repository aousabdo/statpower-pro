import {
  Calculator, Users, Link2, TrendingUp, Grid3x3, SquareAsterisk, Percent, Equal, Shield,
  FlaskConical, ClipboardList, Table2, Target, ArrowRightLeft, Sparkles,
  AlertTriangle, Ruler, ArrowLeftRight, ScatterChart, BrainCircuit, BarChart3, BookOpen,
  Download, Copy,
} from 'lucide-react';

const toolSections = [
  {
    label: 'Power Analysis',
    tools: [
      { icon: <Calculator size={18} />, title: 'T-Test', desc: 'Calculate the required sample size for two-sample, one-sample, or paired t-tests. Specify Cohen\'s d, power (1 - \u03b2), and significance level (\u03b1).' },
      { icon: <Users size={18} />, title: 'Paired T-Test', desc: 'Sample size for within-subjects and matched-pair designs. Accounts for the correlation between paired observations, which reduces the effective variability and often requires fewer participants than independent designs.' },
      { icon: <Link2 size={18} />, title: 'Correlation', desc: 'Determine the sample size needed to detect a significant Pearson correlation coefficient. Uses the Fisher z-transformation for accurate power estimation.' },
      { icon: <TrendingUp size={18} />, title: 'Regression', desc: 'Power analysis for multiple regression models. Specify R\u00b2 and the number of predictors to compute the required total sample size using Cohen\'s f\u00b2.' },
      { icon: <Grid3x3 size={18} />, title: 'ANOVA', desc: 'Sample size per group for one-way ANOVA designs. Specify the number of groups and Cohen\'s f effect size to plan multi-group experiments.' },
      { icon: <SquareAsterisk size={18} />, title: 'Chi-Square', desc: 'Sample size for chi-square tests of association or goodness-of-fit. Uses Cohen\'s w effect size and the degrees of freedom of your contingency table.' },
      { icon: <Percent size={18} />, title: 'Two Proportions', desc: 'Compare two proportions (e.g., conversion rates). Supports unequal allocation ratios between groups, ideal for A/B testing and clinical trial planning.' },
      { icon: <Equal size={18} />, title: 'Equivalence (TOST)', desc: 'Two One-Sided Tests for equivalence and non-inferiority studies. Specify the equivalence margin, true difference, and standard deviation to determine how many subjects are needed to demonstrate equivalence.' },
      { icon: <Shield size={18} />, title: 'Reliability', desc: 'Sample size for testing Cronbach\'s alpha. Specify your null and expected alpha values and number of scale items to plan psychometric reliability studies.' },
    ],
  },
  {
    label: 'Applied Tools',
    tools: [
      { icon: <FlaskConical size={18} />, title: 'A/B Test Calculator', desc: 'Purpose-built for product and marketing teams. Enter your baseline conversion rate, minimum detectable effect (as relative lift), daily visitors, and get sample size per variant plus estimated experiment duration in days.' },
      { icon: <ClipboardList size={18} />, title: 'Survey Sample Size', desc: 'The most-searched sample size question answered: how many survey responses do you need? Specify population size, margin of error, confidence level, and expected response distribution. Supports finite population correction.' },
      { icon: <Table2 size={18} />, title: 'Sample Size Tables', desc: 'Generate publication-ready tables showing required sample sizes across a range of effect sizes and power levels. Supports T-Test, ANOVA, Chi-Square, Correlation, and Regression. Perfect for grant proposals and methodology sections.' },
      { icon: <Target size={18} />, title: 'Min. Detectable Effect', desc: 'The inverse question: given a fixed sample size, what is the smallest effect your study can detect? Useful when budget or recruitment constraints determine your N.' },
    ],
  },
  {
    label: 'Effect Size Tools',
    tools: [
      { icon: <ArrowRightLeft size={18} />, title: 'Effect Size Converter', desc: 'Convert between seven effect size metrics: Cohen\'s d, Pearson r, \u03b7\u00b2 (eta-squared), Cohen\'s f, f\u00b2, odds ratio, and Cohen\'s w. Enter any one value and instantly see all equivalents.' },
      { icon: <Sparkles size={18} />, title: 'Effect Size Interpreter', desc: 'Go beyond "small/medium/large" labels. See benchmark values, distribution overlap percentage, and a visual showing how much two groups overlap for your specific effect size.' },
    ],
  },
  {
    label: 'Visualization & Education',
    tools: [
      { icon: <AlertTriangle size={18} />, title: 'Error Simulator', desc: 'Interactive visualization of Type I (false positive) and Type II (false negative) errors. See the null and alternative distributions, the critical value, and how changing parameters shifts the error regions.' },
      { icon: <Ruler size={18} />, title: 'CI Width Explorer', desc: 'Explore the relationship between sample size and confidence interval width. Understand diminishing returns: doubling your sample doesn\'t halve your CI.' },
      { icon: <ArrowLeftRight size={18} />, title: 'One-Sided vs. Two-Sided', desc: 'Compare sample sizes for directional versus non-directional tests. See the power trade-off of committing to a direction before collecting data.' },
      { icon: <ScatterChart size={18} />, title: 'P-Value Distributions', desc: 'Visualize how p-values behave under the null hypothesis (uniform) versus the alternative (skewed toward zero). Understand why "just significant" results are often unreliable at low power.' },
    ],
  },
  {
    label: 'Bayesian',
    tools: [
      { icon: <BrainCircuit size={18} />, title: 'Bayesian Sample Size', desc: 'Plan sample sizes using Bayes Factors instead of p-values. Specify your expected effect size, target BF\u2081\u2080, and prior scale (Cauchy prior width). Uses the JZS Bayes Factor approximation.' },
    ],
  },
  {
    label: 'Reference',
    tools: [
      { icon: <BarChart3 size={18} />, title: 'Test Comparison', desc: 'Compare sample size requirements across different t-test designs (two-sample, one-sample, paired) side by side. Useful for deciding between designs during study planning.' },
    ],
  },
];

const concepts = [
  { term: 'Effect Size', definition: 'A standardized measure of the magnitude of a difference or relationship. Larger effects require smaller samples to detect.' },
  { term: 'Statistical Power (1 - \u03b2)', definition: 'The probability of detecting a true effect. Convention: 0.80 (80%). Higher power requires larger samples.' },
  { term: 'Significance Level (\u03b1)', definition: 'The false positive rate threshold. Typically 0.05 (5%). Lowering \u03b1 increases the required sample size.' },
  { term: 'Type I Error (\u03b1)', definition: 'False positive: concluding an effect exists when it does not. Controlled directly by the significance level.' },
  { term: 'Type II Error (\u03b2)', definition: 'False negative: missing a real effect. Related to power as \u03b2 = 1 - power.' },
  { term: "Cohen's d", definition: 'Effect size for comparing two means. Benchmarks: Small = 0.2, Medium = 0.5, Large = 0.8.' },
  { term: "Cohen's f", definition: 'Effect size for ANOVA (multiple group comparisons). Benchmarks: Small = 0.1, Medium = 0.25, Large = 0.4.' },
  { term: "Cohen's w", definition: 'Effect size for chi-square tests. Benchmarks: Small = 0.1, Medium = 0.3, Large = 0.5.' },
  { term: 'Pearson r', definition: 'Correlation coefficient, also an effect size. Benchmarks: Small = 0.1, Medium = 0.3, Large = 0.5.' },
  { term: 'R\u00b2 / f\u00b2', definition: 'Variance explained in regression. f\u00b2 = R\u00b2/(1-R\u00b2). Benchmarks for f\u00b2: Small = 0.02, Medium = 0.15, Large = 0.35.' },
  { term: '\u03b7\u00b2 (Eta-squared)', definition: 'Proportion of variance explained. Benchmarks: Small = 0.01, Medium = 0.06, Large = 0.14.' },
  { term: 'Bayes Factor (BF\u2081\u2080)', definition: 'Ratio of evidence for H\u2081 vs H\u2080. BF > 3: moderate evidence, > 10: strong, > 30: very strong.' },
  { term: 'Equivalence Margin', definition: 'The largest difference you would still consider "equivalent." Used in TOST studies to demonstrate non-inferiority.' },
  { term: 'Minimum Detectable Effect (MDE)', definition: 'The smallest effect size a study can detect at a given power and sample size. Critical for feasibility assessment.' },
];

const tips = [
  'All calculations run entirely in your browser. No data is sent to any server.',
  'Every chart can be exported as a branded PDF or copied to your clipboard using the buttons above each chart.',
  'The Sample Size Table generator is perfect for grant applications and methodology sections.',
  'Use the Effect Size Converter when reviewing literature that reports different metrics than your planned analysis.',
  'The A/B Test calculator gives you experiment duration in days \u2014 share it directly with your product team.',
  'When unsure about your expected effect size, run the Min. Detectable Effect tool in reverse to see what your available sample can detect.',
  'The P-Value Distribution simulator is a powerful teaching tool \u2014 it shows why underpowered studies produce misleading p-values.',
];

export default function Guide() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">User Guide</h1>
        <p className="page-subtitle">Complete reference for all 22 tools and the statistical concepts behind them</p>
      </div>
      <div className="page-body" style={{ maxWidth: 840 }}>

        {/* Overview */}
        <div className="card" style={{ marginBottom: 32 }}>
          <div className="card-body" style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <p>
              <strong style={{ color: 'var(--text-primary)' }}>StatPower Pro</strong> is a comprehensive statistical power analysis and study design toolkit with <strong>22 tools</strong> covering
              power analysis, sample size planning, effect size interpretation, and statistical education. Everything runs in your browser with no backend required.
            </p>
          </div>
        </div>

        {/* Tool sections */}
        {toolSections.map((section, si) => (
          <div key={si} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-tertiary)', marginBottom: 12 }}>{section.label}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {section.tools.map((tool, ti) => (
                <div key={ti} className="card" style={{ overflow: 'visible' }}>
                  <div className="card-body" style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px 20px' }}>
                    <div style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>{tool.icon}</div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 3, color: 'var(--text-primary)' }}>{tool.title}</h3>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{tool.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Export features */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-tertiary)', marginBottom: 12 }}>Export & Sharing</h2>
          <div className="card">
            <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Download size={16} style={{ color: 'var(--accent)' }} />
                  <strong style={{ color: 'var(--text-primary)' }}>Export PDF</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Copy size={16} style={{ color: 'var(--accent)' }} />
                  <strong style={{ color: 'var(--text-primary)' }}>Copy to Clipboard</strong>
                </div>
              </div>
              <p>Every results panel can be exported as a branded PDF with the Analytica DSS logo, or copied directly to your clipboard as an image. Exports include the chart, summary statistics, and a timestamp.</p>
            </div>
          </div>
        </div>

        {/* Key Concepts */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-tertiary)', marginBottom: 12 }}>Key Statistical Concepts</h2>
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '22%' }}>Term</th>
                    <th>Definition</th>
                  </tr>
                </thead>
                <tbody>
                  {concepts.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 550, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{c.term}</td>
                      <td>{c.definition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-tertiary)', marginBottom: 12 }}>Tips</h2>
          <div className="card">
            <div className="card-body">
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tips.map((tip, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 20, position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, color: 'var(--accent)', fontWeight: 600 }}>{i + 1}.</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>About StatPower Pro</h3>
            <p style={{ marginBottom: 12 }}>
              StatPower Pro is built for researchers, students, data scientists, and product teams who need reliable statistical power analysis without installing software.
              All computations run in JavaScript using established formulas from R's <code style={{ fontSize: 12, padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>pwr</code> package
              and the <code style={{ fontSize: 12, padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>jStat</code> library for distribution functions.
            </p>
            <p>
              Built by <strong>Analytica Data Science Solutions</strong> — <a href="https://analyticadss.com" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'none' }}>analyticadss.com</a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
