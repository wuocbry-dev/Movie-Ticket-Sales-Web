import React, { useState, useEffect } from 'react';
import { FaGift } from 'react-icons/fa';
import { toast } from '../../utils/toast';
import promotionService from '../../services/promotionService';
import './PromotionsPage.css';

const PROMO_TYPE_LABEL = {
  PERCENTAGE: 'Giảm theo %',
  FIXED_AMOUNT: 'Giảm tiền cố định',
  BUY_X_GET_Y: 'Mua X tặng Y',
  FREE_ITEM: 'Tặng sản phẩm',
  POINTS_MULTIPLIER: 'Nhân điểm thưởng',
};

const getPromoImage = (promo) => {
  if (promo?.imageUrl) return promo.imageUrl;
  const id = promo?.id;
  if (id >= 1 && id <= 3) return `/images/events/events${id}.png`;
  return null;
};

const formatDate = (instant) => {
  if (!instant) return '—';
  const d = new Date(instant);
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatPrice = (v) => {
  if (v == null) return '—';
  return new Intl.NumberFormat('vi-VN').format(v) + ' ₫';
};

const PromotionsPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await promotionService.getAllActive();
        if (!cancelled) setList(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setList([]);
          toast.error('Không thể tải khuyến mãi');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <main className="promo-page">
        <div className="promo-page__inner">
          <header className="promo-page__header">
            <h1 className="promo-page__title"><FaGift aria-hidden /> Khuyến mãi</h1>
            <p className="promo-page__subtitle">Đang tải...</p>
          </header>
          <div className="promo-page__loading" aria-busy="true" />
        </div>
      </main>
    );
  }

  return (
    <main className="promo-page" role="main" aria-label="Trang khuyến mãi">
      <div className="promo-page__inner">
        <header className="promo-page__header">
          <h1 className="promo-page__title"><FaGift aria-hidden /> Khuyến mãi</h1>
          <p className="promo-page__subtitle">
            Ưu đãi hấp dẫn khi mua vé xem phim
          </p>
        </header>

        {list.length === 0 ? (
          <section className="promo-page__empty" aria-live="polite">
            <FaGift className="promo-page__empty-icon" aria-hidden />
            <p>Hiện chưa có khuyến mãi nào.</p>
          </section>
        ) : (
          <section className="promo-page__grid" aria-label="Danh sách khuyến mãi">
            {list.map((promo) => {
              const imgSrc = getPromoImage(promo);
              const typeLabel = PROMO_TYPE_LABEL[promo.promotionType] || promo.promotionType;
              return (
                <article
                  key={promo.id}
                  className="promo-page__card"
                  aria-labelledby={`promo-title-${promo.id}`}
                >
                  <div className="promo-page__card-media">
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextElementSibling?.classList.add('promo-page__placeholder--show');
                        }}
                      />
                    ) : null}
                    <div className="promo-page__placeholder">
                      <FaGift aria-hidden />
                      <span>Khuyến mãi</span>
                    </div>
                  </div>
                  <div className="promo-page__card-body">
                    <h2 id={`promo-title-${promo.id}`} className="promo-page__card-title">
                      {promo.promotionName || 'Khuyến mãi'}
                    </h2>
                    {promo.promotionCode && (
                      <p className="promo-page__card-code">Mã: <strong>{promo.promotionCode}</strong></p>
                    )}
                    <p className="promo-page__card-type">{typeLabel}</p>
                    {promo.description && (
                      <p className="promo-page__card-desc">{promo.description}</p>
                    )}
                    <div className="promo-page__card-meta">
                      {promo.discountPercentage != null && (
                        <span>Giảm {promo.discountPercentage}%</span>
                      )}
                      {promo.discountAmount != null && promo.discountAmount > 0 && (
                        <span>Giảm {formatPrice(promo.discountAmount)}</span>
                      )}
                      {promo.minPurchaseAmount != null && promo.minPurchaseAmount > 0 && (
                        <span>Đơn tối thiểu {formatPrice(promo.minPurchaseAmount)}</span>
                      )}
                    </div>
                    <p className="promo-page__card-dates">
                      {formatDate(promo.startDate)} – {formatDate(promo.endDate)}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default PromotionsPage;
