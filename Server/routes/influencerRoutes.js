const express = require('express');
const router = express.Router();

const { getProfile, updateProfile, getPublicCampaigns, acceptCampaign, getAdRequests, handleAdRequest } = require('../controllers/influencerController');
const { authenticateJWT } = require('../controllers/authController');


router.get('/profile', authenticateJWT, getProfile);

router.put('/profile', authenticateJWT, updateProfile);

router.get('/open-campaigns', authenticateJWT, getPublicCampaigns);

router.post('/campaigns/:id/accept', authenticateJWT, acceptCampaign);

router.get('/ad-requests', authenticateJWT, getAdRequests);

router.post('/ad-requests/:id/:action', authenticateJWT, handleAdRequest);

module.exports = router;