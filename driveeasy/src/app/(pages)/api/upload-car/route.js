import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();

  // Forward to backend
  const response = await fetch("http://localhost:5000/api/cars/upload", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    return NextResponse.json({ message: "Car uploaded successfully" });
  }
  return NextResponse.json({ error: "Upload failed" }, { status: 500 });
}