"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast"; // Import react-hot-toast
import PaypalButton from "./PaypalButton";
import Loader from "./Loader";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function SignupForm({ onPaymentSuccess, setLoading }) {
  const [images, setImages] = useState([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    license: null,
    pin: null,
  });
  const [showPayment, setShowPayment] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*",
    multiple: true,
    onDrop: (files) => setImages([...images, ...files]),
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.files[0] });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalLoading(true);

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      setLocalLoading(false);
      return;
    }

    // Validate required fields
    if (!formData.email || !formData.password || !formData.license || !formData.pin) {
      toast.error("All required fields must be filled.");
      setLocalLoading(false);
      return;
    }

    setTimeout(() => {
      toast.success("Form submitted successfully! Proceed to payment.");
      setShowPayment(true);
      setLocalLoading(false);
    }, 500);
  };

  const handlePaymentSuccess = async (details) => {
    setLoading(true);

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "confirmPassword") data.append(key, value);
    });
    images.forEach((img) => data.append("images", img));

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        body: data,
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Signup failed");
      }
      console.log("Signup response:", result);
      onPaymentSuccess();
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error(error.message); // Replace inline error with toast
    } finally {
      setLoading(false);
      setShowPayment(false);
    }
  };

  return (
    <div className="relative">
      {localLoading ? (
        <Loader />
      ) : (
        <div className="space-y-6 max-w-lg mx-auto">
          {/* Document Verification Fee Message */}
          <div className="bg-blue-100 p-4 rounded-lg text-center">
            <p className="text-blue-900 font-semibold">
              A $15 fee will be charged for document verification.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={localLoading}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={localLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-10 transform -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                onChange={handleChange}
                className="w-full p-2 border rounded mt-1 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={localLoading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-10 transform -translate-y-1/2 text-gray-500"
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Images Field (Drag-and-Drop) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Upload Additional Images (Optional)
              </label>
              <div {...getRootProps()} className="border-dashed border-2 p-4 rounded-lg mt-1">
                <input {...getInputProps()} disabled={localLoading} />
                <p className="text-gray-500">Drag & drop images here, or click to select</p>
              </div>
              {images.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-gray-700">Selected Images:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {images.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* License Field */}
            <div>
              <label htmlFor="license" className="block text-sm font-medium text-gray-700">
                Driver’s License <span className="text-red-500">*</span>
              </label>
              <input
                id="license"
                type="file"
                name="license"
                onChange={handleFileChange}
                className="w-full p-2 border rounded mt-1"
                accept="image/*,application/pdf"
                required
                disabled={localLoading}
              />
              {formData.license && (
                <p className="mt-1 text-sm text-gray-600">
                  Selected file: <span className="font-medium">{formData.license.name}</span>
                </p>
              )}
            </div>

            {/* PIN Field */}
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                Proof of Identity (e.g., Passport, National ID) <span className="text-red-500">*</span>
              </label>
              <input
                id="pin"
                type="file"
                name="pin"
                onChange={handleFileChange}
                className="w-full p-2 border rounded mt-1"
                accept="image/*,application/pdf"
                required
                disabled={localLoading}
              />
              {formData.pin && (
                <p className="mt-1 text-sm text-gray-600">
                  Selected file: <span className="font-medium">{formData.pin.name}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            {!showPayment ? (
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                disabled={localLoading}
              >
                {localLoading ? "Processing..." : "Submit & Pay $15"}
              </button>
            ) : (
              <PaypalButton onSuccess={handlePaymentSuccess} />
            )}
          </form>
        </div>
      )}
    </div>
  );
}