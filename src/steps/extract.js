/**
 * Step 2: Extract — OCR processing + editable item list
 */
import { extractTextFromImage } from '../utils/ocr.js';
import { parseBillText } from '../utils/parser.js';
import { getDishEmoji } from '../utils/dishes.js';
import { renderStepIndicator } from './upload.js';

let hasExtracted = false;

export function renderExtract(container, state, actions) {
  if (!hasExtracted && state.items.length === 0) {
    renderExtracting(container, state, actions);
    return;
  }

  renderItemsList(container, state, actions);
}

async function renderExtracting(container, state, actions) {
  container.innerHTML = `
    <div class="step-view">
      <div class="step-header">
        ${renderStepIndicator(1)}
        <h1 class="step-title">Reading Your Bill</h1>
        <p class="step-subtitle">Our AI is scanning every delicious item...</p>
      </div>

      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" id="ocr-progress" style="width: 0%"></div>
        </div>
        <p class="progress-text" id="ocr-status">Initializing OCR engine...</p>
      </div>

      <div style="text-align: center; font-size: 4rem; margin-top: var(--space-xl);">
        <span style="display: inline-block; animation: float 2s ease-in-out infinite;">🔍</span>
      </div>
    </div>
  `;

  try {
    const progressEl = container.querySelector('#ocr-progress');
    const statusEl = container.querySelector('#ocr-status');

    const text = await extractTextFromImage(state.billImage, (progress) => {
      if (progressEl) progressEl.style.width = progress + '%';
      if (statusEl) statusEl.textContent = progress < 50
        ? 'Scanning bill...'
        : progress < 90
          ? 'Extracting items...'
          : 'Almost done...';
    });

    const items = parseBillText(text);
    state.items = items.map((item, i) => ({
      id: Date.now() + i,
      ...item,
      emoji: getDishEmoji(item.name),
    }));

    state.ocrRawText = text;
    hasExtracted = true;
    renderItemsList(container, state, actions);
  } catch (err) {
    container.innerHTML = `
      <div class="step-view">
        <div class="step-header">
          ${renderStepIndicator(1)}
          <h1 class="step-title">Oops!</h1>
          <p class="step-subtitle">Couldn't read the bill. Try a clearer photo.</p>
        </div>
        <div style="text-align: center; font-size: 3rem; margin: var(--space-xl) 0;">😅</div>
        <div class="bottom-actions">
          <button class="btn btn-secondary" id="go-back-btn">← Go Back</button>
        </div>
      </div>
    `;
    container.querySelector('#go-back-btn')?.addEventListener('click', () => {
      hasExtracted = false;
      actions.goToStep(0);
    });
  }
}

function renderItemsList(container, state, actions) {
  const total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  container.innerHTML = `
    <div class="step-view">
      <div class="step-header">
        ${renderStepIndicator(1)}
        <h1 class="step-title">Your Items</h1>
        <p class="step-subtitle">${state.items.length} items found • Edit anything that looks off</p>
      </div>

      <div class="items-list" id="items-list">
        ${state.items.map(item => renderItemRow(item)).join('')}
      </div>

      <button class="add-item-btn" id="add-item-btn">
        <span>+</span> Add Item Manually
      </button>

      <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-md) 0; border-top: 2px dashed var(--border-pencil);">
        <span style="font-family: var(--font-hand); color: var(--ink-secondary); font-size: 1.1rem; font-weight: 600;">Bill Total</span>
        <span style="font-family: var(--font-mono); font-weight: 500; font-size: var(--fs-h2); color: var(--accent-tomato);">
          ₹${total.toFixed(2)}
        </span>
      </div>

      <div class="bottom-actions">
        <button class="btn btn-secondary" id="back-btn">← Back</button>
        <button class="btn btn-primary" id="next-btn" ${state.items.length === 0 ? 'disabled' : ''}>
          Add Friends →
        </button>
      </div>
    </div>
  `;

  bindItemEvents(container, state, actions);
}

function renderItemRow(item) {
  return `
    <div class="item-row" data-id="${item.id}">
      <span class="item-emoji">${item.emoji}</span>
      <input class="item-name-input" value="${item.name}" data-field="name" />
      <input class="item-qty-input" type="number" value="${item.quantity}" min="1" data-field="quantity" />
      <input class="item-price-input" value="${item.price}" data-field="price" placeholder="₹0" />
      <button class="item-remove" data-action="remove">✕</button>
    </div>
  `;
}

function bindItemEvents(container, state, actions) {
  // Input changes
  container.querySelectorAll('.item-row input').forEach(input => {
    input.addEventListener('change', (e) => {
      const row = e.target.closest('.item-row');
      const id = parseInt(row.dataset.id);
      const field = e.target.dataset.field;
      const item = state.items.find(i => i.id === id);
      if (!item) return;

      if (field === 'name') {
        item.name = e.target.value;
        item.emoji = getDishEmoji(e.target.value);
        row.querySelector('.item-emoji').textContent = item.emoji;
      } else if (field === 'quantity') {
        item.quantity = Math.max(1, parseInt(e.target.value) || 1);
      } else if (field === 'price') {
        item.price = parseFloat(e.target.value) || 0;
      }

      updateTotal(container, state);
    });
  });

  // Remove
  container.querySelectorAll('[data-action="remove"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const row = e.target.closest('.item-row');
      const id = parseInt(row.dataset.id);
      state.items = state.items.filter(i => i.id !== id);
      row.style.opacity = '0';
      row.style.transform = 'translateX(30px)';
      row.style.transition = 'all 200ms ease';
      setTimeout(() => renderItemsList(container, state, actions), 200);
    });
  });

  // Add
  container.querySelector('#add-item-btn')?.addEventListener('click', () => {
    state.items.push({
      id: Date.now(),
      name: 'New Item',
      quantity: 1,
      price: 0,
      emoji: '🍽️',
    });
    renderItemsList(container, state, actions);
    // Focus the new item's name input
    const rows = container.querySelectorAll('.item-row');
    const lastRow = rows[rows.length - 1];
    lastRow?.querySelector('.item-name-input')?.focus();
  });

  // Navigation
  container.querySelector('#back-btn')?.addEventListener('click', () => {
    hasExtracted = false;
    actions.goToStep(0);
  });
  container.querySelector('#next-btn')?.addEventListener('click', () => actions.goToStep(2));
}

function updateTotal(container, state) {
  const total = state.items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  const totalEl = container.querySelector('.bottom-actions')?.previousElementSibling?.querySelector('span:last-child');
  if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
}

export function resetExtractState() {
  hasExtracted = false;
}
