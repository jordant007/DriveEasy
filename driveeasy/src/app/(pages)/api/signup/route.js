import { NextResponse } from "next/server";

export async function POST(req) {
  const formData = await req.formData();
  const email = formData.get("email");
  const password = formData.get("password");
  const license = formData.get("license");
  const pin = formData.get("pin");

  // Forward to backend
  const response = await fetch("http://localhost:5000/api/auth/signup", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    return NextResponse.json({ message: "Signup successful" });
  }
  return NextResponse.json({ error: "Signup failed" }, { status: 500 });
}