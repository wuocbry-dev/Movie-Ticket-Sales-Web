import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/UserInterface/Header';
import BookingStatusBar from './components/UserInterface/BookingStatusBar';
import Footer from './components/UserInterface/Footer';
import HomePage from './components/UserInterface/HomePage';
import LoginForm from './components/UserInterface/LoginForm';
import MovieDetail from './components/UserInterface/MovieDetail';
import ProfilePage from './components/UserInterface/ProfilePage';
import BookingHistory from './components/UserInterface/BookingHistory';
import Dashboard from './components/AdminDashboard/Dashboard';
import MovieManagement from './components/AdminDashboard/MovieManagement';
import AccountManagement from './components/AdminDashboard/AccountManagement';
import CinemaChainManagement from './components/AdminDashboard/CinemaChainManagement';
import CinemaManagement from './components/AdminDashboard/CinemaManagement';
import MyCinemaManagement from './components/AdminDashboard/MyCinemaManagement';
import UnifiedCinemaManagement from './components/AdminDashboard/UnifiedCinemaManagement';
import CinemaHallManagement from './components/AdminDashboard/CinemaHallManagement';
import ShowtimeManagement from './components/AdminDashboard/ShowtimeManagement';
import ManagerShowtimeManagement from './components/AdminDashboard/ManagerShowtimeManagement';
import BookingManagement from './components/AdminDashboard/BookingManagement';
import AdminLayout from './components/AdminDashboard/AdminLayout';
import StaffLayout from './components/Staff/StaffLayout';
import StaffDashboard from './components/Staff/StaffDashboard';
import TicketCheckIn from './components/Staff/TicketCheckIn';
import StaffPayment from './components/Staff/StaffPayment';
import StaffPaymentManager from './components/Staff/StaffPaymentManager';
import StaffConcessionOrders from './components/Staff/StaffConcessionOrders';
import AdminPaymentManager from './components/AdminDashboard/AdminPaymentManager';
import ComingSoon from './components/UserInterface/ComingSoon';
import NowShowingPage from './components/UserInterface/NowShowingPage';
import ComingSoonPage from './components/UserInterface/ComingSoonPage';
import CinemaListingPage from './components/UserInterface/CinemaListingPage';
import ConcessionsPage from './components/UserInterface/ConcessionsPage';
import PromotionsPage from './components/UserInterface/PromotionsPage';
import PromotionManagement from './components/AdminDashboard/PromotionManagement';
import BookingPage from './components/UserInterface/BookingPage';
import SeatSelection from './components/UserInterface/SeatSelection';
import BookingConfirmation from './components/UserInterface/BookingConfirmation';
import Q2KThankYouPage from './components/UserInterface/Q2KThankYouPage';
import ProtectedRoute from './components/UserInterface/ProtectedRoute';
import ConcessionCategoryManagement from './components/AdminDashboard/ConcessionCategoryManagement';
import ConcessionItemManagement from './components/AdminDashboard/ConcessionItemManagement';
import CinemaConcessionManagement from './components/AdminDashboard/CinemaConcessionManagement';
import ConcessionOrderManagement from './components/AdminDashboard/ConcessionOrderManagement';
import CinemaStaffManagement from './components/AdminDashboard/CinemaStaffManagement';
import ForgotPassword from './components/UserInterface/ForgotPassword';
import BottomNav from './components/UserInterface/BottomNav';
import { QuickBookingProvider } from './components/UserInterface/QuickBookingContext';
import { ROLES } from './utils/roleUtils';
// Import LoadingSpinner.css last to override other loading-spinner styles
import './components/UserInterface/LoadingSpinner.css';

// Component to conditionally render Footer
const ConditionalFooter = () => {
  const location = useLocation();
  const hideFooterPaths = ['/admin', '/staff', '/system-admin', '/login', '/forgot-password', '/booking'];
  const shouldHideFooter = hideFooterPaths.some(path => location.pathname.startsWith(path));
  if (shouldHideFooter) return null;
  return <Footer />;
};

// Bottom nav - chỉ hiện trên mobile, trang công khai
const ConditionalBottomNav = () => {
  const location = useLocation();
  const hidePaths = ['/admin', '/staff', '/system-admin', '/login', '/forgot-password', '/booking'];
  const shouldHide = hidePaths.some(path => location.pathname.startsWith(path));
  if (shouldHide) return null;
  return <BottomNav />;
};

// Không dùng Header / BookingStatusBar của site công khai trên khu admin & staff — layout riêng full màn hình
const ADMIN_STAFF_PREFIXES = ['/admin', '/system-admin', '/staff'];
const isAdminOrStaffShell = (pathname) =>
  ADMIN_STAFF_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));

const ConditionalHeader = () => {
  const location = useLocation();
  if (isAdminOrStaffShell(location.pathname)) return null;
  return <Header />;
};

const ConditionalBookingStatusBar = () => {
  const location = useLocation();
  if (isAdminOrStaffShell(location.pathname)) return null;
  return <BookingStatusBar />;
};

function App() {
  // Clean up corrupted localStorage on app initialization
  useEffect(() => {
    const cleanupLocalStorage = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr === 'undefined' || userStr === 'null') {
          console.warn('Removing corrupted user data from localStorage');
          localStorage.removeItem('user');
        } else if (userStr) {
          // Try to parse and validate
          try {
            JSON.parse(userStr);
          } catch (e) {
            console.error('Invalid JSON in localStorage, removing:', e);
            localStorage.removeItem('user');
          }
        }
      } catch (e) {
        console.error('Error cleaning localStorage:', e);
      }
    };
    
    cleanupLocalStorage();
  }, []);

  return (
    <Router>
      <QuickBookingProvider>
      <div className="App">
        <ConditionalHeader />
        <ConditionalBookingStatusBar />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/:showtimeId" element={<SeatSelection />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/q2k-thank-you" element={<Q2KThankYouPage />} />
          <Route path="/now-showing" element={<NowShowingPage />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          <Route path="/cinemas" element={<CinemaListingPage />} />
          <Route path="/concessions" element={<ConcessionsPage />} />
          <Route path="/promotions" element={<PromotionsPage />} />
          
          {/* Protected Customer Routes */}
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER, ROLES.CINEMA_STAFF, ROLES.CINEMA_MANAGER, ROLES.SYSTEM_ADMIN]}>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute allowedRoles={[ROLES.CUSTOMER, ROLES.CINEMA_STAFF, ROLES.CINEMA_MANAGER, ROLES.SYSTEM_ADMIN]}>
              <BookingHistory />
            </ProtectedRoute>
          } />
          
          {/* Unified Admin Routes - CINEMA_MANAGER & SYSTEM_ADMIN */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[ROLES.CINEMA_MANAGER, ROLES.SYSTEM_ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            {/* Core Management */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="movies" element={<MovieManagement />} />
            <Route path="cinema-chains" element={<CinemaChainManagement />} />
            <Route path="cinema-management" element={<CinemaChainManagement />} />
            <Route path="cinemas" element={<CinemaManagement />} />
            <Route path="cinemas/:cinemaId" element={<CinemaHallManagement />} />
            
            {/* Showtimes - Admin only */}
            <Route path="showtimes" element={<ShowtimeManagement />} />
            
            {/* Manager Showtimes - Cinema Manager only */}
            <Route path="manager-showtimes" element={<ManagerShowtimeManagement />} />
            
            {/* Sales */}
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="payment-manager" element={<AdminPaymentManager />} />
            <Route path="promotions" element={<PromotionManagement />} />
            
            {/* Concession Management */}
            <Route path="concession-categories" element={<ConcessionCategoryManagement />} />
            <Route path="concession-items" element={<ConcessionItemManagement />} />
            <Route path="cinema-concessions" element={<CinemaConcessionManagement />} />
            <Route path="concession-orders" element={<ConcessionOrderManagement />} />
            
            {/* User Management */}
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="staff" element={<ComingSoon feature="Quản Lý Nhân Viên" />} />
            <Route path="cinema-staffs" element={<CinemaStaffManagement />} />
            
            {/* System & Reports */}
            <Route path="reports" element={<ComingSoon feature="Báo Cáo & Thống Kê" />} />
            <Route path="audit-logs" element={<ComingSoon feature="Nhật Ký Hệ Thống" />} />
            <Route path="settings" element={<ComingSoon feature="Cấu Hình Hệ Thống" />} />
          </Route>

          {/* Redirect old system-admin routes to /admin */}
          <Route path="/system-admin/*" element={
            <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="*" element={<ComingSoon feature="Tính năng này" />} />
          </Route>

          {/* Staff Routes - CINEMA_STAFF */}
          <Route path="/staff" element={
            <ProtectedRoute allowedRoles={[ROLES.CINEMA_STAFF]}>
              <StaffLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<StaffDashboard />} />
            <Route path="check-in" element={<TicketCheckIn />} />
            <Route path="concession-orders" element={<StaffConcessionOrders />} />
            <Route path="payment" element={<StaffPayment />} />
            <Route path="payment-manager" element={<StaffPaymentManager />} />
          </Route>
        </Routes>
        <ConditionalFooter />
        <ConditionalBottomNav />
      </div>
      </QuickBookingProvider>
    </Router>
  );
}

export default App;
