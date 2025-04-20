import SignUpForm from '@/components/signup-form';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md rounded border p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Create Account</h1>
        <SignUpForm />
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
} 