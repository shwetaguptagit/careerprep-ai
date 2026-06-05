'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Results() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [jd, setJd] = useState('');
  const [isDark, setIsDark] = useState(true);

  // Per-doc state: null | 'loading' | 'error' | { ...content }
  const [charter, setCharter] = useState(null);
  const [charterStatus, setCharterStatus] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const raw = sessionStorage.getItem('analysisResult');
    const savedJd = sessionStorage.getItem('jobDescription');
    if (!raw) { router.push('/'); return; }
    try {
      setData(JSON.parse(raw));
      setJd(savedJd || '');
    } catch { router.push('/'); }
  }, [router]);

  if (!data) return null;

  const c = isDark ? {
    pageBg:        '#0a0a0a',
    cardBg:        '#141414',
    cardBorder:    '#262626',
    inputBg:       '#1a1a1a',
    inputBorder:   '#2e2e2e',
    textPrimary:   '#ededed',
    textSecondary: '#888888',
    textMuted:     '#555555',
    ctaBg:         '#ffffff',
    ctaText:       '#0a0a0a',
    ctaHover:      '#e5e5e5',
    errorText:     '#f87171',
    warnBg:        '#1a1000',
    warnBorder:    '#92400e',
    warnText:      '#fbbf24',
    successText:   '#4ade80',
    barTrack:      '#262626',
    pillBg:        '#1a1a1a',
    pillBorder:    '#2e2e2e',
    gapHighBg:     '#1a0505',
    gapHighBorder: '#7f1d1d',
    gapHighText:   '#fca5a5',
    gapMedBg:      '#1a1000',
    gapMedBorder:  '#92400e',
    gapMedText:    '#fbbf24',
    gapLowBg:      '#0d1a0d',
    gapLowBorder:  '#166534',
    gapLowText:    '#4ade80',
    divider:       '#1f1f1f',
    docCardBg:     '#0f0f0f',
    docCardBorder: '#1f1f1f',
    charterBg:     '#0d0d1a',
    charterBorder: '#2a2a4a',
    charterAccent: '#818cf8',
    riskBg:        '#1a0a0a',
    riskBorder:    '#3f1515',
  } : {
    pageBg:        '#f9fafb',
    cardBg:        '#ffffff',
    cardBorder:    '#e5e7eb',
    inputBg:       '#f9fafb',
    inputBorder:   '#e5e7eb',
    textPrimary:   '#111827',
    textSecondary: '#6b7280',
    textMuted:     '#9ca3af',
    ctaBg:         '#111827',
    ctaText:       '#ffffff',
    ctaHover:      '#374151',
    errorText:     '#ef4444',
    warnBg:        '#fffbeb',
    warnBorder:    '#fcd34d',
    warnText:      '#92400e',
    successText:   '#16a34a',
    barTrack:      '#f3f4f6',
    pillBg:        '#f3f4f6',
    pillBorder:    '#e5e7eb',
    gapHighBg:     '#fef2f2',
    gapHighBorder: '#fecaca',
    gapHighText:   '#991b1b',
    gapMedBg:      '#fffbeb',
    gapMedBorder:  '#fcd34d',
    gapMedText:    '#92400e',
    gapLowBg:      '#f0fdf4',
    gapLowBorder:  '#bbf7d0',
    gapLowText:    '#166534',
    divider:       '#f3f4f6',
    docCardBg:     '#f9fafb',
    docCardBorder: '#e5e7eb',
    charterBg:     '#f0f0ff',
    charterBorder: '#c7c7f0',
    charterAccent: '#4f46e5',
    riskBg:        '#fff5f5',
    riskBorder:    '#fecaca',
  };

  const { score, companyName, scoreBreakdown, strengths, gaps, lowFit } = data;

  const scoreColor = score >= 80
    ? (isDark ? '#4ade80' : '#16a34a')
    : score >= 60
    ? (isDark ? '#fbbf24' : '#d97706')
    : (isDark ? '#f87171' : '#dc2626');

  const rubricItems = [
    { key: 'mandatorySkills',  label: 'Mandatory skills',   max: 40 },
    { key: 'experienceLevel',  label: 'Experience level',   max: 25 },
    { key: 'domainFit',        label: 'Domain / industry',  max: 20 },
    { key: 'projectRelevance', label: 'Project relevance',  max: 15 },
  ];

  const gapColors = {
    high:   { bg: c.gapHighBg, border: c.gapHighBorder, text: c.gapHighText, label: 'High' },
    medium: { bg: c.gapMedBg,  border: c.gapMedBorder,  text: c.gapMedText,  label: 'Medium' },
    low:    { bg: c.gapLowBg,  border: c.gapLowBorder,  text: c.gapLowText,  label: 'Low' },
  };

  // ── Charter generation ──────────────────────────────────────────────
  async function generateCharter() {
    if (charterStatus === 'loading') return;
    setCharterStatus('loading');
    setCharter(null);
    try {
      const res = await fetch('/api/charter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult: data, jobDescription: jd }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Request failed');
      setCharter(json.charter);
      setCharterStatus('done');
    } catch (err) {
      console.error(err);
      setCharterStatus('error');
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────
  function card(children, extraStyle = {}) {
    return (
      <div style={{
        background: c.cardBg,
        border: `1px solid ${c.cardBorder}`,
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '16px',
        ...extraStyle,
      }}>
        {children}
      </div>
    );
  }

  function sectionLabel(text) {
    return (
      <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 16px 0' }}>
        {text}
      </p>
    );
  }

  function divider() {
    return <div style={{ height: '1px', background: c.divider, margin: '20px 0' }} />;
  }

  function docButton({ label, status, onClick, available }) {
    if (!available) {
      return (
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: c.textMuted, flexShrink: 0, alignSelf: 'center' }}>
          Coming soon
        </span>
      );
    }
    const isLoading = status === 'loading';
    const isDone = status === 'done';
    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        style={{
          marginLeft: 'auto',
          flexShrink: 0,
          alignSelf: 'center',
          fontSize: '11px',
          fontWeight: 500,
          padding: '5px 12px',
          borderRadius: '8px',
          border: `1px solid ${isDone ? c.successText : c.cardBorder}`,
          background: isDone ? 'transparent' : c.ctaBg,
          color: isDone ? c.successText : c.ctaText,
          cursor: isLoading ? 'wait' : 'pointer',
          fontFamily: 'inherit',
          opacity: isLoading ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {isLoading ? '...' : isDone ? '↺ Regenerate' : 'Generate'}
      </button>
    );
  }

  // ── Charter display ──────────────────────────────────────────────────
  function CharterContent() {
    if (!charter) return null;
    return (
      <div style={{
        marginTop: '16px',
        background: c.charterBg,
        border: `1px solid ${c.charterBorder}`,
        borderRadius: '12px',
        padding: '20px',
      }}>
        {/* Title */}
        <p style={{ fontSize: '13px', fontWeight: 600, color: c.charterAccent, margin: '0 0 4px 0', letterSpacing: '0.02em' }}>
          {charter.title}
        </p>

        {/* Overview */}
        <p style={{ fontSize: '13px', color: c.textSecondary, margin: '12px 0 0 0', lineHeight: 1.6 }}>
          {charter.overview}
        </p>

        {/* Objective */}
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 6px 0' }}>Objective</p>
          <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>{charter.objective}</p>
        </div>

        {/* Fit summary */}
        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 6px 0' }}>Fit assessment</p>
          <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>{charter.fitSummary}</p>
        </div>

        {/* Risks */}
        {charter.risks?.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 10px 0' }}>Risks & mitigations</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {charter.risks.map((r, i) => (
                <div key={i} style={{
                  background: c.riskBg,
                  border: `1px solid ${c.riskBorder}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: c.errorText, margin: '0 0 3px 0' }}>{r.risk}</p>
                  <p style={{ fontSize: '12px', color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>↳ {r.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Interview scenarios */}
        {charter.interviewScenarios?.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 10px 0' }}>Likely interview scenarios</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {charter.interviewScenarios.map((s, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${c.charterAccent}`, paddingLeft: '12px' }}>
                  {s.type && (
                    <span style={{
                      fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em',
                      textTransform: 'uppercase', color: c.charterAccent,
                      marginBottom: '4px', display: 'inline-block',
                    }}>{s.type}</span>
                  )}
                  <p style={{ fontSize: '12px', fontWeight: 500, color: c.textPrimary, margin: '0 0 3px 0' }}>{s.scenario}</p>
                  <p style={{ fontSize: '12px', color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>{s.guidance}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company snapshot */}
        {charter.companySnapshot && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 6px 0' }}>Company snapshot</p>
            <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>{charter.companySnapshot}</p>
          </div>
        )}

        {/* Success metrics */}
        {charter.successMetrics?.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 10px 0' }}>Success metrics</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {charter.successMetrics.map((m, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: c.charterAccent, fontSize: '12px', flexShrink: 0 }}>◆</span>
                  <p style={{ fontSize: '12px', color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>{m}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const docCards = [
    {
      key: 'charter',
      icon: '◈',
      title: 'Project Charter',
      desc: 'PM-style application brief with interview scenarios and company snapshot.',
      available: true,
      status: charterStatus,
      onGenerate: generateCharter,
    },
    {
      key: 'plan',
      icon: '◫',
      title: 'Preparation Plan',
      desc: `Day-by-day schedule${lowFit ? ' (extended plan)' : ' (up to 7 days)'}.`,
      available: false,
    },
    {
      key: 'training',
      icon: '◧',
      title: 'Training Materials',
      desc: 'Curated resources per gap — free and low-cost, with time estimates.',
      available: false,
    },
    {
      key: 'cvrewrite',
      icon: '◩',
      title: 'CV Rewrite',
      desc: 'Tailored CV matched to JD language, with a change log.',
      available: false,
    },
  ];

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: c.pageBg,
      padding: '64px 16px 80px',
      fontFamily: 'var(--font-geist-sans, sans-serif)',
      transition: 'background-color 0.2s',
    }}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Logo + nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textSecondary, margin: 0 }}>
            <span style={{ color: c.textPrimary }}>CareerPrep</span> — AI
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              fontSize: '12px', color: c.textSecondary, background: 'none',
              border: `1px solid ${c.cardBorder}`, borderRadius: '8px',
              padding: '5px 12px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            ← New analysis
          </button>
        </div>

        {/* Low fit warning */}
        {lowFit && (
          <div style={{
            background: c.warnBg, border: `1px solid ${c.warnBorder}`,
            borderRadius: '12px', padding: '14px 18px', marginBottom: '16px',
          }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: c.warnText, margin: '0 0 4px 0' }}>⚠ Low fit score</p>
            <p style={{ fontSize: '13px', color: c.warnText, margin: 0, opacity: 0.85 }}>
              Your score is below 60. You can still proceed with an extended preparation plan, but the gap to the role is significant.
            </p>
          </div>
        )}

        {/* Score card */}
        {card(
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                {sectionLabel('Fit score')}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '56px', fontWeight: 600, color: scoreColor, lineHeight: 1 }}>{score}</span>
                  <span style={{ fontSize: '20px', color: c.textMuted, fontWeight: 400 }}>/100</span>
                </div>
                {companyName && (
                  <p style={{ fontSize: '13px', color: c.textSecondary, margin: '6px 0 0 0' }}>{companyName}</p>
                )}
              </div>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: c.inputBg, border: `3px solid ${scoreColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: '22px', fontWeight: 600, color: scoreColor }}>{score}</span>
              </div>
            </div>

            {divider()}

            {/* Score breakdown */}
            {sectionLabel('Score breakdown')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {rubricItems.map(({ key, label, max }) => {
                const item = scoreBreakdown?.[key];
                if (!item) return null;
                const pct = Math.round((item.score / max) * 100);
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: c.textSecondary }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: c.textPrimary }}>
                        {item.score}<span style={{ color: c.textMuted, fontWeight: 400 }}>/{max}</span>
                      </span>
                    </div>
                    <div style={{ height: '4px', background: c.barTrack, borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', width: `${pct}%`,
                        background: scoreColor, borderRadius: '2px',
                        transition: 'width 0.6s ease',
                      }} />
                    </div>
                    {item.notes && (
                      <p style={{ fontSize: '12px', color: c.textMuted, margin: '6px 0 0 0', lineHeight: 1.5 }}>
                        {item.notes}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Strengths */}
        {strengths?.length > 0 && card(
          <>
            {sectionLabel('Strengths')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {strengths.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <span style={{ color: c.successText, fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>✦</span>
                  <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>{s}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Gaps */}
        {gaps?.length > 0 && card(
          <>
            {sectionLabel('Gaps')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gaps.map((g, i) => {
                const severity = g.severity?.toLowerCase();
                const col = gapColors[severity] || gapColors.low;
                return (
                  <div key={i} style={{
                    background: col.bg,
                    border: `1px solid ${col.border}`,
                    borderRadius: '10px',
                    padding: '12px 14px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em',
                        textTransform: 'uppercase', color: col.text,
                        background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${col.border}`,
                        borderRadius: '4px', padding: '2px 6px',
                      }}>
                        {col.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: col.text, margin: 0, lineHeight: 1.6, opacity: 0.9 }}>
                      {g.gap}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Output documents */}
        {card(
          <>
            {sectionLabel('Your preparation package')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {docCards.map(({ key, icon, title, desc, available, status, onGenerate }) => (
                <div key={key}>
                  <div style={{
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                    background: c.docCardBg,
                    border: `1px solid ${available ? c.cardBorder : c.docCardBorder}`,
                    borderRadius: '10px',
                    padding: '14px',
                    opacity: available ? 1 : 0.5,
                  }}>
                    <span style={{ fontSize: '20px', color: c.textMuted, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: c.textPrimary, margin: '0 0 2px 0' }}>{title}</p>
                      <p style={{ fontSize: '12px', color: c.textMuted, margin: 0, lineHeight: 1.5 }}>{desc}</p>
                      {status === 'error' && (
                        <p style={{ fontSize: '11px', color: c.errorText, margin: '4px 0 0 0' }}>
                          Generation failed — check console and retry.
                        </p>
                      )}
                    </div>
                    {docButton({ label: title, status, onClick: onGenerate, available })}
                  </div>

                  {/* Charter expanded content */}
                  {key === 'charter' && charterStatus === 'done' && <CharterContent />}

                  {/* Charter loading state */}
                  {key === 'charter' && charterStatus === 'loading' && (
                    <div style={{
                      marginTop: '10px',
                      background: c.docCardBg,
                      border: `1px solid ${c.docCardBorder}`,
                      borderRadius: '10px',
                      padding: '20px',
                      textAlign: 'center',
                    }}>
                      <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>Generating Project Charter…</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </main>
  );
}