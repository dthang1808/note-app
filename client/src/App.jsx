import { useEffect, useState } from 'react';
import AuthPage from './pages/AuthPage.jsx';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import { authApi } from './services/api.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    authApi.me()
      .then(setUser)
      .catch((error) => setAuthError(error.message))
      .finally(() => setLoading(false));
  }, []);

  if (window.location.pathname !== '/') return <NotFound />;
  if (loading) {
    return <main className="auth-loading"><span className="empty-state__icon">◌</span><p>Đang kiểm tra phiên đăng nhập...</p></main>;
  }
  if (!user) {
    return (
      <AuthPage
        onAuthenticated={(authenticatedUser) => {
          setUser(authenticatedUser);
          setAuthError('');
        }}
        initialError={authError}
      />
    );
  }

  async function logout() {
    try {
      await authApi.logout();
      setUser(null);
      setAuthError('');
    } catch (error) {
      setAuthError(error.message);
    }
  }

  return <Home user={user} onLogout={logout} authError={authError} />;
}
