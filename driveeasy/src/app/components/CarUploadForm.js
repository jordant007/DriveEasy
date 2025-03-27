"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useSession } from "next-auth/react";
import PaypalButton from "./PaypalButton";

export default function CarUploadForm({ onUploadSuccess }) {
  const { data: session } = useSession();
  const [images, setImages] = useState([]);
  const [carDetails, setCarDetails] = useState({
    model: "",
    passengers: "",
    type: "",
    rate: "",
    location: "",
    description: "",
    registration: null,
    license: null,
    pin: null,
  });
  const [fileNames, setFileNames] = useState({
    registration: "",
    license: "",
    pin: "",
  });
  const [showPayment, setShowPayment] = useState(false);
  const [error, setError] = useState(null);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
    },
    multiple: true,
    onDrop: (files) => setImages([...images, ...files]),
  });

  const handleChange = (e) => setCarDetails({ ...carDetails, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setCarDetails({ ...carDetails, [name]: files[0] });
      setFileNames({ ...fileNames, [name]: files[0].name });
    } else {
      setCarDetails({ ...carDetails, [name]: null });
      setFileNames({ ...fileNames, [name]: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (details) => {
    const formData = new FormData();
    Object.entries(carDetails).forEach(([key, value]) => formData.append(key, value));
    images.forEach((img) => formData.append("images", img));

    try {
      const token = session?.user?.token;
      if (!token) {
        throw new Error("User is not authenticated. Please sign in.");
      }

      const response = await fetch("http://localhost:5000/api/cars/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Car upload failed");
      }

      const data = await response.json();
      console.log("Upload response:", data);
      onUploadSuccess();
    } catch (error) {
      console.error("Error during car upload:", error);
      setError(error.message);
    } finally {
      setShowPayment(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <div {...getRootProps()} className="border-dashed border-2 p-4 rounded-lg">
        <input {...getInputProps()} />
        <p>Drag & drop car images here, or click to select</p>
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
      <input
        name="model"
        placeholder="Car Model/Make"
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        name="passengers"
        placeholder="Number of Passengers"
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <select name="type" onChange={handleChange} className="w-full p-2 border rounded">
        <option value="">Select Car Type</option>
        <option value="sedan">Sedan</option>
        <option value="hatchback">Hatchback</option>
      </select>
      <input
        name="rate"
        placeholder="Hourly Rate"
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <input
        name="location"
        placeholder="Location"
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <textarea
        name="description"
        placeholder="Description"
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700">Registration Document</label>
        <input
          type="file"
          name="registration"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
        {fileNames.registration && (
          <p className="text-sm text-gray-600 mt-1">Selected: {fileNames.registration}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">License Document</label>
        <input
          type="file"
          name="license"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
        {fileNames.license && (
          <p className="text-sm text-gray-600 mt-1">Selected: {fileNames.license}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">PIN Document</label>
        <input
          type="file"
          name="pin"
          onChange={handleFileChange}
          className="w-full p-2 border rounded"
        />
        {fileNames.pin && (
          <p className="text-sm text-gray-600 mt-1">Selected: {fileNames.pin}</p>
        )}
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {!showPayment ? (
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Submit & Pay $15
        </button>
      ) : (
        <PaypalButton onSuccess={handlePaymentSuccess} />
      )}
    </form>
  );
}