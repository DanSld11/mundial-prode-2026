'use client'

import { useState } from 'react'

export default function TestPage() {
  const [result, setResult] = useState('')

  function testCookie() {
    document.cookie = `test-cookie=hello; path=/; max-age=60`
    const cookies = document.cookie
    setResult('Cookie set. All cookies: ' + cookies)
  }

  async function testLogin() {
    try {
      const res = await fetch('https://anbfhgkaaaqvjeiwtojp.supabase.co/auth/v1/token?grant_type=password', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuYmZoZ2thYWFxdmplaXd0b2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjg1OTksImV4cCI6MjA5NDcwNDU5OX0.rsfIrfuYdpLxdR2OlfU0k4Ddf0h4sHmyM6Nj48IDSlc',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'admin@prode.com', password: 'admin123' }),
      })
      const data = await res.json()
      setResult('Status: ' + res.status + ' | access_token: ' + (data.access_token ? 'OK (' + data.access_token.substring(0, 20) + '...)' : 'NONE') + ' | error: ' + (data.error || 'none'))
    } catch (e: any) {
      setResult('ERROR: ' + e.message)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="space-y-4 text-center">
        <button onClick={testCookie} className="bg-green-500 px-4 py-2 rounded">Test Cookie</button>
        <button onClick={testLogin} className="bg-red-500 px-4 py-2 rounded">Test Login API</button>
        <pre className="text-sm text-green-400 max-w-md">{result}</pre>
      </div>
    </div>
  )
}
