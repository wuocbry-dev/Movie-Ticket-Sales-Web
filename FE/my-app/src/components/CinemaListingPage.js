import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CinemaListingPage.css';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

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

  const fetchCinemas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.GET_CINEMAS}`);
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách rạp');
      }

      const data = await response.json();
      setCinemas(data);
      setFilteredCinemas(data);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cinemas:', err);
      // Fallback to mock data if API fails
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    const mockCinemas = [
      {
        id: 1,
        name: 'CGV Vincom Center',
        address: '72 Lê Thánh Tôn, Quận 1, TP.HCM',
        district: 'Quận 1',
        phone: '1900 6017',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
        screens: 8,
        facilities: ['IMAX', '4DX', 'Dolby Atmos', 'VIP Lounge'],
        distance: '2.5 km',
        rating: 4.5,
        showtimes: ['10:00', '12:30', '15:00', '17:30', '20:00', '22:30']
      },
      {
        id: 2,
        name: 'Lotte Cinema Landmark 81',
        address: '720A Điện Biên Phủ, Bình Thạnh, TP.HCM',
        district: 'Bình Thạnh',
        phone: '1900 5454 65',
        image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
        screens: 10,
        facilities: ['4K Laser', 'Premium Seats', 'Dolby Atmos'],
        distance: '3.8 km',
        rating: 4.7,
        showtimes: ['09:30', '12:00', '14:30', '17:00', '19:30', '22:00']
      },
      {
        id: 3,
        name: 'Galaxy Cinema Nguyễn Du',
        address: '116 Nguyễn Du, Quận 1, TP.HCM',
        district: 'Quận 1',
        phone: '1900 2224',
        image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800',
        screens: 6,
        facilities: ['Premium', 'Standard', 'Couple Seats'],
        distance: '1.8 km',
        rating: 4.3,
        showtimes: ['10:30', '13:00', '15:30', '18:00', '20:30']
      },
      {
        id: 4,
        name: 'BHD Star Cineplex',
        address: '3/2 Street, Quận 10, TP.HCM',
        district: 'Quận 10',
        phone: '1900 2099',
        image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?w=800',
        screens: 7,
        facilities: ['Gold Class', 'Dolby Atmos', 'IMAX'],
        distance: '4.2 km',
        rating: 4.6,
        showtimes: ['11:00', '13:30', '16:00', '18:30', '21:00']
      },
      {
        id: 5,
        name: 'Platinum Cineplex',
        address: 'Tân Bình, TP.HCM',
        district: 'Tân Bình',
        phone: '1800 1234',
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
        screens: 5,
        facilities: ['Standard', 'VIP'],
        distance: '5.5 km',
        rating: 4.2,
        showtimes: ['10:00', '14:00', '17:00', '20:00']
      },
      {
        id: 6,
        name: 'MegaStar Cineplex',
        address: 'Quận 7, TP.HCM',
        district: 'Quận 7',
        phone: '028 5413 1881',
        image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800',
        screens: 9,
        facilities: ['4DX', 'ScreenX', 'Premium'],
        distance: '6.8 km',
        rating: 4.4,
        showtimes: ['09:00', '11:30', '14:00', '16:30', '19:00', '21:30']
      }
    ];
    setCinemas(mockCinemas);
    setFilteredCinemas(mockCinemas);
  };

  const filterCinemas = () => {
    let filtered = cinemas;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(cinema =>
        cinema.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cinema.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by district
    if (selectedDistrict !== 'all') {
      filtered = filtered.filter(cinema => cinema.district === selectedDistrict);
    }

    setFilteredCinemas(filtered);
  };

  const handleCinemaSelect = (cinema) => {
    if (selectedMovie) {
      // If coming from movie detail, go to showtime selection
      navigate(`/movie/${selectedMovie.id}/showtimes`, {
        state: { movie: selectedMovie, cinema: cinema }
      });
    } else {
      // Otherwise, show cinema details or movies at this cinema
      navigate(`/cinema/${cinema.id}`);
    }
  };

  const getUniqueDistricts = () => {
    const districts = [...new Set(cinemas.map(cinema => cinema.district))];
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
                <img src={cinema.image} alt={cinema.name} />
                <div className="cinema-overlay">
                  <button className="select-btn">
                    <i className="fas fa-ticket-alt"></i>
                    Chọn Rạp
                  </button>
                </div>
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
                  <div className="rating">
                    <i className="fas fa-star"></i>
                    <span>{cinema.rating}</span>
                  </div>
                </div>

                <div className="cinema-info">
                  <div className="info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{cinema.address}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-phone"></i>
                    <span>{cinema.phone}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-door-open"></i>
                    <span>{cinema.screens} phòng chiếu</span>
                  </div>
                </div>

                <div className="facilities">
                  {cinema.facilities.map((facility, index) => (
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
