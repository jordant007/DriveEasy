"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <header className="bg-gradient-to-r from-blue-900 to-blue-500 text-white p-6 shadow-md sticky top-0 z-10">
      <nav className="flex justify-between items-center max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold">
          <Link href="/">DriveEasy</Link>
        </h1>
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="hover:text-blue-100">
              Home
            </Link>
          </li>
          <li>
            <Link href="/listings" className="hover:text-blue-100">
              Rent a Car
            </Link>
          </li>
          {status === "authenticated" ? (
            <>
              <li>
                <Link href="/owner-dashboard" className="hover:text-blue-100">
                  List Your Car
                </Link>
              </li>
              <li>
                <Link href="/renter-dashboard" className="hover:text-blue-100">
                  My Rentals
                </Link>
              </li>
              <li>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hover:text-blue-100"
                >
                  Sign Out
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link href="/signup" className="hover:text-blue-100">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/signin" className="hover:text-blue-100">
                  Sign In
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}