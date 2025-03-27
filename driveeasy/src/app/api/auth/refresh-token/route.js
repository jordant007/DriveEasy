import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // Parse the request body to get the token
    const { token } = await request.json();

    // Validate the token
    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    // Call the backend's /api/auth/refresh endpoint
    const res = await fetch("http://localhost:5000/api/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    // Check if the refresh was successful
    if (res.ok && data.token) {
      return NextResponse.json({
        token: data.token,
        expiry: data.expiry || Date.now() + 24 * 60 * 60 * 1000, // Default to 24 hours if expiry not provided
      });
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to refresh token" },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error refreshing token:", error.message);
    return NextResponse.json(
      { message: "Error refreshing token" },
      { status: 500 }
    );
  }
}