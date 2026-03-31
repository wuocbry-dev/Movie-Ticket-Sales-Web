import React from 'react';
import './LoadingSpinner.css';

// Main Loading Spinner Component
export const LoadingSpinner = ({ 
  size = 'medium', 
  text = 'Đang tải...', 
  showText = true,
  variant = 'default',
  fullPage = false,
  overlay = false
}) => {
  const sizeClass = {
    small: 'spinner-small',
    medium: '',
    large: 'spinner-large'
  }[size] || '';

  const variantClass = {
    default: '',
    orange: 'spinner-orange',
    success: 'spinner-success',
    white: 'spinner-white',
    gradient: 'spinner-gradient'
  }[variant] || '';

  const containerClass = fullPage 
    ? 'loading-fullpage' 
    : overlay 
      ? 'loading-overlay' 
      : 'loading-container';

  return (
    <div className={containerClass}>
      <div className={`spinner ${sizeClass} ${variantClass}`}></div>
      {showText && <span className="loading-text-animated">{text}</span>}
    </div>
  );
};

// Dots Loading
export const LoadingDots = ({ text = 'Đang tải' }) => (
  <div className="loading-container">
    <div className="loading-dots">
      <span></span>
      <span></span>
      <span></span>
    </div>
    {text && <span className="loading-text">{text}</span>}
  </div>
);

// Pulse Loading
export const LoadingPulse = ({ text = 'Đang tải...' }) => (
  <div className="loading-container">
    <div className="loading-pulse"></div>
    {text && <span className="loading-text-animated">{text}</span>}
  </div>
);

// Inline Loading (for buttons)
export const LoadingInline = ({ text = 'Đang xử lý...' }) => (
  <span className="loading-inline">
    <div className="spinner spinner-small spinner-white"></div>
    {text && <span>{text}</span>}
  </span>
);

// Skeleton Loaders
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`skeleton-container ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div 
        key={i} 
        className="skeleton skeleton-text" 
        style={{ width: `${100 - (i * 10)}%` }}
      ></div>
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`skeleton-card ${className}`}>
    <div className="skeleton skeleton-image"></div>
    <div className="skeleton skeleton-title"></div>
    <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
    <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
  </div>
);

// Default export
export default LoadingSpinner;
