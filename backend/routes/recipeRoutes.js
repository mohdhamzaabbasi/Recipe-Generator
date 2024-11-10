const express = require('express');
const router = express.Router();
const User = require('../models/User');
const axios = require('axios');

// Registration route
router.post('/auth/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      username,
      password,
      requests: [], // Initialize an empty requests array
    });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error registering user: ' + error.message });
  }
});

// Login route
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful', username });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in: ' + error.message });
  }
});

router.post('/auth/save-request', async (req, res) => {
  try {
    console.log(req.body);
    const { username, ingredients } = req.body;
    console.log('Received request:', username, ingredients);

    // Ensure ingredients is a string or convert it to a string
    const ingredientsString = Array.isArray(ingredients) ? ingredients.join(', ') : ingredients.toString();
    console.log('Ingredients after processing:', ingredientsString);

    const user = await User.findOne({ username });

    if (user) {
      user.requests.push(ingredientsString);
      await user.save();
      res.status(200).json({ message: 'Request saved successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error saving request:', error);  // More detailed error logging
    res.status(500).json({ message: 'Error saving request: ' + error.message });
  }
});

// Fetch all requests for a user (Chat-like functionality)
router.get('/auth/messages', async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });

    if (user) {
      res.status(200).json(user.requests); // Respond with the user's request history
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests: ' + error.message });
  }
});


const API_URL = 'http://192.168.1.35:5000/generate_recipe'; // Replace with your recipe API URL

router.post('/generate-recipe', async (req, res) => {
  try {
    console.log(req.body);
    // Sending POST request to the recipe API with ingredients
    const response = await axios.post(API_URL, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Sending the API response back to the client
    res.json(response.data);
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Failed to generate recipe');
  }
});

router.post('/save-request', async (req, res) => {
  const { username, input } = req.body;
  console.log(req.body);

  // Validate input data
  if (!username || !input) {
    return res.status(400).json({ error: 'Username and ingredients are required.' });
  }

  try {
    // Find user by username
    let user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }  

    // Save the ingredients to the user's requests array
    user.requests.push(input);
    await user.save();

    res.status(200).json({ message: 'Request saved successfully.', user });
  } catch (error) {
    console.error('Error saving request:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

router.post('/get-requests', async (req, res) => {
  const { username } = req.body;

  // Validate input data
  if (!username) {
    return res.status(400).json({ error: 'Username is required.' });
  }

  try {
    // Find user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Return the user's request array
    res.status(200).json({ requests: user.requests });
  } catch (error) {
    console.error('Error retrieving requests:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Assuming Express setup
router.post('/auth/delete-account', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate user input
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify password (assuming user.password is hashed)
    const isMatch = password===user.password;
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Delete user
    await User.deleteOne({ username });
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account: ' + error.message });
  }
});


router.post('/auth/update-password', async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;

    if (!username || !oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Username, old password, and new password are required' });
    }

    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if old password is correct
    const isMatch = oldPassword===user.password;
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect old password' });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating password: ' + error.message });
  }
});


module.exports = router;
