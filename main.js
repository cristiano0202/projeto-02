(function () {
  function getCurrentUser() {
    if (!window.EcoApi || typeof window.EcoApi.getUser !== 'function') {
      return null;
    }

    return window.EcoApi.getUser();
  }

  function createLoggedOutLinks() {
    return `
      <a href="login.html" class="eco-btn-secondary">
        Entrar
      </a>

      <a href="cadastro.html" class="eco-btn-primary">
        Criar conta
      </a>
    `;
  }

  function createLoggedInLinks(user) {
    const firstName = user?.name
      ? String(user.name).trim().split(' ')[0]
      : 'Usuário';

    return `
      <a href="dashboard.html" class="eco-btn-secondary">
        Painel de Energia
      </a>

      <button type="button" data-logout class="eco-btn-primary">
        Sair
      </button>
    `;
  }

  function updateAuthLinks() {
    const user = getCurrentUser();

    const authAreas = document.querySelectorAll(
      '[data-auth-area], [data-mobile-auth-area]'
    );

    if (!authAreas.length) {
      return;
    }

    const html = user
      ? createLoggedInLinks(user)
      : createLoggedOutLinks();

    authAreas.forEach((area) => {
      area.innerHTML = html;
    });
  }

  function logout() {
    if (window.EcoApi && typeof window.EcoApi.clearSession === 'function') {
      window.EcoApi.clearSession();
    }

    if (window.EcoApi && typeof window.EcoApi.showToast === 'function') {
      window.EcoApi.showToast('Você saiu da conta.', 'info');

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);

      return;
    }

    window.location.href = 'index.html';
  }

  document.addEventListener('click', (event) => {
    const logoutButton = event.target.closest('[data-logout]');

    if (!logoutButton) {
      return;
    }

    logout();
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.EcoApi) {
      console.error('EcoApi não foi carregado. Verifique se js/api.js vem antes de js/main.js.');
      return;
    }

    updateAuthLinks();
  });

  window.EcoMain = {
    updateAuthLinks,
    logout
  };
})();