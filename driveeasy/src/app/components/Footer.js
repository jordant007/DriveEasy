"use client"; // Add this directive at the top

import Link from "next/link";
import { useState } from "react";
import { FaTwitter, FaFacebook, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setNewsletterMessage("Please enter a valid email address.");
      return;
    }
    setNewsletterMessage("Thank you for subscribing!");
    setEmail("");
    setTimeout(() => setNewsletterMessage(""), 3000);
  };

  return (
    <footer className="bg-gradient-to-r from-blue-900 to-blue-500 text-white p-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* DriveEasy Branding */}
        <div>
          <h4 className="text-yellow-400 text-lg font-semibold mb-4">DriveEasy</h4>
          <p className="text-gray-200">
            Your go-to platform for instant micro-rentals. Rent smarter, not longer.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-yellow-400 text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-gray-200 hover:text-yellow-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/listings" className="text-gray-200 hover:text-yellow-400 transition-colors">
                Listings
              </Link>
            </li>
            <li>
              <Link href="/owner-dashboard" className="text-gray-200 hover:text-yellow-400 transition-colors">
                Owner Dashboard
              </Link>
            </li>
            <li>
              <Link href="/signin" className="text-gray-200 hover:text-yellow-400 transition-colors">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/signup" className="text-gray-200 hover:text-yellow-400 transition-colors">
                Sign Up
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-gray-200 hover:text-yellow-400 transition-colors">
                About Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="text-yellow-400 text-lg font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-2 text-gray-200">
            <li className="flex items-center">
              <FaEnvelope className="mr-2" />
              <a href="mailto:support@driveeasy.com" className="hover:text-yellow-400 transition-colors">
                support@driveeasy.com
              </a>
            </li>
            <li className="flex items-center">
              <FaPhone className="mr-2" />
              <a href="tel:+1234567890" className="hover:text-yellow-400 transition-colors">
                +1 (234) 567-890
              </a>
            </li>
            <li className="flex items-center">
              <FaMapMarkerAlt className="mr-2" />
              <span>123 DriveEasy Lane, Car City, USA</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="text-yellow-400 text-lg font-semibold mb-4">Newsletter</h4>
          <p className="text-gray-200 mb-4">Stay updated with our latest offers and news.</p>
          <form onSubmit={handleNewsletterSubmit} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 rounded-lg bg-blue-800/50 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button
              type="submit"
              className="w-full bg-yellow-400 text-blue-900 p-2 rounded-lg hover:bg-yellow-500 font-semibold"
            >
              Subscribe
            </button>
            {newsletterMessage && (
              <p
                className={`text-sm mt-2 ${
                  newsletterMessage.includes("Thank you") ? "text-green-300" : "text-red-300"
                }`}
              >
                {newsletterMessage}
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Social Media Links */}
      <div className="max-w-6xl mx-auto mt-8 flex justify-center space-x-6">
        <a
          href="https://twitter.com/driveeasy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-200 hover:text-yellow-400 transition-colors"
        >
          <FaTwitter size={24} />
        </a>
        <a
          href="https://facebook.com/driveeasy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-200 hover:text-yellow-400 transition-colors"
        >
          <FaFacebook size={24} />
        </a>
        <a
          href="https://instagram.com/driveeasy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-200 hover:text-yellow-400 transition-colors"
        >
          <FaInstagram size={24} />
        </a>
      </div>

      {/* Copyright */}
      <div className="text-center mt-4 border-t pt-4 border-white/20">
        <p>© 2025 DriveEasy. All rights reserved.</p>
      </div>
    </footer>
  );
}