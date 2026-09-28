/**
 * AI StudyBuddy - Dashboard Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  renderNavigation('dashboard');

  const user = getUser();
  const welcomeElem = document.getElementById('user-welcome-name');
  if (welcomeElem && user) {
    welcomeElem.textContent = user.name;
  }

  await loadDashboardData();
});

async function loadDashboardData() {
  const materialsListElem = document.getElementById('recent-materials-list');
  const materialsCountElem = document.getElementById('stat-materials-count');

  try {
    const res = await apiFetch('/material');
    if (res.success && Array.isArray(res.materials)) {
      if (materialsCountElem) {
        materialsCountElem.textContent = res.materials.length;
      }

      if (materialsListElem) {
        if (res.materials.length === 0) {
          materialsListElem.innerHTML = `
            <tr>
              <td colspan="4" style="text-align:center; color: var(--color-text-muted); padding: 24px;">
                No study materials uploaded yet. <a href="/upload.html" style="color:var(--color-primary); font-weight:600;">Upload your first document</a>
              </td>
            </tr>
          `;
          return;
        }

        materialsListElem.innerHTML = res.materials.map(m => `
          <tr>
            <td>
              <strong>${escapeHtml(m.title)}</strong>
              <div style="font-size:0.8rem; color:var(--color-text-muted);">${escapeHtml(m.content.slice(0, 80))}...</div>
            </td>
            <td><span class="user-badge">${escapeHtml(m.subject)}</span></td>
            <td>${new Date(m.createdAt).toLocaleDateString()}</td>
            <td>
              <div style="display:flex; gap:6px;">
                <button onclick="summarizeMaterial('${m._id}')" class="btn btn-secondary btn-sm" title="Generate Summary">📝 Summary</button>
                <button onclick="createFlashcardsFor('${m._id}')" class="btn btn-secondary btn-sm" title="Generate Flashcards">🗂️ Cards</button>
                <button onclick="createQuizFor('${m._id}')" class="btn btn-secondary btn-sm" title="Generate Quiz">❓ Quiz</button>
                <button onclick="deleteMaterial('${m._id}')" class="btn btn-danger btn-sm" title="Delete">🗑️</button>
              </div>
            </td>
          </tr>
        `).join('');
      }
    }
  } catch (e) {
    console.error('Failed to load dashboard materials:', e);
  }
}

async function summarizeMaterial(id) {
  window.location.href = `/summary.html?materialId=${id}`;
}

async function createFlashcardsFor(id) {
  window.location.href = `/flashcards.html?materialId=${id}`;
}

async function createQuizFor(id) {
  window.location.href = `/quiz.html?materialId=${id}`;
}

async function deleteMaterial(id) {
  if (!confirm('Are you sure you want to delete this study material and all associated flashcards/summaries?')) {
    return;
  }
  const res = await apiFetch(`/material/${id}`, { method: 'DELETE' });
  if (res.success) {
    await loadDashboardData();
  } else {
    alert(res.error || 'Failed to delete material.');
  }
}
