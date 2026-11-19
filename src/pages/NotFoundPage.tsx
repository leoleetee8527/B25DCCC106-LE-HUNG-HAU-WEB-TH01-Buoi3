import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--color-card-bg)', borderRadius: '8px', maxWidth: '500px', margin: '40px auto' }}>
      <h1 style={{ fontSize: '4rem', color: 'var(--color-primary)', marginBottom: '8px' }}>404</h1>
      <h2 style={{ marginBottom: '12px' }}>Không tìm thấy trang</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
        Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
      </p>
      <Link to="/" className="btn btn-primary">
        ← Quay về trang chủ
      </Link>
    </div>
  );
};
