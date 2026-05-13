import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast } from '../../utils/toast';
import InlineError from '../common/InlineError';
import Cookies from 'js-cookie';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { FaGoogle, FaGithub, FaFacebookF } from 'react-icons/fa';
import PrivacyPolicy from './PrivacyPolicy';
import { getDashboardPath, getRoleDisplayName, getHighestRole } from '../../utils/roleUtils';
import './LoginForm.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

/** Map common backend register errors to Vietnamese */
const translateRegisterError = (msg) => {
  if (!msg) return 'Đăng ký thất bại. Vui lòng thử lại.';
  const lower = msg.toLowerCase();
  if (lower.includes('email already registered') || lower.includes('email đã'))
    return 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.';
  if (lower.includes('phone number already registered') || lower.includes('số điện thoại đã'))
    return 'Số điện thoại này đã được đăng ký. Vui lòng sử dụng SĐT khác.';
  if (lower.includes('registration failed'))
    return 'Đăng ký thất bại: ' + msg.replace(/Registration failed:\s*/i, '');
  return msg;
};

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
  rememberMe: yup.boolean()
});

const registerSchema = yup.object().shape({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  phoneNumber: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số')
    .required('Số điện thoại là bắt buộc'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Mật khẩu xác nhận không khớp')
    .required('Vui lòng nhập lại mật khẩu'),
  fullName: yup
    .string()
    .required('Họ và tên là bắt buộc'),
  dateOfBirth: yup
    .string()
    .required('Ngày sinh là bắt buộc'),
  gender: yup
    .string()
    .required('Giới tính là bắt buộc'),
  acceptTerms: yup
    .boolean()
    .oneOf([true], 'Bạn phải đồng ý với điều khoản')
});

const TESTIMONIALS = [
  {
    quote:
      'Đặt vé xem phim giờ dễ hơn bao giờ hết. Chọn suất, chọn ghế là có thể tận hưởng buổi tối.',
    author: 'Những cánh chim cô đơn',
    role: 'Thành viên từ 2026'
  },
  {
    quote:
      'Giao diện gọn gàng, thanh toán nhanh, tôi rất thích sơ đồ ghế. Ứng dụng tôi hay dùng cuối tuần cùng bạn bè.',
    author: 'Những cánh chim cô đơn',
    role: 'Khán giả điện ảnh'
  },
  {
    quote:
      'Khuyến mãi và quyền lợi thành viên thực sự giúp tôi tiết kiệm. Hỗ trợ phản hồi rất nhanh khi tôi có thắc mắc.',
    author: 'Những cánh chim cô đơn',
    role: 'Nhà thiết kế UI'
  }
];

const LoginForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [serverError, setServerError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(activeTab === 'login' ? loginSchema : registerSchema)
  });

  const testimonial = TESTIMONIALS[testimonialIndex];

  const nextTestimonial = () => {
    setTestimonialIndex((i) => (i + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setTestimonialIndex((i) => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };
  const testimonialThemeClass = `testimonial-card--t${(testimonialIndex % 3) + 1}`;

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError('');
    setRegisterSuccess('');
    try {
      if (activeTab === 'login') {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: data.email,
          password: data.password
        });

        if (response.data.success) {
          const { accessToken, refreshToken, user } = response.data.data;

          if (data.rememberMe) {
            Cookies.set('accessToken', accessToken, { expires: 7 });
            Cookies.set('refreshToken', refreshToken, { expires: 30 });
          } else {
            Cookies.set('accessToken', accessToken);
            Cookies.set('refreshToken', refreshToken);
          }

          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            console.error('User data is undefined in response');
          }

          window.dispatchEvent(new Event('userChanged'));

          const dashboardPath = getDashboardPath(user.roles);
          const highestRole = getHighestRole(user.roles);
          const roleDisplay = getRoleDisplayName(highestRole);

          toast.success(`Chào mừng ${user.fullName}! Vai trò: ${roleDisplay}`);

          setTimeout(() => {
            navigate(dashboardPath);
          }, 1000);
        }
      } else {
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          privacyPolicyAccepted: true,
          privacyPolicyVersion: '1.0',
          termsOfServiceAccepted: true,
          termsOfServiceVersion: '1.0'
        });

        if (response.data.success) {
          setRegisterSuccess('Đăng ký thành công! Đang chuyển sang đăng nhập...');
          toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
          setTimeout(() => {
            setActiveTab('login');
            setRegisterSuccess('');
            reset();
          }, 1500);
        } else {
          // Backend returned success:false (shouldn't hit for 400 but handle anyway)
          setServerError(translateRegisterError(response.data.message));
        }
      }
    } catch (error) {
      const rawMessage =
        error.response?.data?.message ||
        error.response?.data?.error?.message ||
        '';
      const errorMessage = activeTab === 'login'
        ? (rawMessage || 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.')
        : translateRegisterError(rawMessage);
      setServerError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear server error when user starts typing
  const handleInputFocus = () => {
    if (serverError) setServerError('');
  };

  return (
    <div className="login-container">
      <div className="login-shell">
        <div className="login-shell__left">
          <div className="login-shell__brand" aria-hidden="true">
            <svg className="login-shell__logo" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M8 32L18 8"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M14 32L24 8"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.85"
              />
              <circle cx="30" cy="28" r="3" fill="white" />
            </svg>
          </div>

          <div
            className={`login-shell__tabs ${
              activeTab === 'login' ? 'login-shell__tabs--login' : 'login-shell__tabs--register'
            }`}
            role="tablist"
            aria-label="Chế độ đăng nhập"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'login'}
              className={`login-shell__tab ${activeTab === 'login' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('login')}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'register'}
              className={`login-shell__tab ${activeTab === 'register' ? 'is-active' : ''}`}
              onClick={() => setActiveTab('register')}
            >
              Đăng ký
            </button>
          </div>

          {activeTab === 'login' && (
            <>
              <header className="login-shell__header">
                <h1 className="login-shell__title">Q2K XIN CHÀO</h1>
                <p className="login-shell__subtitle">Vui lòng nhập thông tin tài khoản của bạn</p>
              </header>

              <form onSubmit={handleSubmit(onSubmit)} className="login-form login-form--stack" noValidate>
                {serverError && <InlineError message={serverError} />}
                <div className="form-group">
                  <label htmlFor="email">Địa chỉ email</label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    className={`login-input ${errors.email ? 'is-error' : ''}`}
                    placeholder="email@vidu.com"
                    onFocus={handleInputFocus}
                  />
                  {errors.email && <span className="error-message">{errors.email.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="password">Mật khẩu</label>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      {...register('password')}
                      className={`login-input ${errors.password ? 'is-error' : ''}`}
                      placeholder="••••••••"
                      onFocus={handleInputFocus}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-message">{errors.password.message}</span>
                  )}
                </div>

                <div className="form-row-actions">
                  <label className="checkbox-label">
                    <input type="checkbox" {...register('rememberMe')} />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <Link to="/forgot-password" className="forgot-password-link">
                    Quên mật khẩu?
                  </Link>
                </div>

                <button type="submit" className="submit-button login-submit" disabled={isLoading}>
                  {isLoading ? 'Đang đăng nhập…' : 'Đăng nhập'}
                </button>

                <div className="login-social" aria-label="Đăng nhập mạng xã hội">
                  <button type="button" className="login-social__btn" aria-label="Tiếp tục với Google">
                    <FaGoogle />
                  </button>
                  <button type="button" className="login-social__btn" aria-label="Tiếp tục với GitHub">
                    <FaGithub />
                  </button>
                  <button type="button" className="login-social__btn" aria-label="Tiếp tục với Facebook">
                    <FaFacebookF />
                  </button>
                </div>
              </form>
            </>
          )}

          {activeTab === 'register' && (
            <>
              <header className="login-shell__header">
                <h1 className="login-shell__title">Tạo tài khoản</h1>
                <p className="login-shell__subtitle">Tham gia cùng chúng tôi và đặt vé xem phim ngay</p>
              </header>

              <form onSubmit={handleSubmit(onSubmit)} className="login-form login-form--register" noValidate>
                {serverError && <InlineError message={serverError} />}
                {registerSuccess && (
                  <div className="inline-success" role="status">
                    <span className="inline-success__icon">✓</span>
                    <span>{registerSuccess}</span>
                  </div>
                )}
                <div className="form-group">
                  <label htmlFor="regEmail">Địa chỉ email</label>
                  <input
                    id="regEmail"
                    type="email"
                    {...register('email')}
                    className={`login-input ${errors.email ? 'is-error' : ''}`}
                    placeholder="email@vidu.com"
                    onFocus={handleInputFocus}
                  />
                  {errors.email && <span className="error-message">{errors.email.message}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="phoneNumber">Số điện thoại</label>
                  <input
                    id="phoneNumber"
                    type="text"
                    inputMode="numeric"
                    {...register('phoneNumber')}
                    className={`login-input ${errors.phoneNumber ? 'is-error' : ''}`}
                    placeholder="0912345678"
                    onFocus={handleInputFocus}
                  />
                  {errors.phoneNumber && (
                    <span className="error-message">{errors.phoneNumber.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="regPassword">Mật khẩu</label>
                  <div className="password-input-wrapper">
                    <input
                      id="regPassword"
                      type={showRegPassword ? 'text' : 'password'}
                      {...register('password')}
                      className={`login-input ${errors.password ? 'is-error' : ''}`}
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      aria-label={showRegPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showRegPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="error-message">{errors.password.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="regConfirmPassword">Nhập lại mật khẩu</label>
                  <div className="password-input-wrapper">
                    <input
                      id="regConfirmPassword"
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      className={`login-input ${errors.confirmPassword ? 'is-error' : ''}`}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="toggle-password"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      aria-label={
                        showRegConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'
                      }
                    >
                      {showRegConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="error-message">{errors.confirmPassword.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="fullName">Họ và tên</label>
                  <input
                    id="fullName"
                    type="text"
                    {...register('fullName')}
                    className={`login-input ${errors.fullName ? 'is-error' : ''}`}
                  />
                  {errors.fullName && (
                    <span className="error-message">{errors.fullName.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="dateOfBirth">Ngày sinh</label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    {...register('dateOfBirth')}
                    className={`login-input login-input--date ${errors.dateOfBirth ? 'is-error' : ''}`}
                  />
                  {errors.dateOfBirth && (
                    <span className="error-message">{errors.dateOfBirth.message}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="gender">Giới tính</label>
                  <select
                    id="gender"
                    {...register('gender')}
                    className={`login-input login-select ${errors.gender ? 'is-error' : ''}`}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                  {errors.gender && <span className="error-message">{errors.gender.message}</span>}
                </div>

                <div className="form-group checkbox-group-register">
                  <label className="checkbox-label">
                    <input type="checkbox" {...register('privacyPolicy')} />
                    <span>
                      Chính sách bảo mật{' '}
                      <button
                        type="button"
                        className="privacy-link"
                        onClick={() => setShowPrivacyPolicy(true)}
                      >
                        (Xem chi tiết)
                      </button>
                    </span>
                  </label>
                </div>

                <div className="form-group checkbox-group-register">
                  <label className="checkbox-label">
                    <input type="checkbox" {...register('acceptTerms')} />
                    <span>Điều khoản, điều kiện của thành viên</span>
                  </label>
                  {errors.acceptTerms && (
                    <span className="error-message">{errors.acceptTerms.message}</span>
                  )}
                </div>

                <button type="submit" className="submit-button login-submit" disabled={isLoading}>
                  {isLoading ? 'Đang đăng ký…' : 'Đăng ký'}
                </button>
              </form>
            </>
          )}
        </div>

        <aside className="login-shell__right" aria-label="Đánh giá khách hàng">
          <div className={`testimonial-card ${testimonialThemeClass}`}>
            <div className="testimonial-card__burst" aria-hidden="true">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="burstGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6B8CFF" />
                    <stop offset="100%" stopColor="#B06BFF" />
                  </linearGradient>
                </defs>
                {[...Array(12)].map((_, i) => (
                  <line
                    key={i}
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="20"
                    stroke="url(#burstGrad)"
                    strokeWidth="1.5"
                    opacity="0.35"
                    transform={`rotate(${i * 30} 100 100)`}
                  />
                ))}
              </svg>
            </div>

            <h2 className="testimonial-card__heading">Khán giả nói gì về chúng tôi</h2>
            <div className="testimonial-card__quote-wrap">
              <span className="testimonial-card__mark" aria-hidden="true">
                “
              </span>
              <blockquote className="testimonial-card__quote" key={testimonialIndex}>
                {testimonial.quote}
              </blockquote>
            </div>
            <div className="testimonial-card__author">
              <strong>{testimonial.author}</strong>
              <span>{testimonial.role}</span>
            </div>

            <div className="testimonial-card__nav">
              <button
                type="button"
                className="testimonial-card__nav-btn testimonial-card__nav-btn--prev"
                onClick={prevTestimonial}
                aria-label="Lời nhận xét trước"
              >
                ←
              </button>
              <button
                type="button"
                className="testimonial-card__nav-btn testimonial-card__nav-btn--next"
                onClick={nextTestimonial}
                aria-label="Lời nhận xét sau"
              >
                →
              </button>
            </div>
          </div>
        </aside>
      </div>

      <PrivacyPolicy isOpen={showPrivacyPolicy} onClose={() => setShowPrivacyPolicy(false)} />
    </div>
  );
};

export default LoginForm;
