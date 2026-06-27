const { User, Sponsor, Influencer } = require('../models');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);
const register = async (req, res) => {
  const { name, email, password, role, company, budget, industry, category, niche, reach } = req.body;
  const profileImage = req.file ? req.file.path : null;

  const t = await sequelize.transaction();

  try {
    const existingUser = await User.findOne({ where: { email }, transaction: t });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    }, { transaction: t });

    if (role === 'sponsor') {
      await Sponsor.create({
        userId: newUser.id,
        companyName: company,
        industry,
        budget,
      }, { transaction: t });
    } else if (role === 'influencer') {
      await Influencer.create({
        userId: newUser.id,
        category,
        niche,
        reach,
        profileImageUrl: profileImage,
      }, { transaction: t });
    }

    await t.commit();
    return res.status(201).json({ message: "User registered successfully", user: newUser });

  } catch (error) {
    await t.rollback();
    console.error("Transaction error during registration:", error);
    return res.status(500).json({ message: "Server error, registration failed" });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt for:", email);

    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Invalid password");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    console.log("Login successful for:", email);
    return res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error during login" });
  }
};

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Invalid token:', error);
    return res.status(403).json({ message: "Invalid token" });
  }
};


const getProfile = async (req, res) => {
  try {

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized - user info missing" });
    }

    const userId = req.user.userId;

    const user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

module.exports = { register, login, authenticateJWT, getProfile };