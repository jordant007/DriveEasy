"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast"; // Import react-hot-toast
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";

export default function ListCar() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
    availability: "true",
    ownerPhone: "",
  });
  const [files, setFiles] = useState({
    carImages: [],
    driverLicense: null,
    nationalId: null,
  });
  const [previews, setPreviews] = useState({
    carImages: [],
    driverLicense: null,
    nationalId: null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (name === "carImages") {
      const fileArray = Array.from(selectedFiles);
      setFiles((prev) => ({ ...prev, [name]: fileArray }));
      const previewArray = fileArray.map((file) => URL.createObjectURL(file));
      setPreviews((prev) => ({ ...prev, [name]: previewArray }));
    } else {
      const file = selectedFiles[0];
      setFiles((prev) => ({ ...prev, [name]: file }));
      setPreviews((prev) => ({ ...prev, [name]: file ? URL.createObjectURL(file) : null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (status === "loading" || !session?.user?.id || !session?.user?.token) {
      toast.error("User is not authenticated. Please sign in.");
      setLoading(false);
      return;
    }

    if (
      !formData.model ||
      !formData.type ||
      !formData.passengers ||
      !formData.rate ||
      !formData.location ||
      !formData.description ||
      !formData.registrationNumber ||
      !formData.color ||
      !formData.year ||
      !formData.availability ||
      !formData.ownerPhone
    ) {
      toast.error("All fields are required.");
      setLoading(false);
      return;
    }

    if (!files.carImages.length || !files.driverLicense || !files.nationalId) {
      toast.error("Car images, driver’s license, and national ID are required.");
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
    formDataToSend.append("ownerId", session.user.id);
    formDataToSend.append("ownerPhone", formData.ownerPhone);

    files.carImages.forEach((file) => {
      formDataToSend.append("carImages", file);
    });
    formDataToSend.append("driverLicense", files.driverLicense);
    formDataToSend.append("nationalId", files.nationalId);

    try {
      console.log("Sending POST /api/cars request with token:", session.user.token);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cars`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.user.token}`,
        },
        body: formDataToSend,
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers.get("content-type"));

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to list car (status: ${response.status})`);
        } else {
          const text = await response.text();
          console.error("Non-JSON response from server:", text);
          throw new Error(`Failed to list car (status: ${response.status}) - Non-JSON response: ${text.slice(0, 100)}`);
        }
      }

      const result = await response.json();
      toast.success("Car listed successfully!"); // Replace alert with toast
      router.push("/owner-dashboard");
    } catch (err) {
      toast.error(err.message); // Replace inline error with toast
      console.error("Error listing car:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <section className="p-8 flex-grow text-center">
          <p>Please sign in to list a car.</p>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="p-8 flex-grow">
        <h2 className="text-3xl font-semibold text-blue-900 mb-6">List a New Car</h2>
        {loading ? (
          <Loader />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
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
                disabled={loading}
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
                disabled={loading}
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
                min="1"
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="rate" className="block text-gray-700">Rate ($/day)</label>
              <input
                type="number"
                id="rate"
                name="rate"
                value={formData.rate}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                min="0"
                step="0.01"
                disabled={loading}
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
                disabled={loading}
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
                rows="4"
                required
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="year" className="block text-gray-700">Year of Manufacture</label>
              <input
                type="number"
                id="year"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                min="1900"
                max={new Date().getFullYear()}
                disabled={loading}
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
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="availability" className="block text-gray-700">Availability</label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
                disabled={loading}
              >
                <option value="true">Available</option>
                <option value="false">Not Available</option>
              </select>
            </div>
            <div>
              <label htmlFor="carImages" className="block text-gray-700">Car Images (up to 5)</label>
              <input
                type="file"
                id="carImages"
                name="carImages"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                accept="image/jpeg,image/jpg,image/png"
                multiple
                required
                disabled={loading}
              />
              {previews.carImages.length > 0 && (
                <div className="mt-2 flex space-x-2">
                  {previews.carImages.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Car Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
            <div>
              <label htmlFor="driverLicense" className="block text-gray-700">Driver’s License</label>
              <input
                type="file"
                id="driverLicense"
                name="driverLicense"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                required
                disabled={loading}
              />
              {previews.driverLicense && (
                <div className="mt-2">
                  <img
                    src={previews.driverLicense}
                    alt="Driver’s License Preview"
                    className="w-24 h-24 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div>
              <label htmlFor="nationalId" className="block text-gray-700">National ID</label>
              <input
                type="file"
                id="nationalId"
                name="nationalId"
                onChange={handleFileChange}
                className="w-full p-2 border rounded"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                required
                disabled={loading}
              />
              {previews.nationalId && (
                <div className="mt-2">
                  <img
                    src={previews.nationalId}
                    alt="National ID Preview"
                    className="w-24 h-24 object-cover rounded"
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Listing..." : "List Car"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/owner-dashboard")}
              className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mt-2"
              disabled={loading}
            >
              Cancel
            </button>
          </form>
        )}
      </section>
      <Footer />
    </div>
  );
}