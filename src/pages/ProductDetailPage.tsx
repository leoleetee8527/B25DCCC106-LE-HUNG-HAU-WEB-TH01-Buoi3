import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addToCart } from '../features/cart/cartSlice';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.products);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;
    const productId = Number(id);
    const existing = items.find((p) => p.id === productId);

    if (existing) {
      setProduct(existing);
      setLoading(false);
    } else {
      // Fetch trực tiếp nếu mở link độc lập
      setLoading(true);
      fetch(`https://fakestoreapi.com/products/${productId}`)
        .then((res) => {
          if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
          return res.json();
        })
        .then((data: Product) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err: Error) => {
          setError(err.message || 'Lỗi khi tải chi tiết sản phẩm');
          setLoading(false);
        });
    }
  }, [id, items]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart(product));
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-muted)' }}>
        ⏳ Đang tải thông tin chi tiết sản phẩm...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <p className="alert-danger">{error || 'Không tìm thấy sản phẩm này!'}</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/')}>
          ← Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link to="/" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
          ← Quay lại danh sách sản phẩm
        </Link>
      </div>

      <div className="product-detail-container">
        <div className="product-detail-image-wrap">
          <img
            src={product.image}
            alt={product.title}
            className="product-detail-image"
          />
        </div>

        <div className="product-detail-info">
          <span className="product-detail-category">{product.category}</span>
          <h1 className="product-detail-title">{product.title}</h1>
          <div className="product-detail-price">${product.price.toFixed(2)}</div>

          <p className="product-detail-desc">{product.description}</p>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '1rem' }}
              onClick={handleAddToCart}
            >
              🛒 Thêm vào giỏ hàng
            </button>
            <button
              type="button"
              className="btn"
              style={{
                padding: '12px 24px',
                fontSize: '1rem',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: '1px solid #1d4ed8',
              }}
              onClick={() => {
                if (product) {
                  dispatch(addToCart(product));
                  navigate('/checkout');
                }
              }}
            >
              ⚡ Mua ngay
            </button>
            <Link to="/cart" className="btn btn-outline" style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
              Xem giỏ hàng
            </Link>
          </div>

          {added && (
            <div style={{ marginTop: '12px', color: 'var(--color-success)', fontWeight: 600 }}>
              ✓ Đã thêm sản phẩm vào giỏ hàng!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
