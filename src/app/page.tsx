'use client'

import { useState } from 'react'

export default function HomePage() {
    const [logs, setLogs] = useState<string[]>([])

    const log = (msg: string) => setLogs(prev => [msg, ...prev])

    const createExpense = async () => {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 1636c757-0ecc-46df-a415-5f3859d65d87'
            },
            body: JSON.stringify({
                accountId: 10,
                amountCents: 150,
                categoryId: 1,
                createdBy: 1,
                currency: "EUR",
                memo: "Jumbo",
                postedAt: "2025-11-07T00:00:00.000Z",
                transactionType: "expense"
            }),
        })
        const data = await res.json()
        log(`Created expense: ${JSON.stringify(data)}`)
    }

    // const createCategory = async () => {
    //     const res = await fetch('/api/categories', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Authorization': 'Bearer 1636c757-0ecc-46df-a415-5f3859d65d87'
    //         },
    //         body: JSON.stringify({
    //             teamId: 1,
    //             name: 'Test Category',
    //             type: 'expense',
    //             color: 'blue',
    //             icon: 'test tube',
    //         }),
    //     })
    //     const data = await res.json()
    //     log(`Created category: ${JSON.stringify(data)}`)
    // }

    const getCategories = async () => {
        const res = await fetch('/api/categories', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 1636c757-0ecc-46df-a415-5f3859d65d87'
            }
        })
        const data = await res.json()
        log(`Categories: ${JSON.stringify(data)}`)
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

    const updateCategoryAndBudget = async () => {
        let res = await fetch(`/api/budgets?id=2&teamId=1`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                teamId: 1,
                categoryId: 1,
                periodMonth: '2025-10',
                amountCents: 100000,
                rollover: false
            }),
        })
        let data = await res.json()
        log(`Created budget: ${JSON.stringify(data)}`)
    }

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">API Test Page</h1>

            <div className="space-x-2">
                <button onClick={createExpense} className="btn">Create Expense</button>
                <button onClick={getCategories} className="btn">Get Categories</button>
                <button onClick={createBudget} className="btn">Create Budget</button>
                <button onClick={updateCategoryAndBudget} className="btn">Update Budget</button>
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
