/**
 * Price Calculation Utilities
 * Đồng bộ với backend BookingService.java
 */

// Hằng số (đồng bộ với backend)
export const TAX_RATE = 0.10; // 10% thuế VAT
export const SERVICE_FEE_PER_TICKET = 5000; // 5,000 VND phí dịch vụ/ghế

/**
 * Tính toán chi tiết giá tiền cho booking
 * Công thức (giống backend BookingService.java):
 * - subtotal = basePrice × số_ghế
 * - serviceFee = 5,000 × số_ghế  
 * - tax = subtotal × 0.10
 * - total = subtotal + serviceFee + tax - discount
 * 
 * @param {number} basePrice - Giá vé cơ bản từ showtime
 * @param {number} numberOfSeats - Số lượng ghế đã chọn
 * @param {number} discountAmount - Số tiền giảm giá (mặc định 0)
 * @returns {Object} Chi tiết giá tiền
 */
export const calculateBookingPrice = (basePrice, numberOfSeats, discountAmount = 0) => {
  // Validate input
  if (!basePrice || basePrice <= 0 || !numberOfSeats || numberOfSeats <= 0) {
    return {
      subtotal: 0,
      serviceFee: 0,
      tax: 0,
      discount: 0,
      total: 0
    };
  }

  // Tính toán theo công thức backend
  const subtotal = basePrice * numberOfSeats;
  const serviceFee = SERVICE_FEE_PER_TICKET * numberOfSeats;
  const tax = subtotal * TAX_RATE;
  const discount = discountAmount || 0;
  const total = subtotal + serviceFee + tax - discount;

  return {
    subtotal: Math.round(subtotal), // Làm tròn để tránh số lẻ
    serviceFee: Math.round(serviceFee),
    tax: Math.round(tax),
    discount: Math.round(discount),
    total: Math.round(total)
  };
};

/**
 * Tính giá cho từng ghế dựa trên loại ghế
 * @param {number} basePrice - Giá vé cơ bản
 * @param {string} seatType - Loại ghế (NORMAL, VIP, COUPLE, DISABLED)
 * @returns {number} Giá ghế
 */
export const calculateSeatPrice = (basePrice, seatType) => {
  if (!basePrice || basePrice <= 0) return 0;

  switch (seatType) {
    case 'VIP':
      return basePrice * 1.5;
    case 'COUPLE':
      return basePrice * 2;
    case 'DISABLED':
      return basePrice * 0.8; // Giảm giá 20%
    case 'NORMAL':
    default:
      return basePrice;
  }
};

/**
 * Format giá tiền theo định dạng Việt Nam
 * @param {number} price - Giá tiền
 * @returns {string} Giá tiền đã format
 */
export const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price || 0);
};

/**
 * Tính tổng giá tiền từ danh sách ghế đã chọn
 * @param {Array} selectedSeats - Danh sách ghế đã chọn
 * @param {number} basePrice - Giá vé cơ bản
 * @returns {number} Tổng giá tiền các ghế (chưa bao gồm phí và thuế)
 */
export const calculateSeatsTotal = (selectedSeats, basePrice) => {
  if (!selectedSeats || selectedSeats.length === 0 || !basePrice) return 0;

  return selectedSeats.reduce((total, seat) => {
    const seatPrice = calculateSeatPrice(basePrice, seat.seatType);
    return total + seatPrice;
  }, 0);
};

/**
 * Ví dụ sử dụng:
 * 
 * const priceDetails = calculateBookingPrice(100000, 2); // 2 ghế, giá 100k/ghế
 * // Result:
 * // {
 * //   subtotal: 200000,      // 100,000 × 2
 * //   serviceFee: 10000,     // 5,000 × 2
 * //   tax: 20000,            // 200,000 × 0.10
 * //   discount: 0,
 * //   total: 230000          // 200,000 + 10,000 + 20,000
 * // }
 */
