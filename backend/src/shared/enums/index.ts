/* eslint-disable prettier/prettier */
//  USER & ACCOUNT
export enum UserRole {
  ADMIN    = 'admin',
  PROVIDER = 'provider',
  CUSTOMER = 'customer',
}

export enum AccountStatus {
  ACTIVE    = 'active',
  SUSPENDED = 'suspended',
  PENDING   = 'pending',
  BANNED    = 'banned',
}


//  SERVICE
export enum ServiceType {
  TOUR = 'tour',
  ACCOMMODATION = 'accommodation',
  TRANSPORTATION = 'transportation',
}


//  TRANSPORT
export enum TransportType {
  VAN     = 'van',
  BUS     = 'bus',
  CAR     = 'car',
  BOAT    = 'boat',
  TUK_TUK = 'tuk_tuk',
  OTHER   = 'other',
}


//  BOOKING & PAYMENT
export enum BookingStatus {
  PENDING   = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
  REFUNDED  = 'refunded',
}

export enum PaymentStatus {
  PENDING            = 'pending',
  PAID               = 'paid',
  FAILED             = 'failed',
  REFUNDED           = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentMethod {
  ABA        = 'aba',
  VISA       = 'visa',
  CASH       = 'cash',
}


//  REVIEWS, REPORTS & SUPPORT
export enum ReviewStatus {
  VISIBLE = 'visible',
  HIDDEN  = 'hidden',
  FLAGGED = 'flagged',
}

export enum ReportStatus {
  PENDING      = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED     = 'resolved',
  DISMISSED    = 'dismissed',
}

export enum ReportType {
  SERVICE  = 'service',
  PROVIDER = 'provider',
}

export enum TicketStatus {
  OPEN        = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED    = 'resolved',
  CLOSED      = 'closed',
}

export enum TicketCategory {
  WEBSITE_BUG   = 'website_bug',
  PAYMENT_ISSUE = 'payment_issue',
  BOOKING_ISSUE = 'booking_issue',
  ACCOUNT_ISSUE = 'account_issue',
  OTHER         = 'other',
}


//  CHAT
export enum MessageSender {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
}


//  FINANCE
export enum PayoutStatus {
  PENDING    = 'pending',
  PROCESSING = 'processing',
  COMPLETED  = 'completed',
  FAILED     = 'failed',
  CANCELLED  = 'cancelled',
}

export enum ProviderAccountType {
  ABA_BANK            = 'aba_bank',
  ACLEDA_BANK         = 'acleda_bank',
  OTHER               = 'other',
}