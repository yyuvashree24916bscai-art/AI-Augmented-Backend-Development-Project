/**
 * AI StudyBuddy - Summary Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  renderNavigation('summary');

  const materialSelect = document.getElementById('summary-material-select');
  const generateBtn = document.getElementById('generate-summary-btn');
  const resultContainer = document.getElementById('summary-result-container');
  const alertContainer = document.getElementById('summary-alert-container');

  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedId = urlParams.get('materialId');

  // Load user materials into selector
  try {
    const res = await apiFetch('/material');
    if (res.success && Array.isArray(res.materials)) {
      if (res.materials.length === 0) {
        materialSelect.innerHTML = `<option value="">No materials found. Please upload first.</option>`;
      } else {
        materialSelect.innerHTML = res.materials.map(m => `
          <option value="${m._id}" ${preSelectedId === m._id ? 'selected' : ''}>
            ${escapeHtml(m.title)} (${escapeHtml(m.subject)})
          </option>
        `).join('');

        if (preSelectedId) {
          // Check if already summarized
          await fetchExistingSummary(preSelectedId);
        }
      }
    }
  } catch (e) {
    console.error('Error loading materials:', e);
  }

  generateBtn?.addEventListener('click', async () => {
    const selectedId = materialSelect.value;
    if (!selectedId) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Please select a study material to summarize.</div>`;
      return;
    }

    alertContainer.innerHTML = '';
    generateBtn.disabled = true;
    generateBtn.innerHTML = `⏳ Generating Summary with Gemini 2.5 Flash...`;

    try {
      const res = await apiFetch(`/materials/${selectedId}/summarize`, {
        method: 'POST',
      });

      if (res.success) {
        renderSummary(res.materialTitle, res.summary);
      } else {
        alertContainer.innerHTML = `<div class="alert alert-danger">⚠️ ${escapeHtml(res.error || 'Failed to generate summary.')}</div>`;
      }
    } catch (err) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Network error: ${escapeHtml(err.message)}</div>`;
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `✨ Generate AI Summary`;
    }
  });

  materialSelect?.addEventListener('change', async () => {
    if (materialSelect.value) {
      await fetchExistingSummary(materialSelect.value);
    }
  });
});

async function fetchExistingSummary(materialId) {
  const resultContainer = document.getElementById('summary-result-container');
  try {
    const res = await apiFetch(`/material/${materialId}`);
    if (res.success && res.resources?.summary) {
      renderSummary(res.material.title, res.resources.summary);
    } else {
      resultContainer.style.display = 'none';
    }
  } catch (e) {
    // Ignore error
  }
}

function renderSummary(title, markdownText) {
  const resultContainer = document.getElementById('summary-result-container');
  const titleElem = document.getElementById('summary-target-title');
  const bodyElem = document.getElementById('summary-body-content');

  if (titleElem) titleElem.textContent = title;
  if (bodyElem) {
    // Simple robust markdown formatting for headers, bold, bullets
    bodyElem.innerHTML = formatSimpleMarkdown(markdownText);
  }
  if (resultContainer) {
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth' });
  }
}

function formatSimpleMarkdown(md) {
  if (!md) return '';
  let html = escapeHtml(md);
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 style="margin-top:14px; color:var(--color-primary-text);">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="margin-top:18px; color:var(--color-text-main); font-size:1.25rem;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="margin-top:20px; font-size:1.4rem;">$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Bullets
  html = html.replace(/^\s*[-•*]\s*(.*$)/gim, '<li style="margin-left:20px;">$1</li>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '<br><br>');
  return html;
}
