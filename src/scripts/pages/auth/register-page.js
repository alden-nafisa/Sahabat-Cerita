import { AuthPresenter } from '../../presenters/auth-presenter.js';

export default class RegisterPage {
  constructor() {
    this.presenter = new AuthPresenter(this);
  }

  async render() {
    return `
      <div class="auth-page">
        <div class="auth-container">
          <div class="auth-card">
            <h1 class="auth-title">Register</h1>
            <form id="register-form" class="auth-form" novalidate>
              <div class="form-group">
                <label for="name">Nama</label>
                <input id="name" name="name" type="text" required />
              </div>
              <div class="form-group">
                <label for="email">Email</label>
                <input id="email" name="email" type="email" required />
              </div>
              <div class="form-group">
                <label for="password">Password</label>
                <input id="password" name="password" type="password" minlength="8" required />
              </div>
              <button class="btn btn-primary" type="submit">Daftar</button>
            </form>
            <p class="auth-link">Sudah punya akun? <a href="#/login">Login</a></p>
            <p id="message" role="status" class="auth-message"></p>
          </div>
        </div>
      </div>
    `;
  }

  // View methods for Presenter
  showLoading(message) {
    const messageEl = document.querySelector('#message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  showSuccess(message) {
    const messageEl = document.querySelector('#message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  showError(message) {
    const messageEl = document.querySelector('#message');
    if (messageEl) {
      messageEl.textContent = message;
    }
  }

  navigateToLogin() {
    setTimeout(() => {
      window.location.hash = '#/login';
    }, 1000);
  }

  async afterRender() {
    const form = document.querySelector('#register-form');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const name = formData.get('name');
      const email = formData.get('email');
      const password = formData.get('password');
      
      await this.presenter.register({ name, email, password });
    });
  }
}


