import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  clearCart,
  selectCartItems,
  selectTotalPrice,
  selectTotalQuantity,
} from '../features/cart/cartSlice';

interface CheckoutLocationState {
  coupon?: { code: string; percent: number } | null;
  discountAmount?: number;
  finalPrice?: number;
}

export const CheckoutPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const totalPrice = useAppSelector(selectTotalPrice);
  const totalQuantity = useAppSelector(selectTotalQuantity);

  const checkoutState = location.state as CheckoutLocationState | undefined;
  const discountAmount = checkoutState?.discountAmount || 0;
  const appliedCoupon = checkoutState?.coupon || null;
  const finalPrice = checkoutState?.finalPrice ?? Math.max(0, totalPrice - discountAmount);

  const [fullName, setFullName] = useState(user?.name || user?.username || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isOrdered, setIsOrdered] = useState(false);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    // Yêu cầu đề bài: Nút "Đặt hàng" ở trang Thanh toán xoá giỏ hàng và hiện thông báo thành công
    dispatch(clearCart());
    setIsOrdered(true);
  };

  if (isOrdered) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center' }}>
        <div className="alert-success">
          <h2 style={{ marginBottom: '10px' }}>🎉 Đặt hàng thành công!</h2>
          <p style={{ marginBottom: '8px' }}>
            Cảm ơn bạn <b>{fullName}</b> đã mua sắm tại <b>ShopMini</b>.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#166534' }}>
            Đơn hàng trị giá <b>${finalPrice.toFixed(2)}</b> đã được ghi nhận và giỏ hàng của bạn đã được làm trống.
          </p>
        </div>
        <Link to="/" className="btn btn-primary">
          ← Quay lại trang chủ mua sắm
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--color-card-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <h2>Giỏ hàng của bạn đang trống!</h2>
        <p style={{ color: 'var(--color-text-muted)', margin: '16px 0' }}>
          Bạn chưa có món hàng nào để thanh toán.
        </p>
        <Link to="/" className="btn btn-primary">
          ← Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '20px' }}>
        📦 Thanh toán đơn hàng
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {/* Form thông tin giao hàng */}
        <div style={{ background: 'var(--color-card-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>Thông tin người nhận</h3>
          <form id="checkout-form" onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Họ và tên:</label>
              <input
                id="fullName"
                type="text"
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="phone">Số điện thoại:</label>
              <input
                id="phone"
                type="tel"
                className="form-input"
                placeholder="Nhập số điện thoại nhận hàng..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Địa chỉ nhận hàng:</label>
              <textarea
                id="address"
                className="form-input"
                rows={3}
                placeholder="Nhập địa chỉ chi tiết (số nhà, đường, quận/huyện...)..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phương thức thanh toán:</label>
              <div style={{ padding: '8px 12px', background: 'var(--color-bg)', borderRadius: '6px', fontSize: '0.9rem' }}>
                💵 Thanh toán khi nhận hàng (COD)
              </div>
            </div>
          </form>
        </div>

        {/* Tóm tắt đơn hàng */}
        <div style={{ background: 'var(--color-card-bg)', padding: '20px', borderRadius: '8px', border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', color: 'var(--color-primary)' }}>
            Tóm tắt giỏ hàng ({totalQuantity} món)
          </h3>

          <div style={{ flex: 1, maxHeight: '250px', overflowY: 'auto', marginBottom: '16px' }}>
            {cartItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ flex: 1, paddingRight: '12px' }}>
                  <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                    {item.title}
                  </div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                    Số lượng: {item.quantity} x ${item.price.toFixed(2)}
                  </div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px dashed var(--color-border)', paddingTop: '12px', marginBottom: '20px', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span>Tạm tính:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: 'var(--color-success)', fontWeight: 600 }}>
                <span>Mã giảm ({appliedCoupon.code}):</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 700, marginTop: '8px', borderTop: '1px solid var(--color-border)', paddingTop: '8px' }}>
              <span>Tổng thanh toán:</span>
              <span style={{ color: 'var(--color-primary)' }}>${finalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            form="checkout-form"
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 600 }}
          >
            ✅ Đặt hàng
          </button>
        </div>
      </div>
    </div>
  );
};
