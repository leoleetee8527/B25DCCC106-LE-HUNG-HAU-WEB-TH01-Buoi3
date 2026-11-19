import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  selectCartItems,
  selectTotalPrice,
  selectTotalQuantity,
  updateQuantity,
  removeFromCart,
  clearCart,
} from '../features/cart/cartSlice';

export const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const totalQuantity = useAppSelector(selectTotalQuantity);

  // Tính năng thêm: Mã giảm giá (Promo code)
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; percent: number } | null>(null);
  const [couponMsg, setCouponMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponCode.trim().toUpperCase();

    if (!cleanCode) {
      setCouponMsg({ type: 'error', text: 'Vui lòng nhập mã giảm giá.' });
      return;
    }

    if (cleanCode === 'GIAM10') {
      setAppliedCoupon({ code: 'GIAM10', percent: 10 });
      setCouponMsg({ type: 'success', text: 'Áp dụng mã GIAM10 thành công! Giảm 10% tổng đơn.' });
    } else if (cleanCode === 'SHOPMINI') {
      setAppliedCoupon({ code: 'SHOPMINI', percent: 15 });
      setCouponMsg({ type: 'success', text: 'Áp dụng mã SHOPMINI thành công! Giảm 15% tổng đơn.' });
    } else {
      setCouponMsg({ type: 'error', text: 'Mã giảm giá không tồn tại hoặc đã hết hạn.' });
    }
  };

  const discountAmount = appliedCoupon ? (totalPrice * appliedCoupon.percent) / 100 : 0;
  const finalPrice = Math.max(0, totalPrice - discountAmount);

  const handleQuantityChange = (id: number, currentQty: number, delta: number) => {
    const newQty = currentQty + delta;
    dispatch(updateQuantity({ id, quantity: newQty }));
  };

  const handleInputChange = (id: number, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      dispatch(updateQuantity({ id, quantity: num }));
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-card-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <h2 style={{ marginBottom: '12px' }}>Giỏ hàng của bạn đang trống!</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Hãy chọn các sản phẩm bạn yêu thích từ cửa hàng.
        </p>
        <Link to="/" className="btn btn-primary">
          ← Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="cart-page-title" style={{ margin: 0 }}>
          Giỏ hàng của bạn ({totalQuantity} sản phẩm)
        </h1>
        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
          onClick={() => {
            if (window.confirm('Bạn có chắc chắn muốn xoá toàn bộ giỏ hàng?')) {
              dispatch(clearCart());
            }
          }}
        >
          🗑️ Xoá toàn bộ giỏ
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="cart-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Đơn giá</th>
              <th style={{ textAlign: 'center' }}>Số lượng</th>
              <th>Thành tiền</th>
              <th style={{ textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {cartItems.map((item) => (
              <tr key={item.id}>
                <td>
                  <img src={item.image} alt={item.title} className="cart-item-image" />
                </td>
                <td>
                  <Link to={`/products/${item.id}`} style={{ fontWeight: 600 }}>
                    {item.title}
                  </Link>
                </td>
                <td>${item.price.toFixed(2)}</td>
                <td style={{ textAlign: 'center' }}>
                  <div className="quantity-control">
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                      title="Giảm 1"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      className="quantity-input"
                      value={item.quantity}
                      onChange={(e) => handleInputChange(item.id, e.target.value)}
                    />
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                      title="Tăng 1"
                    >
                      +
                    </button>
                  </div>
                </td>
                <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => dispatch(removeFromCart(item.id))}
                    title="Xoá khỏi giỏ"
                  >
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tóm tắt giỏ hàng & Mã giảm giá */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px' }}>
        {/* Khung nhập mã giảm giá */}
        <div style={{ background: 'var(--color-card-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '8px', color: 'var(--color-primary)' }}>
            🏷️ Mã giảm giá khuyến mãi
          </h3>
          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              className="coupon-input"
              placeholder="Nhập mã (VD: GIAM10)..."
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Áp dụng
            </button>
          </form>

          {couponMsg && (
            <p
              style={{
                fontSize: '0.85rem',
                marginTop: '8px',
                color: couponMsg.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
                fontWeight: 500,
              }}
            >
              {couponMsg.text}
            </p>
          )}

          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '8px' }}>
            💡 Gợi ý mã thử nghiệm: Nhập <b>GIAM10</b> (-10%) hoặc <b>SHOPMINI</b> (-15%)
          </p>
        </div>

        {/* Khung tổng tiền thanh toán */}
        <div className="cart-summary" style={{ margin: 0 }}>
          <div style={{ width: '100%', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Tạm tính ({totalQuantity} món):</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--color-success)', fontWeight: 600 }}>
                <span>Giảm giá ({appliedCoupon.code}):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '8px', fontSize: '1.25rem', fontWeight: 700 }}>
              <span>Tổng thanh toán:</span>
              <span className="cart-total-price">${finalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', width: '100%', justifyContent: 'flex-end', marginTop: '8px' }}>
            <Link to="/" className="btn btn-outline" style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}>
              ← Mua thêm
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate('/checkout', {
                  state: {
                    coupon: appliedCoupon,
                    discountAmount,
                    finalPrice,
                  },
                })
              }
            >
              Tiến hành thanh toán →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
