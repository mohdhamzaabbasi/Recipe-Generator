const mongoose = require('mongoose');

// Define user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  requests: [
    {
      type: String, // Store the ingredients used by the user
    },
  ],
});

// Create user model
const User = mongoose.model('User', userSchema);

module.exports = User;
