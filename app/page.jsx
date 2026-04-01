'use client'
import { useState, useEffect } from 'react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

const mono = "'JetBrains Mono', monospace"
const sans = "'Inter', sans-serif"

function ScoreBar({ label, value, color, detail }) {
    return (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: sans }}>{label}</span>
                <span style={{ fontSize: '11px', color, fontFamily: mono }}>{(value * 100).toFixed(0)}</span>
            </div>
            <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${value * 100}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.6s ease' }} />
            </div>
            {detail && <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '3px', fontFamily: sans }}>{detail}</div>}
        </div>
    )
}

function EngineerCard({ engineer, expanded, onToggle }) {
    const radarData = [
        { dim: 'Complexity', value: engineer.complexity_score },
        { dim: 'Consistency', value: engineer.collaboration_score },
        { dim: 'Sustained', value: engineer.review_quality_score },
        { dim: 'Longevity', value: engineer.longevity_score }
    ]

    const rankColor = engineer.rank === 1 ? '#f0883e' : engineer.rank === 2 ? '#8b949e' : engineer.rank === 3 ? '#d29922' : 'var(--text-dim)'

    const whyRank = {
        1: `Highest combined score. Strong complexity (avg ${engineer.avg_pr_size} lines/PR) with consistent delivery across ${engineer.weeks_active} weeks.`,
        2: `Top complexity score. avg ${engineer.avg_pr_size} lines per PR signals hard, substantial work. ${engineer.stable_prs}/${engineer.pr_count} PRs required no hotfixes.`,
        3: `High volume (${engineer.pr_count} PRs) with strong longevity. ${engineer.stable_prs}/${engineer.pr_count} stable PRs shows reliable shipping.`,
        4: `Strong complexity at ${engineer.avg_pr_size} lines/PR average. Consistent across ${engineer.weeks_active} active weeks with ${engineer.stable_prs}/${engineer.pr_count} stable PRs.`,
        5: `Balanced profile — complexity, volume, and longevity all solid. ${engineer.pr_count} PRs across ${engineer.weeks_active} weeks shows sustained contribution.`
    }

    return (
        <div
            onClick={onToggle}
            style={{
                background: 'var(--bg-card)',
                border: `1px solid ${expanded ? '#4c1d95' : 'var(--border)'}`,
                borderRadius: '12px', padding: '20px', cursor: 'pointer',
                transition: 'all 0.2s', borderLeft: `3px solid ${rankColor}`
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ fontSize: '22px', fontWeight: '700', color: rankColor, fontFamily: mono, minWidth: '28px' }}>
                        #{engineer.rank}
                    </div>
                    <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text)', fontFamily: sans }}>{engineer.login}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: sans, marginTop: '2px' }}>
                            {engineer.pr_count} PRs · {engineer.weeks_active} active weeks · avg {engineer.avg_pr_size} lines/PR
                        </div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '26px', fontWeight: '700', color: '#a78bfa', fontFamily: mono }}>
                        {(engineer.impact_score * 100).toFixed(0)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: sans }}>impact score</div>
                </div>
            </div>

            {/* Score bars */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
                <ScoreBar
                    label="Complexity Owned (35%)"
                    value={engineer.complexity_score}
                    color="#a78bfa"
                    detail={`avg ${engineer.avg_pr_size} lines · ${engineer.avg_files} files/PR`}
                />
                <ScoreBar
                    label="Consistency & Volume (30%)"
                    value={engineer.collaboration_score}
                    color="#3fb950"
                    detail={`${engineer.pr_count} PRs across ${engineer.weeks_active} active weeks`}
                />
                <ScoreBar
                    label="Sustained Cadence (20%)"
                    value={engineer.review_quality_score}
                    color="#58a6ff"
                    detail={`${engineer.weeks_active} weeks active vs ${engineer.pr_count} PRs — sustained beats bursty`}
                />
                <ScoreBar
                    label="Code Longevity (15%)"
                    value={engineer.longevity_score}
                    color="#f0883e"
                    detail={`${engineer.stable_prs}/${engineer.pr_count} PRs without hotfix patterns`}
                />
            </div>

            {/* Expanded detail */}
            {expanded && (
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <ResponsiveContainer width="100%" height={180}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="var(--border)" />
                                <PolarAngleAxis dataKey="dim" tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: sans }} />
                                <Radar dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} strokeWidth={2} />
                                <Tooltip
                                    formatter={(v) => [(v * 100).toFixed(0), 'Score']}
                                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '12px' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                        <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: '8px', borderLeft: '3px solid #a78bfa' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, marginBottom: '6px' }}>WHY RANK #{engineer.rank}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: sans, lineHeight: 1.6 }}>
                                {whyRank[engineer.rank]}
                            </div>
                        </div>
                    </div>

                    <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, letterSpacing: '0.08em', marginBottom: '10px' }}>TOP PRS BY COMPLEXITY</div>
                        {engineer.top_prs.map(pr => (
                            <div key={pr.number} style={{ marginBottom: '8px', padding: '8px 10px', background: 'var(--bg-hover)', borderRadius: '8px' }}>
                                <div style={{ fontSize: '12px', color: 'var(--text)', fontFamily: sans, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    #{pr.number} {pr.title}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, marginTop: '2px' }}>
                                    +{pr.additions} -{pr.deletions} · {pr.changedFiles} files
                                </div>
                            </div>
                        ))}

                        <div style={{ marginTop: '12px', padding: '10px 12px', background: 'var(--bg-hover)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: mono, marginBottom: '8px' }}>STATS SUMMARY</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                                {[
                                    { label: 'Total PRs', value: engineer.pr_count },
                                    { label: 'Active weeks', value: engineer.weeks_active },
                                    { label: 'Avg PR size', value: `${engineer.avg_pr_size} lines` },
                                    { label: 'Avg files/PR', value: engineer.avg_files },
                                    { label: 'Stable PRs', value: `${engineer.stable_prs}/${engineer.pr_count}` },
                                    { label: 'PRs/week', value: (engineer.pr_count / Math.max(engineer.weeks_active, 1)).toFixed(1) }
                                ].map(s => (
                                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                                        <span style={{ color: 'var(--text-dim)', fontFamily: sans }}>{s.label}</span>
                                        <span style={{ color: 'var(--text)', fontFamily: mono }}>{s.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ fontSize: '10px', color: 'var(--text-dim)', textAlign: 'right', marginTop: '12px', fontFamily: sans }}>
                {expanded ? '↑ collapse' : '↓ expand for detail'}
            </div>
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
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px 40px', maxWidth: '1100px', margin: '0 auto' }}>

            {/* Header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '10px', color: '#a78bfa', fontFamily: mono, letterSpacing: '0.1em', marginBottom: '6px' }}>// ENGINEERING IMPACT DASHBOARD</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '26px', fontWeight: '700', color: 'var(--text)', letterSpacing: '-0.03em', fontFamily: sans }}>PostHog — Top 5 Engineers</h1>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: sans }}>Last 90 days · Impact = quality + consequence, not activity</p>
                    </div>
                    {data && (
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: mono, textAlign: 'right' }}>
                            <div>{data.total_prs} PRs analyzed</div>
                            <div>posthog/posthog</div>
                        </div>
                    )}
                </div>
            </div>

            {error && (
                <div style={{ background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: '10px', padding: '16px', color: 'var(--red)', fontSize: '14px', fontFamily: sans, marginBottom: '24px' }}>
                    ⚠ {error}
                </div>
            )}

            {!data && !error && (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-dim)', fontFamily: mono, fontSize: '12px' }}>
          // COMPUTING IMPACT SCORES...
                </div>
            )}

            {data && (
                <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                        {data.engineers.map(e => (
                            <EngineerCard
                                key={e.login}
                                engineer={e}
                                expanded={expanded === e.login}
                                onToggle={() => setExpanded(expanded === e.login ? null : e.login)}
                            />
                        ))}
                    </div>

                    {/* Methodology */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '20px' }}>
                        <div style={{ fontSize: '10px', color: '#a78bfa', fontFamily: mono, letterSpacing: '0.1em', marginBottom: '12px' }}>// METHODOLOGY</div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            {[
                                { color: '#a78bfa', label: 'Complexity (35%)', desc: 'Average PR size in lines changed + files touched. Engineers who take on harder work score higher.' },
                                { color: '#3fb950', label: 'Consistency & Volume (30%)', desc: 'PR throughput across active weeks. Sustained contribution beats a single big sprint.' },
                                { color: '#58a6ff', label: 'Sustained Cadence (20%)', desc: 'Ratio of active weeks to total PRs. Engineers who show up consistently over time.' },
                                { color: '#f0883e', label: 'Code Longevity (15%)', desc: 'PRs without hotfix/revert/rollback patterns in the title. Code that stands without immediate fixes.' }
                            ].map(m => (
                                <div key={m.label} style={{ borderLeft: `3px solid ${m.color}`, paddingLeft: '12px' }}>
                                    <div style={{ fontSize: '12px', fontWeight: '600', color: m.color, fontFamily: sans, marginBottom: '4px' }}>{m.label}</div>
                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: sans, lineHeight: 1.6 }}>{m.desc}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '16px', fontFamily: sans, borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                            Each dimension normalized 0–1 across all engineers with ≥3 PRs in the window. Review quality proxied from cadence data — review body content unavailable via GitHub CLI bulk export on large repos. Not measured: raw commit count, lines of code, PR count alone, or additions/deletions in isolation.
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}