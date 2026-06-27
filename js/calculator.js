(function () {
  const FALLBACK_EQUIPMENTS = [
    { id: 'chuveiro', name: 'Chuveiro Elétrico', default_power_watts: 5500, category: 'Aquecimento' },
    { id: 'ar-condicionado', name: 'Ar-Condicionado', default_power_watts: 1500, category: 'Climatização' },
    { id: 'geladeira', name: 'Geladeira Duplex', default_power_watts: 250, category: 'Refrigeração' },
    { id: 'microondas', name: 'Micro-ondas', default_power_watts: 1200, category: 'Cozinha' },
    { id: 'maquina-lavar', name: 'Máquina de Lavar', default_power_watts: 500, category: 'Lavanderia' },
    { id: 'televisor', name: 'Televisor LED', default_power_watts: 100, category: 'Eletrônicos' },
    { id: 'cooktop', name: 'Cooktop/Fogão Elétrico', default_power_watts: 6000, category: 'Cozinha' }
  ];

  function getTip(equipmentName = '', mode = 'equipment') {
    if (mode === 'bill') {
      return 'Compare o consumo geral da conta com os equipamentos mais usados. Chuveiro, ar-condicionado, geladeira e cooktop costumam ter maior impacto.';
    }

    const name = equipmentName.toLowerCase();

    if (name.includes('chuveiro')) {
      return 'Reduza 5 minutos no banho e use a posição verão sempre que possível.';
    }

    if (name.includes('ar-condicionado') || name.includes('ar condicionado')) {
      return 'Mantenha em 23°C ou 24°C, limpe os filtros e feche portas e janelas.';
    }

    if (name.includes('geladeira')) {
      return 'Evite abrir a porta muitas vezes e confira a borracha de vedação.';
    }

    if (name.includes('micro')) {
      return 'Use apenas para aquecer pequenas porções e evite descongelamentos longos.';
    }

    if (name.includes('lavar')) {
      return 'Use a capacidade máxima recomendada e evite ciclos pequenos.';
    }

    if (name.includes('televisor') || name.includes('tv')) {
      return 'Ative o modo economia e desligue da tomada quando ficar muito tempo sem uso.';
    }

    if (name.includes('cooktop') || name.includes('fogão')) {
      return 'Use panelas adequadas e desligue alguns minutos antes do fim do preparo.';
    }

    return 'Compare o tempo de uso e tente reduzir o funcionamento diário desnecessário.';
  }

  function toNumber(value) {
    return Number(String(value || '').replace(',', '.'));
  }

  function formatPercent(value) {
    return `${Number(value || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}%`;
  }

  function calculateEquipment({ powerWatts, hours, minutes, days, tariff, totalBillKwh }) {
    const power = toNumber(powerWatts);
    const h = toNumber(hours);
    const min = toNumber(minutes);
    const d = toNumber(days);
    const t = toNumber(tariff);
    const totalKwh = toNumber(totalBillKwh);

    if (!Number.isFinite(power) || power <= 0) {
      throw new Error('Informe uma potência válida.');
    }

    if (!Number.isFinite(h) || h < 0 || h > 24) {
      throw new Error('Horas devem estar entre 0 e 24.');
    }

    if (!Number.isFinite(min) || min < 0 || min > 59) {
      throw new Error('Minutos devem estar entre 0 e 59.');
    }

    if (h + min <= 0) {
      throw new Error('Informe um tempo de uso maior que zero.');
    }

    if (!Number.isFinite(d) || d <= 0 || d > 31) {
      throw new Error('Dias devem estar entre 1 e 31.');
    }

    if (!Number.isFinite(t) || t <= 0) {
      throw new Error('Informe uma tarifa válida.');
    }

    const hoursPerDay = h + min / 60;
    const monthlyKwh = (power * hoursPerDay * d) / 1000;
    const monthlyCost = monthlyKwh * t;

    const billSharePercent =
      Number.isFinite(totalKwh) && totalKwh > 0
        ? (monthlyKwh / totalKwh) * 100
        : null;

    return {
      type: 'equipment',
      hoursPerDay,
      monthlyKwh: Number(monthlyKwh.toFixed(2)),
      monthlyCost: Number(monthlyCost.toFixed(2)),
      billSharePercent: billSharePercent === null ? null : Number(billSharePercent.toFixed(2))
    };
  }

  function calculateBill({ billCost, billKwh, billTariff, billDays }) {
    const cost = toNumber(billCost);
    const informedKwh = toNumber(billKwh);
    const tariff = toNumber(billTariff);
    const days = toNumber(billDays);

    if (!Number.isFinite(days) || days <= 0 || days > 31) {
      throw new Error('Dias do período devem estar entre 1 e 31.');
    }

    if ((!Number.isFinite(informedKwh) || informedKwh <= 0) && (!Number.isFinite(cost) || cost <= 0)) {
      throw new Error('Informe o valor da conta ou o consumo em kWh.');
    }

    if ((!Number.isFinite(informedKwh) || informedKwh <= 0) && (!Number.isFinite(tariff) || tariff <= 0)) {
      throw new Error('Para calcular kWh pelo valor da conta, informe uma tarifa válida.');
    }

    const monthlyKwh =
      Number.isFinite(informedKwh) && informedKwh > 0
        ? informedKwh
        : cost / tariff;

    const monthlyCost =
      Number.isFinite(cost) && cost > 0
        ? cost
        : monthlyKwh * tariff;

    const effectiveTariff = monthlyCost / monthlyKwh;
    const dailyAverageKwh = monthlyKwh / days;
    const averageContinuousWatts = (dailyAverageKwh * 1000) / 24;

    return {
      type: 'bill',
      monthlyKwh: Number(monthlyKwh.toFixed(2)),
      monthlyCost: Number(monthlyCost.toFixed(2)),
      effectiveTariff: Number(effectiveTariff.toFixed(2)),
      dailyAverageKwh: Number(dailyAverageKwh.toFixed(2)),
      averageContinuousWatts: Number(averageContinuousWatts.toFixed(0))
    };
  }

  async function loadEquipments() {
    try {
      const data = await window.EcoApi.request('/equipments');

      if (Array.isArray(data)) {
        return data.length ? data : FALLBACK_EQUIPMENTS;
      }

      if (Array.isArray(data.equipments)) {
        return data.equipments.length ? data.equipments : FALLBACK_EQUIPMENTS;
      }

      if (Array.isArray(data.equipamentos)) {
        return data.equipamentos.length ? data.equipamentos : FALLBACK_EQUIPMENTS;
      }

      return FALLBACK_EQUIPMENTS;
    } catch (error) {
      return FALLBACK_EQUIPMENTS;
    }
  }

  function renderEquipments(select, equipments) {
    select.innerHTML = '<option value="">Selecione um equipamento</option>';

    equipments.forEach((equipment) => {
      const option = document.createElement('option');

      option.value = String(equipment.id);
      option.textContent = `${equipment.name} - ${equipment.default_power_watts}W`;
      option.dataset.name = equipment.name;
      option.dataset.power = equipment.default_power_watts;

      select.appendChild(option);
    });

    const customOption = document.createElement('option');
    customOption.value = 'custom';
    customOption.textContent = 'Personalizado';
    customOption.dataset.name = 'Personalizado';
    customOption.dataset.power = '';

    select.appendChild(customOption);
  }

  function setEquipmentResult(result, equipmentName) {
    document.querySelector('[data-result-title]').textContent = 'Impacto do equipamento na conta';
    document.querySelector('[data-result-kwh-label]').textContent = 'Consumo mensal do equipamento';
    document.querySelector('[data-result-cost-label]').textContent = 'Custo mensal do equipamento';
    document.querySelector('[data-result-kwh]').textContent = window.EcoApi.formatKwh(result.monthlyKwh);
    document.querySelector('[data-result-cost]').textContent = window.EcoApi.formatCurrency(result.monthlyCost);
    document.querySelector('[data-result-tip]').textContent = getTip(equipmentName, 'equipment');
    document.querySelector('[data-result-state]').textContent = 'Resultado calculado com base no equipamento selecionado.';
    document.querySelector('[data-result-extra-title]').textContent = 'Participação na conta';

    document.querySelector('[data-result-extra]').textContent =
      result.billSharePercent === null
        ? 'Preencha o consumo total da conta em kWh para ver a participação desse aparelho.'
        : `Esse equipamento representa aproximadamente ${formatPercent(result.billSharePercent)} do consumo total informado.`;
  }

  function setBillResult(result) {
    document.querySelector('[data-result-title]').textContent = 'Consumo geral da conta mensal';
    document.querySelector('[data-result-kwh-label]').textContent = 'Consumo geral do mês';
    document.querySelector('[data-result-cost-label]').textContent = 'Valor total estimado';
    document.querySelector('[data-result-kwh]').textContent = window.EcoApi.formatKwh(result.monthlyKwh);
    document.querySelector('[data-result-cost]').textContent = window.EcoApi.formatCurrency(result.monthlyCost);
    document.querySelector('[data-result-tip]').textContent = getTip('', 'bill');
    document.querySelector('[data-result-state]').textContent = 'Resultado calculado com base na conta de energia.';
    document.querySelector('[data-result-extra-title]').textContent = 'Média diária';

    document.querySelector('[data-result-extra]').textContent =
      `Média de ${window.EcoApi.formatKwh(result.dailyAverageKwh)} por dia. Potência média equivalente: ${result.averageContinuousWatts} W ligados continuamente.`;
  }

  function setupCalculator() {
    const form = document.querySelector('#calculatorForm');

    if (!form) {
      return;
    }

    const equipmentModeBox = document.querySelector('[data-equipment-mode]');
    const billModeBox = document.querySelector('[data-bill-mode]');
    const equipmentModeButton = document.querySelector('[data-mode-button="equipment"]');
    const billModeButton = document.querySelector('[data-mode-button="bill"]');
    const equipmentSelect = form.querySelector('#equipment');
    const powerInput = form.querySelector('#powerWatts');
    const powerHelp = powerInput?.parentElement?.querySelector('.eco-help');
    const saveButton = document.querySelector('#saveSimulationButton');

    let currentMode = 'equipment';
    let lastPayload = null;

    loadEquipments().then((equipments) => {
      renderEquipments(equipmentSelect, equipments);
    });

    function updateButtons() {
      if (currentMode === 'equipment') {
        equipmentModeButton.className = 'mode-button active';
        billModeButton.className = 'mode-button';
        saveButton.classList.remove('hidden');
      } else {
        equipmentModeButton.className = 'mode-button';
        billModeButton.className = 'mode-button active';
        saveButton.classList.add('hidden');
      }
    }

    function setMode(mode) {
      currentMode = mode;

      equipmentModeBox.classList.toggle('hidden', mode !== 'equipment');
      billModeBox.classList.toggle('hidden', mode !== 'bill');

      updateButtons();

      document.querySelector('[data-result-state]').textContent =
        mode === 'equipment'
          ? 'Preencha os dados do equipamento para calcular.'
          : 'Preencha os dados da conta mensal para calcular.';
    }

    function updatePowerBySelection() {
      const selectedOption = equipmentSelect.selectedOptions[0];
      const isCustom = equipmentSelect.value === 'custom';

      powerInput.readOnly = !isCustom;
      powerInput.value = isCustom ? '' : selectedOption?.dataset.power || '';

      if (powerHelp) {
        powerHelp.textContent = isCustom
          ? 'Digite a potência real do equipamento em Watts.'
          : 'Potência estimada preenchida automaticamente pela lista.';
      }
    }

    function runEquipmentCalculation({ silent = false } = {}) {
      const selectedOption = equipmentSelect.selectedOptions[0];
      const equipmentName = selectedOption?.dataset.name || 'Personalizado';

      const result = calculateEquipment({
        powerWatts: powerInput.value,
        hours: form.hours.value,
        minutes: form.minutes.value,
        days: form.days.value,
        tariff: form.tariff.value,
        totalBillKwh: form.totalBillKwh.value
      });

      lastPayload = {
        equipmentId:
          equipmentSelect.value !== 'custom' && equipmentSelect.value
            ? Number(equipmentSelect.value) || null
            : null,
        equipmentName,
        powerWatts: Number(powerInput.value),
        hoursPerDay: result.hoursPerDay,
        daysPerMonth: Number(form.days.value),
        tariff: toNumber(form.tariff.value)
      };

      setEquipmentResult(result, equipmentName);

      if (!silent) {
        window.EcoApi.showToast('Cálculo por equipamento realizado.', 'success');
      }

      return result;
    }

    function runBillCalculation({ silent = false } = {}) {
      const result = calculateBill({
        billCost: form.billCost.value,
        billKwh: form.billKwh.value,
        billTariff: form.billTariff.value,
        billDays: form.billDays.value
      });

      lastPayload = null;
      setBillResult(result);

      if (!silent) {
        window.EcoApi.showToast('Cálculo da conta mensal realizado.', 'success');
      }

      return result;
    }

    function runCalculation(options = {}) {
      return currentMode === 'equipment'
        ? runEquipmentCalculation(options)
        : runBillCalculation(options);
    }

    function tryAutoCalculate() {
      try {
        if (currentMode === 'equipment') {
          if (!equipmentSelect.value || !powerInput.value || !form.days.value || !form.tariff.value) {
            return;
          }
        }

        if (currentMode === 'bill') {
          if (!form.billCost.value && !form.billKwh.value) {
            return;
          }
        }

        runCalculation({ silent: true });
      } catch (error) {
        // Ignora enquanto o usuário ainda está preenchendo o formulário.
      }
    }

    equipmentModeButton.addEventListener('click', () => setMode('equipment'));
    billModeButton.addEventListener('click', () => setMode('bill'));

    equipmentSelect.addEventListener('change', () => {
      updatePowerBySelection();
      tryAutoCalculate();
    });

    form.querySelectorAll('input, select').forEach((field) => {
      field.addEventListener('input', tryAutoCalculate);
      field.addEventListener('change', tryAutoCalculate);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      try {
        runCalculation();
      } catch (error) {
        window.EcoApi.showToast(error.message, 'error');
      }
    });

    if (saveButton) {
      saveButton.addEventListener('click', async () => {
        try {
          if (currentMode !== 'equipment') {
            window.EcoApi.showToast('O salvamento está disponível apenas para cálculo por equipamento.', 'info');
            return;
          }

          if (!lastPayload) {
            runEquipmentCalculation({ silent: true });
          }

          if (!window.EcoApi.isAuthenticated()) {
            window.EcoApi.showToast('Entre na sua conta para salvar o cálculo.', 'info');

            setTimeout(() => {
              window.location.href = 'login.html';
            }, 900);

            return;
          }

          saveButton.disabled = true;
          saveButton.textContent = 'Salvando...';

          await window.EcoApi.request('/simulations', {
            method: 'POST',
            auth: true,
            body: lastPayload
          });

          window.EcoApi.showToast('Cálculo salvo no histórico.', 'success');
        } catch (error) {
          window.EcoApi.showToast(error.message, 'error');
        } finally {
          saveButton.disabled = false;
          saveButton.textContent = 'Salvar simulação';
        }
      });
    }

    setMode('equipment');
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.EcoApi) {
      console.error('EcoApi não foi carregado. Verifique se js/api.js vem antes de js/calculator.js.');
      return;
    }

    setupCalculator();
  });
})();
