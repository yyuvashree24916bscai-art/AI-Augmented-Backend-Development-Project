/**
 * AI StudyBuddy - Semantic Vector Search Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  renderNavigation('search');

  const searchForm = document.getElementById('semantic-search-form');
  const searchInput = document.getElementById('search-query-input');
  const searchBtn = document.getElementById('search-submit-btn');
  const alertContainer = document.getElementById('search-alert-container');
  const resultsContainer = document.getElementById('search-results-container');
  const aiInsightBox = document.getElementById('search-ai-insight');
  const hitsList = document.getElementById('search-hits-list');

  searchForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;

    alertContainer.innerHTML = '';
    searchBtn.disabled = true;
    searchBtn.innerHTML = `⏳ Vectorizing Query & Computing Cosine Distance...`;

    try {
      const res = await apiFetch('/ai/search', {
        method: 'POST',
        body: { query }
      });

      if (res.success) {
        if (!res.results || res.results.length === 0) {
          alertContainer.innerHTML = `<div class="alert alert-info">No semantic matches found. Make sure you have uploaded study notes in the Upload tab!</div>`;
          resultsContainer.style.display = 'none';
          return;
        }

        // Render AI Insight if returned
        if (res.aiInsight && aiInsightBox) {
          aiInsightBox.innerHTML = `
            <div class="card" style="background:var(--color-primary-light); border-color:#c7d2fe; margin-bottom:20px;">
              <div style="font-weight:700; color:var(--color-primary-text); margin-bottom:6px; display:flex; align-items:center; gap:6px;">
                <span>✨ AI Semantic Synthesis</span>
              </div>
              <div style="font-size:0.95rem; color:var(--color-text-main);">${escapeHtml(res.aiInsight).replace(/\n/g, '<br>')}</div>
            </div>
          `;
          aiInsightBox.style.display = 'block';
        } else if (aiInsightBox) {
          aiInsightBox.style.display = 'none';
        }

        // Render ranked hits
        hitsList.innerHTML = res.results.map((hit, idx) => `
          <div class="card" style="margin-bottom:16px;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
              <div>
                <span class="user-badge" style="background:#e0e7ff; color:#3730a3; font-weight:700;">Rank #${idx + 1}</span>
                <strong style="font-size:1.05rem; margin-left:8px;">${escapeHtml(hit.materialTitle)}</strong>
                <span class="user-badge" style="margin-left:6px;">${escapeHtml(hit.materialSubject)}</span>
              </div>
              <div class="user-badge" style="background:#dcfce7; color:#166534; font-weight:700;">
                Vector Match: ${hit.similarityScore}%
              </div>
            </div>
            <div style="background:#f8fafc; border-left:3px solid var(--color-primary); padding:12px; border-radius:4px; font-size:0.9rem; line-height:1.6;">
              "${escapeHtml(hit.textChunk)}"
            </div>
            <div style="margin-top:12px; display:flex; gap:8px;">
              <a href="/summary.html?materialId=${hit.materialId}" class="btn btn-secondary btn-sm">Open Summary</a>
              <a href="/chat.html" class="btn btn-primary btn-sm">Ask StudyBuddy About This</a>
            </div>
          </div>
        `).join('');

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
      } else {
        alertContainer.innerHTML = `<div class="alert alert-danger">⚠️ ${escapeHtml(res.error || 'Search failed.')}</div>`;
      }
    } catch (err) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Network error: ${escapeHtml(err.message)}</div>`;
    } finally {
      searchBtn.disabled = false;
      searchBtn.innerHTML = `🔍 Search Across Notes`;
    }
  });
});
