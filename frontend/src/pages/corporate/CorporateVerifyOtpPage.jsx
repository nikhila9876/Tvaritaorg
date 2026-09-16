import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { corporateApi } from '../../api/corporate';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CorporateVerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuthenticatedUser } = useAuth();
  const toast = useToast();

  // Retrieve state or fallback to session storage
  const stateData = location.state || {};
  const [signupData, setSignupData] = useState(() => {
    if (stateData.signupData) return stateData.signupData;
    try {
      const raw = sessionStorage.getItem('tvarita_pending_corporate_otp');
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      email: 'corporate@company.com',
      name: 'Corporate Partner',
      companyName: 'Partner Enterprise',
      orgId: 'ORG-2026',
    };
  });

  const returnTo = stateData.returnTo || sessionStorage.getItem('tvarita_corporate_return_to') || '/corporate/dashboard';

  // 6 digit inputs
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);

  // States
  const [timer, setTimer] = useState(60);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const isExpired = timer <= 0;

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle individual digit entry
  const handleDigitChange = (index, value) => {
    // Only digits
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...digits];
      updated[index] = '';
      setDigits(updated);
      return;
    }

    // Handle paste of full 6-digit code
    if (cleaned.length >= 6) {
      const pasteDigits = cleaned.slice(0, 6).split('');
      setDigits(pasteDigits);
      inputRefs.current[5]?.focus();
      return;
    }

    const updated = [...digits];
    updated[index] = cleaned[cleaned.length - 1]; // take last entered digit
    setDigits(updated);

    // Auto advance to next input
    if (index < 5 && cleaned) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  async function handleVerify(e) {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStatusMessage('');

    const otpCode = digits.join('');
    if (otpCode.length !== 6) {
      setErrorMessage('Please enter all 6 digits of the verification code.');
      return;
    }

    if (attempts >= 5) {
      setErrorMessage('Too many invalid attempts. Please request a new verification code or sign up again.');
      return;
    }

    setVerifying(true);

    try {
      const result = await corporateApi.verifyOtp({
        email: signupData.email,
        otp: otpCode,
        pendingData: signupData,
      });

      if (result.success && result.user) {
        setIsSuccess(true);
        setStatusMessage('Email verified successfully! Logging you in...');
        setAuthenticatedUser(result.user, result.token);
        toast.success(`Welcome, ${result.user.name}! Corporate account active.`);

        // Clear return_to from session
        sessionStorage.removeItem('tvarita_corporate_return_to');

        setTimeout(() => {
          navigate(returnTo, { replace: true });
        }, 1000);
      }
    } catch (err) {
      setAttempts((prev) => prev + 1);
      setErrorMessage(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (timer > 0) return;
    setResending(true);
    setErrorMessage('');
    try {
      await corporateApi.sendOtp({ email: signupData.email });
      setTimer(60);
      setAttempts(0);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      toast.success('A new 6-digit verification code has been dispatched.');
    } catch (err) {
      setErrorMessage('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      {/* Brand Header */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none', marginBottom: '2rem' }}>
        <div
          style={{
            width: 44,
            height: 44,
            background: 'var(--color-primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>T</span>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 'var(--text-xl)', color: 'var(--color-text)', lineHeight: 1.1 }}>
            Tvarita
          </div>
          <div style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-terracotta)', fontWeight: 600 }}>
            Arts Collective
          </div>
        </div>
      </Link>

      {/* Main Verification Card */}
      <div
        className="card"
        style={{
          maxWidth: 480,
          width: '100%',
          padding: '2.5rem',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: isSuccess ? '#D1FAE5' : '#FEF3C7',
            color: isSuccess ? 'var(--color-primary)' : 'var(--color-ochre)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          {isSuccess ? <CheckCircle2 size={28} /> : <Mail size={28} />}
        </div>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: '0.5rem' }}>
          Verify Your Email
        </h1>

        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          We’ve sent a 6-digit verification code to:
          <br />
          <strong style={{ color: 'var(--color-text)', wordBreak: 'break-all' }}>{signupData.email}</strong>
        </p>

        {errorMessage && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusMessage && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <CheckCircle2 size={16} />
            <span>{statusMessage}</span>
          </div>
        )}

        <form onSubmit={handleVerify}>
          {/* 6 Digit Inputs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              marginBottom: '1.75rem',
            }}
          >
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                disabled={isSuccess || verifying}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                style={{
                  width: '48px',
                  height: '56px',
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-surface)',
                  outline: 'none',
                  transition: 'border-color var(--transition-fast)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--color-primary)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
                aria-label={`Digit ${idx + 1}`}
              />
            ))}
          </div>

          {/* Verify CTA */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={verifying || isSuccess || digits.join('').length !== 6}
            style={{ width: '100%', fontWeight: 700, marginBottom: '1.5rem' }}
          >
            {verifying ? 'Verifying Code...' : 'Verify Email & Continue'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Resend & Change Email Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', fontSize: 'var(--text-sm)' }}>
          <div style={{ color: 'var(--color-muted)' }}>
            {timer > 0 ? (
              <span>Resend code in <strong>{timer}s</strong></span>
            ) : (
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleResend}
                disabled={resending}
                style={{ color: 'var(--color-primary)', fontWeight: 600 }}
              >
                <RefreshCw size={14} className={resending ? 'spin' : ''} />
                Resend Verification Code
              </button>
            )}
          </div>

          <div>
            <Link
              to="/corporate/signup"
              style={{ color: 'var(--color-terracotta)', fontWeight: 600, textDecoration: 'none' }}
            >
              Change Email Address
            </Link>
          </div>
        </div>

        {/* Development Helper Pill */}
        <div style={{ marginTop: '2rem', padding: '0.75rem', background: 'var(--color-surface-2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
          Demo / Test OTP Code: <code style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>482910</code> or <code style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>123456</code>
        </div>
      </div>
    </div>
  );
}
