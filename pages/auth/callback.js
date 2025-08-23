import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    async function handleAuth() {
      // 1. Tausche den Code aus der URL gegen eine Session ein
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)

      if (error) {
        console.error('Auth error:', error.message)
        router.push('/?error=auth')
      } else {
        // 2. Jetzt ist die Session gesetzt → weiter ins Dashboard
        router.push('/dashboard')
      }
    }

    handleAuth()
  }, [router])

  return <p>Login wird verarbeitet...</p>
}


