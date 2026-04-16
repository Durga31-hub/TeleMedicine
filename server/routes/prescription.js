const express = require('express');
const Prescription = require('../models/Prescription');
const router = express.Router();

// Create prescription
router.post('/create', async (req, res) => {
  try {
    const { appointmentId, patientId, doctorId, diagnosis, medicines, notes } = req.body;
    const prescription = new Prescription({ appointmentId, patientId, doctorId, diagnosis, medicines, notes });
    await prescription.save();
    res.status(201).json(prescription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get prescriptions for patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({ patientId: req.params.patientId })
      .populate('doctorId', 'name specialization')
      .sort({ createdAt: -1 });
    res.json(prescriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
