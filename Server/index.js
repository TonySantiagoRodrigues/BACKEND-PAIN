require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connection = require("./db");
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

const app = express();

// Middlewares
app.use(express.json());

// Configure CORS to only allow requests from your frontend domain
app.use(cors({
   origin: "https://relaxed-faloodeh-2e68d0.netlify.app"  // seu frontend URL
}));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Database connection
connection();

const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`Using MongoDB at: ${process.env.MONGO_URL}`);
});
