import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data?.user) {
        router.push('/') // nicht eingeloggt → zurück zum Login
      } else {
        setUser(data.user)
      }
    }
    fetchUser()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Willkommen im Dashboard</h1>
      {user && <p>Eingeloggt als: {user.email}</p>}
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
}


