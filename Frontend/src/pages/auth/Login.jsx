import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/common/Button';

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
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
    </div>
  );
}
