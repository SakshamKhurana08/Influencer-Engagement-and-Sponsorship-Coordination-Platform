const express = require('express');
const {
    createCampaign,
    getAllMyCampaigns,
    updateCampaign,
    deleteCampaign,
    createAdRequest,
    getAdRequestsForCampaign,
    updateAdRequest,
    deleteAdRequest
} = require('../controllers/campaignController');
const { authenticateJWT } = require('../controllers/authController');

const router = express.Router();

router.post('/', authenticateJWT, createCampaign);               
router.get('/my-campaigns', authenticateJWT, getAllMyCampaigns);           
router.put('/:id', authenticateJWT, updateCampaign);   
router.delete('/:id', authenticateJWT, deleteCampaign);     

router.post('/campaign/:campaignId/ad-request', authenticateJWT, createAdRequest);     
router.get('/campaign/:campaignId/ad-requests', authenticateJWT, getAdRequestsForCampaign);
router.put('/ad-request/:adRequestId', authenticateJWT, updateAdRequest);       
router.delete('/ad-request/:adRequestId', authenticateJWT, deleteAdRequest);          

module.exports = router;
