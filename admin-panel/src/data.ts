import { User, Donation, ComplaintReport, NotificationItem, PlatformStats } from './types';

export const initialUsers: User[] = [
  {
    id: 'u-1',
    name: 'Kumar Restaurant',
    email: 'contact@kumarrestaurant.com',
    phone: '+91 94432 12345',
    role: 'Donor',
    status: 'Verified',
    location: 'Chidambaram',
    regDate: '2026-04-12',
    avatar: '🏢',
    stats: {
      donations: 142,
      pickups: 0,
      completed: 138,
    }
  },
  {
    id: 'u-2',
    name: 'Rahul Kumar',
    email: 'rahul.kumar@gmail.com',
    phone: '+91 88701 98765',
    role: 'Volunteer',
    status: 'Verified',
    location: 'Chidambaram',
    regDate: '2026-05-18',
    avatar: '👨',
    stats: {
      donations: 0,
      pickups: 84,
      completed: 82,
    }
  },
  {
    id: 'u-3',
    name: 'Helping Hands NGO',
    email: 'verify@helpinghands.org',
    phone: '+91 73735 44221',
    role: 'NGO',
    status: 'Pending',
    location: 'Chidambaram',
    regDate: '2026-09-18',
    avatar: '🤝',
    regId: 'NGO-2026-00124',
    documents: {
      certName: 'NGO_Registration_Certificate_HelpingHands.pdf',
      certVerified: true,
      idName: 'Trustee_ID_Proof_HelpingHands.pdf',
      idVerified: true
    },
    stats: {
      donations: 0,
      pickups: 12,
      completed: 12,
    }
  },
  {
    id: 'u-4',
    name: 'ABC Restaurant',
    email: 'manager@abcrestaurant.com',
    phone: '+91 98423 55667',
    role: 'Donor',
    status: 'Verified',
    location: 'Chidambaram',
    regDate: '2026-01-10',
    avatar: '🏨',
    stats: {
      donations: 210,
      pickups: 0,
      completed: 205,
    }
  },
  {
    id: 'u-5',
    name: 'Chennai Hope Center',
    email: 'info@chennaihope.org',
    phone: '+91 44 2445 9900',
    role: 'NGO',
    status: 'Verified',
    location: 'Chennai',
    regDate: '2026-02-14',
    avatar: '🏫',
    stats: {
      donations: 0,
      pickups: 156,
      completed: 150,
    }
  },
  {
    id: 'u-6',
    name: 'Anjali Sharma',
    email: 'anjali.s@outlook.com',
    phone: '+91 91234 56789',
    role: 'Volunteer',
    status: 'Suspended',
    location: 'Cuddalore',
    regDate: '2026-03-22',
    avatar: '👩',
    stats: {
      donations: 0,
      pickups: 24,
      completed: 20,
    }
  }
];

export const initialDonations: Donation[] = [
  {
    id: 'd-1',
    foodName: 'Vegetable Rice',
    quantity: '25 Meals',
    foodType: 'Vegetarian',
    donorName: 'ABC Restaurant',
    donorId: 'u-4',
    location: 'Chidambaram',
    preparedTime: '08:30 AM',
    expiryTime: '12:30 PM',
    status: 'Active',
    volunteerName: 'Rahul Kumar',
    volunteerId: 'u-2',
    foodImage: '🍲',
    timeline: {
      posted: '08:30 AM',
      accepted: '08:45 AM',
    }
  },
  {
    id: 'd-2',
    foodName: 'Biryani Special',
    quantity: '40 Meals',
    foodType: 'Non-Vegetarian',
    donorName: 'Kumar Restaurant',
    donorId: 'u-1',
    location: 'Chidambaram',
    preparedTime: 'Yesterday, 07:00 PM',
    expiryTime: 'Yesterday, 11:00 PM',
    status: 'Delivered',
    volunteerName: 'Rahul Kumar',
    volunteerId: 'u-2',
    foodImage: '🍛',
    timeline: {
      posted: 'Yesterday, 07:00 PM',
      accepted: 'Yesterday, 07:15 PM',
      pickedUp: 'Yesterday, 07:45 PM',
      delivered: 'Yesterday, 08:30 PM'
    }
  },
  {
    id: 'd-3',
    foodName: 'Garden Fresh Salad',
    quantity: '15 Meals',
    foodType: 'Vegan',
    donorName: 'Green Salad Club',
    donorId: 'u-fake',
    location: 'Chennai',
    preparedTime: 'Yesterday, 10:00 AM',
    expiryTime: 'Yesterday, 02:00 PM',
    status: 'Expired',
    foodImage: '🥗',
    timeline: {
      posted: 'Yesterday, 10:00 AM',
      expired: 'Yesterday, 02:00 PM'
    }
  },
  {
    id: 'd-4',
    foodName: 'Paneer Butter Masala',
    quantity: '30 Meals',
    foodType: 'Vegetarian',
    donorName: 'ABC Restaurant',
    donorId: 'u-4',
    location: 'Cuddalore',
    preparedTime: '09:00 AM',
    expiryTime: '01:00 PM',
    status: 'Accepted',
    volunteerName: 'Rahul Kumar',
    volunteerId: 'u-2',
    foodImage: '🥘',
    timeline: {
      posted: '09:00 AM',
      accepted: '09:20 AM'
    }
  },
  {
    id: 'd-5',
    foodName: 'Steamed Idli & Chutney',
    quantity: '50 Meals',
    foodType: 'Vegan',
    donorName: 'Anand Bhavan',
    donorId: 'u-ab',
    location: 'Puducherry',
    preparedTime: '07:00 AM',
    expiryTime: '11:00 AM',
    status: 'Picked Up',
    volunteerName: 'Suresh Kumar',
    volunteerId: 'u-suresh',
    foodImage: '⚪',
    timeline: {
      posted: '07:00 AM',
      accepted: '07:10 AM',
      pickedUp: '07:40 AM'
    }
  }
];

export const initialReports: ComplaintReport[] = [
  {
    id: 'r-1',
    reportType: 'Expired Food',
    reportedBy: 'Rahul Kumar',
    reportedByRole: 'Volunteer',
    donationId: 'd-2',
    donationName: 'Biryani Special',
    reason: 'Food appeared expired and smelled stale upon inspection before delivering.',
    status: 'Pending',
    date: 'Today',
    donorName: 'Kumar Restaurant',
    quantity: '40 Meals',
    preparedTime: '08:30 AM',
    expiryTime: '12:30 PM'
  },
  {
    id: 'r-2',
    reportType: 'Fake Donation',
    reportedBy: 'Helping Hands NGO',
    reportedByRole: 'NGO',
    donationId: 'd-3',
    donationName: 'Garden Fresh Salad',
    reason: 'The listed donor address is completely vacant and phone number is non-reachable.',
    status: 'Investigating',
    date: 'Yesterday',
    donorName: 'Green Salad Club',
    quantity: '15 Meals',
    preparedTime: '10:00 AM',
    expiryTime: '02:00 PM'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'danger',
    title: 'New Report Filed',
    description: 'Biryani donation reported as "Expired Food" by Rahul Kumar.',
    time: '10 mins ago',
    isRead: false,
    section: 'Today'
  },
  {
    id: 'n-2',
    type: 'warning',
    title: 'NGO Verification Requested',
    description: 'Helping Hands NGO submitted verification papers. Registration ID: NGO-2026-00124.',
    time: '2 hours ago',
    isRead: false,
    section: 'Today'
  },
  {
    id: 'n-3',
    type: 'success',
    title: 'Donation Completed',
    description: '40 meals delivered successfully to Chennai Hope Center by Volunteer Suresh.',
    time: '4 hours ago',
    isRead: true,
    section: 'Today'
  },
  {
    id: 'n-4',
    type: 'info',
    title: 'New Volunteer Registered',
    description: 'Rahul Kumar registered and self-verified with ID Proof.',
    time: 'Yesterday',
    isRead: true,
    section: 'Earlier'
  },
  {
    id: 'n-5',
    type: 'info',
    title: 'New Donor Onboarded',
    description: 'ABC Restaurant registered as a verified Food Donor in Chidambaram.',
    time: '2 days ago',
    isRead: true,
    section: 'Earlier'
  }
];

export const initialStats: PlatformStats = {
  totalUsers: 1248,
  foodDonors: 420,
  volunteers: 768,
  activeDonations: 86,
  completedDonations: 4620,
  expiredDonations: 272,
  mealsRescued: 58420
};
