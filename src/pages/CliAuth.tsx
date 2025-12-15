/**
 * CLI Authentication Page
 * 
 * This page handles OAuth login for the VFX.sh CLI client.
 * It authenticates the user via Clerk and redirects the session token
 * back to the local CLI callback server.
 */

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';

export default function CliAuth() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'authenticating' | 'redirecting' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  
  const callback = searchParams.get('callback');

  useEffect(() => {
    async function handleAuth() {
      if (!isLoaded) return;
      
      // If not signed in, redirect to sign-in
      if (!isSignedIn) {
        setStatus('authenticating');
        // Store callback URL in sessionStorage so we can get it after login
        if (callback) {
          sessionStorage.setItem('cli_auth_callback', callback);
        }
        // Redirect to sign-in with return URL back to this page
        navigate('/sign-in?redirect_url=/cli-auth');
        return;
      }
      
      // User is signed in, get long-lived CLI token from API
      try {
        // Retrieve callback from params or sessionStorage (if returning from sign-in)
        const callbackUrl = callback || sessionStorage.getItem('cli_auth_callback');
        sessionStorage.removeItem('cli_auth_callback');
        
        if (!callbackUrl) {
          setError('No callback URL provided. Please try logging in from the CLI again.');
          setStatus('error');
          return;
        }
        
        setStatus('redirecting');
        
        // Get short-lived session token for API call
        const sessionToken = await getToken();
        
        if (!sessionToken) {
          setError('Failed to get authentication token');
          setStatus('error');
          return;
        }

        // Exchange session token for long-lived CLI token
        let cliToken = sessionToken; // Fallback to session token if API fails
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://api.vfx.sh'}/cli/token`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sessionToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json();
            cliToken = data.token;
            console.log('Got long-lived CLI token, expires:', new Date(data.expires_at * 1000).toISOString());
          } else {
            console.warn('Failed to get long-lived token, using session token');
          }
        } catch (err) {
          console.warn('CLI token API error, using session token:', err);
        }
        
        // Redirect to CLI callback with token
        const redirectUrl = `${callbackUrl}?token=${encodeURIComponent(cliToken)}`;
        console.log('Redirecting to CLI callback:', redirectUrl.substring(0, 50) + '...');
        
        window.location.href = redirectUrl;
        
      } catch (err) {
        console.error('Auth error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setStatus('error');
      }
    }
    
    handleAuth();
  }, [isLoaded, isSignedIn, callback, getToken, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
            VFX.sh CLI Authentication
          </h1>
        </div>
        
        {status === 'loading' && (
          <div className="text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        )}
        
        {status === 'authenticating' && (
          <div className="text-gray-600 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p>Redirecting to sign in...</p>
          </div>
        )}
        
        {status === 'redirecting' && (
          <div className="text-green-600 dark:text-green-400">
            <div className="animate-pulse">
              <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-medium">Authentication successful!</p>
            <p className="text-sm mt-2">Redirecting back to CLI...</p>
            {user && (
              <p className="text-xs mt-4 text-gray-500">
                Signed in as {user.primaryEmailAddress?.emailAddress}
              </p>
            )}
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-red-600 dark:text-red-400">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">Authentication failed</p>
            <p className="text-sm mt-2">{error}</p>
            <button
              onClick={() => navigate('/sign-in?redirect_url=/cli-auth')}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Try Again
            </button>
          </div>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-8">
          This window will close automatically after authentication.
        </p>
      </div>
    </div>
  );
}
