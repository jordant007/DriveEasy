"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Link from "next/link";
import Loader from "../../components/Loader";
import Image from "next/image"; // Import Image

export default function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageErrorMap, setImageErrorMap] = useState({});

  console.log("Session state:", session);
  console.log("Status:", status);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    const fetchCars = async () => {
      if (!session?.user?.id || !session?.user?.token) {
        setError("User is not authenticated. Please sign in.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching cars with ownerId:", session.user.id);
        console.log("Using token:", session.user.token);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cars/owner?ownerId=${session.user.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.token}`,
          },
        });

        console.log("Fetch cars response status:", response.status);
        console.log("Fetch cars response headers:", response.headers.get("content-type"));

        if (!response.ok) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            if (response.status === 401) {
              router.push("/signin");
              return;
            }
            throw new Error(errorData.message || `Failed to fetch cars (status: ${response.status})`);
          } else {
            const text = await response.text();
            console.error("Non-JSON response from server:", text);
            throw new Error(`Failed to fetch cars (status: ${response.status}) - Non-JSON response: ${text.slice(0, 100)}`);
          }
        }

        const data = await response.json();
        console.log("Fetched cars:", data);
        setCars(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching cars:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchCars();
    }
  }, [session, status, router]);

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="p-8 flex-grow max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-blue-900">Your Cars</h1>
        <Link
          href="/list-car"
          className="mb-6 inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          List a New Car
        </Link>
        {cars.length === 0 ? (
          <p className="text-gray-600">You have not listed any cars yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {cars.map((car) => (
              <div key={car._id || Math.random()} className="border rounded-lg p-4 shadow-md">
                {car.carImages && car.carImages.length > 0 && !imageErrorMap[car._id] ? (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${car.carImages[0]}`}
                    alt={car.model}
                    width={400}
                    height={160} // Matches h-40 (10rem or 160px)
                    className="w-full h-40 object-cover rounded-lg mb-4"
                    onError={() => {
                      setImageErrorMap((prev) => ({ ...prev, [car._id]: true }));
                      console.error(`Failed to load image for ${car.model}: ${car.carImages[0]}`);
                    }}
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                    <span className="text-gray-500">No Image Available</span>
                  </div>
                )}
                <h2 className="text-xl font-semibold">{car.model}</h2>
                <p className="text-gray-600">Type: {car.type}</p>
                <p className="text-gray-600">Rate: ${car.rate}/hour</p>
                <p className="text-gray-600">Location: {car.location}</p>
                {car._id ? (
                  <button
                    onClick={() => {
                      console.log(`Navigating to /edit-car/${car._id}`);
                      router.push(`/edit-car/${car._id}`);
                    }}
                    className="mt-2 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Edit Car
                  </button>
                ) : (
                  <p className="text-red-500 mt-2">Error: Car ID missing</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}