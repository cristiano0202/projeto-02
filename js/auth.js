(function () {
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setButtonLoading(button, isLoading, loadingText, defaultText) {
    if (!button) return;

    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : defaultText;

    if (isLoading) {
      button.classList.add('opacity-70', 'cursor-not-allowed');
    } else {
      button.classList.remove('opacity-70', 'cursor-not-allowed');
    }
  }

  function redirectIfAuthenticated() {
    const currentPage = window.location.pathname.split('/').pop();

    const authPages = ['login.html', 'cadastro.html'];

    if (authPages.includes(currentPage) && window.EcoApi?.isAuthenticated()) {
      window.location.href = 'dashboard.html';
    }
  }

  function setupLoginForm() {
    const form = document.querySelector('#loginForm');

    if (!form) return;

    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = form.querySelector('button[type="submit"]');

      const email = form.email.value.trim().toLowerCase();
      const password = form.password.value;

      if (!email || !password) {
        window.EcoApi.showToast('Informe e-mail e senha.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        window.EcoApi.showToast('Informe um e-mail válido.', 'error');
        return;
      }

      try {
        setButtonLoading(submitButton, true, 'Entrando...', 'Entrar');

        const data = await window.EcoApi.request('/auth/login', {
          method: 'POST',
          body: {
            email,
            password
          }
        });

        window.EcoApi.setSession(data);
        window.EcoApi.showToast('Login realizado com sucesso.', 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 500);
      } catch (error) {
        window.EcoApi.showToast(error.message, 'error');
      } finally {
        setButtonLoading(submitButton, false, 'Entrando...', 'Entrar');
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
      const email = form.email.value.trim().toLowerCase();
      const password = form.password.value;
      const confirmPassword = form.confirmPassword.value;
      const userType = form.userType.value;

      if (!name || !email || !password || !confirmPassword || !userType) {
        window.EcoApi.showToast('Preencha todos os campos obrigatórios.', 'error');
        return;
      }

      if (name.length < 3) {
        window.EcoApi.showToast('Informe um nome com pelo menos 3 caracteres.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        window.EcoApi.showToast('Informe um e-mail válido.', 'error');
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
        setButtonLoading(submitButton, true, 'Criando conta...', 'Criar conta');

        const data = await window.EcoApi.request('/auth/register', {
          method: 'POST',
          body: {
            name,
            email,
            password,
            userType
          }
        });

        window.EcoApi.setSession(data);
        window.EcoApi.showToast('Conta criada com sucesso.', 'success');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 500);
      } catch (error) {
        window.EcoApi.showToast(error.message, 'error');
      } finally {
        setButtonLoading(submitButton, false, 'Criando conta...', 'Criar conta');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (!window.EcoApi) {
      console.error('EcoApi não foi carregado. Verifique se js/api.js vem antes de js/auth.js.');
      return;
    }

    redirectIfAuthenticated();
    setupLoginForm();
    setupRegisterForm();
  });
})();
