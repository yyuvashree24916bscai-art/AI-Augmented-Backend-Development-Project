/**
 * AI StudyBuddy - Frontend Authentication & Navigation Module
 */

function getToken() {
  return localStorage.getItem('studybuddy_token');
}

function getUser() {
  const userJson = localStorage.getItem('studybuddy_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}

function setAuth(token, user) {
  localStorage.setItem('studybuddy_token', token);
  localStorage.setItem('studybuddy_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('studybuddy_token');
  localStorage.removeItem('studybuddy_user');
}

async function logout() {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } catch (e) {
    // Ignore error
  }
  clearAuth();
  window.location.href = '/index.html';
}

/**
 * Protects pages from unauthenticated access.
 * Redirects to index.html if token is missing.
 */
function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = '/index.html?unauthorized=1';
    return false;
  }
  return true;
}

/**
 * Protects admin-only pages.
 * Redirects students to dashboard with warning.
 */
function requireAdmin() {
  if (!requireAuth()) return false;
  const user = getUser();
  if (!user || user.role !== 'admin') {
    alert('Access Denied: Administrator privileges required.');
    window.location.href = '/dashboard.html';
    return false;
  }
  return true;
}

/**
 * Dynamically renders the universal navigation bar into element with id="nav-container"
 */
function renderNavigation(activePage = '') {
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) return;

  const user = getUser();
  const isLoggedIn = !!getToken() && !!user;

  if (!isLoggedIn) {
    navContainer.innerHTML = `
      <header class="site-header">
        <div class="header-container">
          <a href="/index.html" class="brand-logo">
            <span>📚 AI StudyBuddy</span>
            <span class="brand-badge">Gemini 2.5</span>
          </a>
          <ul class="nav-links">
            <li><a href="/index.html" class="nav-link ${activePage === 'login' ? 'active' : ''}">Sign In</a></li>
            <li><a href="/register.html" class="btn btn-primary btn-sm">Register</a></li>
          </ul>
        </div>
      </header>
    `;
    return;
  }

  const isAdmin = user.role === 'admin';

  navContainer.innerHTML = `
    <header class="site-header">
      <div class="header-container">
        <a href="/dashboard.html" class="brand-logo">
          <span>📚 AI StudyBuddy</span>
          <span class="brand-badge">RAG</span>
        </a>

        <ul class="nav-links">
          <li><a href="/dashboard.html" class="nav-link ${activePage === 'dashboard' ? 'active' : ''}">Dashboard</a></li>
          <li><a href="/upload.html" class="nav-link ${activePage === 'upload' ? 'active' : ''}">Upload</a></li>
          <li><a href="/summary.html" class="nav-link ${activePage === 'summary' ? 'active' : ''}">Summaries</a></li>
          <li><a href="/flashcards.html" class="nav-link ${activePage === 'flashcards' ? 'active' : ''}">Flashcards</a></li>
          <li><a href="/quiz.html" class="nav-link ${activePage === 'quiz' ? 'active' : ''}">Quizzes</a></li>
          <li><a href="/study-plan.html" class="nav-link ${activePage === 'study-plan' ? 'active' : ''}">Study Plan</a></li>
          <li><a href="/chat.html" class="nav-link ${activePage === 'chat' ? 'active' : ''}">AI Chat</a></li>
          <li><a href="/search.html" class="nav-link ${activePage === 'search' ? 'active' : ''}">Vector Search</a></li>
          ${isAdmin ? `<li><a href="/admin.html" class="nav-link ${activePage === 'admin' ? 'active' : ''}" style="color: #d97706; font-weight:700;">Admin Panel</a></li>` : ''}
        </ul>

        <div class="user-nav-profile">
          <span class="user-badge ${isAdmin ? 'badge-admin' : ''}">
            ${isAdmin ? '👑' : '🎓'} <strong>${escapeHtml(user.name)}</strong> (${user.role})
          </span>
          <button onclick="logout()" class="btn btn-secondary btn-sm">Logout</button>
        </div>
      </div>
    </header>
  `;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
