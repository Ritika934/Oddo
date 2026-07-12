import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RootRoute() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}
