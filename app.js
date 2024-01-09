// Import necessary modules
const express = require("express");
const app = express();
const mongoose = require("mongoose");

// Load environment variables
require("dotenv").config();
const DBUSER = process.env.DBUSER;
const DBPWD = process.env.DBPWD;

// Define Mongoose model for Person
const Person = mongoose.model("Person", {
  name: {
    type: String,
    required: [true, "The field is required"],
  },
  age: Number,
  favoriteFoods: [String],
});

// Connect to MongoDB Atlas using Mongoose
mongoose
  .connect(
    `mongodb+srv://${DBUSER}:${DBPWD}@cluster0.w2jl7xd.mongodb.net/checkpoint-mongoose?retryWrites=true&w=majority`,
    
  )
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

// Middleware to parse JSON in requests
app.use(express.json());

// Route to add a person or multiple people to the database
app.post("/addPerson", async (req, res) => {
  try {
    const peopleData = req.body;

    // Ensure the request body is an array
    if (!Array.isArray(peopleData)) {
      return res.status(400).json({
        status: false,
        error: "Invalid request format. Expecting an array.",
      });
    }

    // Insert people data into the database
    const insertedPeople = await Person.insertMany(peopleData);

    res
      .status(200)
      .json({ status: true, message: "Data was added", insertedPeople });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
});

// Route to find people who like burritos, sort them, limit results, and hide age
app.get("/persons", async (req, res) => {
  try {
    // Add the query to find people who like burritos
    let data = await Person.find({ favoriteFoods: "burritos" })
      .sort({ name: 1 }) // Sort them by name in ascending order
      .limit(2) // Limit the results to two documents
      .select("-age") // Hide their age
      .exec((err, data) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ status: false, error: "Internal Server Error" });
        }
        res.status(200).json({ status: true, data });
      });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
});

// Route to find a person by name
app.get("/person", async (req, res) => {
  try {
    let { name } = req.body;
    let nameRegex = new RegExp(name);

    // Find a person by name using a regular expression
    let data = await Person.findOne({ name: nameRegex });
    res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
});

// Route to find a person by ID
app.get("/person/:id", async (req, res) => {
  try {
    let { id } = req.params;

    // Find a person by ID
    let data = await Person.findById(id);
    res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
});

// Route to update a person's information
app.put("/updatePerson", async (req, res) => {
  try {
    let { name } = req.query;

    // Update a person's information by name
    let data = await Person.findOneAndUpdate(
      { name },
      { $set: { ...req.body } },
      { new: true }
    );
    res.status(200).json({ status: true, data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
});

// Route to delete a person by ID
app.delete("/deletePerson/:id", async (req, res) => {
  try {
    let { id } = req.query;

    // Delete a person by ID
    await Person.findByIdAndDelete(id);
    res.status(200).json({ status: true, message: "Person was removed" });
  } catch (error) {
    res.status(500).json({ status: false, error: "Internal Server Error" });
  }
});

// Set up the server to listen on a specified port
const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});
