"use client";
import { useState } from "react";
import toast from "react-hot-toast"; // Import react-hot-toast
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import VerificationForm from "../../components/VerificationForm";
import Loader from "../../components/Loader";

export default function Signup() {
  const [loading, setLoading] = useState(false);

  const handlePaymentSuccess = () => {
    toast.success("Payment successful! You are now signed up."); // Replace alert with toast
    window.location.href = "/signin";
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow p-8">
        <h2 className="text-3xl font-semibold text-blue-900 mb-6">Sign Up</h2>
        {loading ? (
          <Loader />
        ) : (
          <VerificationForm onPaymentSuccess={handlePaymentSuccess} setLoading={setLoading} />
        )}
      </main>
      <Footer />
    </div>
  );
}