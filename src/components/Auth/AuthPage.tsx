import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, CheckCircle } from 'lucide-react';
import EmailConfirmationPage from './EmailConfirmationPage';
import { supabase } from '../../config/supabase';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [passwordStrength, setPasswordStrength] = useState<string[]>([]);

  const { user, signUp, signIn, resetPassword, validatePassword } = useAuth();

  const handleResendConfirmation = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingEmail,
      });
      
      if (error) {
        throw error;
      }
      
      return Promise.resolve();
    } catch (error: any) {
      return Promise.reject(error);
    }
  };



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear specific error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time password validation for signup
    if (name === 'password' && !isLogin) {
      const validationErrors = validatePassword(value);
      setPasswordStrength(validationErrors);
    }

    // Confirm password validation
    if (name === 'confirmPassword' && !isLogin) {
      if (value && value !== formData.password) {
        setErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          confirmPassword: ''
        }));
      }
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin) {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = 'Password does not meet requirements';
      }
    }

    // Confirm password validation (signup only)
    if (!isLogin) {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setErrors({ general: 'Invalid email or password. Please try again.' });
          } else if (error.message.includes('Email not confirmed')) {
            setErrors({ general: 'Please confirm your email address before signing in.' });
          } else {
            setErrors({ general: error.message });
          }
        }
      } else {
        const { data, error } = await signUp(formData.email, formData.password);
        if (error) {
          if (error.message.includes('User already registered')) {
            setErrors({ email: 'An account with this email already exists. Try signing in instead.' });
          } else {
            setErrors({ general: error.message });
          }
        } else if (data?.user) {
          // User was created successfully, show email confirmation page
          console.log('User created successfully:', data.user);
          setPendingEmail(formData.email);
          setShowEmailConfirmation(true);
        } else {
          // Handle case where signup succeeded but no user data
          setErrors({ general: 'Account created but unable to sign you in. Please try signing in manually.' });
        }
      }
    } catch (error) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      setErrors({ email: 'Please enter your email address' });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const { error } = await resetPassword(formData.email);
      if (error) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Password reset email sent! Check your inbox.' });
      }
    } catch (error) {
      setErrors({ general: 'Failed to send reset email. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '' });
    setErrors({});
    setPasswordStrength([]);
    setShowForgotPassword(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };



  if (showEmailConfirmation) {
    return (
      <EmailConfirmationPage
        email={pendingEmail}
        onBack={() => setShowEmailConfirmation(false)}
        onResend={handleResendConfirmation}
      />
    );
  }

  if (showForgotPassword) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2 className="auth-title">Reset your password</h2>
            <p className="auth-subtitle">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form className="auth-form" onSubmit={handleForgotPassword}>
            <div className="form-group">
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="auth-input"
                  placeholder="Email address"
                />
              </div>
              {errors.email && (
                <p className="error-message">{errors.email}</p>
              )}
            </div>

            {errors.general && (
              <div className="auth-message">
                <p className={errors.general.includes('sent') ? 'success-message' : 'error-message'}>
                  {errors.general}
                </p>
              </div>
            )}

            <div className="auth-actions">
              <button
                type="submit"
                disabled={isLoading}
                className="auth-button primary"
              >
                {isLoading ? 'Sending...' : 'Send Reset Email'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="auth-button secondary"
              >
                Back to Sign In
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">Personal Assistant</h2>
          <p className="auth-subtitle">Capture thoughts, get daily plans</p>
        </div>

        {/* Tab Navigation */}
        <div className="auth-tabs">
          <button
            onClick={() => {
              if (!isLogin) switchMode();
            }}
            className={`auth-tab ${isLogin ? 'active' : ''}`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              if (isLogin) switchMode();
            }}
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
          >
            Sign Up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {errors.general && (
            <div className="auth-message">
              <p className="error-message">{errors.general}</p>
            </div>
          )}

          <div className="form-fields">
            {/* Email Field */}
            <div className="form-group">
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="auth-input"
                  placeholder="Email address"
                />
              </div>
              {errors.email && (
                <p className="error-message">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="auth-input"
                  placeholder="Password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="error-message">{errors.password}</p>
              )}
              
              {/* Password Requirements (Sign Up Only) */}
              {!isLogin && formData.password && (
                <div className="password-requirements">
                  <p className="requirements-title">Password must include:</p>
                  {[
                    'At least 8 characters long',
                    'At least one uppercase letter',
                    'At least one lowercase letter',
                    'At least one number',
                    'At least one special character'
                  ].map((requirement, index) => (
                    <div key={index} className="requirement-item">
                      <CheckCircle 
                        className={`requirement-icon ${
                          !passwordStrength.includes(requirement)
                            ? 'met' 
                            : 'unmet'
                        }`} 
                      />
                      <span 
                        className={`requirement-text ${
                          !passwordStrength.includes(requirement)
                            ? 'met' 
                            : 'unmet'
                        }`}
                      >
                        {requirement}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field (Sign Up Only) */}
            {!isLogin && (
              <div className="form-group">
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="auth-input"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="error-message">{errors.confirmPassword}</p>
                )}
              </div>
            )}
          </div>

          {/* Forgot Password Link (Sign In Only) */}
          {isLogin && (
            <div className="forgot-password">
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="forgot-password-link"
              >
                Forgot your password?
              </button>
            </div>
          )}

          <div className="submit-section">
            <button
              type="submit"
              disabled={isLoading}
              className="auth-button primary full-width"
            >
              {isLoading ? (
                <div className="loading-content">
                  <div className="loading-spinner"></div>
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                isLogin ? 'Sign in' : 'Create account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface WelcomeMessageProps {
  onContinue: () => void;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ onContinue }) => {
  return (
    <div className="auth-container">
      <div className="auth-card welcome-card">
        <div className="welcome-header">
          <CheckCircle className="welcome-icon" />
        </div>
        
        <h2 className="welcome-title">
          Welcome to Personal Assistant!
        </h2>
        
        <p className="welcome-subtitle">
          Your account has been created successfully. Here's what you can do:
        </p>
        
        <div className="welcome-features">
          <div className="feature-item">
            <CheckCircle className="feature-icon" />
            <div>
              <h3 className="feature-title">Capture Anything</h3>
              <p className="feature-description">
                Use voice input or text to capture thoughts, tasks, and ideas with smart hashtag organization
              </p>
            </div>
          </div>
          
          <div className="feature-item">
            <CheckCircle className="feature-icon" />
            <div>
              <h3 className="feature-title">AI-Powered Planning</h3>
              <p className="feature-description">
                Get intelligent daily plans with commands like "plan my day" using customizable AI behavior
              </p>
            </div>
          </div>
          
          <div className="feature-item">
            <CheckCircle className="feature-icon" />
            <div>
              <h3 className="feature-title">Cross-Device Sync</h3>
              <p className="feature-description">
                Access your data anywhere with real-time sync, bulk operations, and smart organization tools
              </p>
            </div>
          </div>
        </div>
        
        <button
          onClick={onContinue}
          className="auth-button primary full-width"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
