// TS types mirroring backend DTOs exactly (the design brief §3). Responses are camelCase;
// money fields are integer cents.

export type Role = "guest" | "host";

export interface User {
  id: number;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  isSuperhost: boolean;
}
export interface AuthResponse {
  token: string;
  user: User;
}

export interface Photo {
  id: number;
  url: string;
  sortOrder: number;
  isCover: boolean;
}
export interface HostBrief {
  id: number;
  name: string;
  avatarUrl: string | null;
  isSuperhost: boolean;
}

export interface ListingCard {
  id: number;
  title: string;
  city: string;
  country: string;
  propertyType: string;
  pricePerNight: number; // cents
  ratingAvg: number | null;
  ratingCount: number;
  coverPhoto: string | null;
  maxGuests: number;
}
export interface ListingDetail extends ListingCard {
  description: string;
  cleaningFee: number; // cents
  serviceFeePct: number; // fraction
  bedrooms: number;
  beds: number;
  bathrooms: number;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  photos: Photo[];
  host: HostBrief;
}
export interface ListingPage {
  items: ListingCard[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Quote {
  nights: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number; // all cents
}
export interface Booking {
  id: number;
  listingId: number;
  guestId: number;
  checkIn: string;
  checkOut: string;
  guestsCount: number;
  nightlyRate: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  totalPrice: number;
  status: "confirmed" | "completed" | "cancelled";
  listing?: ListingCard | null;
}
export interface Review {
  id: number;
  listingId: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}
export interface WishlistItem {
  id: number;
  listing: ListingCard;
}
export interface BookedRange {
  checkIn: string;
  checkOut: string;
}
export interface Availability {
  listingId: number;
  booked: BookedRange[];
}

// --- legacy aliases (kept until each page is migrated in §7 order) ---
export type UserDTO = User;
export type PhotoDTO = Photo;
export type HostBriefDTO = HostBrief;
export type ListingCardDTO = ListingCard;
export type ListingDetailDTO = ListingDetail;
export type ListingListResponse = ListingPage;
export type PriceQuoteDTO = Quote;
export type BookingDTO = Booking;
export type ReviewDTO = Review;
export type WishlistItemDTO = WishlistItem;
export type DateRange = BookedRange;
export type AvailabilityDTO = Availability;
export type BookingStatus = Booking["status"];
