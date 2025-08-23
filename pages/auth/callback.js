
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Auth error:', error.message)
          alert('Authentifizierungsfehler: ' + error.message)
          router.push('/')
          return
        }

        if (data.session) {
          // User is authenticated, redirect to dashboard or main app
          router.push('/dashboard')
        } else {
          // No session found, redirect back to login
          router.push('/')
        }
      } catch (error) {
        console.error('Unexpected error:', error)
        router.push('/')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>Authentifizierung läuft...</h2>
      <p>Du wirst weitergeleitet...</p>
    </div>
  )
}
