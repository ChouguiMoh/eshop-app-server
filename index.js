// Import required Node modules
require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');

// Import required files
const { notFoundHandler, globalErrorHandler } = require('./middleware/errors');
const corsOptions = require('./utils/corsOptions');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5001;
const MONGO_URL = process.env.MONGO_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(helmet());
app.use(morgan('common'));

app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use(require('./routes/root'));
app.use('/api/auth', require('./routes/auth'));

app.all('/*splat', (req, res, next) => {
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
    } else if (req.accepts('json')) {
        res.status(404).json({ error: 'Not Found' });
    } else {
        res.status(404).type('txt').send('Not Found');
    }
});
// Error handling middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

// Connect to MongoDB and start the server
mongoose.connect(MONGO_URL);
mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
  });
});
mongoose.connection.on('error', (err) => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

