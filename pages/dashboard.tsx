
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data, error }) => {
      if (data?.user) {
        setUser(data.user)
      }
    })
  }, [])

  if (!user) {
    return <p>Bitte zuerst einloggen.</p>
  }

  return (
    <div>
      <h1>Willkommen 🎉</h1>
      <p>Eingeloggt als {user.email}</p>
      <button onClick={() => supabase.auth.signOut()}>Logout</button>
    </div>
  )
}
