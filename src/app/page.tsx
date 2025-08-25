'use client'

import { useState } from 'react'

export default function HomePage() {
    const [logs, setLogs] = useState<string[]>([])

    const log = (msg: string) => setLogs(prev => [msg, ...prev])

    const createCategory = async () => {
        const res = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teamId: 1,
                name: 'Test',
                type: 'expense',
                icon: '1',
                color: 'blue',
                parentId: null
            }),
        })
        const data = await res.json()
        log(`Created expense: ${JSON.stringify(data)}`)
    }

    const createBudget = async () => {
        const res = await fetch('/api/budgets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: 0,
                teamId: 1,
                categoryId: 1,
                periodMonth: '2025-09',
                amountCents: 100000,
                rollover: false
            }),
        })
        const data = await res.json()
        log(`Created expense: ${JSON.stringify(data)}`)
    }

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">API Test Page</h1>

            <div className="space-x-2">
                <button onClick={createCategory} className="btn">Create Category</button>
                <button onClick={createBudget} className="btn">Create Budget</button>
            </div>

            <div className="mt-8">
                <h2 className="font-semibold">Logs:</h2>
                <pre className="bg-gray-100 text-black p-4 max-h-[300px] overflow-auto text-sm">
          {logs.join('\n\n')}
        </pre>
            </div>
        </div>
    )
}
