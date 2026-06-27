// Server/routes/sponsorRoutes.js
const express = require('express');
const { getMySponsorDetails, getProfile, updateProfile } = require('../controllers/SponsorController');
const { authenticateJWT } = require('../controllers/authController');

const router = express.Router();

router.get('/details', authenticateJWT, getMySponsorDetails);  // Apply middleware here
router.get('/profile', authenticateJWT, getProfile);
router.put('/profile', authenticateJWT, updateProfile);

module.exports = router;
