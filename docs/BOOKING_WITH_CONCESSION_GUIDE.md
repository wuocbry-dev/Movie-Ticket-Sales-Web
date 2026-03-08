# BOOKING WITH CONCESSION API TESTING GUIDE

## 🎯 Complete Flow: Book Tickets + Buy Concessions

### Step 1: Login to get JWT Token
```bash
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

**Copy the `accessToken` from response!**

---

### Step 2: Select Showtime & Check Available Seats
```bash
GET http://localhost:8080/api/showtimes/{showtimeId}
```

---

### Step 3: Hold Seats (Important!)
```bash
POST http://localhost:8080/api/seats/hold
Content-Type: application/json

{
  "showtimeId": 1,
  "seatIds": [1, 2, 3],
  "sessionId": "your-browser-session-id-12345"
}
```

**Response:**
```json
{
  "success": true,
  "expiresAt": "2024-12-07T10:15:00Z",
  "holdDuration": 300
}
```

---

### Step 4: Browse Concession Items at Cinema
```bash
GET http://localhost:8080/api/cinemas/{cinemaId}/concessions
```

**Example Response:**
```json
[
  {
    "cinemaItemId": 1,
    "itemId": 1,
    "itemName": "Bắp rang bơ lớn",
    "categoryName": "Đồ ăn",
    "effectivePrice": 50000,
    "stockQuantity": 100,
    "isAvailable": true,
    "size": "L",
    "calories": 500
  },
  {
    "cinemaItemId": 2,
    "itemId": 2,
    "itemName": "Coca Cola",
    "categoryName": "Nước uống",
    "effectivePrice": 30000,
    "stockQuantity": 150,
    "isAvailable": true,
    "size": "M",
    "calories": 200
  }
]
```

---

### Step 5: Create Booking WITH Concession Items
```bash
POST http://localhost:8080/api/bookings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "userId": 1,
  "showtimeId": 1,
  "seatIds": [1, 2, 3],
  "sessionId": "your-browser-session-id-12345",
  "paymentMethod": "BANK_TRANSFER",
  "concessionItems": [
    {
      "itemId": 1,
      "quantity": 2,
      "price": 50000
    },
    {
      "itemId": 2,
      "quantity": 3,
      "price": 30000
    }
  ]
}
```

**What happens:**
1. ✅ Validates seats are held by your session
2. ✅ Creates booking with tickets
3. ✅ Creates concession order linked to booking
4. ✅ Deducts stock from cinema inventory
5. ✅ Calculates total: Ticket Price + Concession Price
6. ✅ Returns booking details with concession summary

**Response:**
```json
{
  "bookingId": 123,
  "bookingCode": "BK20241207-ABC123",
  "totalAmount": 430000,
  "status": "PENDING",
  "paymentStatus": "PENDING",
  "tickets": [
    {
      "ticketCode": "TK-001",
      "seatNumber": "A1",
      "price": 80000
    },
    {
      "ticketCode": "TK-002",
      "seatNumber": "A2",
      "price": 80000
    },
    {
      "ticketCode": "TK-003",
      "seatNumber": "A3",
      "price": 80000
    }
  ],
  "concessionOrder": {
    "orderId": 45,
    "totalAmount": 190000,
    "status": "PENDING",
    "items": [
      {
        "itemId": 1,
        "itemName": "Bắp rang bơ lớn",
        "quantity": 2,
        "unitPrice": 50000,
        "totalPrice": 100000
      },
      {
        "itemId": 2,
        "itemName": "Coca Cola",
        "quantity": 3,
        "unitPrice": 30000,
        "totalPrice": 90000
      }
    ]
  }
}
```

**Price Breakdown:**
```
Tickets (3 x 80,000)     = 240,000 VND
Concessions              = 190,000 VND
                         -----------
TOTAL                    = 430,000 VND
```

---

### Step 6: Get Booking Details
```bash
GET http://localhost:8080/api/bookings/{bookingId}
Authorization: Bearer YOUR_JWT_TOKEN
```

This will return full booking details including concession order!

---

## 🎭 Frontend Integration

### In `BookingConfirmation.js`:

```javascript
const bookingData = {
  userId: user.userId,
  showtimeId: showtime.showtimeId,
  seatIds: selectedSeats.map(s => s.seatId),
  sessionId: sessionId,
  paymentMethod: 'BANK_TRANSFER',
  concessionItems: concessionData.items.length > 0 ? 
    concessionData.items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
      price: item.price
    })) : null
};

const response = await bookingService.createBooking(bookingData);
```

---

## 🔍 Testing Scenarios

### Scenario 1: Book WITHOUT Concessions
```json
{
  "userId": 1,
  "showtimeId": 1,
  "seatIds": [1, 2],
  "sessionId": "session-123",
  "paymentMethod": "BANK_TRANSFER"
  // NO concessionItems - this is fine!
}
```

### Scenario 2: Book WITH Concessions
```json
{
  "userId": 1,
  "showtimeId": 1,
  "seatIds": [1, 2],
  "sessionId": "session-123",
  "paymentMethod": "BANK_TRANSFER",
  "concessionItems": [
    { "itemId": 1, "quantity": 2, "price": 50000 }
  ]
}
```

### Scenario 3: Insufficient Stock (Will Fail)
```json
{
  "concessionItems": [
    { "itemId": 1, "quantity": 999999, "price": 50000 }
  ]
}
```

**Error Response:**
```json
{
  "error": "Insufficient stock for item: Bắp rang bơ lớn"
}
```

---

## ✅ Validation Rules

1. **Seats must be held** before booking
2. **Concession items** are optional
3. **Stock is checked** and deducted automatically
4. **Price is validated** against cinema pricing
5. **Total amount** = Ticket Total + Concession Total

---

## 📊 Database Tables Affected

```
bookings
  ├── total_amount (includes concession)
  └── id

tickets
  └── booking_id (FK)

concession_orders
  ├── booking_id (FK)
  ├── total_amount
  └── status

concession_order_items
  ├── concession_order_id (FK)
  ├── item_id (FK)
  ├── quantity
  └── total_price

cinema_concession_items
  └── stock_quantity (DECREASED)
```

---

## 🎉 Success!

You can now:
- ✅ Book tickets with or without food/drinks
- ✅ Calculate total price including concessions
- ✅ Track inventory automatically
- ✅ View concession order in booking details
- ✅ Frontend shows complete order summary

---

## 🐛 Common Errors

### Error: "Item không tồn tại với ID: X"
**Fix:** Make sure the item exists in `concession_items` table AND is added to the specific cinema in `cinema_concession_items` table.

### Error: "Insufficient stock"
**Fix:** Check `stock_quantity` in `cinema_concession_items`. Update stock via PUT endpoint.

### Error: "Seats are not held by your session"
**Fix:** Call `/api/seats/hold` first before creating booking!

---

## 📞 Need Help?

Check the logs for detailed information:
```
=== ADD ITEM TO CINEMA REQUEST ===
Cinema ID from path: 1
Request body: {...}
```
