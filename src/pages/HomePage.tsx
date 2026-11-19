import React, { useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchProducts } from '../features/products/productSlice';
import { ProductCard } from '../components/ProductCard';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

const categoryLabels: Record<string, string> = {
  all: 'Tất cả',
  "men's clothing": 'Thời trang nam',
  "women's clothing": 'Thời trang nữ',
  jewelery: 'Trang sức',
  electronics: 'Đồ điện tử',
};

export const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((state) => state.products);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchProducts());
    }
  }, [dispatch, status]);

  // Trích xuất danh sách các category duy nhất từ items
  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((p) => p.category)));
    return ['all', ...cats];
  }, [items]);

  // Lọc theo Search + Category, sau đó Sắp xếp
  const processedProducts = useMemo(() => {
    let result = [...items];

    // 1. Lọc theo Danh mục
    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // 2. Lọc theo Tên tìm kiếm
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((p) => p.title.toLowerCase().includes(term));
    }

    // 3. Sắp xếp
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'name-desc') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    }

    return result;
  }, [items, selectedCategory, searchTerm, sortBy]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('default');
  };

  return (
    <div>
      {/* Thanh tìm kiếm theo tên */}
      <div className="search-container">
        <label htmlFor="search-input" style={{ fontWeight: 600 }}>🔍 Tìm kiếm:</label>
        <input
          id="search-input"
          type="text"
          className="search-input"
          placeholder="Nhập tên sản phẩm cần tìm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            style={{ color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
            onClick={() => setSearchTerm('')}
          >
            Xoá
          </button>
        )}
      </div>

      {/* Bộ điều khiển: Lọc danh mục & Sắp xếp */}
      <div className="filter-controls">
        <div className="category-chips">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label htmlFor="sort-select" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            Sắp xếp:
          </label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="name-asc">Tên: A - Z</option>
            <option value="name-desc">Tên: Z - A</option>
          </select>
        </div>
      </div>

      {/* Trạng thái Loading */}
      {status === 'loading' && (
        <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '8px' }}>⏳ Đang tải dữ liệu sản phẩm từ FakeStoreAPI...</p>
        </div>
      )}

      {/* Trạng thái Thất bại */}
      {status === 'failed' && (
        <div className="alert-danger" style={{ textAlign: 'center', margin: '20px 0' }}>
          <p>⚠️ Đã có lỗi xảy ra: {error}</p>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            style={{ marginTop: '10px' }}
            onClick={() => dispatch(fetchProducts())}
          >
            Thử tải lại
          </button>
        </div>
      )}

      {/* Trạng thái Thành công */}
      {status === 'succeeded' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--color-primary)' }}>
              Sản phẩm ({processedProducts.length})
            </h2>
            {(searchTerm || selectedCategory !== 'all' || sortBy !== 'default') && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ color: 'var(--color-primary)', borderColor: 'var(--color-primary-border)' }}
                onClick={handleResetFilters}
              >
                ↺ Đặt lại bộ lọc
              </button>
            )}
          </div>

          {processedProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--color-card-bg)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: '12px' }}>
                Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleResetFilters}
              >
                Xoá bộ lọc & xem tất cả
              </button>
            </div>
          ) : (
            /* Lưới responsive: 1 cột mobile, 2 cột tablet, 4 cột desktop */
            <div className="product-grid">
              {processedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
