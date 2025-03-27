import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    const res = await fetch(`http://localhost:5000/api/cars/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (res.ok) {
      return NextResponse.json(data);
    } else {
      return NextResponse.json(
        { message: data.message || "Failed to fetch car" },
        { status: res.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching car", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = params;
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!id || !token) {
    return NextResponse.json(
      { message: "Missing car ID or token" },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`http://localhost:5000/api/cars/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      return NextResponse.json({ message: "Car deleted successfully" });
    } else {
      const data = await res.json();
      return NextResponse.json(
        { message: data.message || "Failed to delete car" },
        { status: res.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Error deleting car", error: error.message },
      { status: 500 }
    );
  }
}