import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      navigate('/login');
      return;
    }

    api
      .get('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAuth(res.data, token);
        navigate('/select-guild');
      })
      .catch(() => {
        navigate('/login');
      });
  }, [searchParams, navigate, setAuth]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-indigo-950 flex items-center justify-center">
      <div className="flex items-center gap-3 bg-gray-800/40 border border-gray-700/50 rounded-xl px-5 py-3">
        <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
        <p className="text-gray-300">Memproses login...</p>
      </div>
    </div>
  );
}
