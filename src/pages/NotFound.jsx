import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper-50 dark:bg-ink-900 px-6 text-center">
      <p className="font-mono text-xs tracking-widest text-signal">ERROR 404</p>
      <h1 className="mt-3 font-display text-6xl font-bold text-ink-900 dark:text-paper-50">Off route</h1>
      <div className="mt-4 route-line w-32 text-ink-300 dark:text-ink-600" />
      <p className="mt-4 max-w-sm text-sm text-ink-500 dark:text-paper-200">
        This stop isn't on the manifest. The page you're looking for doesn't exist or has moved.
      </p>
      <Link to="/dashboard" className="mt-8">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  );
}
