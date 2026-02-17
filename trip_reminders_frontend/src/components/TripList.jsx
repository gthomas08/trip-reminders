import { fetchTrips, deleteTrip } from '../api/trips';
import { useEffect, useState } from 'react';

function TripList({ trips, onTripsChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this trip?')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteTrip(id);
      onTripsChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (trips.length === 0) {
    return (
      <div className="trip-list empty">
        <p>No trips yet. Add your first trip below!</p>
      </div>
    );
  }

  return (
    <div className="trip-list">
      {error && <div className="error">{error}</div>}
      <h2>Your Trips</h2>
      <div className="trips">
        {trips.map((trip) => (
          <div key={trip.id} className="trip-card">
            <div className="trip-content">
              <h3>{trip.destination}</h3>
              <p className="trip-date">📅 {formatDate(trip.trip_date)}</p>
              {trip.notes && <p className="trip-notes">{trip.notes}</p>}
            </div>
            <button
              className="delete-btn"
              onClick={() => handleDelete(trip.id)}
              disabled={loading}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TripList;
