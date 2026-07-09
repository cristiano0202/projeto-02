(function () {
  var DEFAULT_API_URL = "https://projeto-02-production.up.railway.app/api";
  var API_URL_KEY = "ecowatt_api_url";
  var TOKEN_KEY = "ecowatt_auth_token";

  function getBaseUrl() {
    return localStorage.getItem(API_URL_KEY) || DEFAULT_API_URL;
  }

  function setBaseUrl(url) {
    if (!url) {
      localStorage.removeItem(API_URL_KEY);
      return DEFAULT_API_URL;
    }

    var cleanUrl = String(url).trim().replace(/\/$/, "");
    localStorage.setItem(API_URL_KEY, cleanUrl);
    return cleanUrl;
  }

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function setToken(token) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }

  function clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  }

  async function request(path, options) {
    var token = getToken();
    var url = getBaseUrl() + (path.startsWith("/") ? path : "/" + path);
    var headers = { "Content-Type": "application/json" };

    if (token) {
      headers.Authorization = "Bearer " + token;
    }

    var response = await fetch(url, Object.assign({ headers: headers }, options || {}));
    var data = await response.json().catch(function () { return null; });

    if (!response.ok) {
      throw new Error(data && data.message ? data.message : "Erro ao conectar com a API.");
    }

    return data;
  }

  async function login(email, password) {
    var data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email, password: password })
    });
    setToken(data.token);
    return data;
  }

  async function register(user) {
    var data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify(user)
    });
    setToken(data.token);
    return data;
  }

  async function getEquipments() {
    var data = await request("/equipments");
    return data.equipments || [];
  }

  async function getSimulations() {
    var data = await request("/simulations");
    return data.simulations || [];
  }

  async function createSimulation(payload) {
    return request("/simulations", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }

  async function deleteSimulation(id) {
    return request("/simulations/" + id, { method: "DELETE" });
  }

  window.EcoWattAPI = {
    DEFAULT_API_URL: DEFAULT_API_URL,
    getBaseUrl: getBaseUrl,
    setBaseUrl: setBaseUrl,
    getToken: getToken,
    setToken: setToken,
    clearToken: clearToken,
    request: request,
    login: login,
    register: register,
    getEquipments: getEquipments,
    getSimulations: getSimulations,
    createSimulation: createSimulation,
    deleteSimulation: deleteSimulation
  };
})();
