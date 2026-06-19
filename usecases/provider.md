# Provider Use Cases

## UC-05: Service Catalog Management
**Actor:** Provider
**Description:** Provider creates or updates their tourism offerings.
- **Pre-conditions:** User is logged in as a Provider and has a verified profile.
- **Main Flow:**
  1. Provider navigates to "Service Manager".
  2. Provider clicks "Create New Service".
  3. Provider enters title, description, price, and uploads a cover image.
  4. Provider defines the service type (Tour, Accommodation, or Transport) and specific metadata (e.g., itinerary for tours).
  5. System saves the service as a "Draft" or "Live" listing.

## UC-06: Inventory & Dynamic Pricing
**Actor:** Provider
**Description:** Provider manages daily availability and sets peak period rates.
- **Pre-conditions:** Service has been created.
- **Main Flow:**
  1. Provider navigates to "Inventory & Pricing".
  2. Provider selects a date range on the calendar matrix.
  3. Provider updates available slots or adjusts prices for specific dates (e.g., holiday surcharges).
  4. Provider clicks "Save All Changes" to sync availability with the marketplace.

## UC-07: Guest Manifest & Digital Check-in
**Actor:** Provider
**Description:** Provider verifies guest vouchers at the time of service.
- **Pre-conditions:** Provider is at the service location and has the "Guest Manifest" open.
- **Main Flow:**
  1. Provider views the "Today's Guest List" to see expected arrivals.
  2. Guest presents their 6-digit digital reference code.
  3. Provider enters the code into the "Check-in Terminal".
  4. System verifies the code and marks the booking as "Completed".
  5. System updates the manifest UI with a checkmark for that guest.

## UC-08: Financial Tracking & Ledger
**Actor:** Provider
**Description:** Provider monitors their earnings and platform commissions.
- **Pre-conditions:** Provider has completed bookings.
- **Main Flow:**
  1. Provider navigates to "Financial Ledger".
  2. System displays total revenue, commission deducted by the platform, and net payout.
  3. Provider views a detailed breakdown of individual transactions.
