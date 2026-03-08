import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';
import LoginForm from './components/LoginForm';
import MovieDetail from './components/MovieDetail';
import ProfilePage from './components/ProfilePage';
import BookingHistory from './components/BookingHistory';
import Dashboard from './components/Dashboard';
import MovieManagement from './components/MovieManagement';
import AccountManagement from './components/AccountManagement';
import CinemaChainManagement from './components/CinemaChainManagement';
import CinemaManagement from './components/CinemaManagement';
import MyCinemaManagement from './components/MyCinemaManagement';
import UnifiedCinemaManagement from './components/UnifiedCinemaManagement';
import CinemaHallManagement from './components/CinemaHallManagement';
import ShowtimeManagement from './components/ShowtimeManagement';
import ManagerShowtimeManagement from './components/ManagerShowtimeManagement';
import BookingManagement from './components/BookingManagement';
import AdminLayout from './components/AdminLayout';
import SystemAdminLayout from './components/SystemAdminLayout';
import SystemAdminDashboard from './components/SystemAdminDashboard';
import StaffLayout from './components/StaffLayout';
import StaffDashboard from './components/StaffDashboard';
import TicketCheckIn from './components/TicketCheckIn';
import StaffPayment from './components/StaffPayment';
import StaffPaymentManager from './components/StaffPaymentManager';
import StaffConcessionOrders from './components/StaffConcessionOrders';
import AdminPaymentManager from './components/AdminPaymentManager';
import ComingSoon from './components/ComingSoon';
import NowShowingPage from './components/NowShowingPage';
import ComingSoonPage from './components/ComingSoonPage';
import CinemaListingPage from './components/CinemaListingPage';
import BookingPage from './components/BookingPage';
import SeatSelection from './components/SeatSelection';
import BookingConfirmation from './components/BookingConfirmation';
import ProtectedRoute from './components/ProtectedRoute';
import ConcessionCategoryManagement from './components/ConcessionCategoryManagement';
import ConcessionItemManagement from './components/ConcessionItemManagement';
import CinemaConcessionManagement from './components/CinemaConcessionManagement';
import ConcessionOrderManagement from './components/ConcessionOrderManagement';
import CinemaStaffManagement from './components/CinemaStaffManagement';
import ForgotPassword from './components/ForgotPassword';
import { ROLES } from './utils/roleUtils';
// Import LoadingSpinner.css last to override other loading-spinner styles
import './components/LoadingSpinner.css';

// Component to conditionally render Footer
const ConditionalFooter = () => {
  const location = useLocation();
  // Hide footer on admin, staff, login, and booking-related pages
  const hideFooterPaths = ['/admin', '/staff', '/system-admin', '/login', '/forgot-password', '/booking'];
  const shouldHideFooter = hideFooterPaths.some(path => location.pathname.startsWith(path));
  
  if (shouldHideFooter) return null;
  return <Footer />;
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
      <div className="App">
        <Header />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/:showtimeId" element={<SeatSelection />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/now-showing" element={<NowShowingPage />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          <Route path="/cinemas" element={<CinemaListingPage />} />
          
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
            <Route path="promotions" element={<ComingSoon feature="Quản Lý Khuyến Mãi" />} />
            
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
            <Route path="notifications" element={<ComingSoon feature="Thông Báo Hệ Thống" />} />
            <Route path="audit-logs" element={<ComingSoon feature="Nhật Ký Hệ Thống" />} />
            <Route path="settings" element={<ComingSoon feature="Cấu Hình Hệ Thống" />} />
          </Route>

          {/* Redirect old system-admin routes to /admin */}
          <Route path="/system-admin/*" element={
            <ProtectedRoute allowedRoles={[ROLES.SYSTEM_ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }>
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
        <ToastContainer
          position="bottom-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          style={{ fontSize: '14px', width: '320px' }}
        />
      </div>
    </Router>
  );
}

export default App;
