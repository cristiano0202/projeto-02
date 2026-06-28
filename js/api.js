(function () {
  var DEFAULT_API_URL = "http://localhost:3000/api";
  var STORAGE_KEY = "ecowatt_api_url";
  function getBaseUrl() { return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_URL; }
  function setBaseUrl(url) {
    if (!url) { localStorage.removeItem(STORAGE_KEY); return DEFAULT_API_URL; }
    var cleanUrl = String(url).trim().replace(//$/, "");
    localStorage.setItem(STORAGE_KEY, cleanUrl);
    return cleanUrl;
  }
  async function request(path, options) {
    var url = getBaseUrl() + (path.charAt(0) === "/" ? path : "/" + path);
    var response = await fetch(url, Object.assign({ headers: { "Content-Type": "application/json" } }, options || {}));
    if (!response.ok) throw new Error("Nao foi possivel conectar a API.");
    return response.json();
  }
  async function getEquipments() { return request("/equipamentos"); }
  window.EcoWattAPI = { DEFAULT_API_URL: DEFAULT_API_URL, getBaseUrl: getBaseUrl, setBaseUrl: setBaseUrl, request: request, getEquipments: getEquipments };
})();
