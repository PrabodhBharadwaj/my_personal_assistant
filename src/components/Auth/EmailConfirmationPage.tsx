import React, { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface EmailConfirmationPageProps {
  email: string;
  onBack: () => void;
  onResend: () => Promise<void>;
}

const EmailConfirmationPage: React.FC<EmailConfirmationPageProps> = ({
  email,
  onBack,
  onResend
}) => {
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    
    setIsResending(true);
    setResendMessage('');
    
    try {
      await onResend();
      setResendCountdown(60);
      setResendMessage('Confirmation email sent! Check your inbox.');
    } catch (error) {
      setResendMessage('Failed to send email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="email-confirmation-icon">
            <Mail className="icon" />
          </div>
          <h2 className="auth-title">Check your email</h2>
          <p className="auth-subtitle">
            We've sent a confirmation link to <strong>{email}</strong>
          </p>
        </div>

        <div className="email-confirmation-content">
          <div className="confirmation-steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Check your inbox</h3>
                <p>Look for an email from Personal Assistant</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Click the confirmation link</h3>
                <p>This will verify your account and sign you in</p>
              </div>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Start using your assistant</h3>
                <p>You'll be taken to the welcome screen</p>
              </div>
            </div>
          </div>

          <div className="resend-section">
            <p className="resend-text">
              Didn't receive the email? Check your spam folder or request a new one.
            </p>
            
            <button
              onClick={handleResend}
              disabled={resendCountdown > 0 || isResending}
              className="resend-button"
            >
              {isResending ? (
                <>
                  <div className="loading-spinner"></div>
                  Sending...
                </>
              ) : resendCountdown > 0 ? (
                <>
                  <Clock className="icon" />
                  Resend in {resendCountdown}s
                </>
              ) : (
                <>
                  <Mail className="icon" />
                  Resend confirmation email
                </>
              )}
            </button>

            {resendMessage && (
              <p className={`resend-message ${resendMessage.includes('sent') ? 'success' : 'error'}`}>
                {resendMessage}
              </p>
            )}
          </div>
        </div>

        <div className="auth-actions">
          <button
            onClick={onBack}
            className="auth-button secondary"
          >
            <ArrowLeft className="icon" />
            Back to Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
