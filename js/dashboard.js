(function () {
  function requireAuth() {
    if (!window.EcoApi) {
      console.error('EcoApi não foi carregado. Verifique se js/api.js vem antes de js/dashboard.js.');
      return false;
    }

    if (!window.EcoApi.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }

    return true;
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return '-';
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function getUserType(user) {
    return (
      user?.userType ||
      user?.user_type ||
      user?.type ||
      'Conta'
    );
  }

  function normalizeText(value, fallback = '-') {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }

    return String(value);
  }

  function getSimulationValue(simulation, snakeKey, camelKey, fallback = 0) {
    const value = simulation?.[snakeKey] ?? simulation?.[camelKey] ?? fallback;
    return value;
  }

  function renderUser(user) {
    const nameEls = document.querySelectorAll('[data-user-name]');
    const typeEls = document.querySelectorAll('[data-user-type]');

    const name = user?.name || 'Usuário';
    const userType = String(getUserType(user)).replaceAll('_', ' ') || 'Conta';

    nameEls.forEach((el) => {
      el.textContent = name;
    });

    typeEls.forEach((el) => {
      el.textContent = userType;
    });
  }

  function renderSummary(simulations) {
    const totalKwh = simulations.reduce((sum, item) => {
      return sum + Number(getSimulationValue(item, 'monthly_kwh', 'monthlyKwh', 0));
    }, 0);

    const totalCost = simulations.reduce((sum, item) => {
      return sum + Number(getSimulationValue(item, 'monthly_cost', 'monthlyCost', 0));
    }, 0);

    const mostExpensive = simulations.reduce((max, item) => {
      const itemCost = Number(getSimulationValue(item, 'monthly_cost', 'monthlyCost', 0));
      const maxCost = max ? Number(getSimulationValue(max, 'monthly_cost', 'monthlyCost', 0)) : -1;

      return itemCost > maxCost ? item : max;
    }, null);

    const kwhEl = document.querySelector('[data-dashboard-total-kwh]');
    const costEl = document.querySelector('[data-dashboard-total-cost]');
    const expensiveEl = document.querySelector('[data-dashboard-most-expensive]');
    const countEl = document.querySelector('[data-dashboard-count]');

    if (kwhEl) {
      kwhEl.textContent = window.EcoApi.formatKwh(totalKwh);
    }

    if (costEl) {
      costEl.textContent = window.EcoApi.formatCurrency(totalCost);
    }

    if (expensiveEl) {
      const equipmentName =
        mostExpensive?.equipment_name ||
        mostExpensive?.equipmentName ||
        'Sem dados';

      expensiveEl.textContent = equipmentName;
    }

    if (countEl) {
      countEl.textContent = simulations.length;
    }
  }

  function createCell(text, className = 'px-4 py-3 text-slate-600') {
    const td = document.createElement('td');
    td.className = className;
    td.textContent = text;
    return td;
  }

  function renderTable(simulations) {
    const tbody = document.querySelector('[data-simulations-table]');
    const empty = document.querySelector('[data-empty-history]');

    if (!tbody) {
      return;
    }

    tbody.innerHTML = '';

    if (!simulations.length) {
      if (empty) {
        empty.classList.remove('hidden');
      }

      return;
    }

    if (empty) {
      empty.classList.add('hidden');
    }

    simulations.forEach((simulation) => {
      const id = simulation.id;
      const equipmentName = normalizeText(
        simulation.equipment_name || simulation.equipmentName,
        'Equipamento'
      );

      const powerWatts = Number(getSimulationValue(simulation, 'power_watts', 'powerWatts', 0));
      const hoursPerDay = Number(getSimulationValue(simulation, 'hours_per_day', 'hoursPerDay', 0));
      const daysPerMonth = Number(getSimulationValue(simulation, 'days_per_month', 'daysPerMonth', 0));
      const monthlyKwh = Number(getSimulationValue(simulation, 'monthly_kwh', 'monthlyKwh', 0));
      const monthlyCost = Number(getSimulationValue(simulation, 'monthly_cost', 'monthlyCost', 0));
      const createdAt = simulation.created_at || simulation.createdAt;

      const row = document.createElement('tr');
      row.className = 'border-b border-slate-100 hover:bg-slate-50';

      row.appendChild(
        createCell(equipmentName, 'px-4 py-3 font-bold text-slate-800')
      );

      row.appendChild(
        createCell(`${powerWatts.toLocaleString('pt-BR')} W`)
      );

      row.appendChild(
        createCell(`${hoursPerDay.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })} h`)
      );

      row.appendChild(
        createCell(String(daysPerMonth))
      );

      row.appendChild(
        createCell(
          window.EcoApi.formatKwh(monthlyKwh),
          'px-4 py-3 font-bold text-blue-700'
        )
      );

      row.appendChild(
        createCell(
          window.EcoApi.formatCurrency(monthlyCost),
          'px-4 py-3 font-extrabold text-green-700'
        )
      );

      row.appendChild(
        createCell(
          formatDate(createdAt),
          'px-4 py-3 text-slate-500'
        )
      );

      const actionCell = document.createElement('td');
      actionCell.className = 'px-4 py-3';

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'font-bold text-red-600 hover:text-red-800';
      deleteButton.textContent = 'Excluir';
      deleteButton.dataset.deleteSimulation = id;

      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);

      tbody.appendChild(row);
    });
  }

  function getSimulationsFromResponse(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.simulations)) {
      return data.simulations;
    }

    if (Array.isArray(data?.simulacoes)) {
      return data.simulacoes;
    }

    return [];
  }

  async function loadDashboard() {
    if (!requireAuth()) {
      return;
    }

    try {
      const localUser = window.EcoApi.getUser();

      if (localUser) {
        renderUser(localUser);
      }

      const me = await window.EcoApi.request('/auth/me', {
        auth: true
      });

      if (me?.user) {
        renderUser(me.user);
      }

      const data = await window.EcoApi.request('/simulations', {
        auth: true
      });

      const simulations = getSimulationsFromResponse(data);

      renderSummary(simulations);
      renderTable(simulations);
    } catch (error) {
      const message = String(error.message || '').toLowerCase();

      if (
        message.includes('token') ||
        message.includes('não autorizado') ||
        message.includes('unauthorized') ||
        message.includes('jwt')
      ) {
        window.EcoApi.clearSession();
        window.EcoApi.showToast('Sessão expirada. Faça login novamente.', 'info');

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 800);

        return;
      }

      window.EcoApi.showToast(error.message, 'error');
    }
  }

  async function deleteSimulation(id, button) {
    const confirmed = window.confirm('Deseja excluir este cálculo do histórico?');

    if (!confirmed) {
      return;
    }

    try {
      button.disabled = true;
      button.textContent = 'Excluindo...';
      button.classList.add('opacity-60', 'cursor-not-allowed');

      await window.EcoApi.request(`/simulations/${id}`, {
        method: 'DELETE',
        auth: true
      });

      window.EcoApi.showToast('Cálculo excluído do histórico.', 'success');

      await loadDashboard();
    } catch (error) {
      window.EcoApi.showToast(error.message, 'error');
    } finally {
      button.disabled = false;
      button.textContent = 'Excluir';
      button.classList.remove('opacity-60', 'cursor-not-allowed');
    }
  }

  document.addEventListener('click', async (event) => {
    const deleteButton = event.target.closest('[data-delete-simulation]');

    if (!deleteButton) {
      return;
    }

    const id = deleteButton.dataset.deleteSimulation;

    if (!id) {
      window.EcoApi.showToast('ID do cálculo não encontrado.', 'error');
      return;
    }

    await deleteSimulation(id, deleteButton);
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.EcoApi) {
      console.error('EcoApi não foi carregado. Verifique se js/api.js vem antes de js/dashboard.js.');
      return;
    }

    loadDashboard();
  });
})();
