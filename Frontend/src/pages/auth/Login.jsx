import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import { ROLES, ROLE_LABELS } from '../../utils/constants';

// Realistic backend credentials for mock users
const BACKEND_CREDENTIALS = {
  [ROLES.FLEET_MANAGER]: { email: 'manager@transitops.com', password: 'password123' },
  [ROLES.DISPATCHER]: { email: 'dispatcher@transitops.com', password: 'password123' },
  [ROLES.SAFETY_OFFICER]: { email: 'safety@transitops.com', password: 'password123' },
  [ROLES.FINANCE_ANALYST]: { email: 'finance@transitops.com', password: 'password123' },
};

export default function Login() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { login, loading } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values);
      showToast('Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err) {
      setServerError(err.message);
    }
  };

  const handleQuickFill = async (role) => {
    const creds = BACKEND_CREDENTIALS[role];
    if (creds) {
      setValue('email', creds.email);
      setValue('password', creds.password);
      // Auto submit the form
      onSubmit(creds);
    }
  };

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-signal">SIGN IN</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-paper-50">
        Access the dispatch board
      </h2>
      <p className="mt-1 text-sm text-ink-500 dark:text-paper-200">
        Enter your credentials to continue.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Email</label>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
            })}
            placeholder="you@transitops.com"
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-transit"
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            placeholder="••••••••"
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-transit"
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>

        {serverError && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {serverError}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-ink-500 dark:text-paper-200">
        No account? <Link to="/register" className="font-medium text-transit hover:underline">Register</Link>
      </p>

      <div className="mt-8">
        <div className="flex items-center gap-3 text-xs text-ink-400">
          <div className="h-px flex-1 bg-ink-100 dark:bg-ink-700" />
          <span className="font-mono tracking-widest">QUICK FILL DEMO ACCOUNTS</span>
          <div className="h-px flex-1 bg-ink-100 dark:bg-ink-700" />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {Object.values(ROLES).map((role) => (
            <button
              key={role}
              onClick={() => handleQuickFill(role)}
              className="rounded-lg border border-ink-200/70 dark:border-ink-600 px-3 py-2 text-xs font-medium text-ink-600 dark:text-paper-200 hover:border-transit hover:text-transit-dark dark:hover:text-transit-light transition-colors"
            >
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
