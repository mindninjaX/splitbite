/**
 * Step 3: Friends — Add people to split the bill with
 */
import { getAvatarColor, getInitials } from '../utils/dishes.js';
import { renderStepIndicator } from './upload.js';

const EMOJI_OPTIONS = ['😀', '😎', '🤓', '🥳', '😸', '🐶', '🦊', '🐻', '🐼', '🦄', '🌸', '🔥', '⭐', '💎', '🎯'];

export function renderFriends(container, state, actions) {
  container.innerHTML = `
    <div class="step-view">
      <div class="step-header">
        ${renderStepIndicator(2)}
        <h1 class="step-title">Who's Splitting?</h1>
        <p class="step-subtitle">Add friends to share the bill with</p>
      </div>

      <div class="friends-input-row">
        <input
          class="friend-input"
          id="friend-name-input"
          type="text"
          placeholder="Enter friend's name..."
          autocomplete="off"
        />
        <button class="btn btn-teal btn-small" id="add-friend-btn">Add</button>
      </div>

      <div class="friends-grid" id="friends-grid">
        ${state.friends.map(f => renderFriendChip(f)).join('')}
      </div>

      ${state.friends.length === 0 ? `
        <div class="empty-state">
          <div class="empty-state-icon">👥</div>
          <p class="empty-state-text">Add at least 2 people to start splitting</p>
        </div>
      ` : ''}

      ${state.friends.length > 0 && state.friends.length < 2 ? `
        <p style="text-align: center; color: var(--text-muted); font-size: var(--fs-small); margin-bottom: var(--space-md);">
          Add at least one more friend
        </p>
      ` : ''}

      <div class="bottom-actions">
        <button class="btn btn-secondary" id="back-btn">← Back</button>
        <button class="btn btn-primary" id="next-btn" ${state.friends.length < 2 ? 'disabled' : ''}>
          Assign Dishes →
        </button>
      </div>
    </div>
  `;

  bindFriendEvents(container, state, actions);
}

function renderFriendChip(friend) {
  return `
    <div class="friend-chip" data-id="${friend.id}">
      <div class="friend-avatar" style="background: ${friend.color};">
        ${friend.emoji || friend.initials}
      </div>
      <span class="friend-name">${friend.name}</span>
      <button class="friend-remove" data-action="remove-friend">✕</button>
    </div>
  `;
}

function bindFriendEvents(container, state, actions) {
  const input = container.querySelector('#friend-name-input');
  const addBtn = container.querySelector('#add-friend-btn');

  function addFriend() {
    const name = input.value.trim();
    if (!name) return;
    if (state.friends.some(f => f.name.toLowerCase() === name.toLowerCase())) {
      input.value = '';
      input.placeholder = 'Name already added!';
      setTimeout(() => input.placeholder = "Enter friend's name...", 2000);
      return;
    }

    const friend = {
      id: Date.now(),
      name,
      initials: getInitials(name),
      color: getAvatarColor(name, state.friends.length),
      emoji: null,
    };

    state.friends.push(friend);
    input.value = '';
    renderFriends(container, state, actions);
    container.querySelector('#friend-name-input')?.focus();
  }

  addBtn?.addEventListener('click', addFriend);
  input?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addFriend();
  });

  // Toggle emoji on avatar click
  container.querySelectorAll('.friend-avatar').forEach(avatar => {
    avatar.addEventListener('click', (e) => {
      const chip = e.target.closest('.friend-chip');
      const id = parseInt(chip.dataset.id);
      const friend = state.friends.find(f => f.id === id);
      if (!friend) return;

      // Cycle through emojis
      if (!friend.emoji) {
        friend.emoji = EMOJI_OPTIONS[0];
      } else {
        const idx = EMOJI_OPTIONS.indexOf(friend.emoji);
        if (idx >= EMOJI_OPTIONS.length - 1) {
          friend.emoji = null; // Back to initials
        } else {
          friend.emoji = EMOJI_OPTIONS[idx + 1];
        }
      }

      avatar.textContent = friend.emoji || friend.initials;
      avatar.style.fontSize = friend.emoji ? '1.2rem' : 'var(--fs-small)';
    });
  });

  // Remove
  container.querySelectorAll('[data-action="remove-friend"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const chip = e.target.closest('.friend-chip');
      const id = parseInt(chip.dataset.id);
      state.friends = state.friends.filter(f => f.id !== id);
      // Also remove assignments
      state.assignments = state.assignments.filter(a => a.friendId !== id);
      chip.style.transform = 'scale(0)';
      chip.style.opacity = '0';
      chip.style.transition = 'all 200ms ease';
      setTimeout(() => renderFriends(container, state, actions), 200);
    });
  });

  // Navigation
  container.querySelector('#back-btn')?.addEventListener('click', () => actions.goToStep(1));
  container.querySelector('#next-btn')?.addEventListener('click', () => actions.goToStep(3));

  // Focus input on load
  input?.focus();
}
