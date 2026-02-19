/**
 * Drag & Drop utility with touch support
 */

/**
 * Make an element draggable
 * @param {HTMLElement} element - Element to make draggable
 * @param {object} data - Data to transfer on drag
 */
export function makeDraggable(element, data) {
  element.setAttribute('draggable', 'true');

  element.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'move';
    element.classList.add('dragging');

    // Create a custom drag image
    const ghost = element.cloneNode(true);
    ghost.style.transform = 'rotate(5deg) scale(1.05)';
    ghost.style.opacity = '0.9';
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px';
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2);
    setTimeout(() => ghost.remove(), 0);
  });

  element.addEventListener('dragend', () => {
    element.classList.remove('dragging');
  });

  // Touch support
  setupTouchDrag(element, data);
}

/**
 * Make an element a drop zone
 * @param {HTMLElement} element - Element to make a drop zone
 * @param {function} onDrop - Callback when item is dropped
 */
export function makeDropZone(element, onDrop) {
  element.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    element.classList.add('drag-over');
  });

  element.addEventListener('dragleave', (e) => {
    // Only remove if leaving the element itself (not a child)
    if (!element.contains(e.relatedTarget)) {
      element.classList.remove('drag-over');
    }
  });

  element.addEventListener('drop', (e) => {
    e.preventDefault();
    element.classList.remove('drag-over');

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      onDrop(data);
    } catch (err) {
      console.warn('Drop parse error:', err);
    }
  });

  // Touch drop support
  element._dropHandler = onDrop;
  element.classList.add('drop-target');
}

// ─── Touch Drag Support ───

let touchDragEl = null;
let touchGhost = null;
let touchData = null;

function setupTouchDrag(element, data) {
  let startX, startY;
  let isDragging = false;

  element.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = false;
  }, { passive: true });

  element.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;

    if (!isDragging && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      isDragging = true;
      touchDragEl = element;
      touchData = data;
      element.classList.add('dragging');

      // Create ghost
      touchGhost = element.cloneNode(true);
      touchGhost.style.position = 'fixed';
      touchGhost.style.zIndex = '10000';
      touchGhost.style.pointerEvents = 'none';
      touchGhost.style.opacity = '0.85';
      touchGhost.style.transform = 'rotate(5deg) scale(1.05)';
      touchGhost.style.width = element.offsetWidth + 'px';
      touchGhost.style.transition = 'none';
      document.body.appendChild(touchGhost);
    }

    if (isDragging) {
      e.preventDefault();
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      touchGhost.style.left = (x - element.offsetWidth / 2) + 'px';
      touchGhost.style.top = (y - element.offsetHeight / 2) + 'px';

      // Highlight drop zone under finger
      const target = document.elementFromPoint(x, y);
      document.querySelectorAll('.drop-target').forEach(dz => dz.classList.remove('drag-over'));
      const dropZone = target?.closest('.drop-target');
      if (dropZone) dropZone.classList.add('drag-over');
    }
  }, { passive: false });

  element.addEventListener('touchend', (e) => {
    if (isDragging && touchGhost) {
      const x = e.changedTouches[0].clientX;
      const y = e.changedTouches[0].clientY;

      // Find drop zone
      touchGhost.style.display = 'none';
      const target = document.elementFromPoint(x, y);
      touchGhost.style.display = '';

      const dropZone = target?.closest('.drop-target');
      if (dropZone && dropZone._dropHandler) {
        dropZone._dropHandler(touchData);
      }

      // Cleanup
      document.querySelectorAll('.drop-target').forEach(dz => dz.classList.remove('drag-over'));
      touchGhost.remove();
      touchGhost = null;
      element.classList.remove('dragging');
    }

    isDragging = false;
    touchDragEl = null;
    touchData = null;
  }, { passive: true });
}
