(function () {
  function updateAuthLinks() {
    const user = window.EcoApi?.getUser?.();
    const authArea = document.querySelector('[data-auth-area]');
    const mobileAuthArea = document.querySelector('[data-mobile-auth-area]');

    const html = user
      ? `
        <a href="dashboard.html" class="eco-btn-secondary">Painel</a>
        <button type="button" data-logout class="eco-btn-primary">Sair</button>
      `
      : `
        <a href="login.html" class="eco-btn-secondary">Entrar</a>
        <a href="cadastro.html" class="eco-btn-primary">Criar conta</a>
      `;

    if (authArea) authArea.innerHTML = html;
    if (mobileAuthArea) mobileAuthArea.innerHTML = html;
  }

  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-logout]');
    if (!target) return;

    window.EcoApi.clearSession();
    window.location.href = 'index.html';
  });

  document.addEventListener('DOMContentLoaded', updateAuthLinks);
})();
