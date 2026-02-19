/**
 * Step 1: Upload — Camera/file upload with image preview
 */

export function renderUpload(container, state, actions) {
  container.innerHTML = `
    <div class="step-view">
      <div class="step-header">
        ${renderStepIndicator(0)}
        <h1 class="step-title">Snap Your Bill</h1>
        <p class="step-subtitle">Take a photo or upload an image of your restaurant bill</p>
      </div>

      <div id="upload-content">
        ${state.billImage ? renderPreview(state) : renderUploadZone()}
      </div>

      <div class="bottom-actions">
        ${state.billImage ? `
          <button class="btn btn-secondary" id="change-image">Change</button>
          <button class="btn btn-primary" id="extract-btn">
            🔍 Extract Items
          </button>
        ` : ''}
      </div>
    </div>
  `;

  // Bindings
  const fileInput = container.querySelector('#bill-file-input');
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) handleFile(file, state, container, actions);
    });
  }

  const zone = container.querySelector('.upload-zone');
  if (zone) {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file, state, container, actions);
    });
  }

  const changeBtn = container.querySelector('#change-image');
  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      state.billImage = null;
      state.billImageUrl = null;
      renderUpload(container, state, actions);
    });
  }

  const extractBtn = container.querySelector('#extract-btn');
  if (extractBtn) {
    extractBtn.addEventListener('click', () => {
      actions.goToStep(1);
    });
  }
}

function handleFile(file, state, container, actions) {
  if (!file.type.startsWith('image/')) return;
  state.billImage = file;
  state.billImageUrl = URL.createObjectURL(file);
  renderUpload(container, state, actions);
}

function renderUploadZone() {
  return `
    <div class="upload-zone" id="upload-zone">
      <span class="upload-zone-icon">📸</span>
      <p class="upload-zone-text">Tap to snap or upload</p>
      <p class="upload-zone-hint">Supports JPG, PNG, HEIC • Max 20MB</p>
      <input type="file" id="bill-file-input" accept="image/*" capture="environment" />
    </div>
  `;
}

function renderPreview(state) {
  return `
    <div class="image-preview">
      <img src="${state.billImageUrl}" alt="Bill preview" />
      <div class="image-preview-overlay">
        <span style="font-size: var(--fs-small); color: var(--ink-muted);">
          ✅ Bill captured — ready to extract
        </span>
      </div>
    </div>
  `;
}

function renderStepIndicator(activeIndex) {
  const steps = 5;
  return `<div class="step-indicator">
    ${Array.from({ length: steps }, (_, i) => `
      <div class="step-dot ${i === activeIndex ? 'active' : i < activeIndex ? 'done' : ''}"></div>
    `).join('')}
  </div>`;
}

export { renderStepIndicator };
