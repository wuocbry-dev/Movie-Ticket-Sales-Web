import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CinemaListingPage.css';
import { API_BASE_URL, API_ENDPOINTS } from '../../config/api';
import { toast } from '../../utils/toast';

const CinemaListingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [cinemas, setCinemas] = useState([]);
  const [filteredCinemas, setFilteredCinemas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get movie info from navigation state (if coming from movie detail page)
  const selectedMovie = location.state?.movie;

  useEffect(() => {
    fetchCinemas();
  }, []);

  useEffect(() => {
    filterCinemas();
  }, [searchTerm, selectedDistrict, cinemas]);

  /** Chuẩn hóa item từ API (CinemaDto) sang format dùng trong trang */
  const normalizeCinema = (c) => {
    if (!c) return null;

    // facilities từ backend là object: { parking: true, "3D_support": true, ... }
    const FACILITY_LABELS = {
      parking: 'Bãi đậu xe',
      '3D_support': '3D',
      VIP_lounge: 'VIP Lounge',
      '4DX_support': '4DX',
      IMAX_support: 'IMAX',
      wheelchairAccess: 'Xe lăn',
    };
    const facilities = c.facilities;
    let facilitiesList = [];
    if (Array.isArray(facilities)) {
      facilitiesList = facilities;
    } else if (facilities && typeof facilities === 'object') {
      facilitiesList = Object.entries(facilities)
        .filter(([, val]) => val === true)
        .map(([key]) => FACILITY_LABELS[key] || key);
    }

    // Opening hours
    const openingHours = c.openingHours;
    let hoursText = '';
    if (openingHours && typeof openingHours === 'object') {
      const entries = Object.entries(openingHours);
      if (entries.length > 0) hoursText = entries.map(([d, h]) => `${d}: ${h}`).join(' | ');
    } else if (typeof openingHours === 'string') {
      hoursText = openingHours;
    }

    return {
      id: c.cinemaId ?? c.id,
      name: c.cinemaName ?? c.name ?? '',
      address: c.address ?? '',
      city: c.city ?? '',
      district: c.district ?? c.city ?? 'Khác',
      phone: c.phoneNumber ?? c.phone ?? '',
      email: c.email ?? '',
      chainName: c.chainName ?? '',
      image: c.image ?? null,
      screens: c.screens ?? null,
      facilities: facilitiesList,
      openingHours: hoursText,
      showtimes: c.showtimes ?? [],
      rating: c.rating ?? null,
      distance: c.distance ?? null,
      isActive: c.isActive ?? true,
    };
  };

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_CINEMAS}?page=0&size=500`);
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách rạp');
      }

      const result = await response.json();
      // API trả về: { success, message, data: { content: [...], totalElements, ... } }
      const rawList =
        result?.data?.content ??
        result?.data?.data ??
        result?.data ??
        result;
      const list = Array.isArray(rawList) ? rawList : [];
      const normalized = list
        .filter(c => c.isActive !== false)
        .map(normalizeCinema)
        .filter(Boolean);
      setCinemas(normalized);
      setFilteredCinemas(normalized);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cinemas:', err);
    } finally {
      setLoading(false);
    }
  };


  const filterCinemas = () => {
    const list = Array.isArray(cinemas) ? cinemas : [];
    let filtered = list;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cinema =>
        (cinema.name && cinema.name.toLowerCase().includes(term)) ||
        (cinema.address && cinema.address.toLowerCase().includes(term))
      );
    }

    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(cinema => cinema.district === selectedDistrict);
    }

    setFilteredCinemas(filtered);
  };

  const handleCinemaSelect = (cinema) => {
    if (selectedMovie) {
      // If coming from movie detail, go back to movie detail
      navigate(`/movie/${selectedMovie.id}`);
    } else {
      // Show toast because Cinema Detail page is not implemented yet
      toast.info('Trang chi tiết rạp đang được phát triển. Vui lòng chọn phim để đặt vé!');
    }
  };

  const getUniqueDistricts = () => {
    const list = Array.isArray(cinemas) ? cinemas : [];
    const districts = [...new Set(list.map(cinema => cinema.district).filter(Boolean))];
    return districts.sort();
  };

  if (loading) {
    return (
      <div className="cinema-listing-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải danh sách rạp chiếu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cinema-listing-container">
      {/* Header Section */}
      <div className="cinema-listing-header">
        <div className="header-content">
          <h1>Chọn Rạp Chiếu Phim</h1>
          {selectedMovie && (
            <div className="selected-movie-info">
              <img src={selectedMovie.posterUrl} alt={selectedMovie.title} />
              <div className="movie-info">
                <h3>{selectedMovie.title}</h3>
                <p>{selectedMovie.genre} • {selectedMovie.duration} phút</p>
              </div>
            </div>
          )}
          <p className="subtitle">Tìm rạp gần bạn và đặt vé ngay hôm nay</p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="cinema-filters">
        <div className="filter-container">
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Tìm kiếm rạp theo tên hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="district-filter">
            <i className="fas fa-map-marker-alt"></i>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
            >
              <option value="all">Tất cả quận</option>
              {getUniqueDistricts().map(district => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
          </div>

          <div className="results-count">
            <i className="fas fa-film"></i>
            <span>{filteredCinemas.length} rạp chiếu</span>
          </div>
        </div>
      </div>

      {/* Cinema Grid */}
      {error && <div className="error-message">{error}</div>}
      
      {filteredCinemas.length === 0 ? (
        <div className="no-results">
          <i className="fas fa-search"></i>
          <h3>Không tìm thấy rạp chiếu</h3>
          <p>Vui lòng thử lại với từ khóa khác</p>
        </div>
      ) : (
        <div className="cinema-grid">
          {filteredCinemas.map(cinema => (
            <div key={cinema.id} className="cinema-card" onClick={() => handleCinemaSelect(cinema)}>
              <div className="cinema-image">
                {cinema.image ? (
                  <img
                    src={cinema.image}
                    alt={cinema.name}
                    onError={e => { e.target.style.display = 'none'; e.target.nextSibling?.classList.remove('hidden'); }}
                  />
                ) : (
                  <div className="cinema-image-placeholder">
                    <i className="fas fa-film"></i>
                    <span>{cinema.chainName || 'Cinema'}</span>
                  </div>
                )}
                <div className="cinema-overlay">
                  <button className="select-btn">
                    <i className="fas fa-ticket-alt"></i>
                    Chọn Rạp
                  </button>
                </div>
                {cinema.chainName && (
                  <div className="cinema-chain-badge">{cinema.chainName}</div>
                )}
                {cinema.distance && (
                  <div className="distance-badge">
                    <i className="fas fa-location-arrow"></i>
                    {cinema.distance}
                  </div>
                )}
              </div>

              <div className="cinema-content">
                <div className="cinema-header">
                  <h3>{cinema.name}</h3>
                  {cinema.rating && (
                    <div className="rating">
                      <i className="fas fa-star"></i>
                      <span>{cinema.rating}</span>
                    </div>
                  )}
                </div>

                <div className="cinema-info">
                  <div className="info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{cinema.address}{cinema.city ? `, ${cinema.city}` : ''}</span>
                  </div>
                  {cinema.phone && (
                    <div className="info-item">
                      <i className="fas fa-phone"></i>
                      <span>{cinema.phone}</span>
                    </div>
                  )}
                  {cinema.openingHours ? (
                    <div className="info-item">
                      <i className="fas fa-clock"></i>
                      <span>{cinema.openingHours.split(' | ')[0]}</span>
                    </div>
                  ) : cinema.screens ? (
                    <div className="info-item">
                      <i className="fas fa-door-open"></i>
                      <span>{cinema.screens} phòng chiếu</span>
                    </div>
                  ) : null}
                </div>

                <div className="facilities">
                  {(Array.isArray(cinema.facilities) ? cinema.facilities : []).map((facility, index) => (
                    <span key={index} className="facility-tag">{facility}</span>
                  ))}
                </div>

                {cinema.showtimes && (
                  <div className="showtimes-preview">
                    <h4>Suất chiếu hôm nay:</h4>
                    <div className="showtime-chips">
                      {cinema.showtimes.slice(0, 4).map((time, index) => (
                        <span key={index} className="showtime-chip">{time}</span>
                      ))}
                      {cinema.showtimes.length > 4 && (
                        <span className="showtime-chip more">+{cinema.showtimes.length - 4}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map View Toggle (Future Feature) */}
      <button className="map-toggle-btn" title="Xem bản đồ">
        <i className="fas fa-map"></i>
        <span>Xem Bản Đồ</span>
      </button>
    </div>
  );
};

export default CinemaListingPage;
