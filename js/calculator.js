(function () {
  var FALLBACK_EQUIPMENTS = [
    { name: "Chuveiro Eletrico", watts: 5500, tip: "Banhos de 8 a 10 minutos costumam reduzir bastante o impacto do chuveiro na conta." },
    { name: "Ar-Condicionado", watts: 1500, tip: "Use entre 23 e 24 graus, mantenha filtros limpos e feche portas e janelas." },
    { name: "Geladeira Duplex", watts: 250, tip: "Evite abrir a porta muitas vezes e confira a borracha de vedacao." },
    { name: "Micro-ondas", watts: 1200, tip: "Use para aquecimentos curtos e evite deixar o aparelho em standby por longos periodos." },
    { name: "Maquina de Lavar", watts: 500, tip: "Acumule roupas para usar a capacidade ideal e prefira ciclos economicos." },
    { name: "Televisor LED", watts: 100, tip: "Ative economia de energia e desligue da tomada quando ficar muito tempo sem uso." },
    { name: "Cooktop/Fogao Eletrico", watts: 6000, tip: "Use panelas adequadas ao tamanho da boca e tampe recipientes para aquecer mais rapido." },
    { name: "Personalizado", watts: 0, tip: "Compare tempo de uso e potencia para encontrar o melhor ponto de economia." }
  ];
  function number(value) { return Number(String(value || "0").replace(",", ".")) || 0; }
  function getCalculations() { return window.EcoWatt.getStored("ecowatt_calculations", []); }
  function saveCalculation(record) { var list = getCalculations(); list.unshift(record); window.EcoWatt.setStored("ecowatt_calculations", list); }
  async function loadEquipments() {
    try {
      var apiItems = await window.EcoWattAPI.getEquipments();
      if (Array.isArray(apiItems) && apiItems.length) return apiItems.map(function (item) { return { name: item.name || item.nome, watts: Number(item.watts || item.potencia || 0), tip: item.tip || item.dica || "Reduza o tempo de uso e acompanhe a tarifa da sua regiao." }; });
    } catch (error) {}
    return FALLBACK_EQUIPMENTS;
  }
  function tipFor(name, monthlyKwh) {
    var found = FALLBACK_EQUIPMENTS.find(function (item) { return item.name === name; });
    if (found) return found.tip;
    if (monthlyKwh > 350) return "Seu consumo mensal esta alto. Priorize climatizacao, banho eletrico e equipamentos de maior potencia.";
    if (monthlyKwh > 180) return "Ha bom potencial de economia revisando horarios de pico e aparelhos em standby.";
    return "Seu consumo parece controlado. Continue monitorando habitos e tarifa mensal.";
  }
  function renderResult(data) {
    var result = document.querySelector("[data-result]");
    if (!result) return;
    result.classList.remove("is-hidden");
    result.querySelector("[data-result-kwh]").textContent = window.EcoWatt.formatKwh(data.kwh);
    result.querySelector("[data-result-cost]").textContent = window.EcoWatt.formatCurrency(data.cost);
    result.querySelector("[data-result-compare]").textContent = data.compare;
    result.querySelector("[data-result-tip]").textContent = data.tip;
  }
  function wireModeTabs() {
    var buttons = document.querySelectorAll("[data-calc-mode]");
    var panels = document.querySelectorAll("[data-calc-panel]");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        var mode = button.dataset.calcMode;
        buttons.forEach(function (item) { item.classList.toggle("is-active", item === button); });
        panels.forEach(function (panel) { panel.classList.toggle("is-hidden", panel.dataset.calcPanel !== mode); });
      });
    });
  }
  async function wireEquipmentForm() {
    var form = document.querySelector("[data-equipment-form]");
    var select = document.querySelector("[data-equipment-select]");
    if (!form || !select) return;
    var equipments = await loadEquipments();
    select.innerHTML = equipments.map(function (item) { return '<option value="' + item.name + '" data-watts="' + item.watts + '">' + item.name + ' - ' + item.watts + 'W</option>'; }).join("");
    function fillWatts() { form.watts.value = select.selectedOptions[0].dataset.watts || 0; }
    select.addEventListener("change", fillWatts);
    fillWatts();
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var equipment = select.value;
      var watts = number(form.watts.value);
      var hours = number(form.hours.value) + number(form.minutes.value) / 60;
      var days = number(form.days.value);
      var tariff = number(form.tariff.value);
      var billKwh = number(form.billKwh.value);
      var kwh = (watts * hours * days) / 1000;
      var cost = kwh * tariff;
      var participation = billKwh > 0 ? (kwh / billKwh) * 100 : 0;
      var compare = billKwh > 0 ? equipment + " representa cerca de " + participation.toFixed(1).replace(".", ",") + "% do consumo informado na conta." : "Informe o consumo total da conta para ver a participacao deste equipamento.";
      var record = { id: String(Date.now()), type: "equipamento", equipment: equipment, kwh: kwh, cost: cost, tariff: tariff, createdAt: new Date().toISOString(), tip: tipFor(equipment, kwh) };
      saveCalculation(record);
      renderResult({ kwh: kwh, cost: cost, compare: compare, tip: record.tip });
      window.EcoWatt.showToast("Calculo salvo no painel.");
    });
  }
  function wireMonthlyForm() {
    var form = document.querySelector("[data-monthly-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var totalValue = number(form.totalValue.value);
      var informedKwh = number(form.informedKwh.value);
      var tariff = number(form.tariff.value);
      var days = number(form.periodDays.value) || 30;
      var kwh = informedKwh > 0 ? informedKwh : totalValue / tariff;
      var cost = totalValue > 0 ? totalValue : kwh * tariff;
      var daily = kwh / days;
      var averageWatts = (daily / 24) * 1000;
      var compare = "Media diaria: " + window.EcoWatt.formatKwh(daily) + ". Potencia media equivalente: " + averageWatts.toFixed(0) + " W.";
      var tip = tipFor("Conta mensal", kwh);
      saveCalculation({ id: String(Date.now()), type: "conta mensal", equipment: "Conta mensal geral", kwh: kwh, cost: cost, tariff: tariff, createdAt: new Date().toISOString(), tip: tip });
      renderResult({ kwh: kwh, cost: cost, compare: compare, tip: tip });
      window.EcoWatt.showToast("Conta mensal salva no painel.");
    });
  }
  document.addEventListener("DOMContentLoaded", function () { wireModeTabs(); wireEquipmentForm(); wireMonthlyForm(); });
  window.EcoWattCalculator = { FALLBACK_EQUIPMENTS: FALLBACK_EQUIPMENTS, getCalculations: getCalculations };
})();
