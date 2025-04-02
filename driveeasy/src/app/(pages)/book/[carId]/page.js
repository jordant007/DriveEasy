"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../components/Footer";
import Loader from "../../../components/Loader";

export default function BookCar({ params }) {
  const { carId } = params;
  const { data: session, status } = useSession();
  const router = useRouter();
  const [car, setCar] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    startTime: "",
    endTime: "",
  });

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cars`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch car details");
        }

        const data = await response.json();
        const selectedCar = data.find((c) => c._id === carId);
        if (!selectedCar) {
          throw new Error("Car not found");
        }
        setCar(selectedCar);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCar();
    }
  }, [carId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (!bookingData.startTime || !bookingData.endTime) {
      setError("Please select both start and end times.");
      setLoading(false);
      return;
    }

    const start = new Date(bookingData.startTime);
    const end = new Date(bookingData.endTime);
    const now = new Date();

    if (start < now) {
      setError("Start time cannot be in the past.");
      setLoading(false);
      return;
    }

    if (start >= end) {
      setError("End time must be after start time.");
      setLoading(false);
      return;
    }

    const hours = (end - start) / (1000 * 60 * 60);
    const totalCost = hours * car.rate;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify({
          carId,
          renterId: session.user.id,
          startTime: start.toISOString(),
          endTime: end.toISOString(),
          totalCost,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create booking");
      }

      const result = await response.json();
      // Navigate to the confirmation page using the new dynamic route
      router.push(`/confirmation/${result.bookingId}`);
    } catch (err) {
      setError(err.message);
      console.error("Error creating booking:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="p-8 flex-grow text-center">
          <Loader />
        </section>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="p-8 flex-grow text-center">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => router.push("/listings")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Listings
          </button>
        </section>
        <Footer />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="p-8 flex-grow text-center">
          <p>Car not found.</p>
          <button
            onClick={() => router.push("/listings")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Listings
          </button>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="p-8 flex-grow max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Book a Car</h1>
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">{car.model} ({car.type})</h2>
          <p className="mb-2">
            <strong>Location:</strong> {car.location}
          </p>
          <p className="mb-2">
            <strong>Rate:</strong> ${car.rate}/hour
          </p>
          {car.carImages && car.carImages.length > 0 ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/${car.carImages[0]}`}
              alt={car.model}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
          <form onSubmit={handleBooking} className="space-y-4">
            <div>
              <label htmlFor="startTime" className="block text-gray-700">Start Time</label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={bookingData.startTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-gray-700">End Time</label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={bookingData.endTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
                disabled={loading}
              />
            </div>
            {error && <p className="text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Booking..." : "Confirm Booking"}
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}