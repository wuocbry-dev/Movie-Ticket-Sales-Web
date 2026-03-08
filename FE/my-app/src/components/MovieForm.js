import React, { useState, useEffect } from 'react';
import { FaTimes, FaUpload, FaImage } from 'react-icons/fa';
import { toast } from 'react-toastify';
import movieService from '../services/movieService';
import './MovieForm.css';

const MovieForm = ({ movie, genres, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    ageRating: 'P',
    contentWarning: '',
    synopsis: '',
    synopsisEn: '',
    duration: '',
    releaseDate: '',
    endDate: '',
    country: '',
    language: '',
    subtitleLanguage: '',
    director: '',
    cast: '',
    producer: '',
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    status: 'COMING_SOON',
    isFeatured: false,
    genreIds: [],
    availableFormats: [],
    imdbRating: '',
    imdbId: '',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'media', 'imdb'


  useEffect(() => {
    if (movie) {
      console.log('=== Loading movie data into form ===');
      console.log('Full movie object:', JSON.stringify(movie, null, 2));
      
      // Map genres correctly - backend returns array of {id, name}
      const genreIds = Array.isArray(movie.genres) 
        ? movie.genres.map(g => g.id) 
        : [];
      
      // Map available formats - backend returns array of strings
      const formats = Array.isArray(movie.availableFormats) 
        ? movie.availableFormats 
        : [];
      
      const newFormData = {
        title: movie.title || '',
        titleEn: movie.titleEn || '',
        ageRating: movie.ageRating || 'P',
        contentWarning: movie.contentWarning || '',
        synopsis: movie.synopsis || '',
        synopsisEn: movie.synopsisEn || '',
        duration: movie.duration || '',
        releaseDate: movie.releaseDate || '',
        endDate: movie.endDate || '',
        country: movie.country || '',
        language: movie.language || '',
        subtitleLanguage: movie.subtitleLanguage || '',
        director: movie.director || '',
        cast: movie.cast || '',
        producer: movie.producer || '',
        posterUrl: movie.posterUrl || '',
        backdropUrl: movie.backdropUrl || '',
        trailerUrl: movie.trailerUrl || '',
        status: movie.status || 'COMING_SOON',
        isFeatured: movie.isFeatured !== null ? movie.isFeatured : false,
        genreIds: genreIds,
        availableFormats: formats,
        imdbRating: movie.imdbRating !== null ? movie.imdbRating : '',
        imdbId: movie.imdbId || '',
      };
      
      setFormData(newFormData);
      
      console.log('=== Form data set ===');
      console.log('Full form data:', JSON.stringify(newFormData, null, 2));
    }
  }, [movie]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGenreChange = (genreId) => {
    setFormData(prev => {
      const genreIds = prev.genreIds.includes(genreId)
        ? prev.genreIds.filter(id => id !== genreId)
        : [...prev.genreIds, genreId];
      return { ...prev, genreIds };
    });
  };

  const handleFormatChange = (format) => {
    setFormData(prev => {
      const availableFormats = prev.availableFormats.includes(format)
        ? prev.availableFormats.filter(f => f !== format)
        : [...prev.availableFormats, format];
      return { ...prev, availableFormats };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tên phim';
    if (!formData.titleEn.trim()) newErrors.titleEn = 'Vui lòng nhập tên tiếng Anh';
    if (!formData.duration || formData.duration <= 0) newErrors.duration = 'Thời lượng không hợp lệ';
    if (!formData.releaseDate) newErrors.releaseDate = 'Vui lòng chọn ngày phát hành';
    if (!formData.synopsis.trim()) newErrors.synopsis = 'Vui lòng nhập nội dung phim';
    if (!formData.posterUrl.trim()) newErrors.posterUrl = 'Vui lòng upload hoặc nhập URL poster';
    if (formData.genreIds.length === 0) newErrors.genres = 'Vui lòng chọn ít nhất một thể loại';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePosterUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh!');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn! Tối đa 10MB');
      return;
    }

    setUploadingPoster(true);
    try {
      const response = await movieService.uploadPoster(file);
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          posterUrl: response.data.url
        }));
        toast.success('Upload poster thành công!');
      } else {
        toast.error(response.message || 'Upload thất bại!');
      }
    } catch (error) {
      console.error('Error uploading poster:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi upload poster!');
    } finally {
      setUploadingPoster(false);
    }
  };

  const handleBackdropUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Chỉ chấp nhận file ảnh!');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn! Tối đa 10MB');
      return;
    }

    setUploadingBackdrop(true);
    try {
      const response = await movieService.uploadBackdrop(file);
      
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          backdropUrl: response.data.url
        }));
        toast.success('Upload backdrop thành công!');
      } else {
        toast.error(response.message || 'Upload thất bại!');
      }
    } catch (error) {
      console.error('Error uploading backdrop:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi upload backdrop!');
    } finally {
      setUploadingBackdrop(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      // Transform data to match backend DTO
      const submitData = {
        ...formData,
        durationMinutes: parseInt(formData.duration),
        duration: undefined, // Remove old field
      };
      
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mf-modal-overlay">
      <div className="mf-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="mf-modal-header">
          <h2>{movie ? 'Chỉnh Sửa Phim' : 'Thêm Phim Mới'}</h2>
          <button className="mf-btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mf-movie-form">
          {/* Tab Navigation */}
          <div className="mf-tab-navigation">
            <button
              type="button"
              className={`mf-tab-button ${activeTab === 'basic' ? 'active' : ''}`}
              onClick={() => setActiveTab('basic')}
            >
              Thông tin cơ bản
            </button>
            <button
              type="button"
              className={`mf-tab-button ${activeTab === 'imdb' ? 'active' : ''}`}
              onClick={() => setActiveTab('imdb')}
            >
              Nội dung phim
            </button>
            <button
              type="button"
              className={`mf-tab-button ${activeTab === 'media' ? 'active' : ''}`}
              onClick={() => setActiveTab('media')}
            >
              Hình ảnh & Video
            </button>
          </div>

          {/* Tab 1: Thông tin cơ bản */}
          {activeTab === 'basic' && (
            <div className="mf-tab-content">
              <div className="mf-form-grid">
            <div className="mf-form-section">
              <h3>Thông tin phim</h3>
              
              <div className="mf-form-group">
                <label>Tên phim (Tiếng Việt) *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? 'error' : ''}
                />
                {errors.title && <span className="mf-error-message">{errors.title}</span>}
              </div>

              <div className="mf-form-group">
                <label>Tên phim (Tiếng Anh) *</label>
                <input
                  type="text"
                  name="titleEn"
                  value={formData.titleEn}
                  onChange={handleChange}
                  className={errors.titleEn ? 'error' : ''}
                />
                {errors.titleEn && <span className="mf-error-message">{errors.titleEn}</span>}
              </div>

              <div className="mf-form-row">
                <div className="mf-form-group">
                  <label>Thời lượng (phút) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    className={errors.duration ? 'error' : ''}
                  />
                  {errors.duration && <span className="mf-error-message">{errors.duration}</span>}
                </div>

                <div className="mf-form-group">
                  <label>Độ tuổi *</label>
                  <select
                    name="ageRating"
                    value={formData.ageRating}
                    onChange={handleChange}
                  >
                    <option value="P">P - Phổ biến</option>
                    <option value="K">K - Dành cho trẻ em</option>
                    <option value="T13">T13 - 13+</option>
                    <option value="T16">T16 - 16+</option>
                    <option value="T18">T18 - 18+</option>
                    <option value="C">C - Cấm</option>
                  </select>
                </div>
              </div>

              <div className="mf-form-row">
                <div className="mf-form-group">
                  <label>Ngày phát hành *</label>
                  <input
                    type="date"
                    name="releaseDate"
                    value={formData.releaseDate}
                    onChange={handleChange}
                    className={errors.releaseDate ? 'error' : ''}
                  />
                  {errors.releaseDate && <span className="mf-error-message">{errors.releaseDate}</span>}
                </div>

                <div className="mf-form-group">
                  <label>Ngày kết thúc</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mf-form-group">
                <label>Trạng thái *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="COMING_SOON">Sắp chiếu</option>
                  <option value="NOW_SHOWING">Đang chiếu</option>
                </select>
              </div>

              <div className="mf-form-group mf-checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                  />
                  Phim nổi bật
                </label>
              </div>
            </div>

            {/* Thể loại và định dạng */}
            <div className="mf-form-section">
              <h3>Thể loại & Định dạng</h3>
              
              <div className="mf-form-group">
                <label>Thể loại *</label>
                <div className="mf-checkbox-grid">
                  {genres.map(genre => (
                    <label key={genre.id} className="mf-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.genreIds.includes(genre.id)}
                        onChange={() => handleGenreChange(genre.id)}
                      />
                      {genre.name}
                    </label>
                  ))}
                </div>
                {errors.genres && <span className="mf-error-message">{errors.genres}</span>}
              </div>

              <div className="mf-form-group">
                <label>Định dạng chiếu</label>
                <div className="mf-checkbox-grid">
                  {['2D', '3D', 'IMAX', '4DX', 'ScreenX'].map(format => (
                    <label key={format} className="mf-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.availableFormats.includes(format)}
                        onChange={() => handleFormatChange(format)}
                      />
                      {format}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Thông tin sản xuất */}
            <div className="mf-form-section">
              <h3>Thông tin sản xuất</h3>
              
              <div className="mf-form-group">
                <label>Đạo diễn</label>
                <input
                  type="text"
                  name="director"
                  value={formData.director}
                  onChange={handleChange}
                />
              </div>

              <div className="mf-form-group">
                <label>Diễn viên</label>
                <input
                  type="text"
                  name="cast"
                  value={formData.cast}
                  onChange={handleChange}
                  placeholder="Phân cách bằng dấu phẩy"
                />
              </div>

              <div className="mf-form-group">
                <label>Nhà sản xuất</label>
                <input
                  type="text"
                  name="producer"
                  value={formData.producer}
                  onChange={handleChange}
                />
              </div>

              <div className="mf-form-row">
                <div className="mf-form-group">
                  <label>Quốc gia</label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>

                <div className="mf-form-group">
                  <label>Ngôn ngữ</label>
                  <input
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="mf-form-group">
                <label>Phụ đề</label>
                <input
                  type="text"
                  name="subtitleLanguage"
                  value={formData.subtitleLanguage}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Thông tin IMDB */}
            <div className="mf-form-section">
              <h3>Thông tin IMDB</h3>
              
              <div className="mf-form-row">
                <div className="mf-form-group">
                  <label>IMDB Rating</label>
                  <input
                    type="number"
                    name="imdbRating"
                    value={formData.imdbRating}
                    onChange={handleChange}
                    step="0.1"
                    min="0"
                    max="10"
                  />
                </div>

                <div className="mf-form-group">
                  <label>IMDB ID</label>
                  <input
                    type="text"
                    name="imdbId"
                    value={formData.imdbId}
                    onChange={handleChange}
                    placeholder="tt1234567"
                  />
                </div>
              </div>
            </div>
              </div>
            </div>
            )}

            {/* Tab 2: Hình ảnh & Video */}
            {activeTab === 'media' && (
            <div className="mf-tab-content">
              <div className="mf-form-grid">
            <div className="mf-form-section">
              <h3>Hình ảnh & Video</h3>
              
              <div className="mf-form-group">
                <label>Poster *</label>
                <div className="mf-upload-container">
                  <div className="mf-upload-buttons">
                    <label className="mf-btn-upload" style={{ opacity: uploadingPoster ? 0.6 : 1 }}>
                      <FaUpload /> {uploadingPoster ? 'Đang upload...' : 'Upload Poster'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePosterUpload}
                        disabled={uploadingPoster}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span className="mf-upload-hint">hoặc nhập URL</span>
                  </div>
                  <input
                    type="url"
                    name="posterUrl"
                    value={formData.posterUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/poster.jpg"
                    className={errors.posterUrl ? 'error' : ''}
                  />
                  {formData.posterUrl && (
                    <div className="mf-image-preview">
                      <FaImage />
                      <img src={formData.posterUrl} alt="Poster preview" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
                {errors.posterUrl && <span className="mf-error-message">{errors.posterUrl}</span>}
              </div>

              <div className="mf-form-group">
                <label>Backdrop</label>
                <div className="mf-upload-container">
                  <div className="mf-upload-buttons">
                    <label className="mf-btn-upload" style={{ opacity: uploadingBackdrop ? 0.6 : 1 }}>
                      <FaUpload /> {uploadingBackdrop ? 'Đang upload...' : 'Upload Backdrop'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBackdropUpload}
                        disabled={uploadingBackdrop}
                        style={{ display: 'none' }}
                      />
                    </label>
                    <span className="mf-upload-hint">hoặc nhập URL</span>
                  </div>
                  <input
                    type="url"
                    name="backdropUrl"
                    value={formData.backdropUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/backdrop.jpg"
                  />
                  {formData.backdropUrl && (
                    <div className="mf-image-preview">
                      <FaImage />
                      <img src={formData.backdropUrl} alt="Backdrop preview" onError={(e) => e.target.style.display = 'none'} />
                    </div>
                  )}
                </div>
              </div>

              <div className="mf-form-group">
                <label>URL Trailer (YouTube Embed)</label>
                <input
                  type="url"
                  name="trailerUrl"
                  value={formData.trailerUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/embed/..."
                />
              </div>
            </div>
              </div>
            </div>
            )}

            {/* Tab 3: Nội dung phim */}
            {activeTab === 'imdb' && (
            <div className="mf-tab-content">
              <div className="mf-form-grid">
            <div className="mf-form-section">
              <h3>Nội dung phim</h3>
              
              <div className="mf-form-group">
                <label>Nội dung (Tiếng Việt) *</label>
                <textarea
                  name="synopsis"
                  value={formData.synopsis}
                  onChange={handleChange}
                  rows="6"
                  className={errors.synopsis ? 'error' : ''}
                />
                {errors.synopsis && <span className="mf-error-message">{errors.synopsis}</span>}
              </div>

              <div className="mf-form-group">
                <label>Nội dung (Tiếng Anh)</label>
                <textarea
                  name="synopsisEn"
                  value={formData.synopsisEn}
                  onChange={handleChange}
                  rows="6"
                />
              </div>

              <div className="mf-form-group">
                <label>Cảnh báo nội dung</label>
                <textarea
                  name="contentWarning"
                  value={formData.contentWarning}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>
              </div>
            </div>
            )}

          <div className="mf-form-actions">
            <button type="button" onClick={onClose} className="mf-btn-cancel">
              Hủy
            </button>
            <button type="submit" className="mf-btn-submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : (movie ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieForm;
