const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const DB_FILE = path.join(__dirname, 'shared_database.json');

// Middleware
app.use(express.json({ limit: '10mb' }));

// Native CORS middleware - allow requests from any origin (port 3000, 3001, etc.)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Seed data
const initialUsers = [
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
    regId: 'FSSAI-124230004921',
    documents: {
      certName: 'FSSAI_Certificate_KumarRestaurant.pdf',
      certVerified: true,
      idName: 'Aadhaar_Proof_Kumar.pdf',
      idVerified: true
    },
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
    regId: 'VOL-2026-089',
    documents: {
      certName: 'Volunteer_ID_Card_Rahul.pdf',
      certVerified: true,
      idName: 'Aadhaar_Card_Rahul.pdf',
      idVerified: true
    },
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
    name: 'ABC Grand Kitchen',
    email: 'donor@foodrescue.org',
    phone: '+91 98423 55667',
    role: 'Donor',
    status: 'Verified',
    location: 'Chidambaram Main Road',
    regDate: '2026-01-10',
    avatar: '🏨',
    regId: 'FSSAI-124230009841',
    documents: {
      certName: 'FSSAI_License_ABC_Grand.pdf',
      certVerified: true,
      idName: 'Owner_Aadhaar_ABC.pdf',
      idVerified: true
    },
    stats: {
      donations: 210,
      pickups: 0,
      completed: 205,
    }
  },
  {
    id: 'u-5',
    name: 'Ameer Syed',
    email: 'ameersyed1226@gmail.com',
    phone: '+91 94443 12260',
    role: 'Volunteer',
    status: 'Verified',
    location: 'Annamalai Nagar, Chidambaram',
    regDate: '2026-09-20',
    avatar: '🚴',
    regId: 'VOL-CHID-042',
    documents: {
      certName: 'Volunteer_ID_Card_Ameer.pdf',
      certVerified: true,
      idName: 'Aadhaar_Proof_Ameer.pdf',
      idVerified: true
    },
    stats: {
      donations: 0,
      pickups: 26,
      completed: 25,
    }
  }
];

const initialDonations = [
  {
    id: 'd-1',
    foodName: 'Vegetable Biryani & Curd',
    quantity: '25 Meals',
    foodType: 'Vegetarian',
    donorName: 'ABC Grand Kitchen',
    donorId: 'u-4',
    location: 'Chidambaram Main Road',
    preparedTime: '08:30 AM',
    expiryTime: '01:30 PM',
    status: 'Active',
    volunteerName: 'Ameer Syed',
    volunteerId: 'u-5',
    foodImage: '🍲',
    timeline: {
      posted: '08:30 AM',
      accepted: '08:45 AM',
    }
  },
  {
    id: 'd-2',
    foodName: 'Chicken Biryani Feast',
    quantity: '40 Meals',
    foodType: 'Non-Vegetarian',
    donorName: 'Kumar Restaurant',
    donorId: 'u-1',
    location: 'South Car Street, Chidambaram',
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
    foodName: 'South Indian Sambar Rice & Poriyal',
    quantity: '50 Meals',
    foodType: 'Vegetarian',
    donorName: 'ABC Grand Kitchen',
    donorId: 'u-4',
    location: 'Chidambaram Main Road',
    preparedTime: '11:00 AM',
    expiryTime: '03:30 PM',
    status: 'Accepted',
    volunteerName: 'Ameer Syed',
    volunteerId: 'u-5',
    foodImage: '🍱',
    timeline: {
      posted: '11:00 AM',
      accepted: '11:15 AM',
    }
  }
];

// Helper functions for DB reading & writing
function readDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading db:', err);
  }
  const defaultDb = {
    users: initialUsers,
    donations: initialDonations,
    tracking: {
      'u-5': {
        volunteerId: 'u-5',
        volunteerName: 'Ameer Syed',
        phone: '+91 94443 12260',
        lat: 11.3992,
        lng: 79.6936,
        status: 'en_route_to_pickup',
        donationId: 'd-1',
        destination: 'Mother Teresa Anbu Illam, Chidambaram',
        lastUpdated: new Date().toLocaleTimeString()
      }
    },
    notifications: [
      {
        id: 'notif-1',
        type: 'success',
        title: 'New Donor Registered',
        description: 'ABC Grand Kitchen completed FSSAI verification profile.',
        time: '10 mins ago',
        isRead: false,
        section: 'Today'
      }
    ]
  };
  saveDatabase(defaultDb);
  return defaultDb;
}

function saveDatabase(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing db:', err);
  }
}

// ----------------- ROUTES -----------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// 1. GET ALL USERS (Donors, Volunteers, NGOs)
app.get('/api/users', (req, res) => {
  const db = readDatabase();
  res.json(db.users || []);
});

// 2. REGISTER USER (from FoodSave Donor or Volunteer)
app.post('/api/users/register', (req, res) => {
  const db = readDatabase();
  const body = req.body;

  const role = body.role === 'volunteer' || body.role === 'Volunteer' ? 'Volunteer' : 'Donor';
  
  const newUser = {
    id: body.id || `u-${Date.now()}`,
    name: body.name || (role === 'Donor' ? 'Anonymous Donor' : 'Anonymous Volunteer'),
    email: body.email || '',
    phone: body.phone || body.mobileNo || '',
    role: role,
    status: body.status || 'Pending', // requires admin verification
    location: body.address || body.location || 'Chidambaram',
    regDate: new Date().toISOString().split('T')[0],
    avatar: role === 'Donor' ? '🏢' : '🚴',
    regId: body.fssaiLicense || body.volunteerId || (role === 'Donor' ? `FSSAI-${Date.now().toString().slice(-6)}` : `VOL-${Date.now().toString().slice(-4)}`),
    documents: {
      certName: body.fssaiLicense ? `FSSAI_License_${body.fssaiLicense}.pdf` : (body.volunteerId ? `Volunteer_ID_${body.volunteerId}.pdf` : (role === 'Donor' ? 'FSSAI_Certificate.pdf' : 'Volunteer_ID_Card.pdf')),
      certVerified: true,
      idName: body.aadhaarNo ? `Aadhaar_${body.aadhaarNo.slice(-4)}.pdf` : 'Aadhaar_Card.pdf',
      idVerified: true
    },
    stats: {
      donations: role === 'Donor' ? 1 : 0,
      pickups: role === 'Volunteer' ? 1 : 0,
      completed: 0,
    }
  };

  // Check if user with this email or phone already exists
  const existingIdx = db.users.findIndex(u => u.email === newUser.email && u.email !== '');
  if (existingIdx >= 0) {
    db.users[existingIdx] = { ...db.users[existingIdx], ...newUser };
  } else {
    db.users.unshift(newUser);
  }

  // Add system notification for admin
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'info',
    title: `New ${role} Registered`,
    description: `${newUser.name} registered from FoodSave mobile app with ${newUser.documents.certName}.`,
    time: 'Just now',
    isRead: false,
    section: 'Today'
  });

  saveDatabase(db);
  res.status(201).json({ success: true, user: newUser });
});

// 3. UPDATE USER STATUS (Admin Verify / Suspend / Block)
app.patch('/api/users/:id/status', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const { status } = req.body;

  const user = db.users.find(u => u.id === id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.status = status;
  if (status === 'Verified') {
    if (user.documents) {
      user.documents.certVerified = true;
      user.documents.idVerified = true;
    }
  }

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: status === 'Verified' ? 'success' : (status === 'Blocked' ? 'danger' : 'warning'),
    title: `User Status Updated`,
    description: `Admin updated ${user.name} to ${status}.`,
    time: 'Just now',
    isRead: false,
    section: 'Today'
  });

  saveDatabase(db);
  res.json({ success: true, user });
});

// 4. GET ALL DONATIONS
app.get('/api/donations', (req, res) => {
  const db = readDatabase();
  res.json(db.donations || []);
});

// 5. POST FOOD DONATION (from Food Donor in FoodSave)
app.post('/api/donations', (req, res) => {
  const db = readDatabase();
  const body = req.body;

  const newDonation = {
    id: body.id || `d-${Date.now()}`,
    foodName: body.name || body.foodName || 'Surplus Meals',
    quantity: body.quantity || (body.portions ? `${body.portions} ${body.unit || 'Meals'}` : '20 Meals'),
    foodType: body.foodType || (body.classification === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'),
    donorName: body.donorName || 'Registered Donor',
    donorId: body.donorId || 'u-4',
    location: body.location || body.address || 'Chidambaram',
    preparedTime: body.preparedTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    expiryTime: body.expiryTime || body.bestBefore || 'In 4 hours',
    status: body.status || 'Active',
    volunteerName: body.volunteerName || (body.courier ? body.courier.name : undefined),
    volunteerId: body.volunteerId || (body.courier ? body.courier.id : undefined),
    foodImage: body.image || body.foodPhoto || '🍱',
    timeline: body.timeline || {
      posted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  };

  db.donations.unshift(newDonation);

  // Update donor stats
  const donor = db.users.find(u => u.name === newDonation.donorName || u.id === newDonation.donorId);
  if (donor && donor.stats) {
    donor.stats.donations = (donor.stats.donations || 0) + 1;
  }

  // Add system notification for admin
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    type: 'success',
    title: 'New Food Donation Submitted',
    description: `${newDonation.donorName} posted ${newDonation.quantity} of ${newDonation.foodName}.`,
    time: 'Just now',
    isRead: false,
    section: 'Today'
  });

  saveDatabase(db);
  res.status(201).json({ success: true, donation: newDonation });
});

// 6. UPDATE DONATION STATUS OR ASSIGN VOLUNTEER
app.patch('/api/donations/:id', (req, res) => {
  const db = readDatabase();
  const { id } = req.params;
  const updates = req.body;

  let donation = db.donations.find(d => d.id === id);
  if (!donation) {
    // Try relaxed search by substring
    donation = db.donations.find(d => d.id.includes(id) || id.includes(d.id));
  }
  if (!donation) {
    return res.status(404).json({ error: 'Donation not found' });
  }

  if (updates.volunteerName) {
    donation.volunteerName = updates.volunteerName;
    donation.volunteerId = updates.volunteerId || 'u-5';
  }

  if (updates.status) {
    let normStatus = updates.status;
    const s = String(updates.status).toLowerCase();
    if (s.includes('deliver') || s.includes('complete')) {
      normStatus = 'Delivered';
    } else if (s.includes('pick') || s.includes('collect') || s.includes('delivering') || s.includes('confirmed')) {
      normStatus = 'Picked Up';
    } else if (s.includes('accept') || s.includes('assign') || s.includes('en_route') || s.includes('arrived')) {
      normStatus = 'Accepted';
    } else if (s.includes('active') || s.includes('wait')) {
      normStatus = 'Active';
    } else if (s.includes('expire')) {
      normStatus = 'Expired';
    } else if (s.includes('cancel')) {
      normStatus = 'Cancelled';
    }

    donation.status = normStatus;
    if (!donation.timeline) donation.timeline = {};
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (normStatus === 'Accepted') {
      if (!donation.timeline.accepted) donation.timeline.accepted = nowTime;
    } else if (normStatus === 'Picked Up') {
      if (!donation.timeline.accepted) donation.timeline.accepted = donation.timeline.posted || nowTime;
      if (!donation.timeline.pickedUp) donation.timeline.pickedUp = nowTime;

      // Add system notification for admin
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: 'info',
        title: 'Food Donation Picked Up',
        description: `${donation.volunteerName || 'Volunteer'} picked up ${donation.quantity || 'meals'} of ${donation.foodName} from ${donation.donorName}. En route to recipient.`,
        time: 'Just now',
        isRead: false,
        section: 'Today'
      });
    } else if (normStatus === 'Delivered') {
      if (!donation.timeline.accepted) donation.timeline.accepted = donation.timeline.posted || nowTime;
      if (!donation.timeline.pickedUp) donation.timeline.pickedUp = nowTime;
      if (!donation.timeline.delivered) donation.timeline.delivered = nowTime;

      // Update volunteer and donor completed count
      if (donation.volunteerName || donation.volunteerId) {
        const vol = db.users.find(u => u.name === donation.volunteerName || u.id === donation.volunteerId);
        if (vol && vol.stats) {
          vol.stats.completed = (vol.stats.completed || 0) + 1;
        }
      }
      const donor = db.users.find(u => u.name === donation.donorName || u.id === donation.donorId);
      if (donor && donor.stats) {
        donor.stats.completed = (donor.stats.completed || 0) + 1;
      }

      // Add system notification for admin
      db.notifications.unshift({
        id: `notif-${Date.now()}`,
        type: 'success',
        title: 'Food Donation Delivered!',
        description: `${donation.volunteerName || 'Volunteer'} delivered ${donation.quantity || 'meals'} of ${donation.foodName} from ${donation.donorName} successfully!`,
        time: 'Just now',
        isRead: false,
        section: 'Today'
      });
    } else if (normStatus === 'Expired') {
      donation.timeline.expired = nowTime;
    }
  }

  saveDatabase(db);
  res.json({ success: true, donation });
});

// 7. GET LIVE TRACKING LOCATIONS
app.get('/api/tracking', (req, res) => {
  const db = readDatabase();
  res.json(db.tracking || {});
});

// 8. UPDATE LIVE TRACKING (from Volunteer GPS in FoodSave)
app.post('/api/tracking', (req, res) => {
  const db = readDatabase();
  const { volunteerId, volunteerName, phone, lat, lng, status, donationId, destination, donorName, donorLat, donorLng, foodName } = req.body;

  const key = volunteerId || 'u-5';
  db.tracking[key] = {
    volunteerId: key,
    volunteerName: volunteerName || 'Volunteer Courier',
    phone: phone || '+91 94443 12260',
    lat: lat || 11.3992,
    lng: lng || 79.6936,
    status: status || 'delivering',
    donationId: donationId || 'd-1',
    destination: destination || 'Helping Hands NGO, Chidambaram',
    donorName: donorName || '',
    donorLat: donorLat,
    donorLng: donorLng,
    foodName: foodName || '',
    lastUpdated: new Date().toLocaleTimeString()
  };

  // Automatically sync donation status with tracking status
  if (donationId) {
    let donation = db.donations.find(d => d.id === donationId);
    if (!donation) {
      donation = db.donations.find(d => d.id.includes(donationId) || donationId.includes(d.id));
    }
    if (donation) {
      if (!donation.timeline) donation.timeline = {};
      const s = String(status || '').toLowerCase();
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (s === 'delivered') {
        donation.status = 'Delivered';
        if (!donation.timeline.accepted) donation.timeline.accepted = donation.timeline.posted || nowTime;
        if (!donation.timeline.pickedUp) donation.timeline.pickedUp = nowTime;
        if (!donation.timeline.delivered) donation.timeline.delivered = nowTime;
      } else if (s === 'collected' || s === 'food_collected' || s === 'delivering' || s === 'confirmed' || s.includes('pick')) {
        if (donation.status !== 'Delivered') {
          donation.status = 'Picked Up';
          if (!donation.timeline.accepted) donation.timeline.accepted = donation.timeline.posted || nowTime;
          if (!donation.timeline.pickedUp) donation.timeline.pickedUp = nowTime;
        }
      }
    }
  }

  saveDatabase(db);
  res.json({ success: true, tracking: db.tracking[key] });
});

// 9. PLATFORM STATS
app.get('/api/stats', (req, res) => {
  const db = readDatabase();
  const users = db.users || [];
  const donations = db.donations || [];

  const foodDonors = users.filter(u => u.role === 'Donor').length;
  const volunteers = users.filter(u => u.role === 'Volunteer').length;
  const activeDonations = donations.filter(d => d.status === 'Active' || d.status === 'Accepted').length;
  const completedDonations = donations.filter(d => d.status === 'Delivered').length;
  const expiredDonations = donations.filter(d => d.status === 'Expired').length;

  let mealsRescued = 0;
  donations.forEach(d => {
    const num = parseInt(d.quantity) || 20;
    mealsRescued += num;
  });

  res.json({
    totalUsers: users.length,
    foodDonors,
    volunteers,
    activeDonations,
    completedDonations,
    expiredDonations,
    mealsRescued: mealsRescued + 1420
  });
});

// 10. NOTIFICATIONS
app.get('/api/notifications', (req, res) => {
  const db = readDatabase();
  res.json(db.notifications || []);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FoodSave Alliance Unified Backend API running on http://localhost:${PORT}`);
});
