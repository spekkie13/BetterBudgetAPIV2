'use client'

import { useState } from 'react'

export default function HomePage() {
    const [logs, setLogs] = useState<string[]>([])

    const log = (msg: string) => setLogs(prev => [msg, ...prev])

    const createPeriod = async () => {
        const startDateStr = "01/07/2025"
        const [startDay, startMonth, StartYear] = startDateStr.split('/').map(Number);
        const startDate = new Date(Date.UTC(StartYear, startMonth - 1, startDay));

        const endDateStr = "31/07/2025"
        const [endDay, endMonth, endYear] = endDateStr.split('/').map(Number);
        const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay));

        const res = await fetch('/api/periods/find-or-create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                startDate,
                endDate,
            }),
        });

        const data = await res.json();
        log(`Created or fetched period: ${JSON.stringify(data)}`);
    };

    const createExpense = async () => {
        const res = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amountCents: -100,
                categoryId: 1,
                createdAt: "2025-08-21T20:16:29.337Z",
                createdBy: 1,
                currency: "EUR",
                deletedAt: null,
                fromAccountID: 10,
                id: 0,
                isTransfer: false,
                memo: "week boodschappen",
                payee: "",
                postedAt: "2025-08-21T20:16:29.337Z",
                teamId: 1,
                // toAccountID: null,
                transferGroupId: null,
                updatedAt: "2025-08-21T20:16:29.337Z"
            }),
        })
        const data = await res.json()
        log(`Created expense: ${JSON.stringify(data)}`)
    }

    const createIncome = async () => {
        const dateStr = "31/07/2025"
        const [Day, Month, Year] = dateStr.split('/').map(Number);
        const date = new Date(Date.UTC(Year, Month - 1, Day));

        const res = await fetch('/api/incomes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: 123.45,
                date: date,
                userId: 1,
            }),
        })
        const data = await res.json()
        log(`Created income: ${JSON.stringify(data)}`)
    }

    const updateResult = async () => {
        const resultId = 85;
        const userId = 2;

        const updatedResult = {
            id: resultId,
            userId: userId,
            categoryId: 15,
            periodId: 5,
            totalSpent: 250.75,
            percentageSpent: 55.8,
        };

        const res = await fetch(`/api/results/${resultId}?id=${resultId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedResult),
        });

        const data = await res.json();
        log(`Updated result: ${JSON.stringify(data)}`);
    };

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">API Test Page</h1>

            <div className="space-x-2">
                <button onClick={createPeriod} className="btn">Create Period</button>
                <button onClick={createExpense} className="btn">Create Expense</button>
                <button onClick={createIncome} className="btn">Create Income</button>
                <button onClick={updateResult} className="btn">Update Result</button>
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
