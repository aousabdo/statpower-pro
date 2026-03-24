import { BookOpen, Calculator, BarChart3, AlertTriangle, Ruler, ArrowLeftRight, Grid3x3, SquareAsterisk } from 'lucide-react';

const sections = [
  {
    icon: <Calculator size={20} />,
    title: 'T-Test Calculator',
    content: 'Calculate the required sample size for two-sample, one-sample, or paired t-tests. Specify your desired effect size (Cohen\'s d), statistical power, and significance level to determine how many participants you need.',
  },
  {
    icon: <BarChart3 size={20} />,
    title: 'Test Comparison',
    content: 'Compare sample size requirements across different t-test designs side by side. Useful for deciding between paired and independent designs during study planning.',
  },
  {
    icon: <AlertTriangle size={20} />,
    title: 'Error Simulator',
    content: 'Interactively visualize Type I (false positive) and Type II (false negative) errors. See how changing sample size and effect size affects the overlap between null and alternative distributions.',
  },
  {
    icon: <Ruler size={20} />,
    title: 'CI Width Explorer',
    content: 'Explore the relationship between sample size and confidence interval width. Understand the diminishing returns of adding more participants to improve precision.',
  },
  {
    icon: <ArrowLeftRight size={20} />,
    title: 'One-Sided vs. Two-Sided',
    content: 'Compare sample sizes needed for directional versus non-directional hypothesis tests. Understand the trade-off between reduced sample size and the constraint of a directional hypothesis.',
  },
  {
    icon: <Grid3x3 size={20} />,
    title: 'ANOVA Calculator',
    content: 'Determine sample size per group for one-way ANOVA designs. Specify the number of groups, effect size (Cohen\'s f), and desired power to plan multi-group experiments.',
  },
  {
    icon: <SquareAsterisk size={20} />,
    title: 'Chi-Square Calculator',
    content: 'Calculate sample size for chi-square tests of association. Provide degrees of freedom and effect size (Cohen\'s w) to determine total observations needed.',
  },
];

const concepts = [
  { term: 'Effect Size', definition: 'A standardized measure of the magnitude of the difference or relationship you expect to find. Larger effect sizes require smaller samples.' },
  { term: 'Statistical Power', definition: 'The probability that your study will detect a true effect when one exists. Convention is 0.80 (80%), meaning a 20% chance of a Type II error.' },
  { term: 'Significance Level (α)', definition: 'The threshold for rejecting the null hypothesis. Typically set at 0.05, meaning a 5% chance of a false positive.' },
  { term: 'Type I Error', definition: 'A false positive: concluding there is an effect when there isn\'t one. Controlled by α.' },
  { term: 'Type II Error', definition: 'A false negative: failing to detect an effect that truly exists. Related to power (β = 1 - power).' },
  { term: "Cohen's d", definition: 'Effect size for t-tests. Small = 0.2, Medium = 0.5, Large = 0.8.' },
  { term: "Cohen's f", definition: 'Effect size for ANOVA. Small = 0.1, Medium = 0.25, Large = 0.4.' },
  { term: "Cohen's w", definition: 'Effect size for chi-square tests. Small = 0.1, Medium = 0.3, Large = 0.5.' },
];

export default function Guide() {
  return (
    <>
      <div className="page-header">
        <h1 className="page-title">User Guide</h1>
        <p className="page-subtitle">Learn how to use each tool and understand the underlying statistical concepts</p>
      </div>
      <div className="page-body" style={{ maxWidth: 800 }}>
        {/* Tools */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, letterSpacing: -0.3 }}>Tools</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sections.map((s, i) => (
              <div key={i} className="card" style={{ overflow: 'visible' }}>
                <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }}>{s.icon}</div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{s.title}</h3>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{s.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Concepts */}
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, letterSpacing: -0.3 }}>Key Statistical Concepts</h2>
          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '25%' }}>Term</th>
                    <th>Definition</th>
                  </tr>
                </thead>
                <tbody>
                  {concepts.map((c, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 550, color: 'var(--text-primary)' }}>{c.term}</td>
                      <td>{c.definition}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <div className="card-body" style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>About StatPower Pro</h3>
            <p style={{ marginBottom: 12 }}>
              StatPower Pro is a modern statistical power analysis toolkit built for researchers, students, and data scientists.
              All computations run entirely in your browser with no data sent to any server.
            </p>
            <p style={{ marginBottom: 12 }}>
              The underlying statistical algorithms are JavaScript implementations of the well-established formulas
              used by R's <code style={{ fontSize: 12, padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: 4 }}>pwr</code> package.
            </p>
            <p>
              Built by <strong>Analytica Data Science Solutions</strong>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
