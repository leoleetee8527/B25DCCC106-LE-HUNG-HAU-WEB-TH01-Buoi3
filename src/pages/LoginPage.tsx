import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | undefined;
  const redirectPath = state?.from?.pathname || '/';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập');
      return;
    }

    const isSuccess = login(username, password);
    if (isSuccess) {
      // Đăng nhập thành công -> quay lại trang trước đó (ví dụ /checkout)
      navigate(redirectPath, { replace: true });
    } else {
      setErrorMessage('Đăng nhập thất bại! Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <div>
      <div className="auth-card">
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--color-primary)' }}>
          🔐 Đăng nhập tài khoản
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
          Hệ thống ShopMini - Đăng nhập giả lập
        </p>

        {state?.from && (
          <div className="alert-danger" style={{ marginBottom: '16px', fontSize: '0.85rem' }}>
            ℹ️ Bạn cần đăng nhập để tiếp tục truy cập trang <b>{state.from.pathname}</b>.
          </div>
        )}

        {errorMessage && (
          <div className="alert-danger">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Tên đăng nhập:</label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder="Nhập tên đăng nhập..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Mật khẩu:</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '10px', marginTop: '8px' }}
          >
            Đăng nhập ngay
          </button>
        </form>
      </div>
    </div>
  );
};
