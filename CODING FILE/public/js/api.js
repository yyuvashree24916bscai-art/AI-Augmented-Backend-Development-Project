/**
 * AI StudyBuddy - API Client Module
 * Communicates with REST backend endpoints using fetch() and handles JWT.
 */

const API_BASE = '/api';

/**
 * Perform authenticated or public fetch request
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('studybuddy_token');
  
  const headers = {
    ...(options.headers || {}),
  };

  // Attach Bearer token if present
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is an object and not FormData, stringify JSON
  if (options.body && !(options.body instanceof FormData) && typeof options.body === 'object') {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized
    if (response.status === 401) {
      const isAuthPage = window.location.pathname.endsWith('index.html') || 
                         window.location.pathname.endsWith('register.html') || 
                         window.location.pathname === '/';
      if (!isAuthPage) {
        localStorage.removeItem('studybuddy_token');
        localStorage.removeItem('studybuddy_user');
        window.location.href = '/index.html?session_expired=1';
        return { success: false, error: 'Session expired. Please log in again.' };
      }
    }

    const data = await response.json().catch(() => ({ success: false, error: 'Failed to parse server response.' }));

    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        error: data.error || `HTTP Error ${response.status}: ${response.statusText}`,
      };
    }

    return data;
  } catch (error) {
    console.error('API Fetch Network Error:', error);
    return {
      success: false,
      error: error.message || 'Network connection failed.',
    };
  }
}
