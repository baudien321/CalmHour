'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client'; // Use client component Supabase client
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage(''); // Clear previous messages

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // emailRedirectTo: `${window.location.origin}/auth/callback`, // Optional: If you have a specific confirmation page
      },
    });

    if (error) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Could not sign up.');
      setMessage(error.message);
    } else {
      // Don't automatically log in, user needs to confirm email
      toast.success('Check your email for the confirmation link!');
      setMessage('Confirmation email sent. Please check your inbox (and spam folder).');
      // Optionally clear form
      setEmail('');
      setPassword('');
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6} // Supabase default minimum
          placeholder="••••••••"
        />
      </div>
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing Up...</>
        ) : (
          'Sign Up'
        )}
      </Button>
      {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>} 
    </form>
  );
} 