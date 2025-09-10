import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import Head from 'next/head'

export default function Home() {
  const [email, setEmail] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'https://mothers-community-app.vercel.app/auth/callback',
      },
    })

    if (error) {
      alert(error.message)
    } else {
      alert('Schau in dein Postfach für den Login-Link!')
    }
  }

  return (
    <>
      <Head>
        <title>Mütter-Community</title>
      </Head>
      <div style={{ padding: 20 }}>
        <h1>Mütter-Community</h1>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </>
  )
}
