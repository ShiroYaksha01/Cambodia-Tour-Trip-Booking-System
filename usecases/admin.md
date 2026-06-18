# Admin Use Cases

## UC-09: User Governance & Moderation
**Actor:** Admin
**Description:** Administrator manages account statuses to ensure platform safety.
- **Pre-conditions:** Admin is logged in.
- **Main Flow:**
  1. Admin navigates to the "User Management" panel.
  2. Admin searches for a specific user by email or username.
  3. Admin views user activity and current status (Active, Suspended).
  4. Admin toggles the status to "Suspended" if the user violates terms.
  5. System restricts the user's login access immediately.

## UC-10: Provider Verification & Onboarding
**Actor:** Admin
**Description:** Admin reviews and verifies new service providers.
- **Pre-conditions:** A user has applied for a Provider role.
- **Main Flow:**
  1. Admin navigates to "Providers" section.
  2. Admin reviews provider's company details, bank info, and uploaded documents.
  3. Admin clicks "Verify Provider".
  4. System updates the provider status, allowing them to list "Live" services on the marketplace.

## UC-11: Platform Revenue Analytics
**Actor:** Admin
**Description:** Admin monitors the overall health and revenue of the platform.
- **Pre-conditions:** Admin is on the "Admin Dashboard".
- **Main Flow:**
  1. System displays real-time metrics: Total Revenue, Total Bookings, and Active Providers.
  2. Admin navigates to "Revenue Analytics" for a trend chart.
  3. Admin filters data by month or year to track growth and commission collections.
