(function () {
  const DEFAULT_API_URL = 'http://localhost:3000/api';

  const API_BASE_URL =
    localStorage.getItem('ecowatt_api_url') ||
    DEFAULT_API_URL;

  function getToken() {
    return localStorage.getItem('ecowatt_token');
  }

  function setSession({ token, user }) {
    if (token) {
      localStorage.setItem('ecowatt_token', token);
    }

    if (user) {
      localStorage.setItem('ecowatt_user', JSON.stringify(user));
    }
  }

  function getUser() {
    const rawUser = localStorage.getItem('ecowatt_user');

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch (error) {
      localStorage.removeItem('ecowatt_user');
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

  function setApiUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new Error('URL da API inválida.');
    }

    const cleanUrl = url.replace(/\/$/, '');
    localStorage.setItem('ecowatt_api_url', cleanUrl);

    return cleanUrl;
  }

  function resetApiUrl() {
    localStorage.removeItem('ecowatt_api_url');
  }

  function getApiUrl() {
    return localStorage.getItem('ecowatt_api_url') || DEFAULT_API_URL;
  }

  async function request(path, options = {}) {
    const {
      method = 'GET',
      body = null,
      auth = false,
      headers = {},
      timeout = 12000
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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let response;

    try {
      response = await fetch(`${getApiUrl()}${path}`, {
        method,
        headers: finalHeaders,
        body: body ? JSON.stringify(body) : null,
        signal: controller.signal
      });
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Tempo limite excedido ao tentar comunicar com a API.');
      }

      throw new Error(
        'Não foi possível conectar com a API. Verifique se o servidor está ligado.'
      );
    }

    clearTimeout(timeoutId);

    let data = null;

    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      if (response.status === 401) {
        clearSession();
      }

      const message =
        data?.message ||
        data?.error ||
        `Erro ${response.status} ao comunicar com a API.`;

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

    if (existing) {
      existing.remove();
    }

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
    DEFAULT_API_URL,
    request,
    getToken,
    setSession,
    getUser,
    clearSession,
    isAuthenticated,
    setApiUrl,
    resetApiUrl,
    getApiUrl,
    formatCurrency,
    formatKwh,
    showToast
  };
})();