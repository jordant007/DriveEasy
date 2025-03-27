import { NextResponse } from "next/server";

export async function POST(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to create booking" },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating booking", error: error.message },
      { status: 500 }
    );
  }
}