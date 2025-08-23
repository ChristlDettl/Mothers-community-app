import { supabase } from '../lib/supabaseClient'

async function sendMagicLink(email) {
  const { error } = await supabase.auth.signIn(
    { email: email },
    { redirectTo: 'https://mothers-community-app.vercel.app/auth/callback' }
  )

  if (error) {
    console.error('Error sending magic link:', error.message)
  } else {
    alert('Magic-Link wurde verschickt. Bitte Mail öffnen!')
  }
}
