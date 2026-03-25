import { useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles, ArrowRight } from 'lucide-react';

const QUESTIONS = [
  {
    title: 'What type of outcome are you measuring?',
    options: [
      { value: 'continuous', label: 'Continuous (means)', desc: 'Heights, scores, reaction times, revenue' },
      { value: 'binary', label: 'Binary (proportions/rates)', desc: 'Conversion rates, yes/no, pass/fail' },
      { value: 'categorical', label: 'Categorical (counts/frequencies)', desc: 'Survey categories, contingency tables' },
      { value: 'correlation', label: 'Correlation (relationship strength)', desc: 'Association between two continuous variables' },
      { value: 'reliability', label: 'Reliability (scale consistency)', desc: "Cronbach's alpha, measurement reliability" },
    ],
  },
  {
    title: 'How many groups are you comparing?',
    options: [
      { value: 'one', label: 'One group vs known value', desc: 'Compare a sample mean to a fixed reference' },
      { value: 'two', label: 'Two groups', desc: 'Treatment vs control, A vs B' },
      { value: 'three_plus', label: 'Three or more groups', desc: 'Multiple treatments or conditions' },
      { value: 'none', label: 'Not comparing groups', desc: 'Correlation, regression, or single-sample analysis' },
    ],
  },
  {
    title: 'What is your study design?',
    options: [
      { value: 'independent', label: 'Independent groups (between-subjects)', desc: 'Different participants in each group' },
      { value: 'paired', label: 'Paired/matched (within-subjects)', desc: 'Same participants measured in both conditions' },
      { value: 'prepost', label: 'Pre-post measurement', desc: 'Before and after intervention on the same subjects' },
      { value: 'equivalence', label: 'Equivalence/non-inferiority', desc: 'Show treatments are similar, not different' },
    ],
  },
  {
    title: 'What is your primary goal?',
    options: [
      { value: 'difference', label: 'Detect a difference', desc: 'Find the sample size to detect a meaningful effect' },
      { value: 'sample_size', label: 'Estimate sample size for a specific power', desc: 'Plan a study with a target power level' },
      { value: 'mde', label: 'Find the minimum detectable effect', desc: 'Given a fixed sample, what can you detect?' },
      { value: 'abtest', label: 'Plan an A/B test / experiment', desc: 'Product experiments with conversion metrics' },
      { value: 'survey', label: 'Plan a survey', desc: 'Determine how many respondents you need' },
    ],
  },
  {
    title: 'What analysis framework?',
    options: [
      { value: 'frequentist', label: 'Frequentist (p-values)', desc: 'Traditional hypothesis testing with significance levels' },
      { value: 'bayesian', label: 'Bayesian (Bayes Factors)', desc: 'Evidence-based reasoning with prior distributions' },
      { value: 'unsure', label: 'Not sure (default to frequentist)', desc: 'Most common approach in published research' },
    ],
  },
];

function getRecommendation(answers) {
  const [outcome, groups, design, goal, framework] = answers;

  // Bayesian override
  if (framework === 'bayesian') {
    return {
      test: 'Bayesian Sample Size',
      toolId: 'bayesian',
      why: 'You selected Bayesian analysis. This calculator uses Bayes Factors instead of p-values to determine sample size requirements.',
      alternatives: [
        { label: 'T-Test (frequentist)', toolId: 'calculator' },
      ],
    };
  }

  // Survey
  if (goal === 'survey') {
    return {
      test: 'Survey Sample Size',
      toolId: 'survey',
      why: 'For planning surveys, this tool calculates the number of respondents needed based on your desired margin of error and confidence level.',
      alternatives: [
        { label: 'Sample Size Tables', toolId: 'table' },
      ],
    };
  }

  // MDE
  if (goal === 'mde') {
    return {
      test: 'Minimum Detectable Effect',
      toolId: 'mde',
      why: 'Given a fixed sample size and power, this tool finds the smallest effect you can reliably detect.',
      alternatives: [
        { label: 'Effect Size Interpreter', toolId: 'interpreter' },
      ],
    };
  }

  // A/B test
  if (goal === 'abtest' || (outcome === 'binary' && goal === 'abtest')) {
    return {
      test: 'A/B Test Calculator',
      toolId: 'abtest',
      why: 'Designed for product experiments with conversion rates. Includes duration estimation based on daily traffic.',
      alternatives: [
        { label: 'Two Proportions', toolId: 'twoprop' },
        { label: 'Min. Detectable Effect', toolId: 'mde' },
      ],
    };
  }

  // Reliability
  if (outcome === 'reliability') {
    return {
      test: 'Reliability Power Analysis',
      toolId: 'reliability',
      why: "For studies comparing Cronbach's alpha values to evaluate measurement scale consistency.",
      alternatives: [
        { label: 'Correlation', toolId: 'correlation' },
      ],
    };
  }

  // Correlation
  if (outcome === 'correlation') {
    return {
      test: 'Correlation Power Analysis',
      toolId: 'correlation',
      why: 'Calculates the sample size needed to detect a correlation of a given magnitude between two continuous variables.',
      alternatives: [
        { label: 'Regression', toolId: 'regression' },
      ],
    };
  }

  // Categorical
  if (outcome === 'categorical') {
    return {
      test: 'Chi-Square Power Analysis',
      toolId: 'chisq',
      why: 'Chi-square tests are the standard for analyzing categorical outcomes and contingency tables.',
      alternatives: [
        { label: 'Two Proportions', toolId: 'twoprop' },
      ],
    };
  }

  // Binary + two groups
  if (outcome === 'binary' && groups === 'two') {
    return {
      test: 'Two Proportions Power Analysis',
      toolId: 'twoprop',
      why: 'Compares two proportions (e.g., conversion rates between groups). Ideal for binary outcomes with two independent groups.',
      alternatives: [
        { label: 'A/B Test Calculator', toolId: 'abtest' },
        { label: 'Chi-Square', toolId: 'chisq' },
      ],
    };
  }

  // Binary fallback
  if (outcome === 'binary') {
    return {
      test: 'Two Proportions Power Analysis',
      toolId: 'twoprop',
      why: 'For binary outcomes, proportion-based tests are most appropriate.',
      alternatives: [
        { label: 'Chi-Square', toolId: 'chisq' },
        { label: 'A/B Test Calculator', toolId: 'abtest' },
      ],
    };
  }

  // Continuous + equivalence
  if (outcome === 'continuous' && design === 'equivalence') {
    return {
      test: 'Equivalence (TOST) Power Analysis',
      toolId: 'equivalence',
      why: 'The Two One-Sided Tests procedure is designed to demonstrate that two treatments are equivalent within a specified margin.',
      alternatives: [
        { label: 'T-Test', toolId: 'calculator' },
        { label: 'Paired T-Test', toolId: 'paired' },
      ],
    };
  }

  // Continuous + three+ groups
  if (outcome === 'continuous' && groups === 'three_plus') {
    return {
      test: 'ANOVA Power Analysis',
      toolId: 'anova',
      why: 'ANOVA is the standard approach for comparing means across three or more independent groups.',
      alternatives: [
        { label: 'Regression', toolId: 'regression' },
        { label: 'Test Comparison', toolId: 'comparison' },
      ],
    };
  }

  // Continuous + paired/prepost
  if (outcome === 'continuous' && (design === 'paired' || design === 'prepost')) {
    return {
      test: 'Paired T-Test Power Analysis',
      toolId: 'paired',
      why: 'Paired tests account for the correlation between repeated measurements on the same subjects, typically requiring fewer participants.',
      alternatives: [
        { label: 'T-Test (independent)', toolId: 'calculator' },
        { label: 'Equivalence (TOST)', toolId: 'equivalence' },
      ],
    };
  }

  // Continuous + two groups + independent (default)
  if (outcome === 'continuous' && groups === 'two') {
    return {
      test: 'T-Test Power Analysis',
      toolId: 'calculator',
      why: 'The independent two-sample t-test is the most common approach for comparing means between two groups.',
      alternatives: [
        { label: 'Paired T-Test', toolId: 'paired' },
        { label: 'Test Comparison', toolId: 'comparison' },
      ],
    };
  }

  // Continuous + none groups → regression
  if (outcome === 'continuous' && groups === 'none') {
    return {
      test: 'Regression Power Analysis',
      toolId: 'regression',
      why: 'When not comparing groups and working with continuous outcomes, regression analysis is often the right approach for modeling relationships.',
      alternatives: [
        { label: 'Correlation', toolId: 'correlation' },
        { label: 'T-Test', toolId: 'calculator' },
      ],
    };
  }

  // Fallback
  return {
    test: 'T-Test Power Analysis',
    toolId: 'calculator',
    why: 'The t-test is a versatile starting point for power analysis. Based on your answers, this is a reasonable default.',
    alternatives: [
      { label: 'Test Comparison', toolId: 'comparison' },
      { label: 'Sample Size Tables', toolId: 'table' },
      { label: 'User Guide', toolId: 'guide' },
    ],
  };
}

export default function TestWizard({ onNavigate }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState([null, null, null, null, null]);

  const setAnswer = (stepIndex, value) => {
    const next = [...answers];
    next[stepIndex] = value;
    setAnswers(next);
  };

  const canGoNext = answers[currentStep] !== null;
  const showResults = currentStep === 5;

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(5);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers([null, null, null, null, null]);
  };

  const recommendation = showResults ? getRecommendation(answers) : null;

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Which Test Should I Use?</h1>
        <p className="page-subtitle">Answer a few questions to find the right power analysis tool</p>
      </div>
      <div className="page-body">
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {!showResults ? (
            <div className="card animate-in">
              <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 className="card-title">{QUESTIONS[currentStep].title}</h2>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  Step {currentStep + 1} of 5
                </span>
              </div>
              <div className="card-body">
                {/* Progress bar */}
                <div style={{ height: 3, background: 'var(--border-light)', borderRadius: 2, marginBottom: 20 }}>
                  <div style={{
                    height: '100%',
                    width: `${((currentStep + 1) / 5) * 100}%`,
                    background: 'var(--accent)',
                    borderRadius: 2,
                    transition: 'width 0.3s ease',
                  }} />
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {QUESTIONS[currentStep].options.map((opt) => {
                    const selected = answers[currentStep] === opt.value;
                    return (
                      <div
                        key={opt.value}
                        style={{
                          padding: '14px 18px',
                          border: `2px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          background: selected ? 'var(--accent-subtle)' : 'var(--bg-secondary)',
                          transition: 'all 0.15s ease',
                          marginBottom: 8,
                        }}
                        onClick={() => setAnswer(currentStep, opt.value)}
                      >
                        <div style={{ fontWeight: 600, fontSize: 14, color: selected ? 'var(--accent)' : 'var(--text-primary)', marginBottom: 2 }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{opt.desc}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, gap: 12 }}>
                  <button
                    className="btn"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    style={{ opacity: currentStep === 0 ? 0.4 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleNext}
                    disabled={!canGoNext}
                    style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    {currentStep < 4 ? <>Next <ChevronRight size={16} /></> : <>See Recommendation <Sparkles size={16} /></>}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Recommendation */}
              <div className="card" style={{ borderColor: 'var(--accent)', borderWidth: 2 }}>
                <div className="card-header">
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.2, color: 'var(--accent)', marginBottom: 4 }}>
                    Recommended Test
                  </div>
                  <h2 className="card-title" style={{ fontSize: 22 }}>{recommendation.test}</h2>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
                    {recommendation.why}
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={() => onNavigate && onNavigate(recommendation.toolId)}
                  >
                    Go to Calculator <ArrowRight size={16} />
                  </button>
                  {!onNavigate && (
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8 }}>
                      Tool ID: <code style={{ background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: 4 }}>{recommendation.toolId}</code>
                    </div>
                  )}
                </div>
              </div>

              {/* Alternatives */}
              {recommendation.alternatives && recommendation.alternatives.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h2 className="card-title" style={{ fontSize: 14 }}>Also Consider</h2>
                  </div>
                  <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {recommendation.alternatives.map((alt) => (
                      <div
                        key={alt.toolId}
                        style={{
                          padding: '10px 14px',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-md)',
                          cursor: 'pointer',
                          background: 'var(--bg-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s ease',
                        }}
                        onClick={() => onNavigate && onNavigate(alt.toolId)}
                      >
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{alt.label}</span>
                        <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Start over */}
              <div style={{ textAlign: 'center' }}>
                <button
                  className="btn"
                  onClick={handleReset}
                  style={{ fontSize: 13 }}
                >
                  Start Over
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
