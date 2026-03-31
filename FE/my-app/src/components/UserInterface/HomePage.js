import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '../../utils/toast';
import {
  FaChevronLeft,
  FaChevronRight,
  FaFilm,
  FaTicketAlt,
  FaGift,
  FaInfoCircle,
  FaGamepad,
  FaVideo,
  FaMicrophone,
  FaGlassCheers,
  FaHamburger,
  FaGem,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import movieService from '../../services/movieService';
import promotionService from '../../services/promotionService';
import './HomePage.css';

/** Trang chủ: ưu tiên nổi bật (isFeatured), rồi ngày khởi chiếu — đang chiếu: mới hơn trước; sắp chiếu: gần nhất trước */
function sortMoviesForHome(movies, isComingSoon) {
  return [...(movies || [])]
    .sort((a, b) => {
      const fa = a?.isFeatured ? 1 : 0;
      const fb = b?.isFeatured ? 1 : 0;
      if (fb !== fa) return fb - fa;
      const ta = a?.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const tb = b?.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return isComingSoon ? ta - tb : tb - ta;
    })
    .slice(0, 4);
}

const Q2K_SERVICE_CARDS = [
  {
    id: 'game',
    ribbon: 'GAME',
    ribbonMod: 'hp__q2k-card__ribbon--yellow',
    grad: 'hp__q2k-card--g1',
    icon: FaGamepad,
    title: 'Q2K Game Hub',
    text: 'PC & console thế hệ mới, phòng thi đấu eSports và giải đấu nội bộ mang thương hiệu Q2K.',
  },
  {
    id: 'cinema',
    ribbon: 'CINEMA',
    ribbonMod: 'hp__q2k-card__ribbon--blue',
    grad: 'hp__q2k-card--g2',
    icon: FaVideo,
    title: 'Phòng chiếu riêng Q2K',
    text: 'Đặt suất xem theo nhóm, không gian riêng tư — mở rộng trải nghiệm sau suất phim tại rạp.',
  },
  {
    id: 'karaoke',
    ribbon: 'KARAOKE',
    ribbonMod: 'hp__q2k-card__ribbon--purple',
    grad: 'hp__q2k-card--g3',
    icon: FaMicrophone,
    title: 'Karaoke Premium',
    text: 'Phòng cách âm, catalog bài hát cập nhật — phù hợp tiệc nhóm và sự kiện nhỏ Q2K.',
  },
  {
    id: 'event',
    ribbon: 'EVENT',
    ribbonMod: 'hp__q2k-card__ribbon--red',
    grad: 'hp__q2k-card--g4',
    icon: FaGlassCheers,
    title: 'Sự kiện & Party',
    text: 'Gói trang trí, MC và F&B theo concept — Q2K đồng hành từ ý tưởng đến đêm diễn.',
  },
  {
    id: 'fnb',
    ribbon: 'F&B',
    ribbonMod: 'hp__q2k-card__ribbon--green',
    grad: 'hp__q2k-card--g5',
    icon: FaHamburger,
    title: 'Ẩm thực Q2K Lounge',
    text: 'Combo đồ uống & snack phục vụ tại chỗ cho game, karaoke và phòng chiếu.',
  },
  {
    id: 'member',
    ribbon: 'MEMBER',
    ribbonMod: 'hp__q2k-card__ribbon--gold',
    grad: 'hp__q2k-card--g6',
    icon: FaGem,
    title: 'Thẻ thành viên Q2K',
    text: 'Tích điểm xuyên suốt dịch vụ — ưu tiên suất chiếu, giảm giá F&B và quà sinh nhật.',
  },
];

const Q2K_MAP_SEARCH_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  'Đ. Số 385, Hiệp Phú, Thủ Đức, Hồ Chí Minh'
)}`;

const HomePage = () => {
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [mobileTab, setMobileTab] = useState('now');
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promotions, setPromotions] = useState([]);
  const [promotionsLoading, setPromotionsLoading] = useState(true);
  const [promoIndex, setPromoIndex] = useState(0);
  const [promoNoTransition, setPromoNoTransition] = useState(false);
  const promoLength = promotions.length;
  /* 3 ảnh/hàng; index 0 = ảnh 1,2,3 | index 1 = ảnh 2,3,4 (4 vào, 1 ra) | index 2 = ảnh 3,4,5 (5 vào, 2 ra) ... lặp vòng */
  const promoDisplayedItems =
    promoLength >= 3
      ? [...promotions, ...promotions.slice(0, 3)]
      : promoLength === 1
        ? [promotions[0], promotions[0], promotions[0]]
        : promoLength === 2
          ? [promotions[0], promotions[1], promotions[0]]
          : [];
  const maxPromoIndex = promoLength >= 3 ? promoLength : 0;
  const promoStepIndex = promoIndex >= promoLength ? 0 : promoIndex;

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const [nowRes, soonRes, featuredRes] = await Promise.all([
        // Lấy 1 cụm rồi sortMoviesForHome chọn đúng 4 (nổi bật → ngày)
        movieService.getMovies({ status: 'NOW_SHOWING', page: 0, size: 24, sortBy: 'popularity', sortDir: 'desc' }),
        movieService.getMovies({ status: 'COMING_SOON', page: 0, size: 24, sortBy: 'popularity', sortDir: 'desc' }),
        movieService.getMovies({ status: 'NOW_SHOWING', page: 0, size: 50, sortBy: 'popularity', sortDir: 'desc' })
      ]);
      if (nowRes?.success && nowRes.data?.content) setNowShowing(sortMoviesForHome(nowRes.data.content, false));
      if (soonRes?.success && soonRes.data?.content) setComingSoon(sortMoviesForHome(soonRes.data.content, true));
      if (featuredRes?.success && featuredRes.data?.content) {
        const featured = featuredRes.data.content.filter(m => m?.isFeatured && m?.backdropUrl);
        setFeaturedMovies(featured);
      } else {
        setFeaturedMovies([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách phim');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  useEffect(() => {
    let cancelled = false;
    const loadPromotions = async () => {
      try {
        setPromotionsLoading(true);
        const data = await promotionService.getAllActive();
        if (!cancelled) setPromotions(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setPromotions([]);
      } finally {
        if (!cancelled) setPromotionsLoading(false);
      }
    };
    loadPromotions();
    return () => { cancelled = true; };
  }, []);

  const getPromoImage = (promo) => {
    if (promo?.imageUrl) return promo.imageUrl;
    const id = promo?.id;
    if (id >= 1 && id <= 3) return `/images/events/events${id}.png`;
    return null;
  };

  const getPromoDiscountText = (promo) => {
    if (!promo) return '';
    const type = (promo.promotionType || '').toUpperCase();
    if (type === 'PERCENTAGE' && promo.discountPercentage != null) return `Giảm ${Number(promo.discountPercentage)}%`;
    if (type === 'FIXED_AMOUNT' && promo.discountAmount != null) return `Giảm ${Number(promo.discountAmount).toLocaleString('vi-VN')}₫`;
    if (type === 'BUY_X_GET_Y' || type === 'FREE_ITEM') return 'Mua X tặng Y';
    if (type === 'POINTS_MULTIPLIER') return 'Nhân điểm thưởng';
    if (promo.discountPercentage != null) return `Giảm ${Number(promo.discountPercentage)}%`;
    if (promo.discountAmount != null) return `Giảm ${Number(promo.discountAmount).toLocaleString('vi-VN')}₫`;
    return 'Khuyến mãi';
  };

  const getPromoEndDate = (promo) => {
    const d = promo?.endDate;
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  const formatAgeRating = (ageRating) => {
    if (!ageRating) return '';
    const s = String(ageRating).trim().toUpperCase();
    // Common values: T13 / T16 / T18 -> 13+ / 16+ / 18+
    const m = s.match(/^T(\d{1,2})$/);
    if (m) return `${m[1]}+`;
    return s;
  };

  // Banner: CHỈ phim ĐANG CHIẾU + NỔI BẬT, và CHỈ dùng backdropUrl
  const heroSlides = featuredMovies.map(m => ({
    id: m.movieId,
    title: m.title,
    image: m.backdropUrl,
    subtitle: 'Đang chiếu'
  }));

  const heroSlidesSafe = heroSlides.length > 0 ? heroSlides : [
    { id: 1, title: 'PHIM ĐANG CHIẾU', image: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1400&h=500&fit=crop', subtitle: 'Khám phá ngay' },
    { id: 2, title: 'TRẢI NGHIỆM ĐIỆN ẢNH', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1400&h=500&fit=crop', subtitle: 'Đặt vé dễ dàng' }
  ];

  useEffect(() => {
    if (heroSlidesSafe.length <= 1) return;
    const t = setInterval(() => setHeroIndex(i => (i + 1) % heroSlidesSafe.length), 5000);
    return () => clearInterval(t);
  }, [heroSlidesSafe.length]);

  useEffect(() => {
    setHeroIndex(0);
  }, [heroSlidesSafe.length]);

  useEffect(() => {
    if (promoLength < 3) return;
    const t = setInterval(() => {
      setPromoIndex((i) => (i < maxPromoIndex ? i + 1 : i));
    }, 5000);
    return () => clearInterval(t);
  }, [promoLength, maxPromoIndex]);

  const getGenres = (genres) => {
    if (!genres?.length) return 'Đang cập nhật';
    return genres.map(g => g.name).join(', ');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN');
  };

  const moviesForMobile = mobileTab === 'now' ? nowShowing : comingSoon;

  return (
    <main className="hp" role="main" aria-label="Trang chủ">
      <section className="hp__hero" aria-label="Banner">
        <div className="hp__container">
          <div className="hp__hero-frame">
            <div className="hp__hero-inner">
              {heroSlidesSafe.map((slide, i) => (
                <div
                  key={slide.id}
                  className={`hp__hero-slide ${i === heroIndex ? 'hp__hero-slide--active' : ''}`}
                  style={{ backgroundImage: `url(${slide.image})` }}
                  aria-hidden={i !== heroIndex}
                >
                  <div className="hp__hero-overlay" />
                  <div className="hp__hero-content">
                    <h1 className="hp__hero-title">{slide.title}</h1>
                    <p className="hp__hero-subtitle">{slide.subtitle}</p>
                  </div>
                </div>
              ))}
              {heroSlidesSafe.length > 1 && (
                <div className="hp__hero-dots" role="tablist" aria-label="Chọn ảnh banner">
                  {heroSlidesSafe.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={i === heroIndex}
                      aria-label={`Ảnh ${i + 1}`}
                      className={`hp__hero-dot ${i === heroIndex ? 'hp__hero-dot--active' : ''}`}
                      onClick={() => setHeroIndex(i)}
                    />
                  ))}
                </div>
              )}
            </div>
            {heroSlidesSafe.length > 1 && (
              <>
                <button
                  type="button"
                  className="hp__hero-arrow hp__hero-arrow--left"
                  onClick={() => setHeroIndex(i => (i - 1 + heroSlidesSafe.length) % heroSlidesSafe.length)}
                  aria-label="Ảnh trước"
                >
                  <FaChevronLeft />
                </button>
                <button
                  type="button"
                  className="hp__hero-arrow hp__hero-arrow--right"
                  onClick={() => setHeroIndex(i => (i + 1) % heroSlidesSafe.length)}
                  aria-label="Ảnh sau"
                >
                  <FaChevronRight />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Mobile: tabs + carousel */}
      <section className="hp__mobile-movies" aria-label="Phim theo tab">
        <div className="hp__mobile-tabs">
          <button
            type="button"
            className={`hp__mobile-tab ${mobileTab === 'now' ? 'hp__mobile-tab--active' : ''}`}
            onClick={() => setMobileTab('now')}
            aria-pressed={mobileTab === 'now'}
          >
            Đang chiếu
          </button>
          <button
            type="button"
            className={`hp__mobile-tab ${mobileTab === 'soon' ? 'hp__mobile-tab--active' : ''}`}
            onClick={() => setMobileTab('soon')}
            aria-pressed={mobileTab === 'soon'}
          >
            Sắp chiếu
          </button>
        </div>
        {loading ? (
          <div className="hp__mobile-loading">
            <div className="hp__spinner" />
            <p>Đang tải...</p>
          </div>
        ) : moviesForMobile.length === 0 ? (
          <p className="hp__empty">Chưa có phim</p>
        ) : (
          <div className="hp__mobile-carousel">
            {moviesForMobile.map(movie => (
              <article
                key={movie.movieId}
                className="hp__mobile-card"
                onClick={() => navigate(`/movie/${movie.movieId}`)}
                onKeyDown={e => e.key === 'Enter' && navigate(`/movie/${movie.movieId}`)}
                role="button"
                tabIndex={0}
                aria-label={`Xem ${movie.title}`}
              >
                <div className="hp__mobile-poster">
                  {(movie.ageRating || movie.isFeatured) && (
                    <div className="hp__badges" aria-label="Nhãn phim">
                      {movie.ageRating && <span className="hp__age">{formatAgeRating(movie.ageRating)}</span>}
                      {movie.isFeatured && <span className="hp__featured-star" aria-label="Phim nổi bật">⭐</span>}
                    </div>
                  )}
                  {movie.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
                  ) : (
                    <div className="hp__poster-placeholder"><FaFilm aria-hidden /><span>Chưa có poster</span></div>
                  )}
                </div>
                <div className="hp__mobile-info">
                  <h3>{movie.title}</h3>
                  <div className="hp__mobile-meta-foot">
                    <div className="hp__row-split">
                      <p className="hp__card-genres">{getGenres(movie.genres)}</p>
                      <div className="hp__imdb-slot" aria-hidden={movie.imdbRating == null}>
                        {movie.imdbRating != null ? (
                          <p className="hp__imdb">⭐ {Number(movie.imdbRating).toFixed(1)}/10</p>
                        ) : null}
                      </div>
                    </div>
                    <p className="hp__card-date">
                      Khởi chiếu: <strong>{formatDate(movie.releaseDate)}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    className={`hp__mobile-cta ${mobileTab === 'soon' ? 'hp__mobile-cta--detail' : ''}`}
                    onClick={e => { e.stopPropagation(); navigate(`/movie/${movie.movieId}`); }}
                  >
                    {mobileTab === 'now' ? (
                      <><FaTicketAlt aria-hidden /> Đặt vé</>
                    ) : (
                      <><FaInfoCircle aria-hidden /> Chi tiết</>
                    )}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Desktop: Phim đang chiếu */}
      <section className="hp__section" aria-labelledby="hp-now-title">
        <div className="hp__container">
          <header className="hp__section-header">
            <h2 id="hp-now-title">Phim đang chiếu</h2>
            <button type="button" className="hp__see-more" onClick={() => navigate('/now-showing')}>
              Xem thêm
            </button>
          </header>
          {loading ? (
            <div className="hp__loading">
              <div className="hp__spinner" />
              <p>Đang tải phim...</p>
            </div>
          ) : nowShowing.length > 0 ? (
            <div className="hp__grid">
              {nowShowing.map(movie => (
                <article
                  key={movie.movieId}
                  className="hp__card"
                  onClick={() => navigate(`/movie/${movie.movieId}`)}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/movie/${movie.movieId}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiết ${movie.title}`}
                >
                  <div className="hp__card-poster">
                    {(movie.ageRating || movie.isFeatured) && (
                      <div className="hp__badges" aria-label="Nhãn phim">
                        {movie.ageRating && <span className="hp__age">{formatAgeRating(movie.ageRating)}</span>}
                        {movie.isFeatured && <span className="hp__featured-star" aria-label="Phim nổi bật">⭐</span>}
                      </div>
                    )}
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
                    ) : (
                      <div className="hp__poster-placeholder"><FaFilm /><span>Chưa có poster</span></div>
                    )}
                    <div className="hp__card-overlay"><span className="hp__play" aria-hidden>▶</span></div>
                  </div>
                  <div className="hp__card-body">
                    <h3 className="hp__card-title">{movie.title}</h3>
                    <div className="hp__meta-foot">
                      <div className="hp__row-split">
                        <p className="hp__card-genres">{getGenres(movie.genres)}</p>
                        <div className="hp__imdb-slot" aria-hidden={movie.imdbRating == null}>
                          {movie.imdbRating != null ? (
                            <p className="hp__imdb">⭐ {Number(movie.imdbRating).toFixed(1)}/10</p>
                          ) : null}
                        </div>
                      </div>
                      <p className="hp__card-date">
                        Khởi chiếu: <strong>{formatDate(movie.releaseDate)}</strong>
                      </p>
                    </div>
                    <button type="button" className="hp__card-cta" onClick={e => { e.stopPropagation(); navigate(`/movie/${movie.movieId}`); }}>
                      <FaTicketAlt /> Đặt vé
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="hp__empty">Chưa có phim đang chiếu</p>
          )}
        </div>
      </section>

      {/* Desktop: Phim sắp chiếu */}
      <section className="hp__section" aria-labelledby="hp-soon-title">
        <div className="hp__container">
          <header className="hp__section-header">
            <h2 id="hp-soon-title">Phim sắp chiếu</h2>
            <button type="button" className="hp__see-more" onClick={() => navigate('/coming-soon')}>
              Xem thêm
            </button>
          </header>
          {loading ? null : comingSoon.length > 0 ? (
            <div className="hp__grid">
              {comingSoon.map(movie => (
                <article
                  key={movie.movieId}
                  className="hp__card"
                  onClick={() => navigate(`/movie/${movie.movieId}`)}
                  onKeyDown={e => e.key === 'Enter' && navigate(`/movie/${movie.movieId}`)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Xem chi tiết ${movie.title}`}
                >
                  <div className="hp__card-poster">
                    {(movie.ageRating || movie.isFeatured) && (
                      <div className="hp__badges" aria-label="Nhãn phim">
                        {movie.ageRating && <span className="hp__age">{formatAgeRating(movie.ageRating)}</span>}
                        {movie.isFeatured && <span className="hp__featured-star" aria-label="Phim nổi bật">⭐</span>}
                      </div>
                    )}
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} loading="lazy" />
                    ) : (
                      <div className="hp__poster-placeholder"><FaFilm /><span>Chưa có poster</span></div>
                    )}
                    <div className="hp__card-overlay"><span className="hp__play" aria-hidden>▶</span></div>
                  </div>
                  <div className="hp__card-body">
                    <h3 className="hp__card-title">{movie.title}</h3>
                    <div className="hp__meta-foot">
                      <div className="hp__row-split">
                        <p className="hp__card-genres">{getGenres(movie.genres)}</p>
                        <div className="hp__imdb-slot" aria-hidden={movie.imdbRating == null}>
                          {movie.imdbRating != null ? (
                            <p className="hp__imdb">⭐ {Number(movie.imdbRating).toFixed(1)}/10</p>
                          ) : null}
                        </div>
                      </div>
                      <p className="hp__card-date">
                        Khởi chiếu: <strong>{formatDate(movie.releaseDate)}</strong>
                      </p>
                    </div>
                    <button type="button" className="hp__card-cta hp__card-cta--outline" onClick={e => { e.stopPropagation(); navigate(`/movie/${movie.movieId}`); }}>
                      <FaInfoCircle /> Chi tiết
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="hp__empty">Chưa có phim sắp chiếu</p>
          )}
        </div>
      </section>

      {/* Khuyến mãi - dữ liệu từ API (admin cập nhật) */}
      <section className="hp__section hp__section--promo" id="khuyen-mai" aria-labelledby="hp-promo-title">
        <div className="hp__container">
          <header className="hp__section-header">
            <h2 id="hp-promo-title"><FaGift aria-hidden /> Khuyến mãi</h2>
          </header>
          {promotionsLoading ? (
            <div className="hp__promo-loading" aria-busy="true">
              <div className="hp__promo-spinner" />
              <span>Đang tải khuyến mãi...</span>
            </div>
          ) : promotions.length === 0 ? (
            <div className="hp__promo-empty">
              <FaGift aria-hidden />
              <p>Hiện chưa có khuyến mãi. Quay lại sau nhé!</p>
            </div>
          ) : (
            <div className="hp__promo-carousel">
              <div className="hp__promo-viewport">
                <div
                  className="hp__promo-track"
                  style={{
                    width: `${(promoDisplayedItems.length / 3) * 100}%`,
                    transform: `translateX(-${promoIndex * (100 / promoDisplayedItems.length)}%)`,
                    transition: promoNoTransition ? 'none' : 'transform 0.5s ease',
                  }}
                  onTransitionEnd={() => {
                    if (promoIndex >= maxPromoIndex && maxPromoIndex > 0) {
                      setPromoNoTransition(true);
                      setPromoIndex(0);
                      requestAnimationFrame(() => {
                        requestAnimationFrame(() => setPromoNoTransition(false));
                      });
                    }
                  }}
                >
                  {promoDisplayedItems.map((promo, i) => {
                    const imgSrc = getPromoImage(promo);
                    const key = i >= promoLength ? `clone-${i - promoLength}` : promo.id;
                    const itemWidthPct = 100 / promoDisplayedItems.length;
                    return (
                      <div
                        key={key}
                        className="hp__promo-slide"
                        style={{ flex: `0 0 ${itemWidthPct}%`, minWidth: `${itemWidthPct}%`, maxWidth: `${itemWidthPct}%` }}
                      >
                        <Link to="/promotions" className="hp__promo-card">
                          <div className="hp__promo-frame">
                            {imgSrc ? (
                              <img
                                src={imgSrc}
                                alt={promo.promotionName || 'Khuyến mãi'}
                                loading={i < 3 ? 'eager' : 'lazy'}
                                onError={e => { e.target.style.display = 'none'; e.target.parentElement?.nextElementSibling?.classList.add('hp__promo-placeholder--show'); }}
                              />
                            ) : null}
                            <div className={`hp__promo-placeholder ${!imgSrc ? 'hp__promo-placeholder--show' : ''}`}>
                              <FaGift aria-hidden />
                              <span>{promo.promotionName || 'Khuyến mãi'}</span>
                            </div>
                          </div>
                          <div className="hp__promo-info">
                            <div className="hp__promo-code">Mã: {promo.promotionCode || '—'}</div>
                            <div className="hp__promo-title" title={promo.promotionName}>{promo.promotionName || 'Khuyến mãi'}</div>
                            <div className="hp__promo-meta">
                              <span>{getPromoDiscountText(promo)}</span>
                              {getPromoEndDate(promo) && <span> · Hạn: {getPromoEndDate(promo)}</span>}
                            </div>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
              {promoLength >= 3 && (
                <>
                  <button
                    type="button"
                    className="hp__promo-arrow hp__promo-arrow--left"
                    onClick={() => setPromoIndex((i) => (i <= 0 ? Math.max(0, promoLength - 1) : i - 1))}
                    aria-label="Khuyến mãi trước"
                  >
                    <FaChevronLeft />
                  </button>
                  <button
                    type="button"
                    className="hp__promo-arrow hp__promo-arrow--right"
                    onClick={() => {
                      if (promoIndex >= maxPromoIndex) {
                        setPromoNoTransition(true);
                        setPromoIndex(0);
                        requestAnimationFrame(() => requestAnimationFrame(() => setPromoNoTransition(false)));
                      } else {
                        setPromoIndex((i) => i + 1);
                      }
                    }}
                    aria-label="Khuyến mãi sau"
                  >
                    <FaChevronRight />
                  </button>
                  <div className="hp__promo-dots" aria-hidden="true">
                    {Array.from({ length: promoLength }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`hp__promo-dot ${i === promoStepIndex ? 'hp__promo-dot--active' : ''}`}
                        onClick={() => setPromoIndex(i)}
                        aria-label={`Khuyến mãi ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Q2K — giải trí đa dịch vụ + liên hệ (mẫu theo layout tham chiếu) */}
      <section className="hp__section hp__section--q2k" id="q2k" aria-labelledby="hp-q2k-title">
        <div className="hp__q2k-hero">
          <div className="hp__container hp__q2k-hero-inner">
            <header className="hp__q2k-intro">
              <h2 id="hp-q2k-title">Q2K — Dịch vụ giải trí khác</h2>
              <p className="hp__q2k-lead">
                <strong>Q2K</strong> không chỉ là điểm đến xem phim: đó là hệ sinh thái giải trí với game, âm nhạc, sự kiện và ẩm thực trong cùng một thương hiệu — thiết kế cho giới trẻ và nhóm bạn.
              </p>
            </header>
          </div>
        </div>

        <div className="hp__container">
          <div className="hp__q2k-grid" role="list">
            {Q2K_SERVICE_CARDS.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.id} className={`hp__q2k-card ${item.grad}`} role="listitem">
                  <span className={`hp__q2k-card__ribbon ${item.ribbonMod}`}>{item.ribbon}</span>
                  <div className="hp__q2k-card__body">
                    <span className="hp__q2k-card__icon" aria-hidden>
                      <Icon />
                    </span>
                    <h3 className="hp__q2k-card__title">{item.title}</h3>
                    <p className="hp__q2k-card__text">{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hp__q2k-contact">
            <div className="hp__q2k-contact-social">
              <h3 className="hp__q2k-contact-heading">Liên hệ với Q2K</h3>
              <p className="hp__q2k-contact-sub">Theo dõi ưu đãi combo phim + game và lịch sự kiện độc quyền.</p>
              <div className="hp__q2k-social-row">
                <a
                  className="hp__q2k-social hp__q2k-social--fb"
                  href="https://www.facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Facebook Q2K
                </a>
                <a
                  className="hp__q2k-social hp__q2k-social--zalo"
                  href="https://zalo.me"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zalo Q2K
                </a>
              </div>
            </div>

            <div className="hp__q2k-contact-panel">
              <h3 className="hp__q2k-panel-title">Thông tin liên hệ</h3>
              <ul className="hp__q2k-info-list">
                <li>
                  <FaEnvelope aria-hidden />
                  <a
                    className="hp__q2k-info-link"
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=q2kcinema@gmail.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    q2kcinema@gmail.com
                  </a>
                </li>
                <li>
                  <FaPhone aria-hidden />
                  <a className="hp__q2k-info-link" href="tel:+84283456727">
                    Hotline: 028 3456 Q2K (727)
                  </a>
                </li>
                <li>
                  <FaMapMarkerAlt aria-hidden />
                  <a
                    className="hp__q2k-info-link"
                    href={Q2K_MAP_SEARCH_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Đ. Số 385, Hiệp Phú, Thủ Đức, Hồ Chí Minh (Khu Q2K — Trung tâm giải trí)
                  </a>
                </li>
              </ul>
              <form
                className="hp__q2k-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('Cảm ơn bạn! Q2K sẽ phản hồi sớm nhất có thể.');
                  e.currentTarget.reset();
                }}
              >
                <label className="hp__q2k-sr-only" htmlFor="hp-q2k-name">
                  Họ tên
                </label>
                <input id="hp-q2k-name" name="name" type="text" placeholder="Họ tên" autoComplete="name" />
                <label className="hp__q2k-sr-only" htmlFor="hp-q2k-email">
                  Email
                </label>
                <input id="hp-q2k-email" name="email" type="email" placeholder="Email" autoComplete="email" />
                <label className="hp__q2k-sr-only" htmlFor="hp-q2k-msg">
                  Nội dung
                </label>
                <textarea id="hp-q2k-msg" name="message" rows={3} placeholder="Tin nhắn cho Q2K..." />
                <button type="submit" className="hp__q2k-submit">
                  GỬI NGAY
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
