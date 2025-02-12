import React, { useState } from 'react';

interface FlightSearchResponse {
  data: {
    airlines: Airline[];
    trips: Trip[];
  };
  message: string;
  status: string;
}

interface Airline {
  name: string;
  iata: string;
}

interface Trip {
  id: string;
  price: {
    amount: number;
    currency: string;
  };
  departure: {
    airport: {
      name: string;
      iata: string;
    };
    time: string;
  };
  arrival: {
    airport: {
      name: string;
      iata: string;
    };
    time: string;
  };
  airlines: string[];
  duration: string;
}

interface SearchParams {
  departure_id: string;
  arrival_id: string;
  outbound_date: string;
  travel_class: 'ECONOMY' | 'BUSINESS' | 'FIRST';
}

const RAPIDAPI_KEY = '5032e26b30msha69715dd0bc8e65p10c0d5jsnb6646cc81989';
const RAPIDAPI_HOST = 'google-flights2.p.rapidapi.com';

const FlightSearch: React.FC = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    departure_id: '',
    arrival_id: '',
    outbound_date: '',
    travel_class: 'ECONOMY'
  });
  const [trips, setTrips] = useState<Trip[]>([]); // Initialize as empty array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrips([]); // Clear previous results

    const queryParams = new URLSearchParams({
      ...searchParams,
      adults: '1',
      show_hidden: '1',
      currency: 'USD',
      language_code: 'en-US',
      country_code: 'US'
    });

    try {
      const response = await fetch(
        `https://${RAPIDAPI_HOST}/api/v1/searchFlights?${queryParams}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
          }
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data: FlightSearchResponse = await response.json();
      console.log('API Response:', data);
      if (data?.data?.trips) {
        setTrips(data.data.trips);
      } else {
        setTrips([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while searching flights');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Search Form */}
      <div className="border border-gray-300 rounded-lg p-6 mb-6 bg-gray-50">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="departure_id"
              value={searchParams.departure_id}
              onChange={handleInputChange}
              placeholder="From (e.g., LAX)"
              className="p-2 border border-gray-300 rounded bg-white text-gray-900"
              required
            />

            <input
              type="text"
              name="arrival_id"
              value={searchParams.arrival_id}
              onChange={handleInputChange}
              placeholder="To (e.g., JFK)"
              className="p-2 border border-gray-300 rounded bg-white text-gray-900"
              required
            />

            <input
              type="date"
              name="outbound_date"
              value={searchParams.outbound_date}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded bg-white text-gray-900"
              required
            />

            <select
              name="travel_class"
              value={searchParams.travel_class}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded bg-white text-gray-900"
            >
              <option value="ECONOMY">Economy</option>
              <option value="BUSINESS">Business</option>
              <option value="FIRST">First</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? 'Searching...' : 'Search Flights'}
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg border border-red-300">
          {error}
        </div>
      )}

      {/* Flight List */}
      {trips.length > 0 ? (
        <div className="border border-gray-300 rounded-lg divide-y">
          {trips.map((trip, index) => (
            <div key={trip.id || index} className="p-4 hover:bg-gray-50">
              <div className="grid grid-cols-4 gap-4 items-center">
                <div>
                  <div className="font-medium text-gray-900">{trip.airlines[0]}</div>
                  <div className="text-sm text-gray-500">Flight Duration: {trip.duration}</div>
                </div>

                <div className="text-center">
                  <div className="font-medium text-gray-900">{trip.departure.airport.iata}</div>
                  <div className="text-sm text-gray-500">{trip.departure.time}</div>
                </div>

                <div className="text-center">
                  <div className="font-medium text-gray-900">{trip.arrival.airport.iata}</div>
                  <div className="text-sm text-gray-500">{trip.arrival.time}</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-gray-900">${trip.price.amount}</div>
                  <div className="text-sm text-gray-500">{searchParams.travel_class}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : loading ? (
        <div className="text-center text-gray-500">Searching for flights...</div>
      ) : (
        <div className="text-center text-gray-500">No flights found. Try searching above.</div>
      )}
    </div>
  );
};

export default FlightSearch;