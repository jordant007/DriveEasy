const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const authMiddleware = require("../middleware/authenticate");
const multer = require("multer");
const path = require("path");

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// GET /api/cars - Get all available cars (public route)
router.get("/", async (req, res) => {
  try {
    const db = req.app.locals.dbClient.db("driveeasy");
    const carsCollection = db.collection("cars");

    const cars = await carsCollection.find({}).toArray();
    console.log("Fetched all cars:", cars.length, "cars");

    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching all cars:", error);
    res.status(500).json({ message: "Error fetching cars", error: error.message });
  }
});

// GET /api/cars/owner - Get cars by owner (authenticated route)
router.get("/owner", authMiddleware, async (req, res) => {
  console.log("GET /api/cars/owner route called");
  try {
    const ownerId = req.query.ownerId;
    console.log("Received ownerId:", ownerId);
    console.log("Type of ownerId:", typeof ownerId);
    console.log("ObjectId.isValid(ownerId):", ObjectId.isValid(ownerId));

    if (!ownerId) {
      console.log("Owner ID is missing");
      return res.status(400).json({ message: "Owner ID is required" });
    }
    if (!ObjectId.isValid(ownerId)) {
      console.log("Owner ID is invalid:", ownerId);
      return res.status(400).json({ message: `Invalid owner ID: ${ownerId}` });
    }

    console.log("req.user.id from authMiddleware:", req.user.id);
    if (ownerId !== req.user.id) {
      console.log("Forbidden: ownerId does not match authenticated user ID");
      return res.status(403).json({ message: "Forbidden: You can only view your own cars" });
    }

    const db = req.app.locals.dbClient.db("driveeasy");
    const carsCollection = db.collection("cars");

    console.log("Querying cars for ownerId:", ownerId);
    const cars = await carsCollection
      .find({ ownerId: new ObjectId(ownerId) })
      .toArray();

    console.log("Fetched cars for owner:", cars.length, "cars");
    res.status(200).json(cars);
  } catch (error) {
    console.error("Error fetching cars by owner:", error);
    res.status(500).json({ message: "Error fetching cars", error: error.message });
  }
});

// GET /api/cars/:id - Get a specific car by ID (public route)
router.get("/:id", async (req, res) => {
  try {
    const carId = req.params.id;
    console.log("Fetching car with ID:", carId);
    console.log("Type of carId:", typeof carId);
    console.log("ObjectId.isValid(carId):", ObjectId.isValid(carId));

    if (!ObjectId.isValid(carId)) {
      return res.status(400).json({ message: `Invalid car ID: ${carId}` });
    }

    const db = req.app.locals.dbClient.db("driveeasy");
    const carsCollection = db.collection("cars");

    const car = await carsCollection.findOne({ _id: new ObjectId(carId) });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    console.log("Fetched car:", car);
    res.status(200).json(car);
  } catch (error) {
    console.error("Error fetching car by ID:", error);
    res.status(500).json({ message: "Error fetching car", error: error.message });
  }
});

// POST /api/cars - Add a new car with image uploads (authenticated route)
router.post(
  "/",
  authMiddleware,
  upload.fields([
    { name: "carImages", maxCount: 5 },
    { name: "driverLicense", maxCount: 1 },
    { name: "nationalId", maxCount: 1 },
  ]),
  async (req, res) => {
    console.log("POST /api/cars called");
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    try {
      const {
        model,
        type,
        passengers,
        rate,
        location,
        description,
        registrationNumber,
        color,
        year,
        availability,
        ownerId,
        ownerPhone, // Add ownerPhone
      } = req.body;

      console.log("Parsed data:", {
        model,
        type,
        passengers,
        rate,
        location,
        description,
        registrationNumber,
        color,
        year,
        availability,
        ownerId,
        ownerPhone,
      });

      // Validate required fields
      if (
        !model ||
        !type ||
        !passengers ||
        !rate ||
        !location ||
        !description ||
        !registrationNumber ||
        !color ||
        !year ||
        availability === undefined ||
        !ownerId ||
        !ownerPhone // Validate ownerPhone
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Validate ownerId
      if (!ObjectId.isValid(ownerId)) {
        return res.status(400).json({ message: `Invalid owner ID: ${ownerId}` });
      }

      // Ensure the ownerId matches the authenticated user
      if (ownerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You can only list cars for yourself" });
      }

      // Validate file uploads
      if (
        !req.files ||
        !req.files.carImages ||
        !req.files.driverLicense ||
        !req.files.nationalId
      ) {
        return res.status(400).json({ message: "Car images, driver’s license, and national ID are required" });
      }

      const carImages = req.files.carImages.map((file) => `uploads/${file.filename}`);
      const driverLicense = `uploads/${req.files.driverLicense[0].filename}`;
      const nationalId = `uploads/${req.files.nationalId[0].filename}`;

      console.log("Car images:", carImages);
      console.log("Driver’s license:", driverLicense);
      console.log("National ID:", nationalId);

      const db = req.app.locals.dbClient.db("driveeasy");
      const carsCollection = db.collection("cars");

      const newCar = {
        model,
        type,
        passengers: parseInt(passengers),
        rate: parseFloat(rate),
        location,
        description,
        registrationNumber,
        color,
        year: parseInt(year),
        availability: availability === "true",
        ownerId: new ObjectId(ownerId),
        ownerPhone, // Add ownerPhone to the new car object
        carImages,
        driverLicense,
        nationalId,
        createdAt: new Date(),
      };

      const result = await carsCollection.insertOne(newCar);
      console.log("Car added with ID:", result.insertedId);

      res.status(201).json({ message: "Car added successfully", carId: result.insertedId.toString() });
    } catch (error) {
      console.error("Error adding car:", error);
      res.status(500).json({ message: "Error adding car", error: error.message });
    }
  }
);

// PUT /api/cars/:id - Update a car (authenticated route)
router.put(
  "/:id",
  authMiddleware,
  upload.fields([
    { name: "carImages", maxCount: 5 },
    { name: "driverLicense", maxCount: 1 },
    { name: "nationalId", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const carId = req.params.id;
      console.log("Updating car with ID:", carId);
      console.log("Type of carId:", typeof carId);
      console.log("ObjectId.isValid(carId):", ObjectId.isValid(carId));

      if (!ObjectId.isValid(carId)) {
        return res.status(400).json({ message: `Invalid car ID: ${carId}` });
      }

      const db = req.app.locals.dbClient.db("driveeasy");
      const carsCollection = db.collection("cars");

      // Check if the car exists and belongs to the authenticated user
      const car = await carsCollection.findOne({ _id: new ObjectId(carId) });
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      if (car.ownerId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden: You can only edit your own cars" });
      }

      const {
        model,
        type,
        passengers,
        rate,
        location,
        description,
        registrationNumber,
        color,
        year,
        availability,
        ownerPhone, // Add ownerPhone
      } = req.body;

      console.log("Update data:", {
        model,
        type,
        passengers,
        rate,
        location,
        description,
        registrationNumber,
        color,
        year,
        availability,
        ownerPhone,
      });

      // Validate required fields
      if (
        !model ||
        !type ||
        !passengers ||
        !rate ||
        !location ||
        !description ||
        !registrationNumber ||
        !color ||
        !year ||
        availability === undefined ||
        !ownerPhone // Validate ownerPhone
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      // Update fields
      const updatedCar = {
        model,
        type,
        passengers: parseInt(passengers),
        rate: parseFloat(rate),
        location,
        description,
        registrationNumber,
        color,
        year: parseInt(year),
        availability: availability === "true",
        ownerPhone, // Add ownerPhone to the updated car object
        updatedAt: new Date(),
      };

      // Update file fields only if new files are uploaded
      if (req.files) {
        if (req.files.carImages) {
          updatedCar.carImages = req.files.carImages.map((file) => `uploads/${file.filename}`);
        }
        if (req.files.driverLicense) {
          updatedCar.driverLicense = `uploads/${req.files.driverLicense[0].filename}`;
        }
        if (req.files.nationalId) {
          updatedCar.nationalId = `uploads/${req.files.nationalId[0].filename}`;
        }
      }

      const result = await carsCollection.updateOne(
        { _id: new ObjectId(carId) },
        { $set: updatedCar }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ message: "Car not found" });
      }

      console.log("Car updated with ID:", carId);
      res.status(200).json({ message: "Car updated successfully" });
    } catch (error) {
      console.error("Error updating car:", error);
      res.status(500).json({ message: "Error updating car", error: error.message });
    }
  }
);

// DELETE /api/cars/:id - Delete a car (authenticated route)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const carId = req.params.id;
    console.log("Deleting car with ID:", carId);
    console.log("Type of carId:", typeof carId);
    console.log("ObjectId.isValid(carId):", ObjectId.isValid(carId));

    if (!ObjectId.isValid(carId)) {
      return res.status(400).json({ message: `Invalid car ID: ${carId}` });
    }

    const db = req.app.locals.dbClient.db("driveeasy");
    const carsCollection = db.collection("cars");

    // Check if the car exists and belongs to the authenticated user
    const car = await carsCollection.findOne({ _id: new ObjectId(carId) });
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    if (car.ownerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own cars" });
    }

    const result = await carsCollection.deleteOne({ _id: new ObjectId(carId) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    console.log("Car deleted with ID:", carId);
    res.status(200).json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ message: "Error deleting car", error: error.message });
  }
});

module.exports = router;