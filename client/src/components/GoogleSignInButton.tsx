import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
  onError?: (errorMessage: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  text = 'continue_with'
}) => {
  const { googleLogin } = useAuth();
  const [authenticating, setAuthenticating] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      const err = 'Google did not return credentials. Please try again.';
      setInternalError(err);
      if (onError) onError(err);
      return;
    }

    setAuthenticating(true);
    setInternalError(null);

    try {
      // Send genuine Google ID token to backend for cryptographic verification
      await googleLogin(credentialResponse.credential);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const message = err.message || 'Google authentication failed. Please verify your connection.';
      setInternalError(message);
      if (onError) onError(message);
    } finally {
      setAuthenticating(false);
    }
  };

  const handleGoogleFailure = () => {
    const err = 'Google Sign-In was cancelled or failed to initialize.';
    setInternalError(err);
    if (onError) onError(err);
  };

  if (!clientId || clientId.trim() === '' || clientId.includes('your_google_client_id')) {
    return (
      <div className="w-full text-center">
        <div className="w-full py-2.5 px-3 rounded-full bg-white/10 border border-amber-400/40 text-amber-200 text-[11px] flex items-center justify-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span className="truncate">Setup: Add <strong>VITE_GOOGLE_CLIENT_ID</strong> in .env</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {authenticating ? (
        <div className="w-full py-2.5 px-4 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center gap-2 text-white text-xs font-semibold animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
          <span>Verifying with Google...</span>
        </div>
      ) : (
        <div className="w-full flex justify-center [&>div]:w-full [&>div>div]:!w-full [&>div>div]:!justify-center overflow-hidden rounded-full shadow-md hover:shadow-lg transition">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            text={text}
            theme="outline"
            size="large"
            shape="pill"
            width="100%"
            useOneTap={false}
          />
        </div>
      )}

      {internalError && (
        <p className="mt-2 text-[11px] text-rose-300 text-center font-medium">
          {internalError}
        </p>
      )}
    </div>
  );
};
