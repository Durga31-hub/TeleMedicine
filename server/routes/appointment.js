const express = require('express');
const Appointment = require('../models/Appointment');
const router = express.Router();

// Book appointment
router.post('/book', async (req, res) => {
  try {
    const { patientId, doctorId, date, timeSlot } = req.body;
    
    // Constraint: Same doctor OR Same patient at the same time
    const existing = await Appointment.findOne({ 
      $or: [
        { doctorId, date, timeSlot },
        { patientId, date, timeSlot }
      ],
      status: { $ne: 'rejected' } 
    });

    if (existing) {
      return res.status(409).json({ 
        message: existing.doctorId.toString() === doctorId 
          ? 'This doctor is already booked for this slot.' 
          : 'You already have another appointment booked for this time.' 
      });
    }

    const appointment = new Appointment({ patientId, doctorId, date, timeSlot });
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get appointments for user (patient or doctor)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const appointments = await Appointment.find({
      $or: [{ patientId: userId }, { doctorId: userId }]
    }).populate('patientId doctorId', 'name email specialization');
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
