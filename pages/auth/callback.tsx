import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../../lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

      if (error) {
        console.error('Auth error:', error.message);
        router.push('/');
      } else {
        console.log('Session:', data.session);
        router.push('/dashboard');
      }
    };

    handleCallback();
  }, [router]);

  return <p>Authentifiziere dich...</p>;
}
