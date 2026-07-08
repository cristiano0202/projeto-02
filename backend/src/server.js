require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const equipmentRoutes = require('./routes/equipment.routes');
const simulationRoutes = require('./routes/simulation.routes');
const { notFound, errorHandler } = require('./middlewares/error.middleware');
const { testConnection } = require('./database/connection');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || '*',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'EcoWatt API',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/simulations', simulationRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, async () => {
  console.log(`EcoWatt API rodando em http://localhost:${port}`);

  try {
    await testConnection();
  } catch (error) {
    console.error('Erro ao conectar no MySQL:', error.message);
  }
});
