(function () {
  function setupLoginForm() {
    const form = document.querySelector('#loginForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      const email = form.email.value.trim();
      const password = form.password.value;

      if (!email || !password) {
        window.EcoApi.showToast('Informe e-mail e senha.', 'error');
        return;
      }

      try {
        submitButton.disabled = true;
        submitButton.textContent = 'Entrando...';

        const data = await window.EcoApi.request('/auth/login', {
          method: 'POST',
          body: { email, password }
        });

        window.EcoApi.setSession(data);
        window.location.href = 'dashboard.html';
      } catch (error) {
        window.EcoApi.showToast(error.message, 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Entrar';
      }
    });
  }

  function setupRegisterForm() {
    const form = document.querySelector('#registerForm');
    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;
      const confirmPassword = form.confirmPassword.value;
      const userType = form.userType.value;

      if (!name || !email || !password || !confirmPassword || !userType) {
        window.EcoApi.showToast('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      if (password.length < 8) {
        window.EcoApi.showToast('A senha deve ter no mínimo 8 caracteres.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        window.EcoApi.showToast('As senhas não conferem.', 'error');
        return;
      }

      try {
        submitButton.disabled = true;
        submitButton.textContent = 'Criando conta...';

        const data = await window.EcoApi.request('/auth/register', {
          method: 'POST',
          body: { name, email, password, userType }
        });

        window.EcoApi.setSession(data);
        window.location.href = 'dashboard.html';
      } catch (error) {
        window.EcoApi.showToast(error.message, 'error');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Criar conta';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupLoginForm();
    setupRegisterForm();
  });
})();
