"use client";
import { SessionProvider } from "next-auth/react";
// import Navbar from "./components/Navbar"; // Assuming you have a Navbar component

export default function ClientLayout({ children }) {
  return (
    <SessionProvider>
      {/* <Navbar /> */}
      {children}
    </SessionProvider>
  );
}