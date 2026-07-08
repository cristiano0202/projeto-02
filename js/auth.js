(function () {
  var CURRENT_USER_KEY = "ecowatt_current_user";

  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch (error) {
      return null;
    }
  }

  function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    if (window.EcoWatt && window.EcoWatt.updateHeaderUser) {
      window.EcoWatt.updateHeaderUser();
    }
  }

  function logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.EcoWattAPI.clearToken();
    window.location.href = "index.html";
  }

  function toApiUserType(value) {
    if (value === "empreendedor") {
      return "pequeno_empreendedor";
    }

    return value;
  }

  function wireLogin() {
    var form = document.querySelector("[data-login-form]");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      var email = form.email.value.trim().toLowerCase();
      var password = form.password.value;

      try {
        var result = await window.EcoWattAPI.login(email, password);

        setCurrentUser({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          accountType: result.user.userType
        });

        window.location.href = "dashboard.html";
      } catch (error) {
        alert(error.message || "Nao foi possivel fazer login.");
      }
    });
  }

  function wireSignup() {
    var form = document.querySelector("[data-signup-form]");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      var name = form.name.value.trim();
      var email = form.email.value.trim().toLowerCase();
      var userType = toApiUserType(form.accountType.value);
      var password = form.password.value;
      var confirmPassword = form.confirmPassword.value;

      if (password.length < 8) {
        alert("A senha precisa ter no minimo 8 caracteres.");
        return;
      }

      if (password !== confirmPassword) {
        alert("As senhas nao conferem.");
        return;
      }

      try {
        var result = await window.EcoWattAPI.register({
          name: name,
          email: email,
          password: password,
          userType: userType
        });

        setCurrentUser({
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          accountType: result.user.userType
        });

        window.location.href = "dashboard.html";
      } catch (error) {
        alert(error.message || "Nao foi possivel criar a conta.");
      }
    });
  }

  function wireLogout() {
    document.querySelectorAll("[data-logout]").forEach(function (button) {
      button.addEventListener("click", logout);
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
