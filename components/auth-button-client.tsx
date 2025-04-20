'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import type { User } from '@supabase/supabase-js';

export default function AuthButtonClient() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setLoading(false);
        // Keep redirection logic
        if (event === 'SIGNED_OUT') {
            router.push('/');
            router.refresh();
        } else if (event === 'SIGNED_IN' && window.location.pathname !== '/dashboard') {
            router.push('/dashboard');
            router.refresh();
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    // Listener handles state update and redirect
    // No need to setLoading(false) here if redirecting via listener
  };

  if (loading) {
    // Revert to simple loading button
    return <Button disabled variant="outline" size="sm">Loading...</Button>; 
  }

  if (user) {
    // Revert to showing email and simple logout button
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 hidden sm:inline">{user.email}</span>
        <Button onClick={handleLogout} variant="outline" size="sm" disabled={loading}>
          Logout
        </Button>
      </div>
    );
  }

  // Logged-out state: Revert to only Login button
  return (
    <div className="flex items-center gap-2">
      <Button asChild size="sm"> 
         <Link href="/login">Login</Link>
      </Button>
    </div>
  );
} 