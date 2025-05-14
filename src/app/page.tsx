'use client'

import { useEffect, useState } from 'react'
import useSWR from 'swr'
import Image from 'next/image'
import { User } from '@/models/user'

// 1. Create a fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function Home() {
    const [msg, setMsg] = useState<string | null>(null)

    // 2. Use SWR to fetch data
    const { data: users, error, mutate } = useSWR<User[]>(
        '/api [old]/user?email=tspek9@gmail.com',
        fetcher
    )

    useEffect(() => {
        if (users && users.length === 0) {
            setMsg('No teams found with that name.')
        }
    }, [users])

    return (
        <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <Image
                    className="dark:invert"
                    src="/next.svg"
                    alt="Next.js logo"
                    width={180}
                    height={38}
                    priority
                />

                {error && (
                    <p className="text-red-600 text-sm">❌ Failed to load user data.</p>
                )}
                {!users && !error && <p className="text-sm">Loading user info…</p>}

                {msg && <p className="text-yellow-600">{msg}</p>}

                {users && users.length > 0 && (
                    <div className="text-left">
                        <h2 className="text-xl font-semibold mb-2">User Info:</h2>
                        <pre className="bg-gray-100 text-black p-2 rounded text-sm">
              {JSON.stringify(users, null, 2)}
            </pre>
                    </div>
                )}
            </main>

            <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
                {/* ... your footer content */}
            </footer>
        </div>
    )
}
