import React, { useState, useEffect } from 'react';
import { useQuickBooking } from './QuickBookingContext';
import concessionService from '../../services/concessionService';
import './ConcessionsPage.css';

const ConcessionsPage = () => {
  const { openQuickBooking } = useQuickBooking();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  useEffect(() => {
    loadConcessionData();
  }, []);

  const loadConcessionData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [categoriesData, itemsData] = await Promise.all([
        concessionService.getAllCategories(),
        concessionService.getAllItems()
      ]);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setItems(Array.isArray(itemsData) ? itemsData : []);
      if (categoriesData?.length > 0 && !selectedCategoryId) {
        const first = categoriesData[0];
        setSelectedCategoryId(first.id ?? first.categoryId);
      }
    } catch (err) {
      console.error('Error loading concession data:', err);
      setError('Không thể tải danh sách bắp nước. Vui lòng thử lại sau.');
      setCategories([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryId = (cat) => cat.id ?? cat.categoryId;
  const getCategoryName = (cat) => cat.categoryName ?? cat.name ?? '';

  const getItemsForCategory = (categoryId) => {
    if (!categoryId) return items;
    return items.filter(
      (item) => (item.category?.id ?? item.categoryId) === categoryId
    );
  };

  const filteredItems = getItemsForCategory(selectedCategoryId);

  const formatPrice = (value) => {
    if (value == null) return '—';
    const num = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(num)) return '—';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num);
  };

  const handleItemClick = () => {
    openQuickBooking();
  };

  if (loading) {
    return (
      <div className="concessions-page">
        <div className="concessions-loading">
          <div className="spinner" />
          <p>Đang tải danh sách bắp nước...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="concessions-page">
      <div className="concessions-header">
        <h1>Bắp nước</h1>
        <p className="concessions-subtitle">
          Combo, bắp rang, nước ngọt – mua khi đặt vé tại rạp
        </p>
      </div>

      {error && (
        <div className="concessions-error">
          <p>{error}</p>
          <button type="button" onClick={loadConcessionData}>
            Thử lại
          </button>
        </div>
      )}

      {!error && categories.length > 0 && (
        <div className="concessions-tabs">
          {categories.map((cat) => {
            const cid = getCategoryId(cat);
            const isActive = selectedCategoryId === cid;
            return (
              <button
                key={cid}
                type="button"
                className={`concessions-tab ${isActive ? 'active' : ''}`}
                onClick={() => setSelectedCategoryId(cid)}
              >
                {getCategoryName(cat)}
              </button>
            );
          })}
        </div>
      )}

      {!error && (
        <div className="concessions-content">
          {filteredItems.length === 0 ? (
            <div className="concessions-empty">
              <p>Chưa có sản phẩm nào trong danh mục này.</p>
            </div>
          ) : (
            <div className="concessions-grid">
              {filteredItems.map((item) => (
                <button
                  key={item.id ?? item.itemId}
                  type="button"
                  className="concession-card concession-card-clickable"
                  onClick={handleItemClick}
                >
                  <div className="concession-card-image">
                    <img
                      src={
                        item.imageUrl ??
                        item.image ??
                        'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400'
                      }
                      alt={item.itemName ?? item.name}
                    />
                  </div>
                  <div className="concession-card-body">
                    <h3>{item.itemName ?? item.name}</h3>
                    {item.size && (
                      <span className="concession-size">{item.size}</span>
                    )}
                    <p className="concession-price">
                      {formatPrice(item.price ?? item.defaultPrice)}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!error && categories.length === 0 && items.length === 0 && !loading && (
        <div className="concessions-empty">
          <p>Hiện chưa có danh mục bắp nước. Bạn có thể mua khi đặt vé tại rạp.</p>
        </div>
      )}
    </div>
  );
};

export default ConcessionsPage;
