'use client';

import LoginForm from '@/components/login-form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded border p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Log In</h1>
        
        <LoginForm /> 

        <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-neutral-300 after:mt-0.5 after:flex-1 after:border-t after:border-neutral-300 dark:before:border-neutral-500 dark:after:border-neutral-500">
          <p className="mx-4 mb-0 text-center font-semibold dark:text-neutral-200">
            OR
          </p>
        </div>

        <Button variant="outline" className="w-full" onClick={() => document.getElementById('google-login-button')?.click()}> 
          <FcGoogle className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>
        
        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
} 