# Customer Use Cases

## UC-01: User Authentication & Onboarding
**Actor:** Guest
**Description:** A new user creates an account or an existing user logs in to access personalized features.
- **Pre-conditions:** Guest has access to the internet and the platform URL.
- **Post-conditions:** User is authenticated and receives a JWT for session management.
- **Main Flow:**
  1. User enters email, username, and password.
  2. System creates the account and authenticates the user.
  3. System redirects the user to the "Role Selection" or "Home Page".

## UC-02: Search & Filter Tourism Services
**Actor:** Customer
**Description:** User finds specific tours, hotels, or transport options.
- **Pre-conditions:** User is on the "Explore" or "Home" page.
- **Main Flow:**
  1. User enters a keyword in the search bar (e.g., "Angkor Wat").
  2. User selects a category filter (Tour, Accommodation, or Transportation).
  3. User applies price range or location filters.
  4. System displays matching service cards with ratings and starting prices.

## UC-03: Service Booking & Mock Payment
**Actor:** Customer
**Description:** User books a specific service for a selected date.
- **Pre-conditions:** User is logged in and viewing a Service Detail page.
- **Main Flow:**
  1. User selects a date from the availability calendar.
  2. User chooses the quantity (number of people or rooms).
  3. System calculates the total price based on peak/regular rates.
  4. User clicks "Confirm Booking" and is redirected to the Mock Payment page.
  5. User selects a mock payment method (ABA, Bakong, or Card).
  6. System generates a unique 6-digit reference code and confirms the booking.

## UC-04: View Booking History & Details
**Actor:** Customer
**Description:** User tracks their past and upcoming trips.
- **Pre-conditions:** User is logged in.
- **Main Flow:**
  1. User navigates to "My Bookings".
  2. System lists all bookings with their status (Pending, Paid, Completed, Cancelled).
  3. User clicks on a specific booking to see the full voucher, reference code, and provider contact details.
