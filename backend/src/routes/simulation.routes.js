const express = require('express');
const {
  createSimulation,
  listSimulations,
  getSimulationById,
  deleteSimulation
} = require('../controllers/simulation.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', createSimulation);
router.get('/', listSimulations);
router.get('/:id', getSimulationById);
router.delete('/:id', deleteSimulation);

module.exports = router;
