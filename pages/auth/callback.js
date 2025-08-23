import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    async function handleAuth() {
      // Tausche Code/Token aus der URL gegen Session
      const { error } = await supabase.auth.exchangeCodeForSession(window.location.href)

      if (error) {
        console.error('Auth error:', error.message)
        router.push('/')
      } else {
        router.push('/dashboard')
      }
    }

    handleAuth()
  }, [router])

  return <p>Login wird verarbeitet...</p>
}
