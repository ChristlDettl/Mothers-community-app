import { useState } from "react"
import Head from "next/head"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Home() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: "https://mothers-community-app.vercel.app/auth/callback",
      },
    })

    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert("Schau in dein Postfach für den Login-Link!")
    }
  }

  return (
    <>
      <Head>
        <title>Mütter-Community</title>
        <meta name="description" content="Login für die Mütter-Community" />
        <link rel="icon" href="/favicon.ico" />
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
          <button type="submit" disabled={loading}>
            {loading ? "Wird gesendet..." : "Login"}
          </button>
        </form>
      </div>
    </>
  )
}

