export class AuthModel {
  constructor() {
    this.tokenKey = 'auth_token';
  }

  getToken() {
    const token = localStorage.getItem(this.tokenKey);
    // Check if token is valid format (not offline token)
    if (token && token.startsWith('offline_token_')) {
      return token; // Allow offline tokens
    }
    return token;
  }

  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}



