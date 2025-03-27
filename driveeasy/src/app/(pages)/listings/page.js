"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation"; // Add useRouter for navigation
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";

export default function Listings() {
  const { data: session, status } = useSession();
  const router = useRouter(); // Initialize router for navigation
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cars`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch cars (status: ${response.status})`);
          } else {
            throw new Error(`Failed to fetch cars (status: ${response.status})`);
          }
        }

        const data = await response.json();
        setCars(data); // The backend already filters for available cars
      } catch (err) {
        setError(err.message);
        console.error("Error fetching cars:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="p-8 flex-grow">
          <h2 className="text-3xl font-semibold text-blue-900 mb-6">Available Cars for Rent</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-md animate-pulse">
                <div className="h-40 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          <div className="mt-4 space-x-4">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchCars();
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
            <button
              onClick={() => router.push("/")}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Back to Home
            </button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="p-8 flex-grow">
        <h2 className="text-3xl font-semibold text-blue-900 mb-6">Available Cars for Rent</h2>
        {cars.length === 0 ? (
          <p className="text-center text-gray-500">No cars available for rent at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car._id} className="border rounded-lg p-4 shadow-md">
                {car.carImages && car.carImages.length > 0 && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${car.carImages[0]}`}
                    alt={`${car.model} Image`}
                    className="w-full h-40 object-cover rounded mb-4"
                  />
                )}
                <h3 className="text-xl font-semibold">{car.model}</h3>
                <p className="text-gray-600">Type: {car.type}</p>
                <p className="text-gray-600">Rate: ${car.rate}/day</p>
                <p className="text-gray-600">Location: {car.location}</p>
                <Link
                  href={`/book/${car._id}`}
                  className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Rent This Car
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}