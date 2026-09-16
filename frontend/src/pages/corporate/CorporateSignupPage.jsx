import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Building2, ArrowRight, ShieldCheck, Mail, User, Briefcase, Hash, AlertCircle } from 'lucide-react';
import { corporateApi } from '../../api/corporate';
import { useToast } from '../../context/ToastContext';

export default function CorporateSignupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const returnTo = searchParams.get('returnTo') || sessionStorage.getItem('tvarita_corporate_return_to') || '/corporate/dashboard';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orgId: '',
    companyName: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  function validate() {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full Name is required.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Corporate Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid corporate email address.';
    }
    if (!formData.orgId.trim()) {
      errs.orgId = 'ORG_ID (Employee or Organization ID) is required.';
    }
    if (!formData.companyName.trim()) {
      errs.companyName = 'Company / Organization Name is required.';
    }
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await corporateApi.corporateSignup({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        orgId: formData.orgId.trim(),
        companyName: formData.companyName.trim(),
      });

      toast.success(res.message || 'Verification code dispatched to your email.');

      // Redirect to OTP verification screen with signup state
      navigate('/corporate/verify-otp', {
        state: {
          signupData: {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            orgId: formData.orgId.trim(),
            companyName: formData.companyName.trim(),
          },
          returnTo,
        },
      });
    } catch (err) {
      setApiError(err.message || 'Failed to initialize verification. Please try again.');
    } finally {
      setSubmitting(false);
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

      {/* Main Card */}
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
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: '#D1FAE5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--color-primary)',
            }}
          >
            <Building2 size={26} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            Corporate Signup
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            Register your organization to book curated folk experiences, workshops, and cultural performances.
          </p>
        </div>

        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <AlertCircle size={16} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="fullName">
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                id="fullName"
                type="text"
                className={`form-input ${errors.name ? 'error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. Radhika Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Email Address */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="corpEmail">
              Corporate Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                id="corpEmail"
                type="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="coordinator@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
              We'll send a 6-digit verification code to this address.
            </span>
          </div>

          {/* Company Name */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="companyName">
              Company / Organization Name *
            </label>
            <div style={{ position: 'relative' }}>
              <Briefcase size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                id="companyName"
                type="text"
                className={`form-input ${errors.companyName ? 'error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. Infosys, TCS, Google"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </div>
            {errors.companyName && <span className="form-error">{errors.companyName}</span>}
          </div>

          {/* ORG_ID */}
          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label" htmlFor="orgId">
              ORG_ID / Corporate ID *
            </label>
            <div style={{ position: 'relative' }}>
              <Hash size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              <input
                id="orgId"
                type="text"
                className={`form-input ${errors.orgId ? 'error' : ''}`}
                style={{ paddingLeft: '2.5rem' }}
                placeholder="e.g. ORG-INFY-2026 or Employee ID"
                value={formData.orgId}
                onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
              />
            </div>
            {errors.orgId && <span className="form-error">{errors.orgId}</span>}
          </div>

          {/* Submit CTA */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
            style={{ width: '100%', fontWeight: 700 }}
          >
            {submitting ? 'Sending Verification Code...' : 'Continue'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-muted)' }}>
          By continuing, you agree to Tvarita’s living heritage preservation charter and privacy policy.
        </div>

        <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: 'var(--text-sm)' }}>
          <span style={{ color: 'var(--color-muted)' }}>Already registered? </span>
          <Link to="/corporate/verify-otp" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Verify OTP or Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
