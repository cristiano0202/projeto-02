const db = require('../database/connection');

async function listEquipments(req, res, next) {
  try {
    const [equipments] = await db.query(
      `SELECT id, name, default_power_watts, category, is_default, created_at
       FROM equipments
       ORDER BY is_default DESC, name ASC`
    );

    res.json({ equipments });
  } catch (error) {
    next(error);
  }
}

async function createEquipment(req, res, next) {
  try {
    const { name, defaultPowerWatts, category } = req.body;

    if (!name || !defaultPowerWatts) {
      return res.status(400).json({ message: 'Nome e potência são obrigatórios' });
    }

    const power = Number(defaultPowerWatts);

    if (!Number.isFinite(power) || power <= 0) {
      return res.status(400).json({ message: 'Potência inválida' });
    }

    const [insertResult] = await db.query(
      `INSERT INTO equipments (name, default_power_watts, category, is_default)
       VALUES (?, ?, ?, false)`,
      [String(name).trim(), Math.round(power), category || null]
    );

    const [equipments] = await db.query(
      `SELECT id, name, default_power_watts, category, is_default, created_at
       FROM equipments
       WHERE id = ?`,
      [insertResult.insertId]
    );

    res.status(201).json({
      message: 'Equipamento cadastrado com sucesso',
      equipment: equipments[0]
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Este equipamento já está cadastrado' });
    }

    next(error);
  }
}

module.exports = { listEquipments, createEquipment };
