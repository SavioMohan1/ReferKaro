'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles } from 'lucide-react'

export default function PoolRankingPanel({ jobId, candidateCount, poolSize, run }: { jobId: string; candidateCount: number; poolSize: number; run: any }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const canRank = candidateCount >= poolSize && (!run || run.run_number < 2)

    const runRanking = async () => {
        setLoading(true); setError('')
        const response = await fetch('/api/ai/rank-pool', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jobId }) })
        const data = await response.json()
        if (!response.ok) setError(data.error || 'Ranking could not be completed.')
        else router.refresh()
        setLoading(false)
    }

    return <aside className="rk-ai-review">
        <div><span><Sparkles size={14} /> AI pool ranking</span><strong>{run ? `Run ${run.run_number} of 2` : 'Not run'}</strong></div>
        <p>{run ? 'Candidate cards show the latest evidence-based ranking. This is guidance only; you make the referral decision.' : candidateCount < poolSize ? `Ranking starts when the pool reaches ${poolSize} resumes.` : 'The pool is full. The automatic run is being prepared; you can also start it here.'}</p>
        {canRank && <button type="button" className="rk-button rk-button-secondary" disabled={loading} onClick={runRanking}>{loading ? 'Ranking resumes...' : run ? 'Use final rerun' : 'Rank this pool'}</button>}
        {error && <small role="alert">{error}</small>}
    </aside>
}
