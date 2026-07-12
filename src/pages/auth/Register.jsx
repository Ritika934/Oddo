import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { authApi } from '../../api/auth.api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';
import { ROLES, ROLE_LABELS } from '../../utils/constants';

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setLoading(true);
    setServerError('');
    try {
      await authApi.register(values);
      showToast('Account created. Sign in to continue.', 'success');
      navigate('/login');
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Registration requires the backend to be running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p className="font-mono text-xs tracking-widest text-signal">CREATE ACCOUNT</p>
      <h2 className="mt-2 font-display text-2xl font-semibold text-ink-900 dark:text-paper-50">
        Join the operations team
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Full name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Email</label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
          />
          {errors.email && <p className="mt-1 text-xs text-danger">{errors.email.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Role</label>
          <select
            {...register('role', { required: true })}
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
          >
            {Object.values(ROLES).map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-700 dark:text-paper-100">Password</label>
          <input
            type="password"
            {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'At least 6 characters' } })}
            className="w-full rounded-lg border border-ink-200 dark:border-ink-600 bg-white dark:bg-ink-800 px-3.5 py-2.5 text-sm text-ink-900 dark:text-paper-100 focus:outline-none focus:ring-2 focus:ring-transit"
          />
          {errors.password && <p className="mt-1 text-xs text-danger">{errors.password.message}</p>}
        </div>

        {serverError && (
          <div className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger">
            {serverError}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <p className="mt-4 text-sm text-ink-500 dark:text-paper-200">
        Already registered? <Link to="/login" className="font-medium text-transit hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
