const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Get all doctors
router.get('/all', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' }).select('-password');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update doctor availability
router.post('/availability', async (req, res) => {
  try {
    const { userId, availability } = req.body;
    const user = await User.findById(userId);
    if (!user || user.role !== 'doctor') return res.status(404).json({ message: 'Doctor not found' });

    user.availability = availability;
    await user.save();
    res.json({ message: 'Availability updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
