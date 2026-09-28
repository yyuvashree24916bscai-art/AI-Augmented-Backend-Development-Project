/**
 * AI StudyBuddy - AI Chat & RAG Assistant Controller
 */

let conversationHistory = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  renderNavigation('chat');

  const contextSelect = document.getElementById('chat-context-select');
  const chatInput = document.getElementById('chat-prompt-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const messagesContainer = document.getElementById('chat-messages-container');

  // Load user materials into context selector
  try {
    const res = await apiFetch('/material');
    if (res.success && Array.isArray(res.materials)) {
      contextSelect.innerHTML = `
        <option value="">🔍 Global RAG (Search across all my notes)</option>
        ${res.materials.map(m => `
          <option value="${m._id}">📄 Focus on: ${escapeHtml(m.title)}</option>
        `).join('')}
      `;
    }
  } catch (e) {
    console.error('Error loading materials for chat context:', e);
  }

  async function handleSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    const materialId = contextSelect.value || undefined;

    // Append user message
    appendMessage('user', text);
    chatInput.value = '';
    chatInput.focus();

    sendBtn.disabled = true;
    sendBtn.innerHTML = `⏳ Thinking...`;

    // Append temporary typing indicator
    const typingId = appendTypingIndicator();

    try {
      const res = await apiFetch('/ai/chat', {
        method: 'POST',
        body: {
          prompt: text,
          materialId,
          history: conversationHistory,
        }
      });

      removeTypingIndicator(typingId);

      if (res.success) {
        appendMessage('ai', res.response, res.contextSources);
        conversationHistory.push({ prompt: text, response: res.response });
      } else {
        appendMessage('ai', `⚠️ Error: ${res.error || 'Could not process query.'}`);
      }
    } catch (err) {
      removeTypingIndicator(typingId);
      appendMessage('ai', `⚠️ Network error: ${err.message}`);
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = `Send 🚀`;
    }
  }

  sendBtn?.addEventListener('click', handleSend);
  chatInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });
});

function appendMessage(sender, text, contextSources = []) {
  const container = document.getElementById('chat-messages-container');
  if (!container) return;

  const msgDiv = document.createElement('div');
  msgDiv.className = `message-bubble ${sender === 'user' ? 'message-user' : 'message-ai'}`;

  let contentHtml = `<div>${formatChatText(text)}</div>`;

  if (contextSources && contextSources.length > 0) {
    contentHtml += `
      <div class="message-sources">
        <strong>📚 Grounded in Study Context (${contextSources.length} chunk${contextSources.length > 1 ? 's' : ''}):</strong>
        ${contextSources.map((src, i) => `
          <div style="margin-top:4px; font-style:italic; border-left:2px solid #cbd5e1; padding-left:6px;">
            "${escapeHtml(src.slice(0, 180))}..."
          </div>
        `).join('')}
      </div>
    `;
  }

  msgDiv.innerHTML = contentHtml;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function appendTypingIndicator() {
  const container = document.getElementById('chat-messages-container');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'message-bubble message-ai';
  div.style.fontStyle = 'italic';
  div.style.color = 'var(--color-text-muted)';
  div.textContent = 'StudyBuddy is searching notes and formulating response...';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function formatChatText(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^\s*[-•*]\s*(.*$)/gim, '<div style="margin-left:14px;">• $1</div>');
  html = html.replace(/\n\n/g, '<br><br>');
  html = html.replace(/\n/g, '<br>');
  return html;
}
