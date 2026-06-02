# Inventory Management System - Backend Implementation

## Overview
Complete inventory & pricing management system for the provider dashboard. Track daily slots, pricing, occupancy, and peak demand periods with real-time updates.

## Database Schema

### InventorySlot Entity
Stores daily availability and pricing for each service.

```sql
CREATE TABLE inventory_slots (
  id UUID PRIMARY KEY,
  service_id UUID NOT NULL FOREIGN KEY,
  date DATE NOT NULL,
  total_slots SMALLINT NOT NULL,
  available_slots SMALLINT NOT NULL,
  booked_slots SMALLINT DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('available', 'low_stock', 'peak_demand', 'closed'),
  markup_percentage SMALLINT DEFAULT 0,
  is_peak_period BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  UNIQUE(service_id, date)
);

CREATE INDEX idx_inventory_slots_service_date ON inventory_slots(service_id, date);
```

## API Endpoints

### 1. Create Single Inventory Slot
```
POST /inventory/:serviceId/slot
Authorization: Bearer {token}

Body:
{
  "date": "2026-06-15",
  "totalSlots": 20,
  "bookedSlots": 0,
  "price": 85.00,
  "status": "available",
  "markupPercentage": 0,
  "isPeakPeriod": false
}

Response:
{
  "id": "uuid",
  "serviceId": "uuid",
  "date": "2026-06-15",
  "totalSlots": 20,
  "availableSlots": 20,
  "bookedSlots": 0,
  "price": "85.00",
  "status": "available",
  "markupPercentage": 0,
  "isPeakPeriod": false,
  "createdAt": "2026-06-01T10:00:00Z",
  "updatedAt": "2026-06-01T10:00:00Z"
}
```

### 2. Batch Create Inventory Slots (Date Range)
```
POST /inventory/:serviceId/batch
Authorization: Bearer {token}

Body:
{
  "startDate": "2026-06-13",
  "endDate": "2026-06-16",
  "dailySlots": 20,
  "basePrice": 85.00,
  "markupPercentage": 0,
  "isPeakPeriod": true
}

Response: Array of created InventorySlot objects
```

### 3. Get Inventory Matrix (Summary & Details)
```
GET /inventory/:serviceId?startDate=2026-06-13&endDate=2026-06-16
Authorization: Optional (can be public)

Response:
{
  "serviceId": "uuid",
  "startDate": "2026-06-13",
  "endDate": "2026-06-16",
  "slots": [
    {
      "id": "uuid",
      "date": "2026-06-13",
      "totalSlots": 20,
      "availableSlots": 8,
      "bookedSlots": 12,
      "price": "85.00",
      "status": "low_stock",
      "occupancyPercentage": 60,
      "dynamicPrice": 106.25,
      "isPeakPeriod": true
    },
    ...
  ],
  "aggregates": {
    "totalSlots": 80,
    "totalBooked": 45,
    "totalAvailable": 35,
    "avgOccupancy": 56,
    "lowStockCount": 2,
    "peakDemandCount": 4,
    "totalRevenue": 4968.75
  }
}
```

### 4. Get Single Inventory Slot
```
GET /inventory/slot/:slotId
Authorization: Optional

Response: InventorySlot object
```

### 5. Update Inventory Slot
```
PUT /inventory/slot/:slotId
Authorization: Bearer {token}

Body (all optional):
{
  "totalSlots": 25,
  "bookedSlots": 5,
  "price": 95.00,
  "status": "available",
  "markupPercentage": 15,
  "isPeakPeriod": true
}

Response: Updated InventorySlot object
```

### 6. Delete Inventory Slot
```
DELETE /inventory/slot/:slotId
Authorization: Bearer {token}

Response:
{
  "message": "Inventory slot deleted successfully"
}
```

### 7. Book Slots (Increment Booked Count)
```
POST /inventory/slot/:slotId/book
Authorization: Bearer {token}

Body:
{
  "quantity": 2
}

Response: Updated InventorySlot object with bookedSlots incremented
```

### 8. Cancel Booking (Decrement Booked Count)
```
POST /inventory/slot/:slotId/cancel
Authorization: Bearer {token}

Body:
{
  "quantity": 2
}

Response: Updated InventorySlot object with bookedSlots decremented
```

### 9. Apply Dynamic Pricing (Batch)
```
PUT /inventory/:serviceId/pricing
Authorization: Bearer {token}

Body:
{
  "startDate": "2026-06-13",
  "endDate": "2026-06-16",
  "markupPercentage": 25
}

Response: Array of updated InventorySlot objects with new markup applied
```

### 10. Set Peak Period Flags (Batch)
```
PUT /inventory/:serviceId/peak-period
Authorization: Bearer {token}

Body:
{
  "startDate": "2026-06-13",
  "endDate": "2026-06-16",
  "isPeak": true
}

Response: Array of updated InventorySlot objects with isPeakPeriod flags set
```

## Frontend Integration

### Setup in Vue Component
```typescript
import {
  getInventoryMatrix,
  createBatchInventorySlots,
  bookInventorySlots,
  applyDynamicPricing,
  setPeakPeriod,
} from '@/services/api';

// Get inventory for date range
const startDate = '2026-06-13';
const endDate = '2026-06-16';
const matrix = await getInventoryMatrix(serviceId, startDate, endDate);

// Create slots for a period
await createBatchInventorySlots(serviceId, {
  startDate: '2026-06-13',
  endDate: '2026-06-16',
  dailySlots: 20,
  basePrice: 85.00,
  isPeakPeriod: true,
});

// Book slots when customer confirms booking
await bookInventorySlots(slotId, 2);

// Apply dynamic pricing to peak period
await applyDynamicPricing(serviceId, '2026-06-13', '2026-06-16', 25);

// Set Khmer New Year as peak
await setPeakPeriod(serviceId, '2026-04-13', '2026-04-16', true);
```

## Status Auto-Computation

Status is automatically computed based on occupancy:
- **available**: > 10% available slots
- **low_stock**: ≤ 10% available slots (high occupancy)
- **closed**: 0% available slots (fully booked)
- **peak_demand**: Manually set for high-demand periods (e.g., Khmer New Year)

## Dynamic Pricing

The `dynamicPrice` is calculated as:
```
dynamicPrice = basePrice × (1 + markupPercentage / 100)
```

Example:
- Base price: $85.00
- Markup: 25%
- Dynamic price: $85.00 × 1.25 = $106.25

## Running Migrations

```bash
# In backend directory
npm run typeorm -- migration:run

# To rollback
npm run typeorm -- migration:revert
```

## Usage Flow

1. **Provider creates service** → Service stored in `services` table
2. **Provider sets inventory for date range** → Batch create InventorySlots
3. **Customer searches services** → Query InventorySlots for availability
4. **Customer books** → Call `bookInventorySlots` to increment booked count
5. **Provider adjusts pricing** → Call `applyDynamicPricing` for peak periods
6. **Customer cancels** → Call `cancelInventoryBooking` to release slots

## Computed Properties

Each InventorySlot includes computed helpers:

```typescript
get occupancyPercentage(): number {
  return Math.round((this.bookedSlots / this.totalSlots) * 100);
}

get dynamicPrice(): number {
  const basePrice = Number(this.price);
  if (this.markupPercentage > 0) {
    return basePrice * (1 + this.markupPercentage / 100);
  }
  return basePrice;
}
```

## Error Handling

| Error | Status | Message |
|-------|--------|---------|
| Service not found | 404 | Service with ID not found |
| Slot already exists | 400 | Inventory slot for this date already exists |
| Not enough slots | 400 | Not enough available slots. Available: X, Requested: Y |
| Invalid date format | 400 | Invalid date format. Use YYYY-MM-DD |
| Unauthorized | 401 | Provide a valid JWT token |

## Testing with cURL

```bash
# Create service first, then get its serviceId

# Create batch inventory slots
curl -X POST http://localhost:3000/inventory/{serviceId}/batch \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-06-13",
    "endDate": "2026-06-16",
    "dailySlots": 20,
    "basePrice": 85.00,
    "isPeakPeriod": true
  }'

# Get inventory matrix
curl http://localhost:3000/inventory/{serviceId}?startDate=2026-06-13&endDate=2026-06-16

# Book slots
curl -X POST http://localhost:3000/inventory/slot/{slotId}/book \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 2}'

# Apply dynamic pricing
curl -X PUT http://localhost:3000/inventory/{serviceId}/pricing \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2026-06-13",
    "endDate": "2026-06-16",
    "markupPercentage": 25
  }'
```

## Summary

✅ **Complete backend implementation** with:
- InventorySlot entity for daily tracking
- DTOs for type-safe requests
- InventoryService with full CRUD + batch operations
- InventoryController with 10 RESTful endpoints
- Database migration with constraints & indexes
- Frontend API wrapper with 10+ methods
- Status auto-computation based on occupancy
- Dynamic pricing with markup percentages
- Peak period management
- Occupancy tracking & revenue calculations

**Ready for integration with your Inventory & Pricing page!**
