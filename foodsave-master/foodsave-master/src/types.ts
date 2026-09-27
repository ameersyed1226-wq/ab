export interface Courier {
  name: string;
  avatar: string;
  eta: string;
  verified: boolean;
  phone: string;
}

export interface VolunteerLocation {
  lat: number;
  lng: number;
  updatedAt: string;
}

export type DonationStatus = 'waiting_pickup' | 'volunteer_assigned' | 'en_route_to_pickup' | 'courier_on_way' | 'food_collected' | 'delivered' | 'expired';
export type DonationClassification = 'veg' | 'nonveg';

export interface Donation {
  id: string;
  name: string;
  portions: number;
  unit: string;
  classification: DonationClassification;
  preparedTime: string;
  bestBefore: string;
  status: DonationStatus;
  image: string;
  courier: Courier | null;
  pin: string;
  location: string;
  notes: string;
  createdAt: string;
  currentStep: number; // 1 to 5
  latitude?: number;
  longitude?: number;
  donorName?: string;
  donorPhone?: string;
  donorEmail?: string;
  donorId?: string;
  assignedVolunteerId?: string;
  volunteerLocation?: VolunteerLocation;
  foodPhoto?: string;
  destinationAddress?: string;
  destinationLat?: number;
  destinationLng?: number;
}

export interface ActivityNotification {
  id: string;
  title: string;
  time: string;
  body: string;
  read: boolean;
  type: 'pickup_request' | 'pickup_started' | 'completed' | 'milestone';
  badge?: string;
  etaInfo?: string;
}

export type AppTab = 'home' | 'my-donations' | 'add-food' | 'notifications' | 'profile' | 'map' | 'pickups' | 'admin';

// ==================== REGISTRATION TYPES ====================

export interface DonorRegistration {
  id: string;
  name: string;
  mobileNo: string;
  email: string;
  password: string;
  aadhaarNo: string;
  fssaiLicense: string;
  address: string;
  latitude?: number;
  longitude?: number;
  termsAccepted: boolean;
  registeredAt: string;
  status: 'pending' | 'approved' | 'rejected';
  profilePhoto?: string;
}

export interface VolunteerRegistration {
  id: string;
  name: string;
  mobileNo: string;
  email: string;
  password: string;
  aadhaarNo: string;
  volunteerId: string;
  address: string;
  latitude?: number;
  longitude?: number;
  termsAccepted: boolean;
  registeredAt: string;
  status: 'pending' | 'approved' | 'rejected';
  profilePhoto?: string;
  currentLat?: number;
  currentLng?: number;
  isAvailable: boolean;
  totalDeliveries: number;
  rating: number;
}

export interface AdminUser {
  email: string;
  password: string;
  name: string;
}

export type UserRole = 'owner' | 'volunteer' | 'admin';
