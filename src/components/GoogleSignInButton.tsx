'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/Toast';

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleSignInButton({ redirect }: { redirect?: string | null }) {
  const router = useRouter();
  const { showToast } = useToast();
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function initGoogle() {
      if (!window.google || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          try {
            await apiFetch('/api/auth/google', {
              method: 'POST',
              body: JSON.stringify({ idToken: response.credential }),
            });
            router.replace(redirect || '/dashboard');
          } catch (err: any) {
            showToast(err.message || 'Google sign-in failed', 'error');
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      });
    }

    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initGoogle();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [redirect, router, showToast]);

  return <div ref={buttonRef} className="flex justify-center" />;
}