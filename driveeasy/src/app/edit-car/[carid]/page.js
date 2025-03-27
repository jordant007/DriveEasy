"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import Loader from "../../components/Loader";

export default function EditCar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const carId = params?.carid; // Change to lowercase "carid"

  console.log("Current URL:", typeof window !== "undefined" ? window.location.href : "SSR");
  console.log("Params from useParams:", params);
  console.log("carId from params:", carId);

  const [car, setCar] = useState(null);
  const [formData, setFormData] = useState({
    model: "",
    type: "",
    passengers: "",
    rate: "",
    location: "",
    description: "",
    registrationNumber: "",
    color: "",
    year: "",
    availability: true,
    ownerPhone: "",
  });
  const [carImages, setCarImages] = useState([]);
  const [driverLicense, setDriverLicense] = useState(null);
  const [nationalId, setNationalId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/signin?callbackUrl=/edit-car/${carId || ""}`);
    }
  }, [status, router, carId]);

  useEffect(() => {
    if (!carId) {
      setError("No car ID provided.");
      setLoading(false);
      return;
    }

    const fetchCar = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cars/${carId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.token || ""}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch car details");
        }

        const data = await response.json();
        setCar(data);
        setFormData({
          model: data.model || "",
          type: data.type || "",
          passengers: data.passengers || "",
          rate: data.rate || "",
          location: data.location || "",
          description: data.description || "",
          registrationNumber: data.registrationNumber || "",
          color: data.color || "",
          year: data.year || "",
          availability: data.availability || true,
          ownerPhone: data.ownerPhone || "",
        });
      } catch (err) {
        setError(err.message);
        console.error("Error fetching car:", err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchCar();
    }
  }, [carId, session]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (name === "carImages") {
      setCarImages(files);
    } else if (name === "driverLicense") {
      setDriverLicense(files[0]);
    } else if (name === "nationalId") {
      setNationalId(files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (status !== "authenticated") {
      setError("Please sign in to edit a car.");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("model", formData.model);
    formDataToSend.append("type", formData.type);
    formDataToSend.append("passengers", formData.passengers);
    formDataToSend.append("rate", formData.rate);
    formDataToSend.append("location", formData.location);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("registrationNumber", formData.registrationNumber);
    formDataToSend.append("color", formData.color);
    formDataToSend.append("year", formData.year);
    formDataToSend.append("availability", formData.availability);
    formDataToSend.append("ownerPhone", formData.ownerPhone);

    if (carImages.length > 0) {
      Array.from(carImages).forEach((file) => {
        formDataToSend.append("carImages", file);
      });
    }
    if (driverLicense) {
      formDataToSend.append("driverLicense", driverLicense);
    }
    if (nationalId) {
      formDataToSend.append("nationalId", nationalId);
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cars/${carId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update car");
      }

      router.push("/owner-dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Error updating car:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this car?")) return;

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cars/${carId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.user.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete car");
      }

      router.push("/owner-dashboard");
    } catch (err) {
      setError(err.message);
      console.error("Error deleting car:", err);
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
            onClick={() => router.push("/owner-dashboard")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Dashboard
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
            onClick={() => router.push("/owner-dashboard")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Back to Dashboard
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
        <h2 className="text-3xl font-semibold text-blue-900 mb-6">Edit Car: {car.model}</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
          <div>
            <label htmlFor="model" className="block text-gray-700">Model</label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-gray-700">Type</label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="passengers" className="block text-gray-700">Passengers</label>
            <input
              type="number"
              id="passengers"
              name="passengers"
              value={formData.passengers}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="rate" className="block text-gray-700">Rate ($/hour)</label>
            <input
              type="number"
              id="rate"
              name="rate"
              value={formData.rate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="location" className="block text-gray-700">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="registrationNumber" className="block text-gray-700">Registration Number</label>
            <input
              type="text"
              id="registrationNumber"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="color" className="block text-gray-700">Color</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="year" className="block text-gray-700">Year</label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label htmlFor="ownerPhone" className="block text-gray-700">Contact Phone Number</label>
            <input
              type="tel"
              id="ownerPhone"
              name="ownerPhone"
              value={formData.ownerPhone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              pattern="[0-9]{10,15}"
              placeholder="e.g., 1234567890"
            />
          </div>
          <div>
            <label htmlFor="availability" className="block text-gray-700">Available</label>
            <input
              type="checkbox"
              id="availability"
              name="availability"
              checked={formData.availability}
              onChange={handleChange}
              className="p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="carImages" className="block text-gray-700">Car Images (optional)</label>
            <input
              type="file"
              id="carImages"
              name="carImages"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="driverLicense" className="block text-gray-700">Driver’s License (optional)</label>
            <input
              type="file"
              id="driverLicense"
              name="driverLicense"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label htmlFor="nationalId" className="block text-gray-700">National ID (optional)</label>
            <input
              type="file"
              id="nationalId"
              name="nationalId"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Car"}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 mt-2"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Car"}
          </button>
        </form>
      </section>
      <Footer />
    </div>
  );
}