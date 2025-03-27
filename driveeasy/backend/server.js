require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const authRoutes = require("./routes/auth");
const carRoutes = require("./routes/cars");
const bookingRoutes = require("./routes/bookings");
const path = require("path");

const app = express();

// Enable CORS for requests from http://localhost:3000
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Serve static files from the "uploads" directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Optionally keep the "images" directory if you still need it
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(express.json());

// MongoDB client setup
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connect to MongoDB once at startup
async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    app.locals.dbClient = client;

    // Routes
    app.use("/api/auth", authRoutes);
    app.use("/api/cars", carRoutes);
    app.use("/api/bookings", bookingRoutes);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

startServer();

// Close the MongoDB client when the server shuts down
process.on("SIGINT", async () => {
  await client.close();
  console.log("MongoDB client disconnected");
  process.exit(0);
});