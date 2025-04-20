'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const supabase = createClient();

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Login error:', signInError);
      let errorMessage = signInError.message;
      if (signInError.message.includes('Email not confirmed')) {
          errorMessage = 'Please confirm your email address first. Check your inbox for the confirmation link.';
      }
      toast.error(errorMessage);
      setError(errorMessage);
      setIsLoading(false);
    } else {
      toast.success('Logged in successfully!');
      router.refresh();
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Ensure this matches what's in Google Cloud Console if you set one
        // redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('Google login error:', error);
      toast.error(error.message || 'Could not log in with Google.');
      setError(error.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin} className="space-y-4">
        {error && <p className="text-center text-sm text-red-600">{error}</p>} 
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="relative">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <Button 
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-6 h-7 w-7"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} 
          </Button>
        </div>
        <Button type="submit" disabled={isLoading || isGoogleLoading} className="w-full">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging In...</>
          ) : (
            'Log In with Email'
          )}
        </Button>
      </form>

      <Button 
        id="google-login-button" 
        onClick={handleGoogleLogin}
        disabled={isLoading || isGoogleLoading}
        className="hidden"
      >
        {isGoogleLoading ? 'Processing Google Login...' : 'Login with Google'}
      </Button>
    </>
  );
} 