import {
  Calculator,
  BarChart3,
  AlertTriangle,
  Ruler,
  ArrowLeftRight,
  Grid3x3,
  SquareAsterisk,
  Link2,
  TrendingUp,
  Percent,
  Equal,
  Table2,
  Target,
  ArrowRightLeft,
  Sparkles,
  BrainCircuit,
  ScatterChart,
  FlaskConical,
  ClipboardList,
  Shield,
  Users,
  HelpCircle,
  Lightbulb,
  Microscope,
  Beaker,
  Globe,
  GraduationCap,
  LayoutGrid,
  FileText,
  CheckCircle2,
  Smartphone,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: Globe,
    title: 'No Installation Required',
    desc: 'Runs entirely in your browser. No software to download, no Java, no admin rights needed. Works on any device.',
  },
  {
    icon: GraduationCap,
    title: 'Free for Academic Use',
    desc: 'Built for researchers, students, and educators. No account required, no usage limits, no paywalls.',
  },
  {
    icon: LayoutGrid,
    title: '22 Statistical Tools',
    desc: 'From basic t-tests to Bayesian sample size planning, equivalence testing, and effect size interpretation.',
  },
  {
    icon: FileText,
    title: 'Publication-Ready Exports',
    desc: 'Generate APA-formatted methods paragraphs and branded PDF reports ready for your manuscript.',
  },
  {
    icon: CheckCircle2,
    title: 'Validated Against G*Power',
    desc: 'Results verified against G*Power 3.1 for all standard test configurations. See our validation page.',
  },
  {
    icon: Smartphone,
    title: 'Modern & Accessible',
    desc: 'Dark mode, mobile-friendly, keyboard shortcuts, and shareable links. Statistics shouldn\u2019t feel dated.',
  },
];

const SECTIONS = [
  {
    title: 'Most Popular',
    tools: [
      { id: 'calculator', label: 'T-Test', desc: 'Two-sample, one-sample, or paired t-test power', icon: Calculator },
      { id: 'anova', label: 'ANOVA', desc: 'Compare means across multiple groups', icon: Grid3x3 },
      { id: 'correlation', label: 'Correlation', desc: 'Sample size for detecting correlations', icon: Link2 },
      { id: 'chisq', label: 'Chi-Square', desc: 'Categorical data and contingency tables', icon: SquareAsterisk },
      { id: 'table', label: 'Sample Size Tables', desc: 'Quick-reference tables for common designs', icon: Table2 },
    ],
  },
  {
    title: 'For Product Teams',
    tools: [
      { id: 'abtest', label: 'A/B Test', desc: 'Plan experiments with traffic and duration', icon: FlaskConical },
      { id: 'survey', label: 'Survey Sample Size', desc: 'Respondents needed for margin of error', icon: ClipboardList },
      { id: 'twoprop', label: 'Two Proportions', desc: 'Compare conversion rates between groups', icon: Percent },
      { id: 'mde', label: 'Min. Detectable Effect', desc: 'Smallest effect detectable with your sample', icon: Target },
    ],
  },
  {
    title: 'For Researchers',
    tools: [
      { id: 'regression', label: 'Regression', desc: 'Multiple regression power analysis', icon: TrendingUp },
      { id: 'equivalence', label: 'Equivalence (TOST)', desc: 'Show treatments are equivalent', icon: Equal },
      { id: 'paired', label: 'Paired T-Test', desc: 'Within-subjects and pre-post designs', icon: Users },
      { id: 'reliability', label: 'Reliability', desc: "Cronbach's alpha comparison", icon: Shield },
      { id: 'bayesian', label: 'Bayesian Sample Size', desc: 'Bayes Factor-based planning', icon: BrainCircuit },
    ],
  },
  {
    title: 'Explore & Learn',
    tools: [
      { id: 'converter', label: 'Effect Size Converter', desc: "Convert between d, r, f, and Cohen's w", icon: ArrowRightLeft },
      { id: 'interpreter', label: 'Effect Size Interpreter', desc: 'Visualize what an effect size means', icon: Sparkles },
      { id: 'errors', label: 'Error Simulator', desc: 'See Type I and Type II errors in action', icon: AlertTriangle },
      { id: 'pvalue', label: 'P-Value Distributions', desc: 'How p-values behave under H0 and H1', icon: ScatterChart },
      { id: 'ci', label: 'CI Width Explorer', desc: 'Confidence interval width vs sample size', icon: Ruler },
      { id: 'onesided', label: 'One vs. Two-Sided', desc: 'Compare directional test strategies', icon: ArrowLeftRight },
      { id: 'comparison', label: 'Test Comparison', desc: 'Side-by-side test type comparison', icon: BarChart3 },
    ],
  },
];

export default function Home({ onNavigate }) {
  return (
    <div>
      {/* Hero section */}
      <div style={{
        textAlign: 'center',
        padding: '48px 40px 40px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 8 }}>
          Analytica DSS
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: -0.8, color: 'var(--text-primary)', marginBottom: 8 }}>
          StatPower Pro
        </h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto' }}>
          A comprehensive statistical power analysis toolkit with 22 tools for researchers, data scientists, and product teams.
        </p>
      </div>

      {/* Wizard callout */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 24px 0' }}>
        <div
          className="card"
          style={{ cursor: 'pointer', transition: 'all 0.15s ease', borderColor: 'var(--accent)', borderWidth: 2 }}
          onClick={() => onNavigate && onNavigate('wizard')}
          onMouseOver={e => { e.currentTarget.style.background = 'var(--accent-subtle)'; }}
          onMouseOut={e => { e.currentTarget.style.background = ''; }}
        >
          <div className="card-body" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ color: 'var(--accent)', flexShrink: 0 }}>
              <HelpCircle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 2, color: 'var(--text-primary)' }}>
                Not sure which test? Try our Test Selection Wizard
              </h3>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: 0 }}>
                Answer 5 quick questions and get a personalized recommendation
              </p>
            </div>
            <div style={{ color: 'var(--text-tertiary)', flexShrink: 0 }}>&rarr;</div>
          </div>
        </div>
      </div>

      {/* Tool sections */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 24px 40px' }}>
        {SECTIONS.map((section) => (
          <div key={section.title} style={{ marginTop: 28 }}>
            <h2 style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: 'var(--text-tertiary)',
              marginBottom: 12,
              paddingLeft: 4,
            }}>
              {section.title}
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 12,
            }}>
              {section.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    className="card"
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                    onClick={() => onNavigate && onNavigate(tool.id)}
                    onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div className="card-body" style={{ padding: '20px', textAlign: 'center' }}>
                      <div style={{ color: 'var(--accent)', marginBottom: 8 }}>
                        <Icon size={24} />
                      </div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{tool.label}</h3>
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0 }}>{tool.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Why StatPower Pro? */}
      <div style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '8px 24px 40px',
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: 24,
          letterSpacing: -0.3,
        }}>
          Why StatPower Pro?
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 16,
        }}>
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="card"
                style={{ transition: 'all 0.15s ease' }}
              >
                <div className="card-body" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{
                      color: 'var(--accent)',
                      flexShrink: 0,
                      marginTop: 2,
                    }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>
                        {benefit.title}
                      </h3>
                      <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                        {benefit.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trusted by */}
        <div style={{
          textAlign: 'center',
          marginTop: 32,
          fontSize: 13,
          color: 'var(--text-tertiary)',
          fontStyle: 'italic',
        }}>
          Used by researchers and students worldwide
        </div>
      </div>

      {/* Footer */}
      <div style={{
        textAlign: 'center',
        padding: '24px 20px 32px',
        borderTop: '1px solid var(--border-light)',
        fontSize: 12,
        color: 'var(--text-tertiary)',
        lineHeight: 1.6,
      }}>
        22 tools &bull; All calculations run in your browser &bull; No data sent to any server &bull; Built by Analytica DSS
      </div>
    </div>
  );
}
