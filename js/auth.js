(function () {
  var USERS_KEY = "ecowatt_users";
  var CURRENT_USER_KEY = "ecowatt_current_user";
  function getUsers() { return window.EcoWatt.getStored(USERS_KEY, []); }
  function saveUsers(users) { window.EcoWatt.setStored(USERS_KEY, users); }
  function getCurrentUser() { return window.EcoWatt.getStored(CURRENT_USER_KEY, null); }
  function setCurrentUser(user) { window.EcoWatt.setStored(CURRENT_USER_KEY, user); window.EcoWatt.updateHeaderUser(); }
  function logout() { localStorage.removeItem(CURRENT_USER_KEY); window.location.href = "index.html"; }
  function wireLogin() {
    var form = document.querySelector("[data-login-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = form.email.value.trim().toLowerCase();
      var password = form.password.value;
      var user = getUsers().find(function (item) { return item.email === email && item.password === password; });
      if (!user) { window.EcoWatt.showToast("E-mail ou senha invalidos."); return; }
      setCurrentUser(user);
      window.location.href = "dashboard.html";
    });
  }
  function wireSignup() {
    var form = document.querySelector("[data-signup-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = form.name.value.trim();
      var email = form.email.value.trim().toLowerCase();
      var accountType = form.accountType.value;
      var password = form.password.value;
      var confirmPassword = form.confirmPassword.value;
      if (password.length < 6) { window.EcoWatt.showToast("Use uma senha com pelo menos 6 caracteres."); return; }
      if (password !== confirmPassword) { window.EcoWatt.showToast("As senhas nao conferem."); return; }
      var users = getUsers();
      if (users.some(function (user) { return user.email === email; })) { window.EcoWatt.showToast("Este e-mail ja possui cadastro."); return; }
      var newUser = { id: (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())), name: name, email: email, accountType: accountType, password: password, createdAt: new Date().toISOString() };
      users.push(newUser);
      saveUsers(users);
      setCurrentUser(newUser);
      window.location.href = "dashboard.html";
    });
  }
  function wireLogout() { document.querySelectorAll("[data-logout]").forEach(function (button) { button.addEventListener("click", logout); }); }
  document.addEventListener("DOMContentLoaded", function () { wireLogin(); wireSignup(); wireLogout(); });
  window.EcoWattAuth = { getCurrentUser: getCurrentUser, setCurrentUser: setCurrentUser, logout: logout };
})();
