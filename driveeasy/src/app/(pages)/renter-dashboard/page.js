"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function RenterDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Session state:", JSON.stringify(session, null, 2));
    console.log("Status:", status);

    const fetchBookings = async () => {
      if (status === "unauthenticated" || !session?.user?.id || !session?.user?.token) {
        setLoading(false);
        setError("User is not authenticated. Redirecting to sign-in...");
        router.push("/signin");
        return;
      }

      try {
        console.log("Fetching bookings with token:", session.user.token);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/user`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.token}`,
          },
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (response.status === 401) {
            setError("Session expired. Redirecting to sign-in...");
            router.push("/signin");
            return;
          }
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch bookings (status: ${response.status})`);
          } else {
            throw new Error(`Failed to fetch bookings (status: ${response.status})`);
          }
        }

        const data = await response.json();
        console.log("Bookings fetched:", data);
        setBookings(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [session, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="p-8 flex-grow">
          <h2 className="text-3xl font-semibold text-blue-900 mb-6">Renter Dashboard</h2>
          <div className="space-y-4">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-md animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
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
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Home
          </button>
        </section>
        <Footer />
      </div>
    );
  }

  if (!session || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="p-8 flex-grow text-center">
          <p>Please sign in to view your dashboard.</p>
          <button
            onClick={() => router.push("/signin")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Sign In
          </button>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="p-8 flex-grow">
        <h2 className="text-3xl font-semibold text-blue-900 mb-6">Renter Dashboard</h2>
        <div className="space-y-6">
          {bookings.map((booking) => (
            <div key={booking._id} className="border rounded-lg p-4 shadow-md">
              <h3 className="text-xl font-semibold">Booking ID: {booking._id}</h3>
              <p className="text-gray-600">Car: {booking.car?.model || "Unknown Car"}</p>
              <p className="text-gray-600">
                Start Time: {new Date(booking.startTime).toLocaleString()}
              </p>
              <p className="text-gray-600">
                End Time: {new Date(booking.endTime).toLocaleString()}
              </p>
              <p className="text-gray-600">Total Cost: ${booking.totalCost}</p>
            </div>
          ))}
        </div>
        {bookings.length === 0 && !loading && (
          <p className="text-center text-gray-500">No bookings found.</p>
        )}
      </section>
      <Footer />
    </div>
  );
}