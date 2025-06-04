const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");

const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");

require("./models/user");
require("./models/inventory");

dotenv.config();

// Connect to database
connectDB();

const auth = require("./routes/auth");
const inventory = require("./routes/inventory");

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors());

app.use(helmet());

app.use("/api/v1/auth", auth);
app.use("/api/v1/inventory", inventory);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);

  server.close(() => process.exit(1));
});
