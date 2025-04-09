"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useCurrency from "../hooks/useCurrency";
import Loader from "./Loader";
import Image from "next/image";

export default function Hero() {
  const currency = useCurrency();
  const router = useRouter();
  const [topPicks, setTopPicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [getStartedLoading, setGetStartedLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const [searchData, setSearchData] = useState({
    location: "",
    pickupTime: "",
    returnTime: "",
  });

  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFindRide = () => {
    if (!searchData.location || !searchData.pickupTime || !searchData.returnTime) {
      alert("Please fill in all fields.");
      return;
    }
    const pickup = new Date(searchData.pickupTime);
    const returnDate = new Date(searchData.returnTime);
    const now = new Date();
    if (pickup < now || pickup >= returnDate) {
      alert("Invalid pickup or return time.");
      return;
    }
    const url = `/listings/${encodeURIComponent(searchData.location)}/${encodeURIComponent(searchData.pickupTime)}/${encodeURIComponent(searchData.returnTime)}`;
    router.push(url);
  };

  const handleGetStarted = () => {
    setGetStartedLoading(true);
    setTimeout(() => router.push("/signup"), 500);
  };

  useEffect(() => {
    const fetchTopPicks = async () => {
      try {
        const response = await fetch("/api/cars", { // Use relative path with rewrite
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch top picks: ${response.status}`);
        }
        const data = await response.json();
        setTopPicks(data.slice(0, 3));
      } catch (err) {
        setError(err.message);
        console.error("Error fetching top picks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopPicks();
  }, []);

  return (
    <>
      <section className="relative min-h-[80vh] flex items-center justify-center p-8 bg-gradient-to-b from-blue-900 to-black">
        <div className="text-center text-white z-10 max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Rent Smarter, <span className="text-yellow-400">Not Longer</span>
          </h2>
          <p className="text-lg md:text-xl mb-6">
            Grab a car for as low as 6 {currency}/hour—your ride, your way.
          </p>
          {getStartedLoading ? (
            <Loader size={30} color="#ffffff" />
          ) : (
            <button
              onClick={handleGetStarted}
              className="bg-yellow-400 text-blue-900 px-8 py-3 rounded-xl font-semibold hover:bg-yellow-500"
            >
              Get Started
            </button>
          )}
          <div className="mt-6 max-w-2xl mx-auto bg-blue-900/30 p-6 rounded-xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4">Find Your Perfect Ride</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-white">Location</label>
                <input
                  type="text"
                  name="location"
                  value={searchData.location}
                  onChange={handleSearchInputChange}
                  placeholder="Where are you?"
                  className="w-full p-2 rounded-lg bg-blue-800/50 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-white">Pickup Time</label>
                <input
                  type="datetime-local"
                  name="pickupTime"
                  value={searchData.pickupTime}
                  onChange={handleSearchInputChange}
                  className="w-full p-2 rounded-lg bg-blue-800/50 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1 text-white">Return Time</label>
                <input
                  type="datetime-local"
                  name="returnTime"
                  value={searchData.returnTime}
                  onChange={handleSearchInputChange}
                  className="w-full p-2 rounded-lg bg-blue-800/50 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
            <button
              onClick={handleFindRide}
              className="mt-4 w-full bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg hover:bg-yellow-500 font-semibold"
            >
              Find a Ride
            </button>
          </div>
        </div>
      </section>

      <section className="p-8 bg-white">
        <h2 className="text-3xl font-semibold text-blue-900 mb-6 text-center">Top Picks</h2>
        {loading ? (
          <Loader />
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : topPicks.length === 0 ? (
          <p className="text-center text-gray-500">No top picks available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {topPicks.map((car) => (
              <div
                key={car._id}
                className="border rounded-lg p-4 shadow-md bg-white hover:shadow-lg transition-shadow duration-300"
              >
                {car.carImages && car.carImages.length > 0 && !imageErrors[car._id] ? (
                  <Image
                    src={`/uploads/${car.carImages[0]}`} // Proxied via rewrite
                    alt={`${car.model} Image`}
                    width={400}
                    height={192}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                    onError={() => setImageErrors((prev) => ({ ...prev, [car._id]: true }))}
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500">No Image Available</span>
                  </div>
                )}
                <h3 className="text-xl font-semibold text-blue-900">{car.model}</h3>
                <p className="text-gray-600">Type: {car.type}</p>
                <p className="text-gray-600">Rate: ${car.rate}/hour</p>
                <p className="text-gray-600">Location: {car.location}</p>
                <Link href={`/book/${car._id}`}>
                  <button className="mt-2 w-full bg-yellow-400 text-blue-900 p-2 rounded hover:bg-yellow-500 font-semibold">
                    Book Now
                  </button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}