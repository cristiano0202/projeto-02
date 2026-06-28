(function () {
  function formatCurrency(value) { return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  function formatKwh(value) { return Number(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " kWh"; }
  function showToast(message) {
    var oldToast = document.querySelector(".toast");
    if (oldToast) oldToast.remove();
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3200);
  }
  function getStored(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (error) { return fallback; } }
  function setStored(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function updateHeaderUser() {
    var user = getStored("ecowatt_current_user", null);
    document.querySelectorAll("[data-user-name]").forEach(function (element) { element.textContent = user ? user.name : "Visitante"; });
    document.querySelectorAll("[data-auth-only]").forEach(function (element) { element.classList.toggle("is-hidden", !user); });
    document.querySelectorAll("[data-guest-only]").forEach(function (element) { element.classList.toggle("is-hidden", Boolean(user)); });
  }
  document.addEventListener("DOMContentLoaded", updateHeaderUser);
  window.EcoWatt = { formatCurrency: formatCurrency, formatKwh: formatKwh, showToast: showToast, getStored: getStored, setStored: setStored, updateHeaderUser: updateHeaderUser };
})();
