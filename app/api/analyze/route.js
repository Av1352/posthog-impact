import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'
import { computeScores } from '@/lib/score'

export async function GET() {
    try {
        const filePath = join(process.cwd(), 'data', 'posthog_prs_90days.json')
        const raw = readFileSync(filePath, 'utf-8').replace(/^\uFEFF/, '')
        const prs = JSON.parse(raw)
        const SINCE = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        const filtered = prs.filter(pr => pr.mergedAt && new Date(pr.mergedAt) > SINCE)
        const top5 = computeScores(filtered)
        return NextResponse.json({ engineers: top5, total_prs: filtered.length })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}