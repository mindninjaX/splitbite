/**
 * Step 4: Assign — Drag dishes to friends
 */
import { makeDraggable, makeDropZone } from '../utils/drag-drop.js';
import { renderStepIndicator } from './upload.js';

export function renderAssign(container, state, actions) {
  const unassigned = getUnassignedItems(state);
  const allAssigned = unassigned.length === 0 && state.items.length > 0;

  container.innerHTML = `
    <div class="step-view">
      <div class="step-header">
        ${renderStepIndicator(3)}
        <h1 class="step-title">Drag & Drop</h1>
        <p class="step-subtitle">Drag each dish to the person who ordered it</p>
      </div>

      <div class="assign-layout">
        <div class="assign-dishes-section">
          <h3>
            🍽️ Dishes
            ${unassigned.length > 0 ? `<span class="unassigned-count">${unassigned.length} left</span>` : ''}
            ${allAssigned ? '<span style="color: var(--accent-sage); font-size: var(--fs-small); font-weight: 500;">✓ All assigned!</span>' : ''}
          </h3>
          <div class="dish-card-grid" id="dish-grid">
            ${state.items.map(item => renderDishCard(item, state)).join('')}
          </div>
        </div>

        <div class="assign-friends-section">
          <h3>👥 Drop Here</h3>
          <div class="drop-zones" id="drop-zones">
            ${state.friends.map(f => renderDropZone(f, state)).join('')}
          </div>
        </div>
      </div>

      <div class="bottom-actions">
        <button class="btn btn-secondary" id="back-btn">← Back</button>
        <button class="btn btn-primary" id="next-btn" ${!allAssigned ? 'disabled' : ''}>
          See Totals →
        </button>
      </div>
    </div>
  `;

  setupDragDrop(container, state, actions);

  container.querySelector('#back-btn')?.addEventListener('click', () => actions.goToStep(2));
  container.querySelector('#next-btn')?.addEventListener('click', () => actions.goToStep(4));
}

function renderDishCard(item, state) {
  const isAssigned = state.assignments.some(a => a.itemId === item.id);

  return `
    <div class="dish-card ${isAssigned ? 'assigned' : ''}" data-item-id="${item.id}">
      <div class="dish-card-inner">
        <div class="dish-emoji">${item.emoji}</div>
        <div class="dish-name" title="${item.name}">${item.name}</div>
        <div class="dish-meta">
          <span class="dish-qty">×${item.quantity}</span>
          <span class="dish-price">₹${item.price}</span>
        </div>
      </div>
    </div>
  `;
}

function renderDropZone(friend, state) {
  const friendAssignments = state.assignments.filter(a => a.friendId === friend.id);
  const friendItems = friendAssignments.map(a => state.items.find(i => i.id === a.itemId)).filter(Boolean);
  const total = friendItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return `
    <div class="drop-zone" data-friend-id="${friend.id}">
      <div class="drop-zone-avatar" style="background: ${friend.color};">
        ${friend.emoji || friend.initials}
      </div>
      <div class="drop-zone-info">
        <div class="drop-zone-name">${friend.name}</div>
        ${friendItems.length > 0 ? `
          <div class="drop-zone-items">
            ${friendItems.map(item => `
              <span class="drop-zone-item-tag" data-remove-item="${item.id}" data-remove-friend="${friend.id}">
                ${item.emoji} ${item.name} <span class="tag-remove">✕</span>
              </span>
            `).join('')}
          </div>
        ` : '<span class="drop-zone-empty">Drag dishes here</span>'}
      </div>
      ${total > 0 ? `<div class="drop-zone-total">₹${total.toFixed(0)}</div>` : ''}
    </div>
  `;
}

function setupDragDrop(container, state, actions) {
  // Make unassigned dishes draggable
  container.querySelectorAll('.dish-card:not(.assigned)').forEach(card => {
    const itemId = parseInt(card.dataset.itemId);
    makeDraggable(card, { itemId });
  });

  // Make friend zones droppable
  container.querySelectorAll('.drop-zone').forEach(zone => {
    const friendId = parseInt(zone.dataset.friendId);
    makeDropZone(zone, (data) => {
      // Check if already assigned
      const existing = state.assignments.find(a => a.itemId === data.itemId);
      if (existing) return; // Already assigned

      state.assignments.push({
        itemId: data.itemId,
        friendId: friendId,
      });

      renderAssign(container, state, actions);
    });
  });

  // Remove assignment by clicking tag
  container.querySelectorAll('.drop-zone-item-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      const itemId = parseInt(tag.dataset.removeItem);
      const friendId = parseInt(tag.dataset.removeFriend);
      state.assignments = state.assignments.filter(
        a => !(a.itemId === itemId && a.friendId === friendId)
      );
      renderAssign(container, state, actions);
    });
  });
}

function getUnassignedItems(state) {
  const assignedIds = new Set(state.assignments.map(a => a.itemId));
  return state.items.filter(i => !assignedIds.has(i.id));
}
