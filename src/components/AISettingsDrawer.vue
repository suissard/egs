<template>
  <div>
    <!-- Floating Action Button -->
    <button class="fab-btn" @click="toggleDrawer" title="Paramètres IA">
      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
    </button>

    <!-- Overlay -->
    <div v-if="isOpen" class="overlay" @click="toggleDrawer"></div>

    <!-- Drawer Panel -->
    <div class="drawer" :class="{ 'drawer-open': isOpen }">
      <div class="drawer-header">
        <h2 class="text-h6 mb-0">Paramètres OpenRouter</h2>
        <button class="btn-close" @click="toggleDrawer" title="Fermer">×</button>
      </div>

      <div class="drawer-content">
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
            placeholder="Ex: openrouter/free"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { openRouterApiKey, openRouterModel } from '../utils/aiSettings';

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
  background-color: var(--primary);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  cursor: pointer;
  z-index: 1000;
  transition: transform 0.2s, background-color 0.2s;
}

.fab-btn:hover {
  transform: scale(1.05);
  background-color: #1976D2;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

.drawer {
  position: fixed;
  top: 0;
  right: -350px;
  width: 350px;
  height: 100vh;
  background-color: white;
  box-shadow: -4px 0 15px rgba(0,0,0,0.1);
  z-index: 1002;
  transition: right 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
}

.drawer-open {
  right: 0;
}

.drawer-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--background);
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color);
  padding: 0 0.5rem;
  line-height: 1;
}

.btn-close:hover {
  color: var(--primary);
}

.drawer-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}
</style>
