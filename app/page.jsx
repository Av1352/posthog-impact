'use client'
import { useState, useEffect } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

function generateWhy(engineer) {
    const parts = []
    const scores = [
        { key: 'complexity_score', label: 'complexity' },
        { key: 'collaboration_score', label: 'consistency' },
        { key: 'review_quality_score', label: 'cadence' },
        { key: 'longevity_score', label: 'longevity' }
    ].sort((a, b) => engineer[b.key] - engineer[a.key])

    const strongest = scores[0]
    const weakest = scores[scores.length - 1]

    if (strongest.key === 'complexity_score') {
        parts.push(`Ships substantially complex work — avg ${engineer.avg_pr_size} lines across ${engineer.avg_files} files per PR.`)
    } else if (strongest.key === 'collaboration_score') {
        parts.push(`High throughput with sustained delivery — ${engineer.pr_count} PRs across ${engineer.weeks_active} active weeks.`)
    } else if (strongest.key === 'review_quality_score') {
        parts.push(`Consistently shows up — active ${engineer.weeks_active} of the last ~13 weeks without bursty spikes.`)
    } else {
        parts.push(`Reliable shipping quality — ${engineer.stable_prs}/${engineer.pr_count} PRs needed no hotfixes.`)
    }

    parts.push(`${engineer.stable_prs}/${engineer.pr_count} stable PRs (${Math.round(engineer.stable_prs / engineer.pr_count * 100)}% longevity).`)

    if (weakest.key === 'complexity_score') {
        parts.push(`Lower avg PR size (${engineer.avg_pr_size} lines) — scores higher on consistency than complexity.`)
    }

    return parts.join(' ')
}

function MiniBar({ value, color }) {
    return (
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden', marginTop: '3px' }}>
            <div style={{ width: `${value * 100}%`, height: '100%', background: color, borderRadius: '2px' }} />
        </div>
    )
}

function EngineerRow({ engineer, expanded, onToggle }) {
    const rankColor = engineer.rank === 1 ? '#f0883e' : engineer.rank === 2 ? '#8b949e' : engineer.rank === 3 ? '#d29922' : 'var(--text-dim)'

    const radarData = [
        { dim: 'Complexity', value: engineer.complexity_score },
        { dim: 'Consistency', value: engineer.collaboration_score },
        { dim: 'Cadence', value: engineer.review_quality_score },
        { dim: 'Longevity', value: engineer.longevity_score }
    ]

    return (
        <div
            onClick={onToggle}
            style={{
                background: 'var(--bg-card)',
                border: `1px solid ${expanded ? '#4c1d95' : 'var(--border)'}`,
                borderRadius: '10px',
                borderLeft: `3px solid ${rankColor}`,
                cursor: 'pointer',
                transition: 'border-color 0.15s',
                overflow: 'hidden'
            }}
        >
            {/* Collapsed row */}
            <div style={{ display: 'grid', gridTemplateColumns: '32px 160px 1fr 1fr 1fr 1fr 64px', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
                {/* Rank */}
                <div style={{ fontSize: '14px', fontWeight: '700', color: rankColor, fontFamily: mono }}>#{engineer.rank}</div>

                {/* Name + stats */}
                <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', fontFamily: sans }}>{engineer.login}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, marginTop: '1px' }}>
                        {engineer.pr_count} PRs · {engineer.weeks_active}w
                    </div>
                </div>

                {/* Complexity */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: sans }}>Complexity</span>
                        <span style={{ fontSize: '10px', color: '#a78bfa', fontFamily: mono }}>{(engineer.complexity_score * 100).toFixed(0)}</span>
                    </div>
                    <MiniBar value={engineer.complexity_score} color="#a78bfa" />
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: sans, marginTop: '2px' }}>avg {engineer.avg_pr_size}L · {engineer.avg_files}f</div>
                </div>

                {/* Consistency */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: sans }}>Consistency</span>
                        <span style={{ fontSize: '10px', color: '#3fb950', fontFamily: mono }}>{(engineer.collaboration_score * 100).toFixed(0)}</span>
                    </div>
                    <MiniBar value={engineer.collaboration_score} color="#3fb950" />
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: sans, marginTop: '2px' }}>{engineer.pr_count} PRs · {engineer.weeks_active} weeks</div>
                </div>

                {/* Longevity */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: sans }}>Longevity</span>
                        <span style={{ fontSize: '10px', color: '#f0883e', fontFamily: mono }}>{(engineer.longevity_score * 100).toFixed(0)}</span>
                    </div>
                    <MiniBar value={engineer.longevity_score} color="#f0883e" />
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: sans, marginTop: '2px' }}>{engineer.stable_prs}/{engineer.pr_count} stable</div>
                </div>

                {/* Cadence */}
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: sans }}>Cadence</span>
                        <span style={{ fontSize: '10px', color: '#58a6ff', fontFamily: mono }}>{(engineer.review_quality_score * 100).toFixed(0)}</span>
                    </div>
                    <MiniBar value={engineer.review_quality_score} color="#58a6ff" />
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: sans, marginTop: '2px' }}>{(engineer.pr_count / Math.max(engineer.weeks_active, 1)).toFixed(1)} PRs/wk</div>
                </div>

                {/* Score */}
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#a78bfa', fontFamily: mono }}>{(engineer.impact_score * 100).toFixed(0)}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', fontFamily: sans }}>impact</div>
                </div>
            </div>

            {/* Expanded */}
            {expanded && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px', display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '20px' }}>
                    {/* Radar */}
                    <ResponsiveContainer width="100%" height={160}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="var(--border)" />
                            <PolarAngleAxis dataKey="dim" tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: sans }} />
                            <Radar dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} strokeWidth={1.5} />
                            <Tooltip formatter={(v) => [(v * 100).toFixed(0), 'Score']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '11px' }} />
                        </RadarChart>
                    </ResponsiveContainer>

                    {/* Why */}
                    <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, letterSpacing: '0.08em', marginBottom: '8px' }}>WHY #{engineer.rank}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: sans, lineHeight: 1.7, marginBottom: '12px' }}>
                            {generateWhy(engineer)}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                            {[
                                { label: 'PRs/week', value: (engineer.pr_count / Math.max(engineer.weeks_active, 1)).toFixed(1) },
                                { label: 'Avg size', value: `${engineer.avg_pr_size}L` },
                                { label: 'Stable rate', value: `${Math.round(engineer.stable_prs / engineer.pr_count * 100)}%` },
                                { label: 'Active weeks', value: engineer.weeks_active }
                            ].map(s => (
                                <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '3px 0' }}>
                                    <span style={{ color: 'var(--text-dim)', fontFamily: sans }}>{s.label}</span>
                                    <span style={{ color: 'var(--text)', fontFamily: mono }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top PRs */}
                    <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, letterSpacing: '0.08em', marginBottom: '8px' }}>TOP PRS</div>
                        {engineer.top_prs.map(pr => (
                            <div key={pr.number} style={{ marginBottom: '6px', padding: '6px 8px', background: 'var(--bg-hover)', borderRadius: '6px' }}>
                                <div style={{ fontSize: '11px', color: 'var(--text)', fontFamily: sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    #{pr.number} {pr.title}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, marginTop: '2px' }}>
                                    +{pr.additions} -{pr.deletions} · {pr.changedFiles} files
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function Page() {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [expanded, setExpanded] = useState(null)

    useEffect(() => {
        fetch('/api/analyze')
            .then(r => r.json())
            .then(d => { if (d.error) setError(d.error); else setData(d) })
            .catch(e => setError(e.message))
    }, [])

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '24px 32px', maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
                <div>
                    <div style={{ fontSize: '10px', color: '#a78bfa', fontFamily: mono, letterSpacing: '0.1em', marginBottom: '4px' }}>// ENGINEERING IMPACT · POSTHOG · LAST 90 DAYS</div>
                    <h1 style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.03em', fontFamily: sans }}>Top 5 Most Impactful Engineers</h1>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: sans }}>Impact = complexity owned + consistency + code longevity. Not commits, not lines of code.</p>
                </div>
                {data && (
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: mono, textAlign: 'right' }}>
                        <div>{data.total_prs} PRs analyzed · posthog/posthog</div>
                    </div>
                )}
            </div>

            {error && (
                <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '10px', padding: '12px 16px', color: 'var(--red)', fontSize: '13px', fontFamily: sans, marginBottom: '16px' }}>
                    ⚠ {error}
                </div>
            )}

            {!data && !error && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)', fontFamily: mono, fontSize: '12px' }}>
          // COMPUTING IMPACT SCORES...
                </div>
            )}

            {data && (
                <>
                    {/* Column headers */}
                    <div style={{ display: 'grid', gridTemplateColumns: '32px 160px 1fr 1fr 1fr 1fr 64px', gap: '12px', padding: '0 16px', marginBottom: '6px' }}>
                        {['', 'Engineer', 'Complexity (35%)', 'Consistency (30%)', 'Longevity (15%)', 'Cadence (20%)', 'Score'].map((h, i) => (
                            <div key={i} style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, letterSpacing: '0.06em', textAlign: i === 6 ? 'right' : 'left' }}>{h}</div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
                        {data.engineers.map(e => (
                            <EngineerRow
                                key={e.login}
                                engineer={e}
                                expanded={expanded === e.login}
                                onToggle={() => setExpanded(expanded === e.login ? null : e.login)}
                            />
                        ))}
                    </div>

                    {/* Methodology */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '14px 16px' }}>
                        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ fontSize: '10px', color: '#a78bfa', fontFamily: mono, letterSpacing: '0.1em', whiteSpace: 'nowrap', paddingTop: '2px' }}>// METHOD</div>
                            {[
                                { color: '#a78bfa', label: 'Complexity (35%)', desc: 'Avg PR size × files/PR. Hard work scores higher.' },
                                { color: '#3fb950', label: 'Consistency (30%)', desc: 'PRs across active weeks. Sustained beats bursty.' },
                                { color: '#58a6ff', label: 'Cadence (20%)', desc: 'Active weeks / PR count. Steady rhythm scores higher.' },
                                { color: '#f0883e', label: 'Longevity (15%)', desc: 'PRs without hotfix/revert patterns.' }
                            ].map(m => (
                                <div key={m.label} style={{ flex: 1, minWidth: '140px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: '600', color: m.color, fontFamily: sans, marginBottom: '2px' }}>{m.label}</div>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: sans, lineHeight: 1.5 }}>{m.desc}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '10px', fontFamily: sans, borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                            Each dimension normalized 0–1 across engineers with ≥3 PRs. Review quality proxied from cadence — review body content unavailable via GitHub CLI bulk export on large repos. Not measured: commits, raw line count, PR count in isolation.
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}