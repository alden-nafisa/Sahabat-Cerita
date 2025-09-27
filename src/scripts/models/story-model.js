export class StoryModel {
  constructor() {
    this.baseUrl = 'https://story-api.dicoding.dev/v1';
  }

  async registerUser(userData) {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    return await response.json();
  }

  async loginUser(credentials) {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    return await response.json();
  }

  async getStories(params = {}) {
    const { token, page = 1, size = 12, location = 0 } = params;
    
    // Check if offline
    if (!navigator.onLine) {
      throw new Error('Offline - cannot fetch stories');
    }

    // Check if using offline token (only reject if truly offline)
    if (token && token.startsWith('offline_token_')) {
      throw new Error('Offline - cannot fetch stories');
    }

    const url = new URL(`${this.baseUrl}/stories`);
    url.searchParams.append('page', page);
    url.searchParams.append('size', size);
    url.searchParams.append('location', location);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stories');
    }

    return await response.json();
  }

  async getStoryById(id, token) {
    const response = await fetch(`${this.baseUrl}/stories/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch story');
    }
    
    return await response.json();
  }

  async addStory(storyData) {

  const { token, description, photoFile, lat, lon } = storyData;
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photoFile);
  if (lat !== undefined) formData.append('lat', lat);
  if (lon !== undefined) formData.append('lon', lon);

    const response = await fetch(`${this.baseUrl}/stories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add story');
    }
    
    return await response.json();
  }

  async subscribeWebPush(subscriptionData) {
    const { token, subscription } = subscriptionData;
    // Normalize payload to API schema: { endpoint, keys: { p256dh, auth } }
    const payload = {
      endpoint: subscription?.endpoint,
      keys: {
        p256dh: subscription?.keys?.p256dh,
        auth: subscription?.keys?.auth,
      },
    };
    const response = await fetch(`${this.baseUrl}/notifications/subscribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to subscribe');
    }
    
    return await response.json();
  }

  async unsubscribeWebPush(unsubscribeData) {
    const { token, endpoint } = unsubscribeData;
    const response = await fetch(`${this.baseUrl}/notifications/subscribe`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ endpoint }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to unsubscribe');
    }
    
    return await response.json();
  }
}

