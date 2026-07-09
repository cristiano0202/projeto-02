(function () {
  function getLocalCalculations() {
    return window.EcoWatt.getStored("ecowatt_calculations", []);
  }

  function saveLocalCalculations(list) {
    window.EcoWatt.setStored("ecowatt_calculations", list);
  }

  function accountTypeLabel(value) {
    return {
      residential: "Residencial",
      residencial: "Residencial",
      commercial: "Comercial",
      comercial: "Comercial",
      pequeno_empreendedor: "Pequeno empreendedor",
      empreendedor: "Pequeno empreendedor"
    }[value] || "Nao informado";
  }

  function normalizeSimulation(item) {
    return {
      id: String(item.id),
      createdAt: item.created_at || item.createdAt,
      equipment: item.equipment_name || item.equipment || "Conta mensal geral",
      type: item.equipment_id ? "equipamento" : item.type || "equipamento",
      kwh: Number(item.monthly_kwh || item.kwh || 0),
      cost: Number(item.monthly_cost || item.cost || 0)
    };
  }

  async function loadCalculations() {
    if (window.EcoWattAPI && window.EcoWattAPI.getToken()) {
      var apiItems = await window.EcoWattAPI.getSimulations();
      return apiItems.map(normalizeSimulation);
    }

    return getLocalCalculations().map(normalizeSimulation);
  }

  function renderRows(calculations) {
    if (!calculations.length) {
      return '<tr><td colspan="6">Nenhum calculo salvo ainda.</td></tr>';
    }

    return calculations.map(function (item) {
      var date = item.createdAt ? new Date(item.createdAt).toLocaleDateString("pt-BR") : "-";
      return '<tr><td>' + date + '</td><td>' + item.equipment + '</td><td>' + item.type + '</td><td>' + window.EcoWatt.formatKwh(item.kwh) + '</td><td>' + window.EcoWatt.formatCurrency(item.cost) + '</td><td><button class="delete" data-delete-calc="' + item.id + '">Excluir</button></td></tr>';
    }).join("");
  }

  async function renderDashboard() {
    var page = document.querySelector("[data-dashboard]");
    if (!page) return;

    var user = window.EcoWattAuth.getCurrentUser();
    var tbody = document.querySelector("[data-history-body]");

    try {
      var calculations = await loadCalculations();
      var totalKwh = calculations.reduce(function (sum, item) { return sum + Number(item.kwh || 0); }, 0);
      var totalCost = calculations.reduce(function (sum, item) { return sum + Number(item.cost || 0); }, 0);
      var expensive = calculations.slice().sort(function (a, b) { return Number(b.cost || 0) - Number(a.cost || 0); })[0];

      document.querySelector("[data-dash-name]").textContent = user ? user.name : "Visitante";
      document.querySelector("[data-dash-type]").textContent = user ? accountTypeLabel(user.accountType) : "Sem login";
      document.querySelector("[data-dash-kwh]").textContent = window.EcoWatt.formatKwh(totalKwh);
      document.querySelector("[data-dash-cost]").textContent = window.EcoWatt.formatCurrency(totalCost);
      document.querySelector("[data-dash-expensive]").textContent = expensive ? expensive.equipment : "Nenhum calculo";
      document.querySelector("[data-dash-count]").textContent = calculations.length;
      tbody.innerHTML = renderRows(calculations);

      document.querySelectorAll("[data-delete-calc]").forEach(function (button) {
        button.addEventListener("click", async function () {
          try {
            if (window.EcoWattAPI && window.EcoWattAPI.getToken()) {
              await window.EcoWattAPI.deleteSimulation(button.dataset.deleteCalc);
            } else {
              saveLocalCalculations(getLocalCalculations().filter(function (item) { return String(item.id) !== button.dataset.deleteCalc; }));
            }
            window.EcoWatt.showToast("Calculo excluido.");
            renderDashboard();
          } catch (error) {
            window.EcoWatt.showToast(error.message || "Nao foi possivel excluir.");
          }
        });
      });
    } catch (error) {
      tbody.innerHTML = '<tr><td colspan="6">Nao foi possivel carregar o painel.</td></tr>';
      window.EcoWatt.showToast(error.message || "Erro ao carregar painel.");
    }
  }

  document.addEventListener("DOMContentLoaded", renderDashboard);
})();
