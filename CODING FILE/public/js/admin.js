/**
 * AI StudyBuddy - Admin Panel Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAdmin()) return;
  renderNavigation('admin');

  await loadAdminMetrics();
  await loadAdminUsers();
  await loadAdminActivity();
});

async function loadAdminMetrics() {
  try {
    const res = await apiFetch('/admin/activity');
    if (res.success && res.metrics) {
      document.getElementById('metric-users').textContent = res.metrics.totalUsers;
      document.getElementById('metric-materials').textContent = res.metrics.totalMaterials;
      document.getElementById('metric-summaries').textContent = res.metrics.totalSummaries;
      document.getElementById('metric-quizzes').textContent = res.metrics.totalQuizzes;
      document.getElementById('metric-db-status').textContent = res.metrics.databaseStatus;
      document.getElementById('metric-ai-engine').textContent = res.metrics.aiEngine;
    }
  } catch (e) {
    console.error('Error loading metrics:', e);
  }
}

async function loadAdminUsers() {
  const usersTbody = document.getElementById('admin-users-table-body');
  try {
    const res = await apiFetch('/admin/users');
    if (res.success && Array.isArray(res.users)) {
      usersTbody.innerHTML = res.users.map(u => `
        <tr>
          <td><strong>${escapeHtml(u.name)}</strong></td>
          <td>${escapeHtml(u.email)}</td>
          <td>
            <span class="user-badge ${u.role === 'admin' ? 'badge-admin' : ''}">
              ${u.role}
            </span>
          </td>
          <td>${u.materialsUploaded}</td>
          <td>${new Date(u.createdAt).toLocaleDateString()}</td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.error('Error loading users:', e);
  }
}

async function loadAdminActivity() {
  const activityTbody = document.getElementById('admin-activity-table-body');
  try {
    const res = await apiFetch('/admin/activity');
    if (res.success && Array.isArray(res.activityLogs)) {
      activityTbody.innerHTML = res.activityLogs.map(log => `
        <tr>
          <td><span style="font-family:monospace; font-size:0.8rem; color:var(--color-text-muted);">${new Date(log.createdAt).toLocaleTimeString()}</span></td>
          <td>${escapeHtml(log.activity)}</td>
          <td><span style="font-size:0.8rem; color:var(--color-text-muted);">${log.userId ? log.userId.slice(-6) : 'System'}</span></td>
        </tr>
      `).join('');
    }
  } catch (e) {
    console.error('Error loading activity logs:', e);
  }
}
