(function () {
  function requireAuth() {
    if (!window.EcoApi.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }

    return true;
  }

  function formatDate(dateValue) {
    return new Date(dateValue).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderUser(user) {
    const nameEls = document.querySelectorAll('[data-user-name]');
    const typeEls = document.querySelectorAll('[data-user-type]');

    nameEls.forEach((el) => {
      el.textContent = user?.name || 'Usuário';
    });

    typeEls.forEach((el) => {
      el.textContent = String(user?.userType || '').replace('_', ' ') || 'Conta';
    });
  }

  function renderSummary(simulations) {
    const totalKwh = simulations.reduce((sum, item) => sum + Number(item.monthly_kwh || 0), 0);
    const totalCost = simulations.reduce((sum, item) => sum + Number(item.monthly_cost || 0), 0);
    const mostExpensive = simulations.reduce((max, item) => {
      if (!max || Number(item.monthly_cost) > Number(max.monthly_cost)) return item;
      return max;
    }, null);

    const kwhEl = document.querySelector('[data-dashboard-total-kwh]');
    const costEl = document.querySelector('[data-dashboard-total-cost]');
    const expensiveEl = document.querySelector('[data-dashboard-most-expensive]');
    const countEl = document.querySelector('[data-dashboard-count]');

    if (kwhEl) kwhEl.textContent = window.EcoApi.formatKwh(totalKwh);
    if (costEl) costEl.textContent = window.EcoApi.formatCurrency(totalCost);
    if (expensiveEl) expensiveEl.textContent = mostExpensive ? mostExpensive.equipment_name : 'Sem dados';
    if (countEl) countEl.textContent = simulations.length;
  }

  function renderTable(simulations) {
    const tbody = document.querySelector('[data-simulations-table]');
    const empty = document.querySelector('[data-empty-history]');

    if (!tbody) return;

    tbody.innerHTML = '';

    if (!simulations.length) {
      if (empty) empty.classList.remove('hidden');
      return;
    }

    if (empty) empty.classList.add('hidden');

    simulations.forEach((simulation) => {
      const row = document.createElement('tr');
      row.className = 'border-b border-slate-100 hover:bg-slate-50';
      row.innerHTML = `
        <td class="px-4 py-3 font-bold text-slate-800">${simulation.equipment_name}</td>
        <td class="px-4 py-3 text-slate-600">${simulation.power_watts} W</td>
        <td class="px-4 py-3 text-slate-600">${Number(simulation.hours_per_day).toLocaleString('pt-BR')} h</td>
        <td class="px-4 py-3 text-slate-600">${simulation.days_per_month}</td>
        <td class="px-4 py-3 font-bold text-blue-700">${window.EcoApi.formatKwh(simulation.monthly_kwh)}</td>
        <td class="px-4 py-3 font-extrabold text-green-700">${window.EcoApi.formatCurrency(simulation.monthly_cost)}</td>
        <td class="px-4 py-3 text-slate-500">${formatDate(simulation.created_at)}</td>
        <td class="px-4 py-3">
          <button type="button" class="text-red-600 font-bold hover:text-red-800" data-delete-simulation="${simulation.id}">Excluir</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  }

  async function loadDashboard() {
    if (!requireAuth()) return;

    try {
      const localUser = window.EcoApi.getUser();
      renderUser(localUser);

      const me = await window.EcoApi.request('/auth/me', { auth: true });
      renderUser(me.user);

      const data = await window.EcoApi.request('/simulations', { auth: true });
      const simulations = data.simulations || [];

      renderSummary(simulations);
      renderTable(simulations);
    } catch (error) {
      if (error.message.toLowerCase().includes('token')) {
        window.EcoApi.clearSession();
        window.location.href = 'login.html';
        return;
      }
      window.EcoApi.showToast(error.message, 'error');
    }
  }

  document.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('[data-delete-simulation]');
    if (!deleteButton) return;

    const id = deleteButton.dataset.deleteSimulation;

    try {
      deleteButton.disabled = true;
      deleteButton.textContent = 'Excluindo...';

      await window.EcoApi.request(`/simulations/${id}`, {
        method: 'DELETE',
        auth: true
      });

      window.EcoApi.showToast('Simulação excluída.', 'success');
      loadDashboard();
    } catch (error) {
      window.EcoApi.showToast(error.message, 'error');
    }
  });

  document.addEventListener('DOMContentLoaded', loadDashboard);
})();
