export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export const authStorage = {
  get token() {
    return localStorage.getItem('auth_token');
  },
  set token(value) {
    if (value) localStorage.setItem('auth_token', value);
    else localStorage.removeItem('auth_token');
  },
  clear() {
    localStorage.removeItem('auth_token');
  },
  isAuthenticated() {
    return Boolean(localStorage.getItem('auth_token'));
  },
};
