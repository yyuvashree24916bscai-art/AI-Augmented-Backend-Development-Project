/**
 * AI StudyBuddy - Study Plan Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  renderNavigation('study-plan');

  const planForm = document.getElementById('study-plan-form');
  const alertContainer = document.getElementById('plan-alert-container');
  const submitBtn = document.getElementById('generate-plan-btn');
  const resultContainer = document.getElementById('plan-result-container');
  const planContentElem = document.getElementById('plan-content-body');

  planForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = '';

    const subject = document.getElementById('plan-subject').value.trim();
    const topics = document.getElementById('plan-topics').value.trim();
    const examDate = document.getElementById('plan-exam-date').value.trim();
    const dailyHours = document.getElementById('plan-daily-hours').value;

    if (!subject) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Please enter the subject name.</div>`;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `⏳ Formulating Master Study Plan with Gemini 2.5 Flash...`;

    try {
      const res = await apiFetch('/ai/study-plan', {
        method: 'POST',
        body: {
          subject,
          topics,
          examDate,
          dailyHours,
        }
      });

      if (res.success && (res.studyPlan || res.plan)) {
        const planMarkdown = typeof res.studyPlan === 'string' 
          ? res.studyPlan 
          : (res.studyPlan?.studyPlan || res.plan || '');
        if (planContentElem) {
          planContentElem.innerHTML = formatMarkdownPlan(planMarkdown);
        }
        if (resultContainer) {
          resultContainer.style.display = 'block';
          resultContainer.scrollIntoView({ behavior: 'smooth' });
        }
        alertContainer.innerHTML = `<div class="alert alert-success">✅ Personalized Study Plan formulated!</div>`;
      } else {
        alertContainer.innerHTML = `<div class="alert alert-danger">⚠️ ${escapeHtml(res.error || 'Failed to generate study plan.')}</div>`;
      }
    } catch (err) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Network error: ${escapeHtml(err.message)}</div>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `📅 Generate Master Study Plan`;
    }
  });
});

function formatMarkdownPlan(md) {
  if (!md) return '';
  let html = escapeHtml(md);
  html = html.replace(/^### (.*$)/gim, '<h3 style="margin-top:16px; color:var(--color-primary); font-size:1.1rem;">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="margin-top:22px; margin-bottom:10px; color:var(--color-text-main); font-size:1.3rem; border-bottom:1px solid var(--color-border); padding-bottom:6px;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="margin-top:24px; font-size:1.5rem; color:var(--color-primary-text);">$1</h1>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^\s*[-•*]\s*(.*$)/gim, '<li style="margin-left:22px; margin-bottom:6px;">$1</li>');
  html = html.replace(/\n\n/g, '<br><br>');
  return html;
}
