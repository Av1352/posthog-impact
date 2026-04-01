export function computeScores(prs) {
    const engineers = {}

    for (const pr of prs) {
        const author = pr.author?.login || pr.author
        if (!author || author === 'ghost') continue

        if (!engineers[author]) {
            engineers[author] = {
                login: author,
                prs: [],
                weeks_active: new Set()
            }
        }

        const e = engineers[author]
        const week = pr.mergedAt ? pr.mergedAt.slice(0, 7) : ''
        if (week) e.weeks_active.add(week)

        e.prs.push({
            number: pr.number,
            title: pr.title || '',
            additions: pr.additions || 0,
            deletions: pr.deletions || 0,
            changedFiles: pr.changedFiles || 0,
            mergedAt: pr.mergedAt,
            isHotfix: /(hotfix|revert|rollback|fix:)/i.test(pr.title || '')
        })
    }

    const MIN_PRS = 3
    const eligible = Object.values(engineers).filter(e => e.prs.length >= MIN_PRS)

    const raw = eligible.map(e => {
        // Complexity — PR size + file count
        const avgSize = e.prs.reduce((s, p) => s + p.additions + p.deletions, 0) / e.prs.length
        const avgFiles = e.prs.reduce((s, p) => s + p.changedFiles, 0) / e.prs.length
        const complexity_raw = Math.log1p(avgSize) * 0.6 + Math.log1p(avgFiles) * 0.4

        // Consistency — active weeks + PR throughput
        const consistency = e.weeks_active.size
        const collaboration_raw = Math.log1p(e.prs.length) * 1.5 + Math.log1p(consistency) * 2

        // Review breadth proxy — ratio of weeks active to PRs (sustained vs bursty)
        const review_quality_raw = consistency > 0
            ? consistency / Math.max(1, e.prs.length)
            : 0

        // Longevity — PRs without hotfix patterns
        const stablePRs = e.prs.filter(p => !p.isHotfix).length
        const longevity_raw = e.prs.length > 0 ? stablePRs / e.prs.length : 0

        const topPRs = [...e.prs]
            .sort((a, b) => (b.additions + b.deletions) - (a.additions + a.deletions))
            .slice(0, 3)

        return {
            login: e.login,
            pr_count: e.prs.length,
            weeks_active: e.weeks_active.size,
            avg_pr_size: Math.round(avgSize),
            avg_files: Math.round(avgFiles * 10) / 10,
            stable_prs: stablePRs,
            top_prs: topPRs,
            complexity_raw,
            collaboration_raw,
            review_quality_raw,
            longevity_raw
        }
    })

    function normalize(arr, key) {
        const vals = arr.map(e => e[key])
        const min = Math.min(...vals)
        const max = Math.max(...vals)
        const scoreKey = key.replace('_raw', '_score')
        return arr.map(e => ({
            ...e,
            [scoreKey]: max === min ? 0.5 : (e[key] - min) / (max - min)
        }))
    }

    let scored = normalize(raw, 'complexity_raw')
    scored = normalize(scored, 'collaboration_raw')
    scored = normalize(scored, 'review_quality_raw')
    scored = normalize(scored, 'longevity_raw')

    scored = scored.map(e => ({
        ...e,
        impact_score:
            e.complexity_score * 0.35 +
            e.collaboration_score * 0.30 +
            e.review_quality_score * 0.20 +
            e.longevity_score * 0.15
    }))

    return scored
        .sort((a, b) => b.impact_score - a.impact_score)
        .slice(0, 5)
        .map((e, i) => ({ ...e, rank: i + 1 }))
}