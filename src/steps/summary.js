/**
 * Step 5: Summary — Per-person breakdown + grand total
 */
import { renderStepIndicator } from './upload.js';

export function renderSummary(container, state, actions) {
  const friendTotals = state.friends.map(friend => {
    const friendAssignments = state.assignments.filter(a => a.friendId === friend.id);
    const items = friendAssignments.map(a => state.items.find(i => i.id === a.itemId)).filter(Boolean);
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return { friend, items, total };
  });

  const grandTotal = friendTotals.reduce((sum, ft) => sum + ft.total, 0);

  container.innerHTML = `
    <div class="step-view">
      <div class="step-header">
        ${renderStepIndicator(4)}
        <h1 class="step-title">Bill Summary</h1>
        <p class="step-subtitle">Here's what everyone owes 🎉</p>
      </div>

      <div class="summary-cards" id="summary-cards">
        ${friendTotals.map(ft => renderSummaryCard(ft)).join('')}
      </div>

      <div class="summary-grand-total">
        <span class="summary-grand-label">Grand Total</span>
        <span class="summary-grand-value">₹${grandTotal.toFixed(2)}</span>
      </div>

      <div class="bottom-actions">
        <button class="btn btn-secondary" id="back-btn">← Edit</button>
        <button class="btn btn-teal" id="share-btn">📋 Copy Summary</button>
        <button class="btn btn-primary" id="restart-btn">🔄 New Bill</button>
      </div>
    </div>
  `;

  // Confetti on first render
  launchConfetti();

  container.querySelector('#back-btn')?.addEventListener('click', () => actions.goToStep(3));
  container.querySelector('#restart-btn')?.addEventListener('click', () => actions.restart());
  container.querySelector('#share-btn')?.addEventListener('click', () => {
    copySummary(friendTotals, grandTotal);
    const btn = container.querySelector('#share-btn');
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy Summary', 2000);
  });
}

function renderSummaryCard(ft) {
  return `
    <div class="summary-card">
      <div class="summary-card-header">
        <div class="summary-card-person">
          <div class="summary-card-avatar" style="background: ${ft.friend.color};">
            ${ft.friend.emoji || ft.friend.initials}
          </div>
          <span class="summary-card-name">${ft.friend.name}</span>
        </div>
        <span class="summary-card-total">₹${ft.total.toFixed(2)}</span>
      </div>
      <div class="summary-card-items">
        ${ft.items.map(item => `
          <div class="summary-item-row">
            <span class="summary-item-name">
              ${item.emoji} ${item.name} ${item.quantity > 1 ? `×${item.quantity}` : ''}
            </span>
            <span class="summary-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')}

        ${ft.items.length === 0 ? `
          <div class="summary-item-row">
            <span style="color: var(--ink-faint); font-style: italic;">No items assigned</span>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function copySummary(friendTotals, grandTotal) {
  const lines = ['🍽️ SplitBite — Bill Summary', ''];

  for (const ft of friendTotals) {
    lines.push(`${ft.friend.emoji || '👤'} ${ft.friend.name}: ₹${ft.total.toFixed(2)}`);
    for (const item of ft.items) {
      lines.push(`  • ${item.emoji} ${item.name} ${item.quantity > 1 ? `×${item.quantity}` : ''} — ₹${(item.price * item.quantity).toFixed(2)}`);
    }
    lines.push('');
  }

  lines.push(`💰 Grand Total: ₹${grandTotal.toFixed(2)}`);

  navigator.clipboard?.writeText(lines.join('\n')).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = lines.join('\n');
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  });
}

function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#d44527', '#5a7a5a', '#c4952a', '#e8d5b5', '#b87333', '#8b6914', '#c05a3c'];

  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      w: Math.random() * 10 + 5,
      h: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 3 + 2,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
    });
  }

  let frame = 0;
  const maxFrames = 180;

  function animate() {
    if (frame >= maxFrames) {
      canvas.remove();
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.05;
      p.rotation += p.rotationSpeed;
      p.opacity = Math.max(0, 1 - frame / maxFrames);

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    frame++;
    requestAnimationFrame(animate);
  }

  animate();
}
