import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAppSelector } from '../app/hooks';
import { selectTotalQuantity } from '../features/cart/cartSlice';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const totalQuantity = useAppSelector(selectTotalQuantity);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="header-logo">
          🛍️ ShopMini <span>Store</span>
        </Link>

        <div className="header-nav">
          {/* Nút đổi theme */}
          <button
            type="button"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={`Đổi sang chế độ ${theme === 'light' ? 'tối' : 'sáng'}`}
          >
            {theme === 'light' ? '🌙 Tối' : '☀️ Sáng'}
          </button>

          {/* Giỏ hàng */}
          <Link to="/cart" className="cart-link">
            🛒 Giỏ hàng
            <span className="cart-badge">{totalQuantity}</span>
          </Link>

          {/* Thông tin user / Đăng nhập / Đăng xuất */}
          {user ? (
            <div className="header-user-info">
              <span className="user-badge">👤 {user.username}</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-outline btn-sm">
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
