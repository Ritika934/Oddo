import { Link } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import Button from '../components/common/Button';

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-50 dark:bg-ink-900 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10 text-danger">
        <FiLock size={24} />
      </div>
      <p className="mt-4 font-mono text-xs tracking-widest text-danger">ERROR 403</p>
      <h1 className="mt-2 font-display text-4xl font-bold text-ink-900 dark:text-paper-50">Restricted access</h1>
      <p className="mt-4 max-w-sm text-sm text-ink-500 dark:text-paper-200">
        Your role doesn't have clearance for this section. Contact your Fleet Manager if you believe this is an error.
      </p>
      <Link to="/dashboard" className="mt-8">
        <Button variant="secondary">Back to dashboard</Button>
      </Link>
    </div>
  );
}
