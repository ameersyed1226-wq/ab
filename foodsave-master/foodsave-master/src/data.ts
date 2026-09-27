import { Donation, ActivityNotification } from './types';

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'batch-fr-8821',
    name: 'Vegetable Biryani Rice',
    portions: 25,
    unit: 'Meals (Trays)',
    classification: 'veg',
    preparedTime: '08:30 AM',
    bestBefore: '12:30 PM',
    status: 'volunteer_assigned',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4JH_Q9bXrJQaTCv_zj5aviPjS7OdUstTEKb5iQSrtik9JZl9ZSB_Q8fc4MsxXkqai2o_7t9aROwmlFf53PqPkaU-57F8qm9ka3O3E559-EGBCXU6E_ZVz2fR9WlRRPGx9he4JQOLgslu6LNfo7bpsA9iHQM57yB_Q5_MGaxK0u9Xj3hItWtHBnEJ48uCypCjH5iBIdkUO0n-tdkO2IOgCuqsRO1_q3wqh4ADFp4mgUA4np0UVOhM',
    courier: {
      name: 'Rahul Kumar',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAjcmwL6vVUI70nofmpYYolOqtlb3WBTtNoVHYUYAY4hwzZQIFRyIrfafgbI0M5NhiRDRgi0mjDPKj18rpXljUSkUIB6u4ooON0nBspuSZ5xnGoxb52-TZkcpZZr2eeHIvPlrlgJRxe5RUJaV0buR1skwjveTfskl7pFy2T9yCk7berdN5VTx7aiRKWjlpk94SQRKV1nBH-DCzR3FU5gDJY4VANi9vnDn07J1eebe0e1A-huK20qo',
      eta: '14 mins',
      verified: true,
      phone: '+1 (555) 492-8821'
    },
    pin: '4892',
    location: 'ABC Grand Kitchen • Banquet Hall 2 (Anna Nagar West, Sector 4 • Bay 3 Loading)',
    notes: 'Hot packs needed. Packed in sealed foil trays. Spoons and forks included. Nut-free and allergen-labeled.',
    createdAt: '2026-09-18T08:30:00-07:00',
    currentStep: 3,
    latitude: 11.3985,
    longitude: 79.6965,
    donorPhone: '+91 94443 55678'
  },
  {
    id: 'batch-dm-9014',
    name: 'Dal Makhani & Roti',
    portions: 40,
    unit: 'Meals (Trays)',
    classification: 'veg',
    preparedTime: '09:00 AM',
    bestBefore: '02:00 PM',
    status: 'volunteer_assigned',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLrBkdcfV0LnylwXLPeUvO8uBrzC2EIPpo0OTu2KkZ4JpRudoJqaODz_CRmzyQRq4z7K1usfSAJkEurAWWykyvyr79lJpEV-J0fboKEtyU0lan4dTVu5axPcg-rKLlWm46m4GrhbsLXkx7TwJdSJyOAFLzE7Xcyo07QMgDkousXmwmk_lK7n6j70wYmynEUkohwe2wMdS0i370wqql15LNG0hI409OllTqrKmZik2v1Yw4qqiuk6o',
    courier: {
      name: 'Aarav Patel',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      eta: '18 mins',
      verified: true,
      phone: '+1 (555) 901-4112'
    },
    pin: '7319',
    location: 'ABC Grand Kitchen • Banquet Hall 2 (Anna Nagar West, Sector 4 • Bay 3 Loading)',
    notes: 'Sealed Foil. Bring replacement tubs. Cooked with low spice level.',
    createdAt: '2026-09-18T09:00:00-07:00',
    currentStep: 3,
    latitude: 11.3932,
    longitude: 79.6908,
    donorPhone: '+91 94443 77890'
  },
  {
    id: 'batch-comp-1122',
    name: 'Fresh Baguettes & Soup',
    portions: 32,
    unit: 'Meals (Trays)',
    classification: 'veg',
    preparedTime: '07:30 AM',
    bestBefore: '11:30 AM',
    status: 'delivered',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyGl8ap6i9RTPVD8xhMRA9tUnMz4m4VyadZrZW_wv8vH3mFr6rz6-ou6DkXqeSDOk9-BDZd0lbGo1FrCPz8n7YvghzzdZlLJMSqu2mOBs2pq0OlB-fEdirNQmHgS-s2e2IHeg_SFwpE-6coK3Eg4y39buI23-TDgUca23yDGpRWketHTR3eFT1vDrNaft9BQ2C-H1A6AaclpG7eaWurJSeIP4mDPaz_Z6R1KFLGV-hZpvWuF_wEoM',
    courier: {
      name: 'Sneha Rao',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      eta: 'Delivered',
      verified: true,
      phone: '+1 (555) 334-1122'
    },
    pin: '2281',
    location: 'ABC Restaurant - Main Lobby pickup',
    notes: 'Vegetable soup in vacuum flasks, baguettes in clean brown bags.',
    createdAt: '2026-09-18T07:30:00-07:00',
    currentStep: 5,
    latitude: 11.3951,
    longitude: 79.6942,
    donorPhone: '+91 94443 11234'
  }
];

export const INITIAL_NOTIFICATIONS: ActivityNotification[] = [
  {
    id: 'notif-1',
    title: 'New pickup request',
    time: '2 min ago',
    body: 'Rahul Kumar accepted your donation',
    read: false,
    type: 'pickup_request',
    badge: 'Ready for handoff'
  },
  {
    id: 'notif-2',
    title: 'Pickup started',
    time: '10 min ago',
    body: 'Volunteer is on the way',
    read: false,
    type: 'pickup_started',
    etaInfo: 'ETA ~8 mins · Back kitchen door'
  },
  {
    id: 'notif-3',
    title: 'Donation completed',
    time: 'Yesterday',
    body: '25 meals delivered',
    read: true,
    type: 'completed',
    etaInfo: 'City Shelter Hub · Received & verified'
  },
  {
    id: 'notif-4',
    title: 'Impact Milestone!',
    time: '3 days ago',
    body: 'You have saved over 1,200 meals this month',
    read: true,
    type: 'milestone',
    badge: 'Gold Zero-Waste Tier'
  }
];

export interface FoodPreset {
  name: string;
  image: string;
  classification: 'veg' | 'nonveg';
  portions: number;
}

export const FOOD_PRESETS: FoodPreset[] = [
  {
    name: 'Vegetable Biryani Rice',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4JH_Q9bXrJQaTCv_zj5aviPjS7OdUstTEKb5iQSrtik9JZl9ZSB_Q8fc4MsxXkqai2o_7t9aROwmlFf53PqPkaU-57F8qm9ka3O3E559-EGBCXU6E_ZVz2fR9WlRRPGx9he4JQOLgslu6LNfo7bpsA9iHQM57yB_Q5_MGaxK0u9Xj3hItWtHBnEJ48uCypCjH5iBIdkUO0n-tdkO2IOgCuqsRO1_q3wqh4ADFp4mgUA4np0UVOhM',
    classification: 'veg',
    portions: 25
  },
  {
    name: 'Dal Makhani & Roti',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLrBkdcfV0LnylwXLPeUvO8uBrzC2EIPpo0OTu2KkZ4JpRudoJqaODz_CRmzyQRq4z7K1usfSAJkEurAWWykyvyr79lJpEV-J0fboKEtyU0lan4dTVu5axPcg-rKLlWm46m4GrhbsLXkx7TwJdSJyOAFLzE7Xcyo07QMgDkousXmwmk_lK7n6j70wYmynEUkohwe2wMdS0i370wqql15LNG0hI409OllTqrKmZik2v1Yw4qqiuk6o',
    classification: 'veg',
    portions: 35
  },
  {
    name: 'Tandoori Chicken Tikka',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600',
    classification: 'nonveg',
    portions: 30
  },
  {
    name: 'Fresh Baguettes & Lentil Soup',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCyGl8ap6i9RTPVD8xhMRA9tUnMz4m4VyadZrZW_wv8vH3mFr6rz6-ou6DkXqeSDOk9-BDZd0lbGo1FrCPz8n7YvghzzdZlLJMSqu2mOBs2pq0OlB-fEdirNQmHgS-s2e2IHeg_SFwpE-6coK3Eg4y39buI23-TDgUca23yDGpRWketHTR3eFT1vDrNaft9BQ2C-H1A6AaclpG7eaWurJSeIP4mDPaz_Z6R1KFLGV-hZpvWuF_wEoM',
    classification: 'veg',
    portions: 20
  },
  {
    name: 'Butter Chicken & Naan',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=600',
    classification: 'nonveg',
    portions: 45
  }
];
