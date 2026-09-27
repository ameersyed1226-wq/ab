// Haversine distance calculator for real-time tracking
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export function formatDistanceString(distanceKm: number, status?: string): string {
  if (status === 'courier_on_way') {
    return '0.0 km • At your location';
  }
  if (status === 'food_collected') {
    return 'Collected • Delivering to shelter (1.4 km to shelter)';
  }
  if (status === 'delivered') {
    return 'Delivered safely to shelter';
  }
  if (distanceKm <= 0.05) {
    return 'Arriving now (< 50 meters)';
  }
  return `${distanceKm.toFixed(2)} km away from kitchen`;
}

export function calculateEtaMinutes(distanceKm: number, status?: string): string {
  if (status === 'courier_on_way') return 'Arrived at Gate';
  if (status === 'food_collected') return 'Delivering';
  if (status === 'delivered') return 'Delivered';
  const mins = Math.max(1, Math.round(distanceKm * 3.5));
  return `${mins} mins`;
}
