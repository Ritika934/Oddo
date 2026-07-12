import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authApi } from '../../api/auth.api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import { ROLE_LABELS } from '../../utils/constants';

export default function Register() {
  const { register, handleSubmit, getValues, formState: { errors } } = useForm();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP flow states
  const [step, setStep] = useState('details'); // 'details' | 'otp'
  const [formData, setFormData] = useState(null);
  const [otpVal, setOtpVal] = useState('');

  const onSendOtp = async (values) => {
    setLoading(true);
    setServerError('');
    try {
      await authApi.sendOtp({ email: values.email });
      showToast('Verification code sent to your email.', 'success');
      setFormData(values);
      setStep('otp');
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Failed to send verification code. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyAndRegister = async (e) => {
    e.preventDefault();
    if (!otpVal || otpVal.trim().length !== 6) {
      setServerError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      // 1. Verify the OTP
      await authApi.verifyOtp({ email: formData.email, otp: otpVal.trim() });
      
      // 2. Perform actual registration
      await authApi.register(formData);
      
      showToast('Account created successfully. Sign in to continue.', 'success');
      navigate('/login');
    } catch (err) {
      setServerError(err?.response?.data?.message || 'OTP verification or registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setLoading(true);
    setServerError('');
    try {
      await authApi.sendOtp({ email: formData.email });
      showToast('New verification code sent.', 'info');
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-signal">CREATE ACCOUNT</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-paper-50">
        {step === 'details' ? 'Join the operations team' : 'Verify your email'}
      </h2>
      <p className="mt-1 text-sm text-ink-500 dark:text-paper-200">
        {step === 'details' 
          ? 'Enter your details to request an authentication code.' 
          : `We sent a 6-digit code to ${formData?.email}.`
        }
      </p>

      {step === 'details' ? (
        <form onSubmit={handleSubmit(onSendOtp)} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Full name</label>
            <input
              {...register('full_name', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Full name must be at least 2 characters' },
              })}
              placeholder="e.g. Ritika Gupta"
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            />
            {errors.full_name && <p className="mt-1 text-xs text-danger">{errors.full_name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Email</label>
            <input
              type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
              })}
              placeholder="you@transitops.com"
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            />
            {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Password</label>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' },
              })}
              placeholder="••••••••"
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            />
            {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Role</label>
            <select
              {...register('role', { required: 'Please select a role' })}
              className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            >
              <option value="">Select your role</option>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {errors.role && <p className="mt-1 text-xs text-danger">{errors.role.message}</p>}
          </div>

          {serverError && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Sending code…' : 'Request Verification Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={onVerifyAndRegister} className="mt-8 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Verification Code (6-digit)</label>
            <input
              type="text"
              maxLength={6}
              value={otpVal}
              onChange={(e) => setOtpVal(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 123456"
              className="w-full text-center tracking-[0.75em] text-lg font-mono rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
            />
          </div>

          {serverError && (
            <div className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
              {serverError}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Registering…' : 'Verify & Create Account'}
          </Button>

          <div className="flex items-center justify-between text-xs pt-2">
            <button 
              type="button" 
              onClick={() => setStep('details')}
              className="text-ink-600 dark:text-paper-300 hover:underline"
            >
              ← Back to edit details
            </button>
            <button 
              type="button" 
              onClick={resendOtp} 
              disabled={loading}
              className="text-transit font-semibold hover:underline"
            >
              Resend Code
            </button>
          </div>
        </form>
      )}

      <p className="mt-4 text-sm text-ink-500 dark:text-paper-200">
        Already registered? <Link to="/login" className="font-medium text-transit hover:underline">Sign in</Link>
      </p>
    </div>
  );
}