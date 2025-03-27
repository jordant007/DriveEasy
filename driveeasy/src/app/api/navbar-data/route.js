import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  try {
    const client = new MongoClient(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    const db = client.db("driveeasy");
    const data = await db.collection("some-collection").find().toArray();
    await client.close();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching data", error: error.message },
      { status: 500 }
    );
  }
}