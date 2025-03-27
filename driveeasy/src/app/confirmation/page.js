"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast"; // Import react-hot-toast
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

export default function Confirmation() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please sign in to view your booking confirmation.");
      router.push("/signin");
      return;
    }

    if (!bookingId) {
      toast.error("No booking ID provided.");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          if (response.status === 401) {
            toast.error("Session expired. Please sign in again.");
            router.push("/signin");
            return;
          }
          throw new Error(errorData.message || "Failed to fetch booking details");
        }

        const data = await response.json();
        setBooking(data);
        toast.success("Booking details loaded successfully!"); // Add success toast
      } catch (err) {
        toast.error(err.message); // Replace inline error with toast
        console.error("Error fetching booking:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session && bookingId) {
      fetchBooking();
    }
  }, [session, status, bookingId, router]);

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

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="p-8 flex-grow text-center">
          <p>Booking not found.</p>
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
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Booking Confirmation</h1>
        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Thank you for your booking!</h2>
          <p className="mb-2">
            <strong>Booking ID:</strong> {booking._id}
          </p>
          <p className="mb-2">
            <strong>Car:</strong> {booking.car.model} ({booking.car.type})
          </p>
          <p className="mb-2">
            <strong>Location:</strong> {booking.car.location}
          </p>
          <p className="mb-2">
            <strong>Owner Contact:</strong>{" "}
            {booking.car.ownerPhone ? (
              <a href={`tel:${booking.car.ownerPhone}`} className="text-blue-500 hover:underline">
                {booking.car.ownerPhone}
              </a>
            ) : (
              "Not provided"
            )}
          </p>
          <p className="mb-2">
            <strong>Start Time:</strong>{" "}
            {new Date(booking.startTime).toLocaleString()}
          </p>
          <p className="mb-2">
            <strong>End Time:</strong>{" "}
            {new Date(booking.endTime).toLocaleString()}
          </p>
          <p className="mb-4">
            <strong>Total Cost:</strong> ${booking.totalCost.toFixed(2)}
          </p>
          {booking.car.carImages && booking.car.carImages.length > 0 ? (
            <img
              src={`${process.env.NEXT_PUBLIC_API_URL}/${booking.car.carImages[0]}`}
              alt={booking.car.model}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
              <span className="text-gray-500">No Image Available</span>
            </div>
          )}
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </div>
      </section>
      <Footer />
    </div>
  );
}