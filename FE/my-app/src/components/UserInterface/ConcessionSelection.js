import React, { useState, useEffect } from 'react';
import { toast } from '../../utils/toast';
import { FaUtensils, FaGift, FaImage } from 'react-icons/fa';
import concessionService from '../../services/concessionService';
import { formatPrice } from '../../utils/priceCalculation';
import './ConcessionSelection.css';

const ConcessionSelection = ({ cinemaId, onConcessionChange }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConcessionData();
  }, [cinemaId]);

  useEffect(() => {
    if (!onConcessionChange) return;
    const cartItems = Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([itemId, quantity]) => {
        const item = items.find((i) => i.itemId === parseInt(itemId, 10));
        const price = item?.effectivePrice || item?.cinemaPrice || item?.defaultPrice || 0;
        return {
          itemId: parseInt(itemId, 10),
          itemName: item?.itemName,
          quantity,
          price,
          total: price * quantity,
        };
      });
    const totalAmount = cartItems.reduce((sum, it) => sum + it.total, 0);
    onConcessionChange({ items: cartItems, total: totalAmount });
  }, [cart, items, onConcessionChange]);

  const loadConcessionData = async () => {
    if (!cinemaId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [categoriesData, itemsData] = await Promise.all([
        concessionService.getAllCategories(),
        concessionService.getAvailableItemsByCinema(cinemaId),
      ]);
      setCategories(categoriesData || []);
      setItems(itemsData || []);
      if ((categoriesData || []).length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách đồ ăn/nước uống');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => setSelectedCategory(categoryId);

  const handleQuantityChange = (itemId, delta) => {
    setCart((prev) => {
      const cur = prev[itemId] || 0;
      const next = Math.max(0, Math.min(10, cur + delta));
      if (next === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: next };
    });
  };

  const filteredItems = !selectedCategory
    ? items
    : items.filter((i) => i.categoryId === selectedCategory);
  const totalQty = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = items.find((i) => i.itemId === parseInt(id, 10));
    const p = item?.effectivePrice ?? item?.cinemaPrice ?? item?.defaultPrice ?? 0;
    return sum + p * qty;
  }, 0);

  const handleSkip = () => onConcessionChange?.({ items: [], total: 0 });

  if (!cinemaId && !loading) {
    return (
      <div className="csx csx--state">
        <div className="csx__state-card">
          <p className="csx__state-text">Không xác định được rạp chiếu</p>
          <button type="button" className="csx__btn csx__btn--secondary" onClick={handleSkip}>
            Bỏ qua
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="csx csx--state">
        <div className="csx__state-card" aria-busy="true">
          <div className="csx__spinner" aria-hidden="true" />
          <p className="csx__state-text">Đang tải danh sách đồ ăn & nước uống…</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="csx csx--state">
        <div className="csx__state-card">
          <FaUtensils className="csx__state-icon" aria-hidden="true" />
          <p className="csx__state-text">Rạp này chưa có đồ ăn/nước uống</p>
          <button type="button" className="csx__btn csx__btn--secondary" onClick={handleSkip}>
            Bỏ qua
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="csx" aria-label="Chọn đồ ăn & nước uống">
      <header className="csx__head">
        <h2 className="csx__title">
          <FaUtensils className="csx__title-icon" aria-hidden="true" />
          Chọn đồ ăn & nước uống
        </h2>
        <p className="csx__subtitle">Thưởng thức món ngon cùng phim</p>
      </header>

      {totalQty > 0 && (
        <aside className="csx__cart" aria-label="Tóm tắt giỏ">
          <div className="csx__cart-inner">
            <span className="csx__cart-label">{totalQty} món</span>
            <span className="csx__cart-total">{formatPrice(totalPrice)}</span>
          </div>
        </aside>
      )}

      <nav className="csx__tabs" aria-label="Danh mục">
        <button
          type="button"
          className={`csx__tab ${selectedCategory === null ? 'csx__tab--active' : ''}`}
          onClick={() => handleCategoryChange(null)}
        >
          Tất cả
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`csx__tab ${selectedCategory === cat.id ? 'csx__tab--active' : ''}`}
            onClick={() => handleCategoryChange(cat.id)}
          >
            {cat.categoryName}
          </button>
        ))}
      </nav>

      <div className="csx__grid" role="list">
        {filteredItems.map((item) => {
          const qty = cart[item.itemId] || 0;
          const price = item.effectivePrice ?? item.cinemaPrice ?? item.defaultPrice ?? 0;
          const disabled =
            !item.isAvailable || (item.stockQuantity !== undefined && item.stockQuantity === 0);
          const atMax = qty >= 10 || (item.stockQuantity != null && qty >= item.stockQuantity);

          return (
            <article
              key={item.itemId}
              className={`csx__card ${qty > 0 ? 'csx__card--selected' : ''}`}
              role="listitem"
            >
              <div className="csx__card-media">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt="" className="csx__card-img" />
                ) : (
                  <div className="csx__card-placeholder" aria-hidden="true">
                    {item.isCombo ? <FaGift /> : <FaImage />}
                  </div>
                )}
                {item.isCombo && (
                  <span className="csx__card-badge" aria-hidden="true">
                    COMBO
                  </span>
                )}
              </div>
              <div className="csx__card-body">
                <h3 className="csx__card-title">{item.itemName}</h3>
                {item.description && (
                  <p className="csx__card-desc">{item.description}</p>
                )}
                <div className="csx__card-meta">
                  {item.size && <span className="csx__card-size">Size: {item.size}</span>}
                  {item.calories != null && (
                    <span className="csx__card-cal">{item.calories} cal</span>
                  )}
                </div>
                <div className="csx__card-footer">
                  <span className="csx__card-price">{formatPrice(price)}</span>
                  {item.cinemaPrice != null &&
                    item.cinemaPrice !== item.defaultPrice &&
                    item.defaultPrice != null && (
                      <span className="csx__card-price-old">{formatPrice(item.defaultPrice)}</span>
                    )}
                </div>
                <div className="csx__card-actions">
                  {qty === 0 ? (
                    <button
                      type="button"
                      className="csx__btn csx__btn--add"
                      onClick={() => handleQuantityChange(item.itemId, 1)}
                      disabled={disabled}
                    >
                      + Thêm
                    </button>
                  ) : (
                    <div className="csx__qty">
                      <button
                        type="button"
                        className="csx__qty-btn"
                        onClick={() => handleQuantityChange(item.itemId, -1)}
                        aria-label="Giảm số lượng"
                      >
                        −
                      </button>
                      <span className="csx__qty-num" aria-live="polite">
                        {qty}
                      </span>
                      <button
                        type="button"
                        className="csx__qty-btn"
                        onClick={() => handleQuantityChange(item.itemId, 1)}
                        disabled={atMax}
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
                {item.stockQuantity != null && item.stockQuantity < 10 && item.stockQuantity > 0 && (
                  <p className="csx__card-stock">Chỉ còn {item.stockQuantity}</p>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ConcessionSelection;
