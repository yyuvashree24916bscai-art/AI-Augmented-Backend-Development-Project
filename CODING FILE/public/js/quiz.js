/**
 * AI StudyBuddy - Interactive Quiz Controller
 */

let activeQuiz = null;
let userAnswers = {}; // questionIndex -> selectedOptionString
let isSubmitted = false;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  renderNavigation('quiz');

  const materialSelect = document.getElementById('quiz-material-select');
  const generateBtn = document.getElementById('generate-quiz-btn');
  const alertContainer = document.getElementById('quiz-alert-container');
  const submitQuizBtn = document.getElementById('submit-quiz-btn');

  const urlParams = new URLSearchParams(window.location.search);
  const preSelectedId = urlParams.get('materialId');

  // Load materials
  try {
    const res = await apiFetch('/material');
    if (res.success && Array.isArray(res.materials)) {
      materialSelect.innerHTML = `
        <option value="">-- Select Study Material (or enter custom text) --</option>
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

  // Check if existing quiz exists for this material
  if (preSelectedId) {
    await loadExistingQuiz(preSelectedId);
  }

  generateBtn?.addEventListener('click', async () => {
    alertContainer.innerHTML = '';
    const materialId = materialSelect.value;
    const customContent = document.getElementById('custom-quiz-topic')?.value.trim();
    const count = document.getElementById('quiz-question-count')?.value || 4;

    if (!materialId && !customContent) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Please select a study material or provide topic content for the quiz.</div>`;
      return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = `⏳ Generating Multiple-Choice Questions with Gemini...`;

    try {
      const res = await apiFetch('/ai/quiz', {
        method: 'POST',
        body: {
          materialId: materialId || undefined,
          content: customContent || undefined,
          count,
        }
      });

      if (res.success && res.quiz) {
        activeQuiz = res.quiz;
        userAnswers = {};
        isSubmitted = false;
        renderQuiz();
        alertContainer.innerHTML = `<div class="alert alert-success">✅ Quiz successfully generated with ${res.quiz.questions.length} questions!</div>`;
      } else {
        alertContainer.innerHTML = `<div class="alert alert-danger">⚠️ ${escapeHtml(res.error || 'Failed to generate quiz.')}</div>`;
      }
    } catch (err) {
      alertContainer.innerHTML = `<div class="alert alert-danger">Network error: ${escapeHtml(err.message)}</div>`;
    } finally {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `❓ Generate Practice Quiz`;
    }
  });

  submitQuizBtn?.addEventListener('click', () => {
    if (!activeQuiz || !activeQuiz.questions) return;
    isSubmitted = true;
    evaluateQuiz();
  });
});

async function loadExistingQuiz(materialId) {
  try {
    const res = await apiFetch(`/material/${materialId}`);
    if (res.success && res.resources?.quiz) {
      activeQuiz = res.resources.quiz;
      userAnswers = {};
      isSubmitted = false;
      renderQuiz();
    }
  } catch (e) {
    console.error(e);
  }
}

function renderQuiz() {
  const container = document.getElementById('quiz-questions-list');
  const actionsContainer = document.getElementById('quiz-actions-container');
  const scoreContainer = document.getElementById('quiz-score-container');

  if (!container || !activeQuiz || !activeQuiz.questions) return;

  scoreContainer.style.display = 'none';
  actionsContainer.style.display = 'block';

  container.innerHTML = activeQuiz.questions.map((q, qIdx) => `
    <div class="quiz-question-box" id="question-box-${qIdx}">
      <div style="font-weight:700; font-size:1.05rem; margin-bottom:8px; color:var(--color-text-main);">
        ${qIdx + 1}. ${escapeHtml(q.question)}
      </div>
      <div class="quiz-options-list">
        ${q.options.map((opt, optIdx) => `
          <div class="quiz-option" 
               id="opt-${qIdx}-${optIdx}" 
               onclick="selectQuizOption(${qIdx}, ${optIdx}, '${escapeQuote(opt)}')">
            <input type="radio" name="question_${qIdx}" value="${escapeQuote(opt)}" ${userAnswers[qIdx] === opt ? 'checked' : ''}>
            <span>${escapeHtml(opt)}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  container.scrollIntoView({ behavior: 'smooth' });
}

window.selectQuizOption = function(qIdx, optIdx, optionValue) {
  if (isSubmitted) return;
  userAnswers[qIdx] = optionValue;

  const box = document.getElementById(`question-box-${qIdx}`);
  if (box) {
    const options = box.querySelectorAll('.quiz-option');
    options.forEach((el, i) => {
      if (i === optIdx) {
        el.classList.add('selected');
        const radio = el.querySelector('input');
        if (radio) radio.checked = true;
      } else {
        el.classList.remove('selected');
      }
    });
  }
};

function evaluateQuiz() {
  if (!activeQuiz) return;
  let correctCount = 0;
  const total = activeQuiz.questions.length;

  activeQuiz.questions.forEach((q, qIdx) => {
    const userPick = userAnswers[qIdx];
    const isCorrect = userPick === q.correctAnswer;
    if (isCorrect) correctCount++;

    const box = document.getElementById(`question-box-${qIdx}`);
    if (box) {
      const options = box.querySelectorAll('.quiz-option');
      options.forEach(optEl => {
        const textSpan = optEl.querySelector('span')?.textContent;
        if (textSpan === q.correctAnswer) {
          optEl.classList.add('correct');
        } else if (textSpan === userPick && !isCorrect) {
          optEl.classList.add('incorrect');
        }
      });
    }
  });

  const percentage = Math.round((correctCount / total) * 100);
  const scoreContainer = document.getElementById('quiz-score-container');
  const scoreText = document.getElementById('quiz-score-text');

  if (scoreText) {
    scoreText.innerHTML = `
      You scored <strong>${correctCount} / ${total} (${percentage}%)</strong>!
      <div style="font-size:0.9rem; font-weight:normal; margin-top:6px;">
        ${percentage >= 75 ? '🎉 Outstanding mastery! Ready for test day.' : '💡 Review the highlighted correct answers above to reinforce your recall.'}
      </div>
    `;
  }
  if (scoreContainer) {
    scoreContainer.style.display = 'block';
    scoreContainer.scrollIntoView({ behavior: 'smooth' });
  }

  const submitBtn = document.getElementById('submit-quiz-btn');
  if (submitBtn) submitBtn.disabled = true;
}

function escapeQuote(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'");
}
