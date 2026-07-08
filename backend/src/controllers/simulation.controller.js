const db = require('../database/connection');
const { calculateEnergy, getSavingTip } = require('../utils/energyCalculator');

async function createSimulation(req, res, next) {
  try {
    const {
      equipmentId,
      equipmentName,
      powerWatts,
      hoursPerDay,
      daysPerMonth,
      tariff
    } = req.body;

    if (!equipmentName || !powerWatts || hoursPerDay === undefined || !daysPerMonth || !tariff) {
      return res.status(400).json({ message: 'Dados insuficientes para calcular a simulação' });
    }

    const resultCalc = calculateEnergy({ powerWatts, hoursPerDay, daysPerMonth, tariff });
    const savingTip = getSavingTip(equipmentName);

    const [insertResult] = await db.query(
      `INSERT INTO simulations (
        user_id, equipment_id, equipment_name, power_watts,
        hours_per_day, days_per_month, tariff,
        monthly_kwh, monthly_cost, saving_tip
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        equipmentId || null,
        String(equipmentName).trim(),
        Math.round(Number(powerWatts)),
        Number(hoursPerDay),
        Number(daysPerMonth),
        Number(String(tariff).replace(',', '.')),
        resultCalc.monthlyKwh,
        resultCalc.monthlyCost,
        savingTip
      ]
    );

    const [simulations] = await db.query('SELECT * FROM simulations WHERE id = ?', [insertResult.insertId]);

    res.status(201).json({
      message: 'Simulação salva com sucesso',
      simulation: simulations[0]
    });
  } catch (error) {
    if (error.message && error.message.includes('inválid')) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
}

async function listSimulations(req, res, next) {
  try {
    const [simulations] = await db.query(
      `SELECT *
       FROM simulations
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ simulations });
  } catch (error) {
    next(error);
  }
}

async function getSimulationById(req, res, next) {
  try {
    const [simulations] = await db.query(
      `SELECT *
       FROM simulations
       WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (simulations.length === 0) {
      return res.status(404).json({ message: 'Simulação não encontrada' });
    }

    res.json({ simulation: simulations[0] });
  } catch (error) {
    next(error);
  }
}

async function deleteSimulation(req, res, next) {
  try {
    const [deleteResult] = await db.query(
      `DELETE FROM simulations
       WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (deleteResult.affectedRows === 0) {
      return res.status(404).json({ message: 'Simulação não encontrada' });
    }

    res.json({ message: 'Simulação removida com sucesso' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSimulation,
  listSimulations,
  getSimulationById,
  deleteSimulation
};
