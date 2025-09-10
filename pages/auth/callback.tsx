import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

export default function Callback() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      // Session aus URL abholen
      const { data, error } = await supabase.auth.exchangeCodeForSession(location.href)

      if (error) {
        console.error('Auth error:', error.message)
        alert('Fehler bei der Anmeldung.')
        router.push('/') // zurück zum Login
      } else {
        console.log('Login erfolgreich:', data)
        router.push('/dashboard') // weiter zum Dashboard
      }
    }

    handleCallback()
  }, [router])

  return <p>Authentifiziere dich...</p>
}

