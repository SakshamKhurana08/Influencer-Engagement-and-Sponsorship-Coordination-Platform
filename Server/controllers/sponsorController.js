const { Sponsor, User } = require('../models');

const getMySponsorDetails = async (req, res) => {
    try {
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Unauthorized - user info missing" });
        }

        const sponsor = await Sponsor.findOne({ where: { userId: req.user.userId } });

        if (!sponsor) {
            return res.status(404).json({ message: "Sponsor profile not found" });
        }

        res.json(sponsor);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {  // Mark the function as async
    try {
        // Find the sponsor using userId from the decoded token (from req.user)
        const sponsor = await Sponsor.findOne({ where: { userId: req.user.userId } });

        if (!sponsor) {
            return res.status(404).json({ message: 'Sponsor not found' });
        }

        // Now find the user associated with this sponsor using userId from the decoded token
        const user = await User.findByPk(req.user.userId);  // Ensure req.user.userId exists and is correct

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send back both sponsor and user data as JSON
        res.json({ sponsor, user });
    } catch (err) {
        console.error("Error fetching profile:", err);
        res.status(500).json({ message: 'Error fetching profile', error: err.message });
    }
};

const updateProfile = async (req, res) => {
    const { name, companyName, industry, budget } = req.body;

    // Ensure all necessary fields are provided
    if (!name || !companyName || !industry || !budget) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Ensure that email cannot be modified
        const user = await User.findByPk(req.user.userId);

        // If the email is in the request body, reject the update
        if (req.body.email && req.body.email !== user.email) {
            return res.status(400).json({ message: 'Email cannot be changed' });
        }

        // Update User's name (email remains unchanged)
        await User.update({ name }, { where: { id: req.user.userId } });

        // Update Sponsor fields
        await Sponsor.update({ companyName, industry, budget }, {
            where: { userId: req.user.userId }
        });

        // Fetch updated records to return
        const updatedUser = await User.findByPk(req.user.userId);
        const updatedSponsor = await Sponsor.findOne({
            where: { userId: req.user.userId }
        });

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser,
            sponsor: updatedSponsor
        });
    } catch (err) {
        console.error("Error updating profile:", err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};



module.exports = { getMySponsorDetails, getProfile, updateProfile };