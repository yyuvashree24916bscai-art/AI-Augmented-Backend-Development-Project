/**
 * AI StudyBuddy - Flashcards Controller
 */

let currentCards = [];
let currentCardIndex = 0;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  renderNavigation('flashcards');

  const materialSelect = document.getElementById('flashcard-material-select');
  const generateBtn = document.getElementById('generate-flashcards-btn');
  const alertContainer = document.getElementById('flashcards-alert-container');
  const cardElement = document.getElementById('active-flashcard');
  const prevBtn = document.getElementById('prev-card-btn');
  const nextBtn = document.getElementById('next-card-btn');
  const flipBtn = document.getElementById('flip-card-btn');

  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedId = urlParams.get('materialId');

  // Load materials
  try {
    const res = await apiFetch('/material');
    if (res.success && Array.isArray(res.materials)) {
      materialSelect.innerHTML = `
        <option value="">-- Select Study Material (or use all notes) --</option>
        ${res.materials.map(m => `
          <option value="${m._id}" ${preSelectedId === m._id ? 'selected' : ''}>
            ${escapeHtml(m.title)}
          </option>
        `).join('')}
      `;
    }
  } catch (e) {
    console.error(e);
  }

  // Load initial cards
  await loadCards(preSelectedId);

  generateBtn?.addEventListener('click', async () => {
    alertContainer.innerHTML = '';
    const materialId = materialSelect.value;
    const customTopic = document.getElementById('custom-card-topic')?.value.trim();
    const count = document.getElementById('card-count-select')?.value || 5;

    if (!materialId && !customTopic) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Please select a study material or specify a custom topic to generate flashcards.</div>`;
      return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = `⏳ Generating Flashcards with Gemini...`;

    try {
      const res = await apiFetch('/ai/flashcards', {
        method: 'POST',
        body: {
          materialId: materialId || undefined,
          content: customTopic || undefined,
          count,
        }
      });

      if (res.success && res.flashcards) {
        currentCards = res.flashcards;
        currentCardIndex = 0;
        renderActiveCard();
        renderCardList();
        alertContainer.innerHTML = `<div class="alert alert-success">✅ Successfully generated ${res.flashcards.length} new flashcards!</div>`;
      } else {
        alertContainer.innerHTML = `<div class="alert alert-danger">⚠️ ${escapeHtml(res.error || 'Failed to generate flashcards.')}</div>`;
      }
    } catch (err) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Network error: ${escapeHtml(err.message)}</div>`;
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `🗂️ Generate Flashcards`;
    }
  });

  // Card click flip
  cardElement?.addEventListener('click', () => {
    cardElement.classList.toggle('is-flipped');
  });

  flipBtn?.addEventListener('click', () => {
    cardElement.classList.toggle('is-flipped');
  });

  prevBtn?.addEventListener('click', () => {
    if (currentCardIndex > 0) {
      currentCardIndex--;
      cardElement.classList.remove('is-flipped');
      renderActiveCard();
    }
  });

  nextBtn?.addEventListener('click', () => {
    if (currentCardIndex < currentCards.length - 1) {
      currentCardIndex++;
      cardElement.classList.remove('is-flipped');
      renderActiveCard();
    }
  });
});

async function loadCards(materialId) {
  try {
    let endpoint = '/material';
    if (materialId) {
      const res = await apiFetch(`/material/${materialId}`);
      if (res.success && res.resources?.flashcards) {
        currentCards = res.resources.flashcards;
      }
    } else {
      // Fetch all materials and extract flashcards
      const mRes = await apiFetch('/material');
      if (mRes.success && mRes.materials?.length > 0) {
        const first = await apiFetch(`/material/${mRes.materials[0]._id}`);
        if (first.success && first.resources?.flashcards) {
          currentCards = first.resources.flashcards;
        }
      }
    }

    if (currentCards.length > 0) {
      currentCardIndex = 0;
      renderActiveCard();
      renderCardList();
    } else {
      const questionElem = document.getElementById('card-question-text');
      if (questionElem) {
        questionElem.textContent = 'No flashcards available yet. Choose a material above and click "Generate Flashcards" to create your study deck!';
      }
    }
  } catch (e) {
    console.error('Error loading cards:', e);
  }
}

function renderActiveCard() {
  const cardElement = document.getElementById('active-flashcard');
  const questionElem = document.getElementById('card-question-text');
  const answerElem = document.getElementById('card-answer-text');
  const counterElem = document.getElementById('card-counter-indicator');
  const prevBtn = document.getElementById('prev-card-btn');
  const nextBtn = document.getElementById('next-card-btn');

  if (currentCards.length === 0) return;

  const card = currentCards[currentCardIndex];
  if (cardElement) cardElement.classList.remove('is-flipped');
  if (questionElem) questionElem.textContent = card.question;
  if (answerElem) answerElem.textContent = card.answer;
  if (counterElem) counterElem.textContent = `Card ${currentCardIndex + 1} of ${currentCards.length}`;

  if (prevBtn) prevBtn.disabled = currentCardIndex === 0;
  if (nextBtn) nextBtn.disabled = currentCardIndex === currentCards.length - 1;
}

function renderCardList() {
  const listElem = document.getElementById('cards-full-list');
  if (!listElem) return;

  listElem.innerHTML = currentCards.map((c, idx) => `
    <div class="card" style="margin-bottom:12px; padding:16px;">
      <div style="font-weight:700; color:var(--color-primary); font-size:0.85rem; margin-bottom:4px;">Q${idx + 1}: ${escapeHtml(c.question)}</div>
      <div style="color:var(--color-text-main); font-size:0.9rem;"><strong>Answer:</strong> ${escapeHtml(c.answer)}</div>
    </div>
  `).join('');
}
