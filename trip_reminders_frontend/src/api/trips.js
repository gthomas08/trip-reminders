const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const fetchTrips = async () => {
  const response = await fetch(`${API_BASE_URL}/trips`);
  if (!response.ok) {
    throw new Error('Failed to fetch trips');
  }
  return response.json();
};

export const createTrip = async (tripData) => {
  const response = await fetch(`${API_BASE_URL}/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ trip: tripData }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.errors?.join(', ') || 'Failed to create trip');
  }
  
  return response.json();
};

export const deleteTrip = async (id) => {
  const response = await fetch(`${API_BASE_URL}/trips/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete trip');
  }
};
