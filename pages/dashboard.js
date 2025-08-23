import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        // Kein User eingeloggt → zurück zum Login
        router.push('/')
      } else {
        setUser(data.user)
      }

      setLoading(false)
    }

    loadUser()
  }, [router])

  if (loading) return <p>Lade...</p>

  return (
    <div style={{ padding: 20 }}>
      <h1>Willkommen im Dashboard 🎉</h1>
      <p>Eingeloggt als: {user?.email}</p>
      <button
        onClick={async () => {
          await supabase.auth.signOut()
          router.push('/')
        }}
      >
        Logout
      </button>
    </div>
  )
}
