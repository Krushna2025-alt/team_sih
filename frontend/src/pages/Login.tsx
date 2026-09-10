import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import * as authService from '../services/authService';
import { errorMessage } from '../services/api';
import { Button, Card, Field, Input } from '../components/common/ui';

export default function Login() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const [params] = useSearchParams();
  const { user, setUser } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (user) return <Navigate to={`/${user.role}/dashboard`} replace />;

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); 
    setBusy(true); 
    setError('');
    
    try {
      const u = await authService.signInPassword(email, password);
      setUser(u);
      
      const from = loc.state?.from;
      if (from) {
        nav(from, { replace: true });
      } else if (params.get('intent') === 'voice' && u.role === 'farmer') {
        nav('/farmer/listings/voice', { replace: true });
      } else {
        nav(`/${u.role}/dashboard`, { replace: true });
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <Card className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-farmer text-white">
            <Sprout size={26} />
          </span>
          <h1 className="mt-2 text-xl font-bold">{t('auth.signInTitle')}</h1>
          <p className="text-sm text-gray-500">{t('auth.signInSubtitle')}</p>
        </div>
        
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <Field label={t('auth.emailLabel') || 'Email'} required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          
          <Field label={t('auth.passwordLabel') || 'Password'} required>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          
          <Button type="submit" tone="neutral" className="w-full" loading={busy}>
            {t('auth.signIn') || 'Sign In'}
          </Button>
        </form>

        <button onClick={() => nav('/signup')} className="w-full text-center text-sm text-buyer hover:underline">
          Don't have an account? Register here
        </button>
      </Card>
    </div>
  );
}
