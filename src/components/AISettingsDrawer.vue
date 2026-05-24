<template>
  <div>
    <!-- Floating Action Button -->
    <button class="fab-btn" @click="toggleDrawer" title="Préférences">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    </button>

    <!-- Overlay -->
    <div v-if="isOpen" class="overlay" @click="toggleDrawer"></div>

    <!-- Drawer Panel -->
    <div class="drawer" :class="{ 'drawer-open': isOpen }">
      <div class="drawer-header">
        <h2 class="text-h6 mb-0">Préférences</h2>
        <button class="btn-close" @click="toggleDrawer" title="Fermer">×</button>
      </div>

      <div class="drawer-content">

        <div class="doc-links mt-6 mb-4">
          <h3 class="text-h6 mb-3 border-bottom pb-2">Documentation</h3>
          <button class="btn btn-secondary btn-block mb-2" @click="openDoc('usage')">Tutoriel : Usage de base</button>
          <button class="btn btn-warning btn-block mb-4" @click="openDoc('editor')" style="color: black;">Tutoriel : Mode Édition</button>
        </div>

        <h3 class="text-h6 mb-3 border-bottom pb-2">Intelligence Artificielle</h3>

        <div class="input-group">
          <label class="input-label font-weight-bold">Clé API OpenRouter</label>
          <input
            type="password"
            v-model="openRouterApiKey"
            class="input-field"
            placeholder="sk-or-v1-..."
          />
          <small class="text-muted d-block mt-1">La clé est sauvegardée localement dans votre navigateur.</small>
        </div>

        <div class="input-group">
          <label class="input-label font-weight-bold">Modèle</label>
          <input
            type="text"
            v-model="openRouterModel"
            class="input-field"
            placeholder="Ex: nvidia/nemotron-3-super-120b-a12b:free"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { openRouterApiKey, openRouterModel } from '../utils/aiSettings';


const emit = defineEmits(['open-doc']);

function openDoc(mode: 'usage' | 'editor') {
  emit('open-doc', mode);
  toggleDrawer();
}

const isOpen = ref(false);

function toggleDrawer() {
  isOpen.value = !isOpen.value;
}
</script>

<style scoped>
.fab-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 12px 28px -4px rgba(59, 130, 246, 0.5);
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(15, 23, 42, 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 1001;
  transition: opacity 0.3s ease;
}

.drawer {
  position: fixed;
  top: 0;
  right: -380px;
  width: 380px;
  height: 100vh;
  background-color: white;
  box-shadow: -10px 0 30px rgba(15, 23, 42, 0.08);
  z-index: 1002;
  transition: right 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.drawer-open {
  right: 0;
}

.drawer-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f8fafc;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  cursor: pointer;
  color: var(--text-muted);
  padding: 0 0.5rem;
  line-height: 1;
  transition: color 0.2s;
}

.btn-close:hover {
  color: var(--primary);
}

.drawer-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

@media print {
  .fab-btn {
    display: none !important;
  }
}
</style>
