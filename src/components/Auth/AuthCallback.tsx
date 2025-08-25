import React, { useEffect, useState } from 'react';
import { supabase } from '../../config/supabase';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

interface AuthCallbackProps {
  onSuccess: () => void;
  onError: (message: string) => void;
}

const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus('loading');
        setMessage('Confirming your account...');

        // Get the current URL and extract the auth parameters
        const url = new URL(window.location.href);
        const hash = url.hash.substring(1); // Remove the # symbol
        
        // Parse the hash parameters
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');

        if (type === 'signup' && accessToken && refreshToken) {
          // Set the session manually
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }

          if (data.session) {
            setStatus('success');
            setMessage('Account confirmed successfully! Redirecting...');
            
            // Wait a moment to show success message, then redirect
            setTimeout(() => {
              onSuccess();
            }, 1500);
          } else {
            throw new Error('No session created');
          }
        } else {
          throw new Error('Invalid confirmation link');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        setStatus('error');
        
        if (error.message.includes('expired')) {
          setMessage('This confirmation link has expired. Please request a new one.');
        } else if (error.message.includes('already confirmed')) {
          setMessage('Your account is already confirmed. You can now sign in.');
        } else {
          setMessage('Something went wrong. Please try again or contact support.');
        }
        
        // Call onError after a delay to show the error message
        setTimeout(() => {
          onError(message);
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [onSuccess, onError]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          {status === 'loading' && (
            <div className="callback-icon loading">
              <Loader className="icon spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="callback-icon success">
              <CheckCircle className="icon" />
            </div>
          )}
          {status === 'error' && (
            <div className="callback-icon error">
              <XCircle className="icon" />
            </div>
          )}
          
          <h2 className="auth-title">
            {status === 'loading' && 'Confirming Account'}
            {status === 'success' && 'Account Confirmed!'}
            {status === 'error' && 'Confirmation Failed'}
          </h2>
          
          <p className="auth-subtitle">
            {message}
          </p>
        </div>

        {status === 'loading' && (
          <div className="callback-content">
            <div className="loading-animation">
              <div className="loading-spinner large"></div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="callback-content">
            <div className="error-actions">
              <button
                onClick={() => window.location.href = '/'}
                className="auth-button primary"
              >
                Go to Sign Up
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
