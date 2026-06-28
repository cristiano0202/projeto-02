(function () {
  function getCalculations() { return window.EcoWatt.getStored("ecowatt_calculations", []); }
  function saveCalculations(list) { window.EcoWatt.setStored("ecowatt_calculations", list); }
  function accountTypeLabel(value) {
    return { residencial: "Residencial", comercial: "Comercial", empreendedor: "Pequeno empreendedor" }[value] || "Nao informado";
  }
  function renderDashboard() {
    var page = document.querySelector("[data-dashboard]");
    if (!page) return;
    var user = window.EcoWattAuth.getCurrentUser();
    var calculations = getCalculations();
    var totalKwh = calculations.reduce(function (sum, item) { return sum + Number(item.kwh || 0); }, 0);
    var totalCost = calculations.reduce(function (sum, item) { return sum + Number(item.cost || 0); }, 0);
    var expensive = calculations.slice().sort(function (a, b) { return Number(b.cost || 0) - Number(a.cost || 0); })[0];
    document.querySelector("[data-dash-name]").textContent = user ? user.name : "Visitante";
    document.querySelector("[data-dash-type]").textContent = user ? accountTypeLabel(user.accountType) : "Sem login";
    document.querySelector("[data-dash-kwh]").textContent = window.EcoWatt.formatKwh(totalKwh);
    document.querySelector("[data-dash-cost]").textContent = window.EcoWatt.formatCurrency(totalCost);
    document.querySelector("[data-dash-expensive]").textContent = expensive ? expensive.equipment : "Nenhum calculo";
    document.querySelector("[data-dash-count]").textContent = calculations.length;
    var tbody = document.querySelector("[data-history-body]");
    tbody.innerHTML = calculations.length ? calculations.map(function (item) {
      var date = new Date(item.createdAt).toLocaleDateString("pt-BR");
      return '<tr><td>' + date + '</td><td>' + item.equipment + '</td><td>' + item.type + '</td><td>' + window.EcoWatt.formatKwh(item.kwh) + '</td><td>' + window.EcoWatt.formatCurrency(item.cost) + '</td><td><button class="btn btn-danger !min-h-0 !px-3 !py-2" data-delete-calc="' + item.id + '">Excluir</button></td></tr>';
    }).join("") : '<tr><td colspan="6">Nenhum calculo salvo ainda.</td></tr>';
    document.querySelectorAll("[data-delete-calc]").forEach(function (button) {
      button.addEventListener("click", function () {
        saveCalculations(getCalculations().filter(function (item) { return item.id !== button.dataset.deleteCalc; }));
        renderDashboard();
        window.EcoWatt.showToast("Calculo excluido.");
      });
    });
  }
  document.addEventListener("DOMContentLoaded", renderDashboard);
})();
