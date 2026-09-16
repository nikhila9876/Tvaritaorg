import { useState, useEffect } from 'react';
import {
  User, Building2, Mail, Hash, CheckCircle2,
  Save, AlertCircle, ShieldCheck, Lock,
} from 'lucide-react';
import DashboardShell from '../../components/layout/DashboardShell';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function CorporateProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    orgId: '',
    companyName: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        orgId: user.orgId || '',
        companyName: user.companyName || '',
      });
    }
  }, [user]);

  function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');

    try {
      updateUser({
        name: formData.name.trim(),
        companyName: formData.companyName.trim(),
        orgId: formData.orgId.trim(),
      });
      setSuccessMsg('Corporate profile updated successfully.');
      toast.success('Profile changes saved.');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell role="corporate">
      <div className="page-enter" style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Header */}
        <div>
          <span className="section-label">Organization Identity</span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', fontWeight: 700, margin: '0.25rem 0 0.5rem' }}>
            Corporate Profile
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
            Manage verified organization credentials and primary coordinator contact information.
          </p>
        </div>

        {/* Profile Card */}
        <div className="card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-xl)', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          {successMsg && (
            <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Coordinator Name */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="profName">
                Authorized Coordinator Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                <input
                  id="profName"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Email Address (Verified) */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="profEmail">
                  Corporate Email
                </label>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-success)',
                    fontWeight: 700,
                  }}
                >
                  <CheckCircle2 size={13} />
                  Verified
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                <input
                  id="profEmail"
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', background: 'var(--color-surface-2)', cursor: 'not-allowed' }}
                  value={formData.email}
                  disabled
                  readOnly
                />
                <Lock size={15} style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', marginTop: '0.25rem' }}>
                Verified via Brevo OTP. Contact support to request an email update.
              </span>
            </div>

            {/* Company Name */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" htmlFor="profCompany">
                Company / Organization Name *
              </label>
              <div style={{ position: 'relative' }}>
                <Building2 size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                <input
                  id="profCompany"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* ORG_ID */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="profOrgId">
                ORG_ID / Corporate Identifier *
              </label>
              <div style={{ position: 'relative' }}>
                <Hash size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                <input
                  id="profOrgId"
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', fontFamily: 'var(--font-mono)' }}
                  value={formData.orgId}
                  onChange={(e) => setFormData({ ...formData, orgId: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
                style={{ fontWeight: 600 }}
              >
                <Save size={16} />
                {saving ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Security & Verification Card */}
        <div className="card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-2)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <ShieldCheck size={24} style={{ color: 'var(--color-primary)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, margin: '0 0 0.25rem' }}>
              Verified Corporate Member
            </h3>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-muted)', margin: 0, lineHeight: 1.6 }}>
              Your organization account is authorized to book subsidized artisan workshops, request custom multi-city team experiences, and receive CSR-ready cultural impact documentation.
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
