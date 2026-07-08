function normalizeNumber(value) {
  if (typeof value === 'string') {
    return Number(value.replace(',', '.'));
  }
  return Number(value);
}

function calculateEnergy({ powerWatts, hoursPerDay, daysPerMonth, tariff }) {
  const power = normalizeNumber(powerWatts);
  const hours = normalizeNumber(hoursPerDay);
  const days = normalizeNumber(daysPerMonth);
  const tariffValue = normalizeNumber(tariff);

  if (!Number.isFinite(power) || power <= 0) {
    throw new Error('Potência inválida');
  }

  if (!Number.isFinite(hours) || hours < 0 || hours > 24) {
    throw new Error('Horas por dia devem estar entre 0 e 24');
  }

  if (!Number.isFinite(days) || days <= 0 || days > 31) {
    throw new Error('Dias de uso no mês devem estar entre 1 e 31');
  }

  if (!Number.isFinite(tariffValue) || tariffValue <= 0) {
    throw new Error('Tarifa inválida');
  }

  const monthlyKwh = (power * hours * days) / 1000;
  const monthlyCost = monthlyKwh * tariffValue;

  return {
    monthlyKwh: Number(monthlyKwh.toFixed(2)),
    monthlyCost: Number(monthlyCost.toFixed(2))
  };
}

function getSavingTip(equipmentName = '') {
  const name = equipmentName.toLowerCase();

  if (name.includes('chuveiro')) {
    return 'Reduza 5 minutos no banho e use a posição verão sempre que possível.';
  }

  if (name.includes('ar-condicionado') || name.includes('ar condicionado')) {
    return 'Mantenha a temperatura entre 23°C e 24°C, limpe os filtros e feche portas e janelas durante o uso.';
  }

  if (name.includes('geladeira')) {
    return 'Evite abrir a porta muitas vezes, confira a borracha de vedação e não coloque alimentos quentes dentro dela.';
  }

  if (name.includes('micro')) {
    return 'Use o micro-ondas para aquecimentos curtos e evite descongelamentos longos.';
  }

  if (name.includes('lavar')) {
    return 'Use a máquina com a capacidade máxima recomendada e prefira ciclos econômicos.';
  }

  if (name.includes('televisor') || name.includes('tv')) {
    return 'Ative o modo economia de energia e desligue o aparelho da tomada quando ficar muito tempo sem uso.';
  }

  if (name.includes('cooktop') || name.includes('fogão')) {
    return 'Use panelas adequadas ao tamanho da boca e desligue alguns minutos antes do fim do preparo.';
  }

  return 'Compare o tempo de uso diário e tente reduzir períodos de funcionamento desnecessários.';
}

module.exports = { calculateEnergy, getSavingTip };
