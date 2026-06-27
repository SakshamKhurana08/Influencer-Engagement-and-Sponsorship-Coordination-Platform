const express = require("express");
const {
  getOngoingCampaigns,
  getFlaggedCampaigns,
  flagUserOrCampaign,
  removeUserOrCampaign,
  searchEntities,
  getStats
} = require("../controllers/adminController");

const { authenticateJWT } = require("../controllers/authController");

const router = express.Router();

// Admin Dashboard routes
router.get('/ongoing-campaigns', authenticateJWT, getOngoingCampaigns);
router.get('/flagged', authenticateJWT, getFlaggedCampaigns);
router.post('/flag', authenticateJWT, flagUserOrCampaign);
router.delete('/remove', authenticateJWT, removeUserOrCampaign);
router.get('/search', authenticateJWT, searchEntities);
router.get('/stats', authenticateJWT, getStats);

module.exports = router;
