'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    
    // Simuleer een kleine vertraging voor betere UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simpele login check (in echte app zou je dit via een API doen)
    if (username === 'admin' && password === 'admin123') {
      // Save login state to localStorage
      localStorage.setItem('isLoggedIn', 'true');
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      setLoginError('Ongeldige gebruikersnaam of wachtwoord');
    }
    
    setIsLoggingIn(false);
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-8 relative radial-gradient">
        <div className="max-w-md w-full relative z-10">
          <div className="glass-card rounded-xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Admin Login
              </h1>
              <p className="text-white">
                Log in om toegang te krijgen tot het toernooi dashboard
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="floating-label-input">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 rounded-lg"
                  required
                />
                <label 
                  htmlFor="username" 
                  className={`floating-label ${username ? 'floating-label-active' : ''}`}
                >
                  Username
                </label>
              </div>

              <div className="floating-label-input">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 rounded-lg"
                  required
                />
                <label 
                  htmlFor="password" 
                  className={`floating-label ${password ? 'floating-label-active' : ''}`}
                >
                  Password
                </label>
              </div>

              {loginError && (
                <div className="text-red-400 text-sm text-center">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-white text-[#1A2335] py-3 px-6 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoggingIn ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Bezig met inloggen...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>Log In</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-white/20 text-center text-sm">
              <button
                type="button"
                onClick={() => setShowDemoCredentials(!showDemoCredentials)}
                className="w-full flex items-center justify-center space-x-2 text-white hover:text-white/80 transition-colors"
              >
                <span className="font-medium">Demo Credentials</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${showDemoCredentials ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showDemoCredentials && (
                <div className="mt-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-white">Username: admin</p>
                  <p className="text-white">Password: admin123</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

