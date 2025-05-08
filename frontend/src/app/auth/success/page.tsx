'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const idToken = searchParams.get('id_token');



    if (accessToken && idToken) {
      console.log('Storing tokens...'); // Optional: for debugging
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('id_token', idToken);

      // Redirect to the home page or dashboard after storing tokens
      router.push('/dashboard');
    } else {
      // Handle the case where tokens are missing
      console.error('Authentication tokens not found in URL');
      // Optionally redirect to a login failed page or show an error message
      // router.push('/login'); // Redirect back to login for simplicity
    }
  }, [router, searchParams]); // Dependencies for the effect

  // Render a loading state or null while processing
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080b15]">
      <p className="text-white">Processing authentication...</p>
      {/* You could add a spinner here */}
    </div>
  );
} 