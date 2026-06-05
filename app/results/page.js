'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

function SunIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function Results() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [jd, setJd] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [themeOverride, setThemeOverride] = useState(null);

  const [charter, setCharter] = useState(null);
  const [charterStatus, setCharterStatus] = useState(null);

  const [training, setTraining] = useState(null);
  const [trainingStatus, setTrainingStatus] = useState(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (themeOverride === null) setIsDark(mq.matches);
    const handler = (e) => { if (themeOverride === null) setIsDark(e.matches); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeOverride]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    setThemeOverride(next ? 'dark' : 'light');
  }

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
    textSecondary: '#b0b0b0',
    textMuted:     '#707070',
    ctaBg:         '#ffffff',
    ctaText:       '#0a0a0a',
    errorText:     '#f87171',
    warnBg:        '#1a1000',
    warnBorder:    '#92400e',
    warnText:      '#fbbf24',
    successText:   '#4ade80',
    barTrack:      '#262626',
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
    trainingBg:    '#0a1a1a',
    trainingBorder:'#1a3a3a',
    trainingAccent:'#22d3ee',
    resourceBg:    '#0d1f1f',
    resourceBorder:'#1e3d3d',
    freeBadgeBg:   '#0d1a0d',
    freeBadgeText: '#4ade80',
    paidBadgeBg:   '#1a1000',
    paidBadgeText: '#fbbf24',
    quickWinBg:    '#0f0f0f',
    themeBtnBg:    '#1a1a1a',
    themeBtnBorder:'#2e2e2e',
    themeBtnColor: '#b0b0b0',
  } : {
    pageBg:        '#f9fafb',
    cardBg:        '#ffffff',
    cardBorder:    '#e5e7eb',
    inputBg:       '#f9fafb',
    inputBorder:   '#e5e7eb',
    textPrimary:   '#111827',
    textSecondary: '#374151',
    textMuted:     '#6b7280',
    ctaBg:         '#111827',
    ctaText:       '#ffffff',
    errorText:     '#ef4444',
    warnBg:        '#fffbeb',
    warnBorder:    '#fcd34d',
    warnText:      '#92400e',
    successText:   '#16a34a',
    barTrack:      '#f3f4f6',
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
    trainingBg:    '#f0feff',
    trainingBorder:'#a5f3fc',
    trainingAccent:'#0891b2',
    resourceBg:    '#ffffff',
    resourceBorder:'#e0f2fe',
    freeBadgeBg:   '#f0fdf4',
    freeBadgeText: '#16a34a',
    paidBadgeBg:   '#fffbeb',
    paidBadgeText: '#92400e',
    quickWinBg:    '#f9fafb',
    themeBtnBg:    '#f3f4f6',
    themeBtnBorder:'#e5e7eb',
    themeBtnColor: '#4b5563',
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

  async function generateTraining() {
    if (trainingStatus === 'loading') return;
    setTrainingStatus('loading');
    setTraining(null);
    try {
      const res = await fetch('/api/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysisResult: data, jobDescription: jd }),
      });
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'Request failed');
      setTraining(json.training);
      setTrainingStatus('done');
    } catch (err) {
      console.error(err);
      setTrainingStatus('error');
    }
  }

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

  function docButton({ status, onClick, available }) {
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
          marginLeft: 'auto', flexShrink: 0, alignSelf: 'center',
          fontSize: '11px', fontWeight: 500,
          padding: '5px 12px', borderRadius: '8px',
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

  function CharterContent() {
    if (!charter) return null;
    return (
      <div style={{ marginTop: '16px', background: c.charterBg, border: `1px solid ${c.charterBorder}`, borderRadius: '12px', padding: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: c.charterAccent, margin: '0 0 4px 0', letterSpacing: '0.02em' }}>
          {charter.title}
        </p>
        <p style={{ fontSize: '13px', color: c.textSecondary, margin: '12px 0 0 0', lineHeight: 1.6 }}>{charter.overview}</p>

        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 6px 0' }}>Objective</p>
          <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>{charter.objective}</p>
        </div>

        <div style={{ marginTop: '16px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 6px 0' }}>Fit assessment</p>
          <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>{charter.fitSummary}</p>
        </div>

        {charter.risks?.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 10px 0' }}>Risks & mitigations</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {charter.risks.map((r, i) => (
                <div key={i} style={{ background: c.riskBg, border: `1px solid ${c.riskBorder}`, borderRadius: '8px', padding: '10px 12px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: c.errorText, margin: '0 0 3px 0' }}>{r.risk}</p>
                  <p style={{ fontSize: '12px', color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>↳ {r.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {charter.interviewScenarios?.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 10px 0' }}>Likely interview scenarios</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {charter.interviewScenarios.map((s, i) => (
                <div key={i} style={{ borderLeft: `2px solid ${c.charterAccent}`, paddingLeft: '12px' }}>
                  {s.type && (
                    <span style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: c.charterAccent, marginBottom: '4px', display: 'inline-block' }}>
                      {s.type}
                    </span>
                  )}
                  <p style={{ fontSize: '12px', fontWeight: 500, color: c.textPrimary, margin: '0 0 3px 0' }}>{s.scenario}</p>
                  <p style={{ fontSize: '12px', color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>{s.guidance}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {charter.companySnapshot && (
          <div style={{ marginTop: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 6px 0' }}>Company snapshot</p>
            <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>{charter.companySnapshot}</p>
          </div>
        )}

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

  function TrainingContent() {
    if (!training) return null;

    function costBadge(cost) {
      const isFree = cost === 'free';
      const isFreemium = cost === 'freemium';
      const bg = isFree || isFreemium ? c.freeBadgeBg : c.paidBadgeBg;
      const text = isFree || isFreemium ? c.freeBadgeText : c.paidBadgeText;
      const label = isFree ? 'Free' : isFreemium ? 'Freemium' : 'Paid';
      return (
        <span style={{
          fontSize: '10px', fontWeight: 500, letterSpacing: '0.04em',
          textTransform: 'uppercase', color: text, background: bg,
          borderRadius: '4px', padding: '2px 6px', flexShrink: 0,
        }}>
          {label}
        </span>
      );
    }

    function typeBadge(type) {
      return (
        <span style={{
          fontSize: '10px', color: c.textMuted, background: c.docCardBg,
          borderRadius: '4px', padding: '2px 6px', flexShrink: 0,
          border: `1px solid ${c.docCardBorder}`,
        }}>
          {type}
        </span>
      );
    }

    return (
      <div style={{ marginTop: '16px', background: c.trainingBg, border: `1px solid ${c.trainingBorder}`, borderRadius: '12px', padding: '20px' }}>
        <p style={{ fontSize: '13px', fontWeight: 600, color: c.trainingAccent, margin: '0 0 8px 0', letterSpacing: '0.02em' }}>
          {training.title}
        </p>
        <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.6 }}>{training.summary}</p>

        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {training.gapResources?.map((gr, gi) => {
            const severity = gr.severity?.toLowerCase();
            const col = gapColors[severity] || gapColors.low;
            return (
              <div key={gi}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em',
                    textTransform: 'uppercase', color: col.text,
                    background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)',
                    border: `1px solid ${col.border}`, borderRadius: '4px', padding: '2px 6px',
                  }}>
                    {gr.severity}
                  </span>
                  <p style={{ fontSize: '12px', fontWeight: 500, color: c.textPrimary, margin: 0, lineHeight: 1.4 }}>{gr.gap}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {gr.resources?.map((r, ri) => (
                    <div key={ri} style={{
                      background: c.resourceBg,
                      border: `1px solid ${c.resourceBorder}`,
                      borderRadius: '8px',
                      padding: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        <p style={{ fontSize: '13px', fontWeight: 500, color: c.textPrimary, margin: 0, flex: 1, minWidth: '120px' }}>{r.title}</p>
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          {costBadge(r.cost)}
                          {typeBadge(r.type)}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '12px', marginBottom: '6px', flexWrap: 'wrap' }}>
                        {r.platform && (
                          <span style={{ fontSize: '12px', color: c.textMuted }}>{r.platform}</span>
                        )}
                        {r.estimatedTime && (
                          <span style={{ fontSize: '12px', color: c.textMuted }}>⏱ {r.estimatedTime}</span>
                        )}
                      </div>

                      <p style={{ fontSize: '12px', color: c.textSecondary, margin: '0 0 8px 0', lineHeight: 1.5 }}>{r.why}</p>

                      {r.url && (
                        r.url.startsWith('Search:') ? (
                          <p style={{ fontSize: '11px', color: c.trainingAccent, margin: 0 }}>
                            🔍 {r.url}
                          </p>
                        ) : (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: '11px', color: c.trainingAccent, margin: 0, wordBreak: 'break-all', display: 'block', textDecoration: 'none' }}
                          >
                            → {r.url}
                          </a>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {training.quickWins?.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textMuted, margin: '0 0 10px 0' }}>Quick wins — do today</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {training.quickWins.map((qw, i) => (
                <div key={i} style={{
                  background: c.quickWinBg,
                  border: `1px solid ${c.trainingBorder}`,
                  borderRadius: '8px',
                  padding: '10px 12px',
                  display: 'flex', gap: '10px', alignItems: 'flex-start',
                }}>
                  <span style={{ color: c.trainingAccent, fontSize: '14px', flexShrink: 0, lineHeight: 1.4 }}>⚡</span>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: c.textPrimary, margin: '0 0 2px 0' }}>{qw.action}</p>
                    <p style={{ fontSize: '11px', color: c.textMuted, margin: 0 }}>Addresses: {qw.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const docCards = [
    { key: 'charter',  icon: '◈', title: 'Project Charter',    desc: 'PM-style application brief with interview scenarios and company snapshot.', available: true,  status: charterStatus,  onGenerate: generateCharter },
    { key: 'training', icon: '◧', title: 'Training Materials', desc: 'Curated resources per gap — free and low-cost, with time estimates.',       available: true,  status: trainingStatus, onGenerate: generateTraining },
    { key: 'cvrewrite',icon: '◩', title: 'CV Rewrite',         desc: 'Tailored CV matched to JD language, with a change log.',                    available: false },
    { key: 'plan',     icon: '◫', title: 'Preparation Plan',   desc: 'Day-by-day prep schedule — coming in the next phase.',                      available: false },
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px' }}>
          <p style={{ fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textSecondary, margin: 0 }}>
            <span style={{ color: c.textPrimary }}>CareerPrep</span> — AI
          </p>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', color: c.themeBtnColor,
                background: c.themeBtnBg, border: `1px solid ${c.themeBtnBorder}`,
                borderRadius: '8px', padding: '5px 10px',
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {isDark ? <SunIcon color={c.themeBtnColor} /> : <MoonIcon color={c.themeBtnColor} />}
              {isDark ? 'Light' : 'Dark'}
            </button>
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
        </div>

        {lowFit && (
          <div style={{ background: c.warnBg, border: `1px solid ${c.warnBorder}`, borderRadius: '12px', padding: '14px 18px', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: 500, color: c.warnText, margin: '0 0 4px 0' }}>⚠ Low fit score</p>
            <p style={{ fontSize: '13px', color: c.warnText, margin: 0, opacity: 0.85 }}>
              Your score is below 60. You can still proceed with an extended preparation plan, but the gap to the role is significant.
            </p>
          </div>
        )}

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
                      <div style={{ height: '100%', width: `${pct}%`, background: scoreColor, borderRadius: '2px', transition: 'width 0.6s ease' }} />
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

        {gaps?.length > 0 && card(
          <>
            {sectionLabel('Gaps')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {gaps.map((g, i) => {
                const severity = g.severity?.toLowerCase();
                const col = gapColors[severity] || gapColors.low;
                return (
                  <div key={i} style={{ background: col.bg, border: `1px solid ${col.border}`, borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{
                        fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: col.text,
                        background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)',
                        border: `1px solid ${col.border}`, borderRadius: '4px', padding: '2px 6px',
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

        {card(
          <>
            {sectionLabel('Your preparation package')}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {docCards.map(({ key, icon, title, desc, available, status, onGenerate }) => (
                <div key={key}>
                  <div style={{
                    display: 'flex', gap: '14px', alignItems: 'flex-start',
                    background: c.docCardBg, border: `1px solid ${available ? c.cardBorder : c.docCardBorder}`,
                    borderRadius: '10px', padding: '14px',
                    opacity: available ? 1 : 0.5,
                  }}>
                    <span style={{ fontSize: '20px', color: c.textMuted, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 500, color: c.textPrimary, margin: '0 0 2px 0' }}>{title}</p>
                      <p style={{ fontSize: '12px', color: c.textMuted, margin: 0, lineHeight: 1.5 }}>{desc}</p>
                      {status === 'error' && (
                        <p style={{ fontSize: '11px', color: c.errorText, margin: '4px 0 0 0' }}>
                          Generation failed — try again.
                        </p>
                      )}
                    </div>
                    {docButton({ status, onClick: onGenerate, available })}
                  </div>

                  {key === 'charter' && charterStatus === 'done' && <CharterContent />}
                  {key === 'charter' && charterStatus === 'loading' && (
                    <div style={{ marginTop: '10px', background: c.docCardBg, border: `1px solid ${c.docCardBorder}`, borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>Generating Project Charter…</p>
                    </div>
                  )}

                  {key === 'training' && trainingStatus === 'done' && <TrainingContent />}
                  {key === 'training' && trainingStatus === 'loading' && (
                    <div style={{ marginTop: '10px', background: c.docCardBg, border: `1px solid ${c.docCardBorder}`, borderRadius: '10px', padding: '20px', textAlign: 'center' }}>
                      <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>Generating Training Materials…</p>
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