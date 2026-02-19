/**
 * SplitBite — Fun Bill Splitter
 * Main entry point
 */
import './styles/index.css';
import './styles/components.css';

import { renderUpload } from './steps/upload.js';
import { renderExtract, resetExtractState } from './steps/extract.js';
import { renderFriends } from './steps/friends.js';
import { renderAssign } from './steps/assign.js';
import { renderSummary } from './steps/summary.js';

// ─── App State ───
const state = {
  currentStep: 0,
  billImage: null,
  billImageUrl: null,
  ocrRawText: '',
  items: [],        // Array<{ id, name, quantity, price, emoji }>
  friends: [],      // Array<{ id, name, initials, color, emoji }>
  assignments: [],  // Array<{ itemId, friendId }>
};

// ─── Step Renderers ───
const steps = [renderUpload, renderExtract, renderFriends, renderAssign, renderSummary];

// ─── Actions ───
const actions = {
  goToStep(index) {
    if (index < 0 || index >= steps.length) return;
    state.currentStep = index;
    render();
  },

  restart() {
    state.currentStep = 0;
    state.billImage = null;
    state.billImageUrl = null;
    state.ocrRawText = '';
    state.items = [];
    state.friends = [];
    state.assignments = [];
    resetExtractState();
    render();
  },
};

// ─── Render ───
function render() {
  const app = document.querySelector('#app');
  app.innerHTML = '<div class="app-container" id="step-container"></div>';
  const container = app.querySelector('#step-container');
  steps[state.currentStep](container, state, actions);
}

// ─── Init ───
document.addEventListener('DOMContentLoaded', render);
render();
