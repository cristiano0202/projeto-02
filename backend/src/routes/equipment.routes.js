const express = require('express');
const { listEquipments, createEquipment } = require('../controllers/equipment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', listEquipments);
router.post('/', authMiddleware, createEquipment);

module.exports = router;
