import { useState } from 'react';
import Icon from '../components/Icon.jsx';
import { authApi } from '../services/api.js';

export default function AuthPage({ onAuthenticated, initialError = '' }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(initialError);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const credentials = { username, password };
      const user = mode === 'login'
        ? await authApi.login(credentials)
        : await authApi.register(credentials);
      onAuthenticated(user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <a className="brand auth-brand" href="/" aria-label="Paper trang chủ">
          <span className="brand__icon"><Icon name="notes" size={21} /></span>
          <span>paper<span className="brand__period">.</span></span>
        </a>
        <div className="eyebrow">{mode === 'login' ? 'CHÀO MỪNG BẠN TRỞ LẠI' : 'TẠO KHÔNG GIAN CỦA BẠN'}</div>
        <h1 id="auth-title">{mode === 'login' ? 'Đăng nhập.' : 'Tạo tài khoản.'}</h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Đăng nhập để tiếp tục với những ghi chú của bạn.'
            : 'Tạo tài khoản để lưu ghi chú riêng tư của bạn.'}
        </p>

        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="auth-username">Tên đăng nhập</label>
          <input
            id="auth-username"
            autoComplete="username"
            autoCapitalize="none"
            minLength={3}
            maxLength={32}
            pattern="[A-Za-z0-9_.-]{3,32}"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="ví dụ: minh_nguyen"
          />
          <label htmlFor="auth-password">Mật khẩu</label>
          <input
            id="auth-password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={12}
            maxLength={72}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Ít nhất 12 ký tự"
          />
          {mode === 'register' && <p className="auth-hint">Mật khẩu tối thiểu 12 ký tự. Tên đăng nhập có thể gồm chữ, số, dấu chấm, gạch dưới hoặc gạch ngang.</p>}
          {error && <div className="error-banner auth-error" role="alert">{error}</div>}
          <button className="primary-button auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
          <button type="button" onClick={() => changeMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </p>
      </section>
    </main>
  );
}
