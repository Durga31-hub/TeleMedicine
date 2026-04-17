const express = require('express');
const { analyzeSymptoms } = require('../services/aiService');
const Appointment = require('../models/Appointment');
const router = express.Router();

// Analyze symptoms and attach to appointment
router.post('/analyze/:appointmentId', async (req, res) => {
  try {
    const { symptoms } = req.body;
    const { appointmentId } = req.params;

    console.log('Starting AI Analysis for:', appointmentId);
    const analysis = analyzeSymptoms(symptoms);
    console.log('Analysis Result:', analysis);
    
    const appointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: { aiAnalysis: { symptoms, ...analysis } } },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      console.log('Appointment not found for ID:', appointmentId);
      return res.status(404).json({ message: 'Appointment record not found.' });
    }

    res.json(analysis);
  } catch (err) {
    console.error('AI Route Error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
