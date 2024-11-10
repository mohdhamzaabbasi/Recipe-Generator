// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const recipeRoutes = require('./routes/recipeRoutes');

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/recipe', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Use the recipe routes
app.use('/api', recipeRoutes);

// Basic route to test the server
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
