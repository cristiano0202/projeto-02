(function () {
  const API_BASE_URL = localStorage.getItem('ecowatt_api_url') || 'http://localhost:3000/api';

  function getToken() {
    return localStorage.getItem('ecowatt_token');
  }

  function setSession({ token, user }) {
    localStorage.setItem('ecowatt_token', token);
    localStorage.setItem('ecowatt_user', JSON.stringify(user));
  }

  function getUser() {
    const rawUser = localStorage.getItem('ecowatt_user');
    if (!rawUser) return null;

    try {
      return JSON.parse(rawUser);
    } catch (error) {
      return null;
    }
  }

  function clearSession() {
    localStorage.removeItem('ecowatt_token');
    localStorage.removeItem('ecowatt_user');
  }

  function isAuthenticated() {
    return Boolean(getToken());
  }

  async function request(path, options = {}) {
    const {
      method = 'GET',
      body = null,
      auth = false,
      headers = {}
    } = options;

    const finalHeaders = {
      'Content-Type': 'application/json',
      ...headers
    };

    if (auth) {
      const token = getToken();
      if (token) {
        finalHeaders.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : null
    });

    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const message = data?.message || 'Erro ao comunicar com a API';
      throw new Error(message);
    }

    return data;
  }

  function formatCurrency(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function formatKwh(value) {
    return `${Number(value || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} kWh`;
  }

  function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3600);
  }

  window.EcoApi = {
    API_BASE_URL,
    request,
    getToken,
    setSession,
    getUser,
    clearSession,
    isAuthenticated,
    formatCurrency,
    formatKwh,
    showToast
  };
})();
