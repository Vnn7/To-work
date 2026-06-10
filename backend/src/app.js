const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  return res.status(404).json({ message: 'Rota não encontrada.' });
});

module.exports = app;
