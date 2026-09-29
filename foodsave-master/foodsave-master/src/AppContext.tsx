import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Donation, ActivityNotification, AppTab, VolunteerLocation } from './types';
import { INITIAL_DONATIONS, INITIAL_NOTIFICATIONS } from './data';

interface AppContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  donations: Donation[];
  setDonations: React.Dispatch<React.SetStateAction<Donation[]>>;
  notifications: ActivityNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<ActivityNotification[]>>;
  selectedDonationId: string | null;
  setSelectedDonationId: (id: string | null) => void;
  language: 'en' | 'ta';
  setLanguage: (lang: 'en' | 'ta') => void;
  addDonation: (donation: Omit<Donation, 'id' | 'createdAt' | 'status' | 'currentStep' | 'courier' | 'pin'>) => void;
  acceptDonation: (donationId: string) => void;
  toggleNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  simulateStatusProgress: (donationId: string) => void;
  stats: {
    donationsCount: number;
    mealsSaved: number;
  };
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  appLoading: boolean;
  setAppLoading: (val: boolean) => void;
  restaurantName: string;
  setRestaurantName: (val: string) => void;
  userEmail: string;
  setUserEmail: (val: string) => void;
  userRole: 'owner' | 'volunteer' | 'admin';
  setUserRole: (val: 'owner' | 'volunteer' | 'admin') => void;
  activeRescueId: string | null;
  setActiveRescueId: (id: string | null) => void;
  rescueStep: 'accepted' | 'on_the_way' | 'arrived' | 'collected' | 'delivering' | 'confirmed' | 'delivered' | null;
  setRescueStep: (step: 'accepted' | 'on_the_way' | 'arrived' | 'collected' | 'delivering' | 'confirmed' | 'delivered' | null) => void;
  volunteerLocation: VolunteerLocation | null;
  setVolunteerLocation: (loc: VolunteerLocation | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Screen selection state
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    const saved = localStorage.getItem('foodsave_active_tab');
    return (saved as AppTab) || 'home';
  });

  const [selectedDonationId, setSelectedDonationId] = useState<string | null>(() => {
    return localStorage.getItem('foodsave_selected_donation_id') || null;
  });

  // Base list of donations
  const [donations, setDonations] = useState<Donation[]>(() => {
    const saved = localStorage.getItem('foodsave_donations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse donations', e);
      }
    }
    return INITIAL_DONATIONS;
  });

  // Notifications
  const [notifications, setNotifications] = useState<ActivityNotification[]>(() => {
    const saved = localStorage.getItem('foodsave_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Language settings
  const [language, setLanguage] = useState<'en' | 'ta'>(() => {
    const saved = localStorage.getItem('foodsave_language');
    return (saved as 'en' | 'ta') || 'en';
  });

  // Login & Loading state for user experience request
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('foodsave_logged_in') === 'true';
  });

  const [appLoading, setAppLoading] = useState<boolean>(false);

  const [restaurantName, setRestaurantName] = useState<string>(() => {
    return localStorage.getItem('foodsave_restaurant_name') || 'Green Bistro';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('foodsave_user_email') || 'rescue@foodsave.org';
  });

  const [userRole, setUserRole] = useState<'owner' | 'volunteer' | 'admin'>(() => {
    return (localStorage.getItem('foodsave_user_role') as 'owner' | 'volunteer' | 'admin') || 'owner';
  });

  const [activeRescueId, setActiveRescueId] = useState<string | null>(() => {
    return localStorage.getItem('foodsave_active_rescue_id') || null;
  });

  const [rescueStep, setRescueStep] = useState<'accepted' | 'on_the_way' | 'arrived' | 'collected' | 'delivering' | 'confirmed' | 'delivered' | null>(() => {
    return (localStorage.getItem('foodsave_rescue_step') as any) || null;
  });

  // Live volunteer location tracking
  const [volunteerLocation, setVolunteerLocation] = useState<VolunteerLocation | null>(null);
  const locationIntervalRef = useRef<number | null>(null);
  const locationStepRef = useRef<number>(0);

  // Sync profile details
  useEffect(() => {
    localStorage.setItem('foodsave_restaurant_name', restaurantName);
  }, [restaurantName]);

  useEffect(() => {
    localStorage.setItem('foodsave_user_email', userEmail);
  }, [userEmail]);

  useEffect(() => {
    localStorage.setItem('foodsave_user_role', userRole);
  }, [userRole]);

  useEffect(() => {
    if (activeRescueId) {
      localStorage.setItem('foodsave_active_rescue_id', activeRescueId);
    } else {
      localStorage.removeItem('foodsave_active_rescue_id');
    }
  }, [activeRescueId]);

  useEffect(() => {
    if (rescueStep) {
      localStorage.setItem('foodsave_rescue_step', rescueStep);

      // Auto-sync rescue step to shared backend API
      if (activeRescueId) {
        let donationStatus = 'Accepted';
        if (rescueStep === 'collected' || rescueStep === 'delivering' || rescueStep === 'confirmed') {
          donationStatus = 'Picked Up';
        } else if (rescueStep === 'delivered') {
          donationStatus = 'Delivered';
        }

        try {
          fetch(`http://localhost:5000/api/donations/${activeRescueId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: donationStatus,
              volunteerName: restaurantName || 'Ameer Syed (Volunteer)',
              volunteerId: 'u-5'
            })
          }).catch(err => console.log('Auto sync error:', err));
        } catch (e) {}
      }
    } else {
      localStorage.removeItem('foodsave_rescue_step');
    }
  }, [rescueStep, activeRescueId, restaurantName]);

  // Sync login status
  useEffect(() => {
    localStorage.setItem('foodsave_logged_in', isLoggedIn ? 'true' : 'false');
  }, [isLoggedIn]);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('foodsave_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedDonationId) {
      localStorage.setItem('foodsave_selected_donation_id', selectedDonationId);
    } else {
      localStorage.removeItem('foodsave_selected_donation_id');
    }
  }, [selectedDonationId]);

  useEffect(() => {
    localStorage.setItem('foodsave_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('foodsave_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('foodsave_language', language);
  }, [language]);

  // ========== LIVE VOLUNTEER LOCATION (Real GPS via Browser Geolocation API) ==========
  const geoWatchRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear any existing watchers/intervals
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    if (geoWatchRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchRef.current);
      geoWatchRef.current = null;
    }

    const activeDonation = donations.find(d => d.id === activeRescueId);
    if (!activeRescueId || !activeDonation) {
      return;
    }

    const endLat = activeDonation.latitude || 11.3985;
    const endLng = activeDonation.longitude || 79.6965;

    // Determine if we should track based on rescue step (track all active rescue steps)
    const shouldTrack = Boolean(rescueStep);

    const syncLocationToBackend = (lat: number, lng: number) => {
      const newLoc: VolunteerLocation = {
        lat,
        lng,
        updatedAt: new Date().toISOString()
      };
      setVolunteerLocation(newLoc);

      // Sync to donation record for cross-role visibility
      setDonations(prev => prev.map(d => {
        if (d.id === activeRescueId) {
          return { ...d, volunteerLocation: newLoc };
        }
        return d;
      }));

      // Sync with shared tracking API for Admin Panel
      try {
        fetch('http://localhost:5000/api/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            volunteerId: 'u-5',
            volunteerName: restaurantName || 'Ameer Syed (Volunteer)',
            phone: '+91 94443 12260',
            lat: newLoc.lat,
            lng: newLoc.lng,
            status: rescueStep || 'on_the_way',
            donationId: activeRescueId,
            destination: activeDonation.location || 'Chidambaram',
            donorName: activeDonation.donorName || 'Food Donor',
            donorLat: activeDonation.latitude || endLat,
            donorLng: activeDonation.longitude || endLng,
            foodName: activeDonation.name || 'Food Donation'
          })
        }).catch(() => {});
      } catch (e) {}
    };

    if (shouldTrack) {
      // Try REAL browser Geolocation API first
      if (navigator.geolocation) {
        // Get initial position immediately
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            syncLocationToBackend(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            // Geolocation denied - use simulation fallback
            const initial = { lat: 11.3920, lng: 79.6900 };
            syncLocationToBackend(initial.lat, initial.lng);
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );

        // Watch for continuous position updates (real GPS)
        geoWatchRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            syncLocationToBackend(pos.coords.latitude, pos.coords.longitude);
          },
          () => {
            // Fallback: simulate movement if geolocation fails
            console.log('Geolocation denied, using GPS simulation');
            const startLat = 11.3920;
            const startLng = 79.6900;
            const totalSteps = 30;

            locationIntervalRef.current = window.setInterval(() => {
              locationStepRef.current += 1;
              if (locationStepRef.current >= totalSteps) {
                locationStepRef.current = totalSteps;
                if (locationIntervalRef.current) {
                  clearInterval(locationIntervalRef.current);
                  locationIntervalRef.current = null;
                }
              }
              const progress = Math.min(locationStepRef.current / totalSteps, 1);
              const curveOffset = Math.sin(progress * Math.PI) * 0.002;
              const simLat = startLat + (endLat - startLat) * progress + curveOffset;
              const simLng = startLng + (endLng - startLng) * progress - curveOffset * 0.5;
              syncLocationToBackend(simLat, simLng);
            }, 3000);
          },
          { enableHighAccuracy: true, maximumAge: 2000, timeout: 5000 }
        );
      } else {
        // No geolocation API at all - fallback simulation
        const startLat = 11.3920;
        const startLng = 79.6900;
        const totalSteps = 30;
        locationIntervalRef.current = window.setInterval(() => {
          locationStepRef.current += 1;
          if (locationStepRef.current >= totalSteps) {
            locationStepRef.current = totalSteps;
            if (locationIntervalRef.current) {
              clearInterval(locationIntervalRef.current);
              locationIntervalRef.current = null;
            }
          }
          const progress = Math.min(locationStepRef.current / totalSteps, 1);
          const curveOffset = Math.sin(progress * Math.PI) * 0.002;
          syncLocationToBackend(
            startLat + (endLat - startLat) * progress + curveOffset,
            startLng + (endLng - startLng) * progress - curveOffset * 0.5
          );
        }, 3000);
      }
    } else if (rescueStep === 'arrived' || rescueStep === 'collected') {
      // Volunteer is at the donor's location
      syncLocationToBackend(endLat, endLng);
    } else if (rescueStep === 'delivered' || !rescueStep) {
      // Reset
      locationStepRef.current = 0;
      setVolunteerLocation(null);
    }

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
        locationIntervalRef.current = null;
      }
      if (geoWatchRef.current !== null) {
        navigator.geolocation.clearWatch(geoWatchRef.current);
        geoWatchRef.current = null;
      }
    };
  }, [activeRescueId, rescueStep]);

  // Derived user statistics (combining baseline values + newly added/completed donations)
  const stats = React.useMemo(() => {
    // Standard baseline stats from ABC Restaurant screenshots are:
    // Donations: 24, Meals Saved: 1,240
    // We let completed items add to this dynamically!
    const baseDonationsCount = 24;
    const baseMealsSaved = 1240;

    // Filter for donations created during this session that aren't part of the baseline
    const customDonations = donations.filter(d => !INITIAL_DONATIONS.some(init => init.id === d.id));
    const completedCustomDonations = customDonations.filter(d => d.status === 'delivered');

    // Calculate sum of portions of newly completed custom donations
    const customMealsSavedSum = completedCustomDonations.reduce((sum, d) => sum + d.portions, 0);

    return {
      donationsCount: baseDonationsCount + customDonations.length,
      mealsSaved: baseMealsSaved + customMealsSavedSum
    };
  }, [donations]);

  // Add donation callback
  const addDonation = (newDonationData: Omit<Donation, 'id' | 'createdAt' | 'status' | 'currentStep' | 'courier' | 'pin'>) => {
    const randomId = `batch-${Math.random().toString(36).substring(2, 7)}-${Date.now().toString().slice(-4)}`;
    const generatedPin = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Created donation is live and instantly notifies couriers!
    const newDonation: Donation = {
      ...newDonationData,
      id: randomId,
      pin: generatedPin,
      status: 'waiting_pickup',
      currentStep: 1,
      createdAt: new Date().toISOString(),
      donorName: newDonationData.donorName || restaurantName || 'ABC Grand Kitchen',
      donorPhone: newDonationData.donorPhone || '+91 94443 12260',
      courier: null
    };

    setDonations(prev => [newDonation, ...prev]);

    // Push new alert notify to activity list
    const newNotification: ActivityNotification = {
      id: `notif-${Date.now()}`,
      title: 'Donation published',
      time: 'Just now',
      body: `"${newDonation.name}" is now broadcasting to nearby volunteers!`,
      read: false,
      type: 'pickup_request',
      badge: 'Broadcasting'
    };
    
    setNotifications(prev => [newNotification, ...prev]);

    // Sync with shared API backend for Admin Panel!
    try {
      fetch('http://localhost:5000/api/donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newDonation.id,
          foodName: newDonation.name,
          quantity: `${newDonation.portions} ${newDonation.unit}`,
          foodType: newDonation.classification === 'veg' ? 'Vegetarian' : 'Non-Vegetarian',
          donorName: newDonation.donorName,
          location: newDonation.location,
          preparedTime: newDonation.preparedTime,
          expiryTime: newDonation.bestBefore,
          status: 'Active',
          foodImage: newDonation.image
        })
      }).catch(err => console.log('Backend sync notice:', err));
    } catch (e) {
      console.log('Backend sync err:', e);
    }
  };

  // Explicit volunteer pickup acceptance ("OK")
  const acceptDonation = (donationId: string) => {
    const assignedCourier = {
      name: 'Ameer Syed (Volunteer)',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAjcmwL6vVUI70nofmpYYolOqtlb3WBTtNoVHYUYAY4hwzZQIFRyIrfafgbI0M5NhiRDRgi0mjDPKj18rpXljUSkUIB6u4ooON0nBspuSZ5xnGoxb52-TZkcpZZr2eeHIvPlrlgJRxe5RUJaV0buR1skwjveTfskl7pFy2T9yCk7berdN5VTx7aiRKWjlpk94SQRKV1nBH-DCzR3FU5gDJY4VANi9vnDn07J1eebe0e1A-huK20qo',
      eta: '8 mins',
      verified: true,
      phone: '+91 94443 12260'
    };

    const initialLoc: VolunteerLocation = {
      lat: 11.3920,
      lng: 79.6900,
      updatedAt: new Date().toISOString()
    };

    let targetName = 'food';
    setDonations(prev =>
      prev.map(d => {
        if (d.id === donationId) {
          targetName = d.name;
          return {
            ...d,
            status: 'volunteer_assigned',
            currentStep: 2,
            courier: assignedCourier,
            volunteerLocation: initialLoc
          };
        }
        return d;
      })
    );

    setActiveRescueId(donationId);
    setRescueStep('accepted');
    setVolunteerLocation(initialLoc);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}-claim`,
        title: 'Volunteer Assigned!',
        time: 'Just now',
        body: `Ameer Syed (Volunteer) accepted your donation "${targetName}". Phone: +91 94443 12260.`,
        read: false,
        type: 'pickup_request',
        badge: 'Assigned'
      },
      ...prev
    ]);

    // Sync with shared backend
    try {
      fetch(`http://localhost:5000/api/donations/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Accepted',
          volunteerName: assignedCourier.name,
          volunteerId: 'u-5'
        })
      }).catch(err => console.log('Backend sync notice:', err));
    } catch (e) {
      console.log('Backend sync err:', e);
    }
  };

  // Toggle notification read status
  const toggleNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Mark all notifications as read
  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Status timeline manual simulator so users can test full cycles:
  const simulateStatusProgress = (donationId: string) => {
    let resultingStatus = 'Active';
    setDonations(prev =>
      prev.map(d => {
        if (d.id === donationId) {
          let nextStep = d.currentStep + 1;
          let nextStatus = d.status;

          if (nextStep > 5) {
            nextStep = 5;
          }

          if (nextStep === 2) {
            nextStatus = 'volunteer_assigned';
            resultingStatus = 'Accepted';
          } else if (nextStep === 3) {
            nextStatus = 'en_route_to_pickup';
            resultingStatus = 'Accepted';
          } else if (nextStep === 4) {
            nextStatus = 'food_collected';
            resultingStatus = 'Picked Up';
          } else if (nextStep === 5) {
            nextStatus = 'delivered';
            resultingStatus = 'Delivered';
          }

          return {
            ...d,
            currentStep: nextStep,
            status: nextStatus
          };
        }
        return d;
      })
    );

    // Sync status change to backend
    try {
      fetch(`http://localhost:5000/api/donations/${donationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: resultingStatus })
      }).catch(err => console.log('Backend sync notice:', err));
    } catch (e) {
      console.log('Backend sync err:', e);
    }

    // Create corresponding live system notification
    const matched = donations.find(d => d.id === donationId);
    if (matched) {
      let stepMessage = '';
      let nType: 'pickup_request' | 'pickup_started' | 'completed' | 'milestone' = 'pickup_request';
      if (matched.currentStep === 2) {
        stepMessage = 'Volunteer notified & matches sent.';
      } else if (matched.currentStep === 3) {
        stepMessage = 'Courier is en-route to ABC Restaurant.';
        nType = 'pickup_started';
      } else if (matched.currentStep === 4) {
        stepMessage = `Handover confirmed for batch ${matched.name}.`;
      } else if (matched.currentStep === 5) {
        stepMessage = `Success! ${matched.portions} meals of "${matched.name}" have been delivered to St. Jude Kitchen.`;
        nType = 'completed';
      }

      if (stepMessage) {
        setNotifications(prev => [
          {
            id: `notif-sim-${Date.now()}`,
            title: matched.currentStep === 4 ? 'Donation Handover Successful' : matched.currentStep === 5 ? 'Rescue Fully Completed! 🎉' : 'Donation Step Updated',
            time: 'Just now',
            body: stepMessage,
            read: false,
            type: nType
          },
          ...prev
        ]);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        donations,
        setDonations,
        notifications,
        setNotifications,
        selectedDonationId,
        setSelectedDonationId,
        language,
        setLanguage,
        addDonation,
        acceptDonation,
        toggleNotificationRead,
        markAllNotificationsRead,
        simulateStatusProgress,
        stats,
        isLoggedIn,
        setIsLoggedIn,
        appLoading,
        setAppLoading,
        restaurantName,
        setRestaurantName,
        userEmail,
        setUserEmail,
        userRole,
        setUserRole,
        activeRescueId,
        setActiveRescueId,
        rescueStep,
        setRescueStep,
        volunteerLocation,
        setVolunteerLocation
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
