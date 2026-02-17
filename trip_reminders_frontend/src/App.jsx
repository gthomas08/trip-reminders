import { useState, useEffect } from 'react'
import { fetchTrips } from './api/trips'
import TripList from './components/TripList'
import AddTripForm from './components/AddTripForm'
import './App.css'

function App() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadTrips = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchTrips()
      setTrips(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTrips()
  }, [])

  if (loading && trips.length === 0) {
    return (
      <div className="app">
        <div className="container">
          <h1>Trip Reminders</h1>
          <p>Loading trips...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="container">
        <header>
          <h1>✈️ Trip Reminders</h1>
          <p>Manage your upcoming trips and get reminders</p>
        </header>

        {error && <div className="error">{error}</div>}

        <TripList trips={trips} onTripsChange={loadTrips} />
        <AddTripForm onTripAdded={loadTrips} />
      </div>
    </div>
  )
}

export default App
