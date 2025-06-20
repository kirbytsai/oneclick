import LoginForm from '../src/components/auth/LoginForm';
import { useAuth } from '../src/contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Login() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <LoginForm />;
}