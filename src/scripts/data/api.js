import CONFIG from '../config';

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const ENDPOINTS = {
  register: `${CONFIG.BASE_URL}/register`,
  login: `${CONFIG.BASE_URL}/login`,
  stories: `${CONFIG.BASE_URL}/stories`,
  storiesGuest: `${CONFIG.BASE_URL}/stories/guest`,
  storyDetail: (id) => `${CONFIG.BASE_URL}/stories/${id}`,
  subscribe: `${CONFIG.BASE_URL}/notifications/subscribe`,
};

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok || data.error) {
    const message = data.message || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export async function registerUser({ name, email, password }) {
  return fetchJson(ENDPOINTS.register, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser({ email, password }) {
  return fetchJson(ENDPOINTS.login, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
}

export async function getStories({ token, page, size, location } = {}) {
  const url = new URL(ENDPOINTS.stories);
  if (page != null) url.searchParams.set('page', page);
  if (size != null) url.searchParams.set('size', size);
  if (location != null) url.searchParams.set('location', location);

  return fetchJson(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getStoryDetail({ token, id }) {
  return fetchJson(ENDPOINTS.storyDetail(id), {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function addStory({ token, description, photoFile, lat, lon }) {
  const form = new FormData();
  form.append('description', description);
  form.append('photo', photoFile);
  if (lat != null) form.append('lat', String(lat));
  if (lon != null) form.append('lon', String(lon));

  return fetchJson(ENDPOINTS.stories, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
}

export async function addStoryGuest({ description, photoFile, lat, lon }) {
  const form = new FormData();
  form.append('description', description);
  form.append('photo', photoFile);
  if (lat != null) form.append('lat', String(lat));
  if (lon != null) form.append('lon', String(lon));

  return fetchJson(ENDPOINTS.storiesGuest, {
    method: 'POST',
    body: form,
  });
}

export async function subscribeWebPush({ token, subscription }) {
  return fetchJson(ENDPOINTS.subscribe, {
    method: 'POST',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    }),
  });
}

export async function unsubscribeWebPush({ token, endpoint }) {
  return fetchJson(ENDPOINTS.subscribe, {
    method: 'DELETE',
    headers: {
      ...JSON_HEADERS,
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint }),
  });
}