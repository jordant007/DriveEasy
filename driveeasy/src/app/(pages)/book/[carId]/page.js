"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/Footer";

export default function BookCar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { carId } = useParams();
  const [car, setCar] = useState(null);
  const [formData, setFormData] = useState({
    startTime: "",
    endTime: "",
  });
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/signin?callbackUrl=/book/${carId}`);
    }
  }, [status, router, carId]);

  // Fetch car details
  useEffect(() => {
    const fetchCar = async () => {
      try {
        const response = await fetch(`/api/cars/${carId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch car details");
        }

        const data = await response.json();
        setCar(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching car:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCar();
  }, [carId]);

  // Calculate total cost based on rental duration in hours
  useEffect(() => {
    if (car && formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const hours = Math.ceil((end - start) / (1000 * 60 * 60)); // Calculate number of hours
      if (hours > 0) {
        const cost = hours * car.rate;
        setTotalCost(cost);
      } else {
        setTotalCost(0);
      }
    } else {
      setTotalCost(0);
    }
  }, [formData.startTime, formData.endTime, car]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Ensure the user is authenticated
    if (status !== "authenticated") {
      setError("Please sign in to book a car.");
      setLoading(false);
      return;
    }

    // Validate that endTime is after startTime
    const start = new Date(formData.startTime);
    const end = new Date(formData.endTime);
    if (end <= start) {
      setError("End time must be after start time.");
      setLoading(false);
      return;
    }

    // Validate that totalCost is calculated
    if (totalCost <= 0) {
      setError("Total cost must be greater than 0. Please select a valid time range.");
      setLoading(false);
      return;
    }

    // Prepare the booking data
    const bookingData = {
      carId,
      renterId: session.user.id,
      startTime: formData.startTime,
      endTime: formData.endTime,
      totalCost,
    };

    // Log the booking data for debugging
    console.log("Sending booking data:", bookingData);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();
      console.log("Booking response data:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to book car");
      }

      if (!data.bookingId) {
        throw new Error("Booking ID not provided in response");
      }

      // Redirect to confirmation page with bookingId
      router.push(`/confirmation?bookingId=${data.bookingId}`);
    } catch (err) {
      setError(err.message);
      console.error("Error booking car:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return <p className="p-8 text-center">Loading...</p>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="p-8 flex-grow text-center">
          <p className="text-red-500">{error}</p>
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
        </section>
        <Footer />
      </div>
    );
  }

  // Set the minimum start time to the current date and time
  const now = new Date();
  const minStartTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="p-8 flex-grow">
        <h2 className="text-3xl font-semibold text-blue-900 mb-6">Book {car.model}</h2>
        {car.carImages && car.carImages.length > 0 && (
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}/${car.carImages[0]}`}
            alt={`${car.model} Image`}
            className="w-full max-w-md h-40 object-cover rounded mb-4"
          />
        )}
        <p className="text-gray-600">Rate: ${car.rate}/hour</p>
        <p className="text-gray-600">Location: {car.location}</p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <label htmlFor="startTime" className="block text-gray-700">Start Time</label>
            <input
              type="datetime-local"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min={minStartTime} // Prevent selecting past dates/times
            />
          </div>
          <div>
            <label htmlFor="endTime" className="block text-gray-700">End Time</label>
            <input
              type="datetime-local"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min={formData.startTime || minStartTime} // Prevent end time before start time
            />
          </div>
          {totalCost > 0 && (
            <p className="text-gray-700">Total Cost: ${totalCost.toFixed(2)}</p>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Booking..." : "Book Car"}
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}