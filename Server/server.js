// Server/server.js
const express = require('express');
const bodyParser = require('body-parser'); 
require('dotenv').config();
const cors = require('cors');
const { sequelize } = require('./models');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const influencerRoutes = require('./routes/influencerRoutes');
const path = require('path');
const sponsorRoutes = require('./routes/sponsorRoutes');
const campaignRoutes = require('./routes/campaignRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'))); 

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/influencer', influencerRoutes);
app.use('/api/sponsors', sponsorRoutes);
app.use('/api/campaign', campaignRoutes);

const PORT = process.env.PORT || 2020;

console.log("Starting server...");
sequelize.authenticate()
  .then(() => {
    console.log("✅ Database connected successfully");
    return sequelize.sync({ force: false });
  })
  .then(() => {
    console.log('✅ Database synced');
    app.listen(PORT, () => console.log(`🚀 Server started on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ Error starting server:', err);
    process.exit(1);
  });

app.get('/', (req, res) => {
  res.send('Influencer Sponsorship Platform API is running!');
});