(function () {
  function formatCurrency(value) {
    return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function formatKwh(value) {
    return Number(value || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + " kWh";
  }

  function showToast(message) {
    var oldToast = document.querySelector(".toast");
    if (oldToast) oldToast.remove();

    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3200);
  }

  function getStored(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (error) {
      return fallback;
    }
  }

  function setStored(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function updateHeaderUser() {
    var user = getStored("ecowatt_current_user", null);
    document.querySelectorAll("[data-user-name]").forEach(function (element) {
      element.textContent = user ? user.name : "Visitante";
    });
    document.querySelectorAll("[data-auth-only]").forEach(function (element) {
      element.classList.toggle("is-hidden", !user);
    });
    document.querySelectorAll("[data-guest-only]").forEach(function (element) {
      element.classList.toggle("is-hidden", Boolean(user));
    });
  }

  function createMobileMenu() {
    var headerRow = document.querySelector("header > div");
    var desktopNav = document.querySelector(".desktop-nav");
    if (!headerRow || !desktopNav || document.querySelector("[data-mobile-menu]")) return;

    var menu = document.createElement("div");
    menu.className = "mobile-menu";
    menu.setAttribute("data-mobile-menu", "");

    var button = document.createElement("button");
    button.type = "button";
    button.className = "menu-toggle";
    button.setAttribute("aria-label", "Abrir menu");
    button.textContent = "...";

    var panel = document.createElement("div");
    panel.className = "mobile-menu-panel is-hidden";

    Array.prototype.forEach.call(desktopNav.querySelectorAll("a"), function (link) {
      var clone = link.cloneNode(true);
      clone.className = "mobile-menu-link";
      panel.appendChild(clone);
    });

    var dashboardLink = panel.querySelector('a[href="dashboard.html"]');
    if (!dashboardLink) {
      dashboardLink = document.createElement("a");
      dashboardLink.href = "dashboard.html";
      dashboardLink.textContent = "Painel";
      dashboardLink.className = "mobile-menu-link";
      dashboardLink.setAttribute("data-auth-only", "");
      panel.appendChild(dashboardLink);
    }

    menu.appendChild(button);
    menu.appendChild(panel);
    headerRow.insertBefore(menu, headerRow.lastElementChild);

    button.addEventListener("click", function () {
      panel.classList.toggle("is-hidden");
    });

    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target)) panel.classList.add("is-hidden");
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    createMobileMenu();
    updateHeaderUser();
  });

  window.EcoWatt = {
    formatCurrency: formatCurrency,
    formatKwh: formatKwh,
    showToast: showToast,
    getStored: getStored,
    setStored: setStored,
    updateHeaderUser: updateHeaderUser
  };
})();
