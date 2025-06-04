const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
// const colors = require('colors');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

console.log('server.js: Attempting to require models...'); 
require('./models/user');
require('./models/inventory');
console.log('server.js: Model files have been required.'); // <-- Log ini
dotenv.config();

// Connect to database
connectDB();


const auth = require('./routes/auth');
const inventory = require('./routes/inventory');

const app = express();


app.use(express.json());


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/inventory', inventory);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});