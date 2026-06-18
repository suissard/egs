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
          <div class="mt-2" v-if="openRouterApiKey">
             <button class="btn btn-secondary btn-block" @click="copyTokenLink">
               {{ copyButtonText }}
             </button>
          </div>
        </div>

        <div class="input-group">
          <label class="input-label font-weight-bold">Modèle</label>
          <div class="model-selector">
            <div v-if="isLoadingModels" class="text-center text-muted py-2">
              ⏳ Chargement des modèles gratuits...
            </div>
            <select
              v-else
              v-model="openRouterModel"
              class="input-field"
              @change="onModelChange"
            >
              <option value="">-- Sélectionner un modèle --</option>
              <option v-for="model in freeModels" :key="model" :value="model">
                {{ model }}
              </option>
            </select>
          </div>
          <div class="mt-2">
            <small class="text-muted d-block">Modèle personnalisé (optionnel):</small>
            <input
              type="text"
              v-model="customModel"
              class="input-field"
              @change="applyCustomModel"
              placeholder="Ex: google/gemma-4-31b-it:free"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { openRouterApiKey, openRouterModel, freeModels, isLoadingModels, fetchFreeModels } from '../utils/aiSettings';

const emit = defineEmits(['open-doc']);
const customModel = ref('');
const isOpen = ref(false);
const copyButtonText = ref('🔗 Partager le token via un lien');
let hasLoadedModels = false;

function openDoc(mode: 'usage' | 'editor') {
  emit('open-doc', mode);
  toggleDrawer();
}

async function copyTokenLink() {
  if (!openRouterApiKey.value) return;
  const currentUrl = window.location.origin + window.location.pathname;
  const urlWithToken = `${currentUrl}?aiToken=${encodeURIComponent(openRouterApiKey.value)}`;
  try {
    await navigator.clipboard.writeText(urlWithToken);
    copyButtonText.value = '✅ Lien copié !';
    setTimeout(() => {
      copyButtonText.value = '🔗 Partager le token via un lien';
    }, 2000);
  } catch (e) {
    console.error('Failed to copy', e);
  }
}

function toggleDrawer() {
  isOpen.value = !isOpen.value;
}

async function loadFreeModels() {
  await fetchFreeModels();
  if (freeModels.value.length > 0 && !openRouterModel.value) {
    openRouterModel.value = freeModels.value[0];
  }
}

function onModelChange() {
  customModel.value = '';
}

function applyCustomModel() {
  if (customModel.value.trim()) {
    openRouterModel.value = customModel.value.trim();
  }
}

// Charger les modèles quand le drawer s'ouvre
watch(isOpen, (newValue) => {
  if (newValue && !hasLoadedModels) {
    loadFreeModels();
    hasLoadedModels = true;
  }
});

onMounted(() => {
  // Charger les modèles au montage du composant
  loadFreeModels();
  hasLoadedModels = true;
});
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

.model-selector {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.model-selector select {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid var(--border);
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.model-selector select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.875rem;
  white-space: nowrap;
}

.btn-sm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
