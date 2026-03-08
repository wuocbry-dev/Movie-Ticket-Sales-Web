import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import concessionService from '../services/concessionService';
import { formatPrice } from '../utils/priceCalculation';
import './ConcessionSelection.css';

const ConcessionSelection = ({ cinemaId, onConcessionChange }) => {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cart, setCart] = useState({}); // { itemId: quantity }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConcessionData();
  }, [cinemaId]);

  useEffect(() => {
    // Notify parent component when cart changes
    if (onConcessionChange) {
      const cartItems = Object.entries(cart)
        .filter(([_, quantity]) => quantity > 0)
        .map(([itemId, quantity]) => {
          const item = items.find(i => i.itemId === parseInt(itemId));
          return {
            itemId: parseInt(itemId),
            itemName: item?.itemName,
            quantity: quantity,
            price: item?.effectivePrice || item?.cinemaPrice || item?.defaultPrice,
            total: (item?.effectivePrice || item?.cinemaPrice || item?.defaultPrice) * quantity
          };
        });
      
      const totalAmount = cartItems.reduce((sum, item) => sum + item.total, 0);
      
      onConcessionChange({
        items: cartItems,
        total: totalAmount
      });
    }
  }, [cart, items, onConcessionChange]);

  const loadConcessionData = async () => {
    console.log('🍿 Loading concession data for cinemaId:', cinemaId);
    
    if (!cinemaId) {
      console.warn('⚠️ No cinemaId provided to ConcessionSelection');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Load categories
      console.log('📂 Fetching categories...');
      const categoriesData = await concessionService.getAllCategories();
      console.log('✅ Categories loaded:', categoriesData);
      setCategories(categoriesData);

      // Load all items for this cinema
      console.log(`🎬 Fetching items for cinema ${cinemaId}...`);
      const itemsData = await concessionService.getAvailableItemsByCinema(cinemaId);
      console.log('✅ Items loaded:', itemsData);
      setItems(itemsData);

      // Set first category as selected
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (error) {
      console.error('Error loading concession data:', error);
      toast.error('Không thể tải danh sách đồ ăn/nước uống');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleQuantityChange = (itemId, change) => {
    setCart(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = Math.max(0, Math.min(10, currentQty + change)); // Max 10 items
      
      if (newQty === 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [itemId]: newQty
      };
    });
  };

  const getFilteredItems = () => {
    if (!selectedCategory) return items;
    return items.filter(item => item.categoryId === selectedCategory);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalPrice = () => {
    return Object.entries(cart).reduce((sum, [itemId, quantity]) => {
      const item = items.find(i => i.itemId === parseInt(itemId));
      const price = item?.effectivePrice || item?.cinemaPrice || item?.defaultPrice || 0;
      return sum + (price * quantity);
    }, 0);
  };

  if (!cinemaId && !loading) {
    return (
      <div className="concession-empty">
        <p>⚠️ Không xác định được rạp chiếu</p>
        <button className="btn-skip" onClick={() => onConcessionChange?.({ items: [], total: 0 })}>
          Bỏ qua
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="concession-loading">
        <div className="spinner"></div>
        <p>Đang tải danh sách đồ ăn/nước uống...</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="concession-empty">
        <p>🍿 Rạp này chưa có đồ ăn/nước uống</p>
        <button className="btn-skip" onClick={() => onConcessionChange?.({ items: [], total: 0 })}>
          Bỏ qua
        </button>
      </div>
    );
  }

  return (
    <div className="concession-selection">
      <div className="concession-header">
        <h2>🍿 Chọn đồ ăn & nước uống</h2>
        <p className="concession-subtitle">Thưởng thức món ăn ngon cùng phim!</p>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        <button
          className={`category-tab ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => handleCategoryChange(null)}
        >
          Tất cả
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.categoryName}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="concession-items-grid">
        {getFilteredItems().map(item => {
          const quantity = cart[item.itemId] || 0;
          const price = item.effectivePrice || item.cinemaPrice || item.defaultPrice;

          return (
            <div key={item.itemId} className={`concession-item ${quantity > 0 ? 'selected' : ''}`}>
              <div className="item-image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.itemName} />
                ) : (
                  <div className="item-placeholder">
                    {item.isCombo ? '🎁' : '🍿'}
                  </div>
                )}
                {item.isCombo && <span className="combo-badge">COMBO</span>}
              </div>

              <div className="item-details">
                <h3 className="item-name">{item.itemName}</h3>
                
                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}

                <div className="item-info">
                  {item.size && <span className="item-size">Size: {item.size}</span>}
                  {item.calories && <span className="item-calories">{item.calories} cal</span>}
                </div>

                <div className="item-footer">
                  <div className="item-price-section">
                    <span className="item-price">{formatPrice(price)}</span>
                    {item.cinemaPrice && item.cinemaPrice !== item.defaultPrice && (
                      <span className="item-original-price">{formatPrice(item.defaultPrice)}</span>
                    )}
                  </div>

                  {item.stockQuantity !== undefined && item.stockQuantity < 10 && (
                    <span className="stock-warning">Chỉ còn {item.stockQuantity}</span>
                  )}
                </div>
              </div>

              <div className="item-actions">
                {quantity === 0 ? (
                  <button 
                    className="btn-add"
                    onClick={() => handleQuantityChange(item.itemId, 1)}
                    disabled={!item.isAvailable || item.stockQuantity === 0}
                  >
                    + Thêm
                  </button>
                ) : (
                  <div className="quantity-controls">
                    <button 
                      className="btn-qty-minus"
                      onClick={() => handleQuantityChange(item.itemId, -1)}
                    >
                      −
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button 
                      className="btn-qty-plus"
                      onClick={() => handleQuantityChange(item.itemId, 1)}
                      disabled={quantity >= 10 || (item.stockQuantity && quantity >= item.stockQuantity)}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Summary */}
      {getTotalItems() > 0 && (
        <div className="concession-cart-summary">
          <div className="cart-summary-content">
            <div className="cart-summary-info">
              <span className="cart-items-count">
                🛒 {getTotalItems()} món
              </span>
              <span className="cart-total-price">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcessionSelection;
