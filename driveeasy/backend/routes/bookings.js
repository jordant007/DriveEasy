const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authenticate");
const { ObjectId } = require("mongodb");

// POST /api/bookings - Create a new booking
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { carId, renterId, startTime, endTime, totalCost } = req.body;

    // Log the incoming request body for debugging
    console.log("Incoming booking request body:", req.body);

    // Validate required fields
    if (!carId || !renterId || !startTime || !endTime || totalCost === undefined) {
      return res.status(400).json({ message: "Car ID, renter ID, start time, end time, and total cost are required" });
    }

    if (renterId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only book for yourself" });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return res.status(400).json({ message: "End time must be after start time" });
    }

    const db = req.app.locals.dbClient.db("driveeasy");
    const carsCollection = db.collection("cars");
    const bookingsCollection = db.collection("bookings");

    // Check if the car exists
    const car = await carsCollection.findOne({ _id: new ObjectId(carId) });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // Removed the overlapping booking check to allow bookings regardless of date conflicts
    /*
    const existingBookings = await bookingsCollection
      .find({
        carId: new ObjectId(carId),
        $or: [
          { startTime: { $lte: end }, endTime: { $gte: start } },
        ],
      })
      .toArray();

    if (existingBookings.length > 0) {
      return res.status(400).json({ message: "Car is not available for the selected dates" });
    }
    */

    const newBooking = {
      carId: new ObjectId(carId),
      renterId: new ObjectId(renterId),
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      totalCost: parseFloat(totalCost),
      createdAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(newBooking);
    res.status(201).json({ message: "Booking created successfully", bookingId: result.insertedId.toString() });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Error creating booking", error: error.message });
  }
});

// GET /api/bookings/user - Fetch bookings for a user
router.get("/user", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const db = req.app.locals.dbClient.db("driveeasy");
    const bookingsCollection = db.collection("bookings");
    const carsCollection = db.collection("cars");

    const bookings = await bookingsCollection
      .aggregate([
        { $match: { renterId: new ObjectId(userId) } },
        {
          $lookup: {
            from: "cars",
            localField: "carId",
            foreignField: "_id",
            as: "car",
          },
        },
        { $unwind: "$car" },
      ])
      .toArray();

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings for user:", error);
    res.status(500).json({ message: "Error fetching bookings", error: error.message });
  }
});

// GET /api/bookings/:id - Fetch a specific booking by ID
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const db = req.app.locals.dbClient.db("driveeasy");
    const bookingsCollection = db.collection("bookings");
    const carsCollection = db.collection("cars");

    const booking = await bookingsCollection
      .aggregate([
        { $match: { _id: new ObjectId(bookingId) } },
        {
          $lookup: {
            from: "cars",
            localField: "carId",
            foreignField: "_id",
            as: "car",
          },
        },
        { $unwind: "$car" },
      ])
      .toArray();

    if (!booking || booking.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const bookingData = booking[0];
    if (bookingData.renterId.toString() !== userId) {
      return res.status(403).json({ message: "You are not authorized to view this booking" });
    }

    res.status(200).json(bookingData);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Error fetching booking", error: error.message });
  }
});

module.exports = router;