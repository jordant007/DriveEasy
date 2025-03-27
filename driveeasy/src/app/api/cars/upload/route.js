import { NextResponse } from "next/server";

export async function POST(request) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json(
      { message: "Missing token" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();

    const response = await fetch("http://localhost:5000/api/cars/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to upload car" },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error uploading car", error: error.message },
      { status: 500 }
    );
  }
}