import { Poppins } from 'next/font/google';
import ClientLayout from './ClientLayout';
import { Toaster } from 'react-hot-toast'; // Import Toaster from react-hot-toast
import './globals.css';

// Initialize Poppins font with desired weights and subsets
const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

// Metadata for the app (used for SEO and browser tab display)
export const metadata = {
  title: 'DriveEasy - Instant Micro-Rentals',
  description: 'Rent smarter, not longer with DriveEasy. Book cars instantly for as low as 6 USD/hour.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.className}>
      <body className="min-h-screen flex flex-col">
        <ClientLayout>
          <main className="flex-grow">{children}</main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000, // Toasts disappear after 3 seconds
              style: {
                background: "#1e3a8a", // Blue background (matches your app's blue-900)
                color: "#ffffff", // White text
                border: "1px solid #facc15", // Yellow border (matches your app's yellow-400)
                borderRadius: "8px",
                padding: "12px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                fontFamily: "Poppins, sans-serif", // Match the Poppins font
              },
              success: {
                style: {
                  background: "#15803d", // Green background for success
                  color: "#ffffff",
                },
                iconTheme: {
                  primary: "#ffffff",
                  secondary: "#15803d",
                },
              },
              error: {
                style: {
                  background: "#b91c1c", // Red background for errors
                  color: "#ffffff",
                },
                iconTheme: {
                  primary: "#ffffff",
                  secondary: "#b91c1c",
                },
              },
            }}
            containerAriaLabel="Notifications"
          />
        </ClientLayout>
      </body>
    </html>
  );
}