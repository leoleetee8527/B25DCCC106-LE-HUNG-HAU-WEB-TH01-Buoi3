import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useAppDispatch } from '../app/hooks';
import { addToCart } from '../features/cart/cartSlice';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const dispatch = useAppDispatch();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addToCart(product));
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="product-card">
      <Link to={`/products/${product.id}`} className="product-card-image-wrap">
        <img
          src={product.image}
          alt={product.title}
          className="product-card-image"
          loading="lazy"
        />
      </Link>
      <div className="product-card-body">
        <span className="product-card-category">{product.category}</span>
        <Link to={`/products/${product.id}`}>
          <h3 className="product-card-title" title={product.title}>
            {product.title}
          </h3>
        </Link>
        <div className="product-card-price">${product.price.toFixed(2)}</div>
        <div className="product-card-actions">
          <Link
            to={`/products/${product.id}`}
            className="btn btn-outline btn-sm"
            style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary-border)' }}
          >
            Chi tiết
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={justAdded ? { backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' } : {}}
            onClick={handleAddToCart}
          >
            {justAdded ? '✓ Đã thêm' : '+ Thêm giỏ'}
          </button>
        </div>
      </div>
    </div>
  );
};
