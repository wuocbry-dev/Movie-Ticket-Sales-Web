import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import { toast } from 'react-toastify';
import Cookies from 'js-cookie';
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import PrivacyPolicy from './PrivacyPolicy';
import { getDashboardPath, getRoleDisplayName, getHighestRole } from '../utils/roleUtils';
import './LoginForm.css';

// API Base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Schema validation
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

const LoginForm = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(activeTab === 'login' ? loginSchema : registerSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      if (activeTab === 'login') {
        // Gọi API đăng nhập
        const response = await axios.post(`${API_BASE_URL}/auth/login`, {
          email: data.email,
          password: data.password
        });

        if (response.data.success) {
          const { accessToken, refreshToken, user } = response.data.data;
          
          // Lưu token vào cookies
          if (data.rememberMe) {
            Cookies.set('accessToken', accessToken, { expires: 7 });
            Cookies.set('refreshToken', refreshToken, { expires: 30 });
          } else {
            Cookies.set('accessToken', accessToken);
            Cookies.set('refreshToken', refreshToken);
          }

          // Lưu thông tin user vào localStorage (kiểm tra user tồn tại)
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            console.error('User data is undefined in response');
          }

          // Dispatch event để Header cập nhật
          window.dispatchEvent(new Event('userChanged'));

          // Xác định dashboard path dựa trên role
          const dashboardPath = getDashboardPath(user.roles);
          const highestRole = getHighestRole(user.roles);
          const roleDisplay = getRoleDisplayName(highestRole);

          toast.success(
            `Chào mừng ${user.fullName}!\n` +
            `Vai trò: ${roleDisplay}`,
            { autoClose: 2000 }
          );
          
          // Chuyển đến dashboard phù hợp sau 1 giây
          setTimeout(() => {
            navigate(dashboardPath);
          }, 1000);
        }
      } else {
        // Gọi API đăng ký
        const response = await axios.post(`${API_BASE_URL}/auth/register`, {
          email: data.email,
          phoneNumber: data.phoneNumber,
          password: data.password,
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          privacyPolicyAccepted: true,
          privacyPolicyVersion: "1.0",
          termsOfServiceAccepted: true,
          termsOfServiceVersion: "1.0"
        });

        if (response.data.success) {
          const { fullName, email, membershipNumber, tierName } = response.data.data;
          
          toast.success(
            `${response.data.message}\n` +
            `Chào mừng ${fullName}!\n` +
            `Membership: ${membershipNumber}\n` +
            `Hạng: ${tierName}`,
            { autoClose: 5000 }
          );
          
          setActiveTab('login');
          reset();
        }
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        error.response?.data?.error?.message ||
        (activeTab === 'login' ? 'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.' : 'Đăng ký thất bại. Vui lòng thử lại.');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            ĐĂNG NHẬP
          </button>
          <button
            className={`tab ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            ĐĂNG KÝ
          </button>
        </div>

        {activeTab === 'login' && (
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={errors.email ? 'error' : ''}
                placeholder="Nhập email của bạn"
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">
                Mật khẩu <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={errors.password ? 'error' : ''}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" {...register('rememberMe')} />
                <span>Lưu mật khẩu đăng nhập</span>
              </label>
              <Link to="/forgot-password" className="forgot-password-link">
                Quên mật khẩu?
              </Link>
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleSubmit(onSubmit)} className="register-form">
            <div className="form-group">
              <label htmlFor="regEmail">
                Email <span className="required">*</span>
              </label>
              <input
                id="regEmail"
                type="email"
                {...register('email')}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">
                PhoneNumber <span className="required">*</span>
              </label>
              <input
                id="phoneNumber"
                type="text"
                {...register('phoneNumber')}
                className={errors.phoneNumber ? 'error' : ''}
              />
              {errors.phoneNumber && (
                <span className="error-message">{errors.phoneNumber.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="regPassword">
                Mật khẩu <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="regPassword"
                  type={showRegPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                >
                  {showRegPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </button>
              </div>
              {errors.password && (
                <span className="error-message">{errors.password.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="fullName">
                Họ và Tên <span className="required">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                {...register('fullName')}
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && (
                <span className="error-message">{errors.fullName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="dateOfBirth">
                Ngày Sinh <span className="required">*</span>
              </label>
              <input
                id="dateOfBirth"
                type="date"
                {...register('dateOfBirth')}
                className={errors.dateOfBirth ? 'error' : ''}
                placeholder="dd/mm/yyyy"
              />
              {errors.dateOfBirth && (
                <span className="error-message">{errors.dateOfBirth.message}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="gender">
                Giới tính <span className="required">*</span>
              </label>
              <select
                id="gender"
                {...register('gender')}
                className={errors.gender ? 'error' : ''}
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
              {errors.gender && (
                <span className="error-message">{errors.gender.message}</span>
              )}
            </div>

            <div className="form-group checkbox-group">
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

            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input type="checkbox" {...register('acceptTerms')} />
                <span>Điều khoản, điều kiện của thành viên ...</span>
              </label>
              {errors.acceptTerms && (
                <span className="error-message">{errors.acceptTerms.message}</span>
              )}
            </div>

            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading ? 'ĐANG ĐĂNG KÝ...' : 'ĐĂNG KÝ'}
            </button>
          </form>
        )}
      </div>
      
      <PrivacyPolicy 
        isOpen={showPrivacyPolicy} 
        onClose={() => setShowPrivacyPolicy(false)} 
      />
    </div>
  );
};

export default LoginForm;
