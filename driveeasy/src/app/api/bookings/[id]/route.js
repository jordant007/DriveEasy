import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/bookings/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to fetch booking" },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching booking", error: error.message },
      { status: 500 }
    );
  }
}