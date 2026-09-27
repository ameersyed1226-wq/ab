export type UserRole = 'Donor' | 'Volunteer' | 'NGO';
export type UserStatus = 'Verified' | 'Pending' | 'Suspended' | 'Blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  location: string;
  regDate: string;
  avatar: string;
  regId?: string;
  documents?: {
    certName: string;
    certVerified: boolean;
    idName: string;
    idVerified: boolean;
  };
  stats: {
    donations: number;
    pickups: number;
    completed: number;
  };
}

export type DonationStatus = 'Active' | 'Accepted' | 'Picked Up' | 'Delivered' | 'Expired' | 'Cancelled';
export type FoodType = 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';

export interface Donation {
  id: string;
  foodName: string;
  quantity: string; // e.g. "25 Meals"
  foodType: FoodType;
  donorName: string;
  donorId: string;
  location: string;
  preparedTime: string;
  expiryTime: string;
  status: DonationStatus;
  volunteerName?: string;
  volunteerId?: string;
  foodImage: string;
  timeline: {
    posted?: string;
    accepted?: string;
    pickedUp?: string;
    delivered?: string;
    expired?: string;
    cancelled?: string;
  };
}

export type ReportType = 'Expired Food' | 'Fake Donation' | 'Inappropriate Content' | 'Other';
export type ReportStatus = 'Pending' | 'Investigating' | 'Resolved';

export interface ComplaintReport {
  id: string;
  reportType: ReportType;
  reportedBy: string;
  reportedByRole: string;
  donationId: string;
  donationName: string;
  reason: string;
  status: ReportStatus;
  date: string;
  donorName: string;
  quantity: string;
  preparedTime: string;
  expiryTime: string;
}

export interface NotificationItem {
  id: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  section: 'Today' | 'Earlier';
}

export interface PlatformStats {
  totalUsers: number;
  foodDonors: number;
  volunteers: number;
  activeDonations: number;
  completedDonations: number;
  expiredDonations: number;
  mealsRescued: number;
}
