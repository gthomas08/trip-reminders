import { useState } from 'react';
import { createTrip } from '../api/trips';

function AddTripForm({ onTripAdded }) {
  const [formData, setFormData] = useState({
    destination: '',
    trip_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createTrip(formData);
      setFormData({
        destination: '',
        trip_date: '',
        notes: '',
      });
      setSuccess(true);
      onTripAdded();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-trip-form">
      <h2>Add New Trip</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="destination">Destination *</label>
          <input
            type="text"
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            required
            placeholder="e.g., Paris, France"
          />
        </div>

        <div className="form-group">
          <label htmlFor="trip_date">Trip Date *</label>
          <input
            type="date"
            id="trip_date"
            name="trip_date"
            value={formData.trip_date}
            onChange={handleChange}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="3"
            placeholder="Any additional notes about your trip..."
          />
        </div>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">Trip added successfully!</div>}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Adding...' : 'Add Trip'}
        </button>
      </form>
    </div>
  );
}

export default AddTripForm;
