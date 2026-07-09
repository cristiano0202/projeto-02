(function () {
  var CURRENT_USER_KEY = "ecowatt_current_user";

  function showMessage(message) {
    if (window.EcoWatt && window.EcoWatt.showToast) {
      window.EcoWatt.showToast(message);
      return;
    }

    alert(message);
  }

  function getStored(key, fallback) {
    if (window.EcoWatt && window.EcoWatt.getStored) {
      return window.EcoWatt.getStored(key, fallback);
    }

    try {
      var value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function setStored(key, value) {
    if (window.EcoWatt && window.EcoWatt.setStored) {
      window.EcoWatt.setStored(key, value);
      return;
    }

    localStorage.setItem(key, JSON.stringify(value));
  }

  function getCurrentUser() {
    return getStored(CURRENT_USER_KEY, null);
  }

  function normalizeUser(user) {
    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      accountType: user.userType || user.user_type || user.accountType,
      createdAt: user.createdAt || user.created_at
    };
  }

  function setCurrentUser(user) {
    setStored(CURRENT_USER_KEY, normalizeUser(user));

    if (window.EcoWatt && window.EcoWatt.updateHeaderUser) {
      window.EcoWatt.updateHeaderUser();
    }
  }

  function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);

    if (window.EcoWattAPI && window.EcoWattAPI.clearToken) {
      window.EcoWattAPI.clearToken();
    }

    window.location.href = "login.html";
  }

  function toApiUserType(value) {
    var map = {
      residential: "residential",
      residencial: "residential",
      commercial: "commercial",
      comercial: "commercial",
      empreendedor: "pequeno_empreendedor",
      pequeno_empreendedor: "pequeno_empreendedor"
    };

    return map[value] || value || "residential";
  }

  function wireLogin() {
    var form = document.querySelector("[data-login-form]");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      try {
        var result = await window.EcoWattAPI.login(
          form.email.value.trim().toLowerCase(),
          form.password.value
        );

        setCurrentUser(result.user);
        window.location.href = "index.html";
      } catch (error) {
        showMessage(error.message || "Nao foi possivel fazer login.");
      }
    });
  }

  function wireSignup() {
    var form = document.querySelector("[data-signup-form]");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      var password = form.password.value;
      var confirmPassword = form.confirmPassword.value;

      if (password.length < 8) {
        showMessage("A senha precisa ter no minimo 8 caracteres.");
        return;
      }

      if (password !== confirmPassword) {
        showMessage("As senhas nao conferem.");
        return;
      }

      try {
        var result = await window.EcoWattAPI.register({
          name: form.name.value.trim(),
          email: form.email.value.trim().toLowerCase(),
          password: password,
          userType: toApiUserType(form.accountType.value)
        });

        setCurrentUser(result.user);
        window.location.href = "index.html";
      } catch (error) {
        showMessage(error.message || "Nao foi possivel criar a conta.");
      }
    });
  }

  function wireLogout() {
    document.querySelectorAll("[data-logout]").forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        logout();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireLogin();
    wireSignup();
    wireLogout();
  });

  window.EcoWattAuth = {
    getCurrentUser: getCurrentUser,
    setCurrentUser: setCurrentUser,
    logout: logout
  };
})();
