# BOOKING API DOCUMENTATION

## Overview
Complete CRUD API for booking management in the Movie Ticket Sales System.

## Base URL
```
http://localhost:8080/api/bookings
```

## Endpoints

### 1. Get All Bookings (Paginated)
**GET** `/api/bookings?page=0&size=10`

**Authentication**: Required

**Query Parameters**:
- `page` (optional, default: 0) - Page number
- `size` (optional, default: 10) - Page size

**Response**:
```json
{
  "totalElements": 100,
  "totalPages": 10,
  "currentPage": 0,
  "pageSize": 10,
  "hasNext": true,
  "hasPrevious": false,
  "data": [
    {
      "bookingId": 1,
      "bookingCode": "BK202512050930001234",
      "userId": 5,
      "username": "user@example.com",
      "customerName": "Nguyen Van A",
      "customerEmail": "nguyenvana@example.com",
      "customerPhone": "0901234567",
      "showtimeId": 10,
      "movieTitle": "Avatar: The Way of Water",
      "cinemaName": "CGV Vincom",
      "hallName": "Hall 1",
      "showDate": "2025-12-10",
      "startTime": "19:30:00",
      "formatType": "3D",
      "bookingDate": "2025-12-05T02:30:00Z",
      "totalSeats": 2,
      "subtotal": 200000,
      "discountAmount": 0,
      "taxAmount": 20000,
      "serviceFee": 10000,
      "totalAmount": 230000,
      "status": "PAID",
      "paymentStatus": "COMPLETED",
      "paymentMethod": "MOMO",
      "paymentReference": "MOMO123456789",
      "paidAt": "2025-12-05T02:35:00Z",
      "holdExpiresAt": null,
      "qrCode": null,
      "invoiceNumber": null,
      "invoiceIssuedAt": null,
      "createdAt": "2025-12-05T02:30:00Z",
      "updatedAt": "2025-12-05T02:35:00Z"
    }
  ]
}
```

---

### 2. Get Booking by ID
**GET** `/api/bookings/{bookingId}`

**Authentication**: Required

**Path Parameters**:
- `bookingId` - Booking ID

**Response**:
```json
{
  "bookingId": 1,
  "bookingCode": "BK202512050930001234",
  "customerName": "Nguyen Van A",
  "customerEmail": "nguyenvana@example.com",
  "customerPhone": "0901234567",
  "showtimeId": 10,
  "movieTitle": "Avatar: The Way of Water",
  "cinemaName": "CGV Vincom",
  "hallName": "Hall 1",
  "showDate": "2025-12-10",
  "startTime": "19:30:00",
  "formatType": "3D",
  "totalSeats": 2,
  "subtotal": 200000,
  "totalAmount": 230000,
  "status": "PAID",
  "tickets": [
    {
      "ticketId": 1,
      "ticketCode": "TKABCD1234",
      "seatId": 45,
      "seatNumber": "5",
      "seatRow": "A",
      "seatType": "STANDARD",
      "basePrice": 100000,
      "surchargeAmount": 0,
      "discountAmount": 0,
      "finalPrice": 115000,
      "status": "BOOKED",
      "checkedInAt": null,
      "checkedInByUsername": null
    },
    {
      "ticketId": 2,
      "ticketCode": "TKABCD5678",
      "seatId": 46,
      "seatNumber": "6",
      "seatRow": "A",
      "seatType": "STANDARD",
      "basePrice": 100000,
      "surchargeAmount": 0,
      "discountAmount": 0,
      "finalPrice": 115000,
      "status": "BOOKED",
      "checkedInAt": null,
      "checkedInByUsername": null
    }
  ]
}
```

---

### 3. Get Booking by Booking Code
**GET** `/api/bookings/code/{bookingCode}`

**Authentication**: Not Required (Public - for guest users to check their booking)

**Path Parameters**:
- `bookingCode` - Booking code (e.g., "BK202512050930001234")

**Response**: Same as Get Booking by ID

---

### 4. Get Bookings by User ID
**GET** `/api/bookings/user/{userId}?page=0&size=10`

**Authentication**: Required

**Path Parameters**:
- `userId` - User ID

**Query Parameters**:
- `page` (optional, default: 0) - Page number
- `size` (optional, default: 10) - Page size

**Response**: Same as Get All Bookings

---

### 5. Get Bookings by Status
**GET** `/api/bookings/status/{status}?page=0&size=10`

**Authentication**: Required

**Path Parameters**:
- `status` - Booking status (PENDING, CONFIRMED, PAID, CANCELLED, REFUNDED)

**Query Parameters**:
- `page` (optional, default: 0) - Page number
- `size` (optional, default: 10) - Page size

**Response**: Same as Get All Bookings

---

### 6. Get Bookings by Showtime ID
**GET** `/api/bookings/showtime/{showtimeId}?page=0&size=10`

**Authentication**: Required

**Path Parameters**:
- `showtimeId` - Showtime ID

**Query Parameters**:
- `page` (optional, default: 0) - Page number
- `size` (optional, default: 10) - Page size

**Response**: Same as Get All Bookings

---

### 7. Create Booking
**POST** `/api/bookings`

**Authentication**: Not Required (Allows guest bookings)

**Request Body**:
```json
{
  "userId": 5,
  "showtimeId": 10,
  "customerName": "Nguyen Van A",
  "customerEmail": "nguyenvana@example.com",
  "customerPhone": "0901234567",
  "seatIds": [45, 46],
  "voucherCode": null,
  "paymentMethod": "MOMO"
}
```

**Field Descriptions**:
- `userId` (optional) - User ID if logged in
- `showtimeId` (required) - Showtime ID
- `customerName` (required) - Customer full name
- `customerEmail` (required) - Valid email address
- `customerPhone` (required) - Phone number (10-20 digits)
- `seatIds` (required) - Array of seat IDs to book
- `voucherCode` (optional) - Voucher/discount code
- `paymentMethod` (required) - Payment method (e.g., "MOMO", "VNPAY", "CARD")

**Response**:
```json
{
  "bookingId": 1,
  "bookingCode": "BK202512050930001234",
  "customerName": "Nguyen Van A",
  "customerEmail": "nguyenvana@example.com",
  "customerPhone": "0901234567",
  "showtimeId": 10,
  "movieTitle": "Avatar: The Way of Water",
  "totalSeats": 2,
  "subtotal": 200000,
  "discountAmount": 0,
  "taxAmount": 20000,
  "serviceFee": 10000,
  "totalAmount": 230000,
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "paymentMethod": "MOMO",
  "holdExpiresAt": "2025-12-05T02:45:00Z",
  "tickets": [...]
}
```

**Business Logic**:
- Validates showtime exists
- Validates all seats exist and are available
- Checks seats are not already booked for this showtime
- Calculates total amount with tax (10%) and service fee (5000 VND per ticket)
- Creates booking with PENDING status
- Creates tickets for each seat with BOOKED status
- Reduces available seats in showtime
- Sets 15-minute hold expiry time
- Generates unique booking code (BK + timestamp + random 4 digits)
- Generates unique ticket codes (TK + random 8 chars)

**Validation**:
- Customer name: Required, max 100 characters
- Customer email: Required, valid email format
- Customer phone: Required, 10-20 digits
- Seat IDs: Required, at least 1 seat
- Payment method: Required

**Error Responses**:
```json
{
  "success": false,
  "message": "Seat A5 is already booked"
}
```

---

### 8. Update Booking
**PUT** `/api/bookings/{bookingId}`

**Authentication**: Required

**Path Parameters**:
- `bookingId` - Booking ID

**Request Body**:
```json
{
  "status": "PAID",
  "paymentStatus": "COMPLETED",
  "paymentReference": "MOMO123456789",
  "customerName": "Nguyen Van A Updated",
  "customerEmail": "newemail@example.com",
  "customerPhone": "0909999999"
}
```

**All fields are optional**

**Response**: Same as Get Booking by ID

**Business Logic**:
- If status changed to CANCELLED:
  - Restores seat availability
  - Updates all tickets to CANCELLED status
- If status changed to PAID:
  - Sets paidAt to current time
  - Sets paymentStatus to COMPLETED

---

### 9. Cancel Booking
**POST** `/api/bookings/{bookingId}/cancel`

**Authentication**: Required

**Path Parameters**:
- `bookingId` - Booking ID

**Response**:
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

**Business Logic**:
- Cannot cancel if already cancelled
- Cannot cancel if already paid (must request refund instead)
- Updates booking status to CANCELLED
- Restores seat availability in showtime
- Updates all tickets to CANCELLED status

**Error Responses**:
```json
{
  "success": false,
  "message": "Booking is already cancelled"
}
```
```json
{
  "success": false,
  "message": "Cannot cancel a paid booking. Please request a refund."
}
```

---

### 10. Delete Booking (Admin Only)
**DELETE** `/api/bookings/admin/{bookingId}`

**Authentication**: Required (SYSTEM_ADMIN role)

**Path Parameters**:
- `bookingId` - Booking ID

**Response**:
```json
{
  "success": true,
  "message": "Booking deleted successfully"
}
```

**Business Logic**:
- Deletes all associated tickets first
- Restores seat availability in showtime
- Permanently deletes booking record

---

## Enums

### StatusBooking
```
PENDING     - Booking created, awaiting payment
CONFIRMED   - Booking confirmed
PAID        - Payment completed
CANCELLED   - Booking cancelled
REFUNDED    - Payment refunded
```

### PaymentStatus
```
PENDING     - Payment not yet initiated
PROCESSING  - Payment in progress
COMPLETED   - Payment successful
FAILED      - Payment failed
REFUNDED    - Payment refunded
```

### TicketStatus
```
BOOKED      - Ticket booked
CANCELLED   - Ticket cancelled
CHECKED_IN  - Customer checked in
USED        - Ticket used
```

---

## Pricing Calculation

**Example**:
- Base price per ticket: 100,000 VND
- Number of tickets: 2
- Subtotal: 200,000 VND
- Tax (10%): 20,000 VND
- Service fee (5,000 VND × 2): 10,000 VND
- **Total Amount: 230,000 VND**

**Per ticket breakdown**:
- Base price: 100,000 VND
- Tax (10%): 10,000 VND
- Service fee: 5,000 VND
- **Final price per ticket: 115,000 VND**

---

## cURL Examples

### Create Booking
```bash
curl -X POST "http://localhost:8080/api/bookings" \
  -H "Content-Type: application/json" \
  -d '{
    "showtimeId": 10,
    "customerName": "Nguyen Van A",
    "customerEmail": "nguyenvana@example.com",
    "customerPhone": "0901234567",
    "seatIds": [45, 46],
    "paymentMethod": "MOMO"
  }'
```

### Get Booking by Code (Guest)
```bash
curl -X GET "http://localhost:8080/api/bookings/code/BK202512050930001234"
```

### Get User's Bookings
```bash
curl -X GET "http://localhost:8080/api/bookings/user/5?page=0&size=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Booking Status to PAID
```bash
curl -X PUT "http://localhost:8080/api/bookings/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID",
    "paymentStatus": "COMPLETED",
    "paymentReference": "MOMO123456789"
  }'
```

### Cancel Booking
```bash
curl -X POST "http://localhost:8080/api/bookings/1/cancel" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Delete Booking (Admin)
```bash
curl -X DELETE "http://localhost:8080/api/bookings/admin/1" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

---

## Security Configuration

**Public Endpoints**:
- `POST /api/bookings` - Create booking (guest allowed)
- `GET /api/bookings/code/{bookingCode}` - Check booking by code

**Authenticated Endpoints**:
- `GET /api/bookings/**` - View bookings
- `GET /api/bookings/user/{userId}` - User's bookings
- `PUT /api/bookings/{bookingId}` - Update booking
- `POST /api/bookings/{bookingId}/cancel` - Cancel booking

**Admin Only**:
- `DELETE /api/bookings/admin/{bookingId}` - Delete booking

---

## Notes

1. **Guest Bookings**: Users can create bookings without logging in by providing customer information
2. **Booking Hold**: Bookings are held for 15 minutes before expiry
3. **Seat Locking**: Seats are immediately locked when booking is created
4. **Automatic Calculations**: Tax and service fees are calculated automatically
5. **Booking Code**: Unique code generated for each booking (format: BK + timestamp + random 4 digits)
6. **Ticket Code**: Unique code generated for each ticket (format: TK + random 8 uppercase chars)
7. **Cancellation Rules**: 
   - Cannot cancel already cancelled bookings
   - Cannot cancel paid bookings (must request refund)
8. **Seat Restoration**: Cancelled bookings automatically restore seat availability
