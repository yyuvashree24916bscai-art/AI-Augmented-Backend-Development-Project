/**
 * AI StudyBuddy - Material Upload Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;
  renderNavigation('upload');

  const uploadForm = document.getElementById('material-upload-form');
  const alertContainer = document.getElementById('upload-alert-container');
  const submitBtn = document.getElementById('upload-submit-btn');

  uploadForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    alertContainer.innerHTML = '';

    const titleInput = document.getElementById('material-title');
    const subjectInput = document.getElementById('material-subject');
    const contentInput = document.getElementById('material-content');
    const fileInput = document.getElementById('material-file');

    const title = titleInput.value.trim();
    const subject = subjectInput.value.trim();
    const content = contentInput.value.trim();
    const file = fileInput.files[0];

    if (!title && !file) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Please provide a document title or select a study file to upload.</div>`;
      return;
    }

    if (!content && !file) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Please either enter study text content or attach a study document file.</div>`;
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `⏳ Processing Document & Generating Vector Embeddings...`;

    try {
      let res;
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        if (title) formData.append('title', title);
        if (subject) formData.append('subject', subject);
        if (content) formData.append('content', content);

        res = await apiFetch('/material/upload', {
          method: 'POST',
          body: formData,
        });
      } else {
        res = await apiFetch('/material/upload', {
          method: 'POST',
          body: { title, subject, content },
        });
      }

      if (res.success) {
        alertContainer.innerHTML = `
          <div class="alert alert-success">
            <div>
              <strong>✅ Success!</strong> ${escapeHtml(res.message)}
              <div style="margin-top:6px; font-size:0.85rem;">
                Vector Embeddings: <strong>${res.material.vectorEmbeddingsGenerated} chunks</strong> created for semantic search and RAG.
              </div>
              <div style="margin-top:12px; display:flex; gap:8px;">
                <a href="/summary.html?materialId=${res.material._id}" class="btn btn-primary btn-sm">Generate AI Summary</a>
                <a href="/flashcards.html?materialId=${res.material._id}" class="btn btn-secondary btn-sm">Create Flashcards</a>
                <a href="/quiz.html?materialId=${res.material._id}" class="btn btn-secondary btn-sm">Create Quiz</a>
              </div>
            </div>
          </div>
        `;
        uploadForm.reset();
      } else {
        alertContainer.innerHTML = `<div class="alert alert-danger">⚠️ ${escapeHtml(res.error || 'Upload failed.')}</div>`;
      }
    } catch (err) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Network error during upload: ${escapeHtml(err.message)}</div>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `🚀 Upload & Vectorize Material`;
    }
  });
});
