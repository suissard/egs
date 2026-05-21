<template>
  <div>
    <!-- Overlay -->
    <div v-if="isOrphanDrawerOpen" class="overlay" @click="closeDrawer"></div>

    <!-- Drawer Panel -->
    <div class="drawer" :class="{ 'drawer-open': isOrphanDrawerOpen }">
      <div class="drawer-header bg-warning-light">
        <div class="d-flex align-center gap-2">
          <span class="warning-icon">⚠️</span>
          <h2 class="text-h6 mb-0 text-warning-dark font-weight-bold">Structure différente détectée</h2>
        </div>
        <button class="btn-close" @click="closeDrawer" title="Fermer">×</button>
      </div>

      <div class="drawer-content">
        <div class="alert-info pa-3 mb-4 rounded border bg-warning-xlight text-warning-darker">
          <p class="font-weight-medium mb-2">
            Certaines données de votre fichier d'import n'ont pas trouvé de place car leurs champs n'existent pas (ou plus) dans ce formulaire.
          </p>
          <p class="text-subtitle-2 mb-0">
            Vous pouvez les copier ci-dessous pour les reporter manuellement si nécessaire.
          </p>
        </div>

        <div class="d-flex justify-space-between align-center mb-4">
          <span class="text-subtitle-1 font-weight-bold">{{ Object.keys(orphanedData).length }} élément(s) orphelin(s)</span>
          <button class="btn btn-secondary btn-sm" @click="copyAll">
            📋 Tout copier
          </button>
        </div>

        <div class="orphans-list">
          <div v-for="(value, key) in orphanedData" :key="key" class="orphan-item pa-3 mb-3 rounded border bg-grey-lighten-5">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="orphan-key font-weight-bold text-primary">{{ key }}</span>
              <button class="btn-copy-action" @click="copyValue(value, key)" :title="'Copier la valeur de ' + key">
                <span v-if="copiedKey === key" class="text-success text-xs font-weight-bold">Copié ! ✅</span>
                <span v-else>Copier 📋</span>
              </button>
            </div>
            
            <div class="orphan-value-container">
              <!-- If value is an array or object, format it nicely -->
              <pre v-if="typeof value === 'object' || Array.isArray(value)" class="orphan-value-pre">{{ formatValue(value) }}</pre>
              <div v-else class="orphan-value-text">{{ value }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { isOrphanDrawerOpen, orphanedData, closeOrphanDrawer } from '../utils/orphanImportState';

const copiedKey = ref<string | null>(null);

function closeDrawer() {
  closeOrphanDrawer();
}

function formatValue(val: any): string {
  if (Array.isArray(val)) {
    // Check if it's a table (2D array)
    if (val.every(item => Array.isArray(item))) {
      return val.map(row => row.join(' | ')).join('\n');
    }
    return val.join(', ');
  }
  if (typeof val === 'object' && val !== null) {
    return JSON.stringify(val, null, 2);
  }
  return String(val);
}

async function copyValue(val: any, key: string) {
  let textToCopy = '';
  if (typeof val === 'object' && val !== null) {
    textToCopy = JSON.stringify(val, null, 2);
  } else {
    textToCopy = String(val);
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
    copiedKey.value = key;
    setTimeout(() => {
      if (copiedKey.value === key) {
        copiedKey.value = null;
      }
    }, 2000);
  } catch (err) {
    console.error('Failed to copy', err);
  }
}

async function copyAll() {
  try {
    const formatted = JSON.stringify(orphanedData.value, null, 2);
    await navigator.clipboard.writeText(formatted);
    alert('Toutes les données orphelines ont été copiées dans votre presse-papier !');
  } catch (err) {
    console.error('Failed to copy all', err);
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 2001;
}

.drawer {
  position: fixed;
  top: 0;
  right: -420px;
  width: 420px;
  height: 100vh;
  background-color: white;
  box-shadow: -4px 0 15px rgba(0,0,0,0.15);
  z-index: 2002;
  transition: right 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
}

.drawer-open {
  right: 0;
}

.drawer-header {
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #fde68a;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bg-warning-light {
  background-color: #fef3c7;
}

.bg-warning-xlight {
  background-color: #fffbeb;
  border-color: #fde68a;
}

.text-warning-dark {
  color: #b45309;
}

.text-warning-darker {
  color: #78350f;
}

.warning-icon {
  font-size: 1.4rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #78350f;
  padding: 0 0.5rem;
  line-height: 1;
  transition: color 0.1s;
}

.btn-close:hover {
  color: #b45309;
}

.drawer-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  font-size: 0.95rem;
  color: #374151;
}

.text-subtitle-2 {
  font-size: 0.85rem;
  opacity: 0.9;
}

.font-weight-medium {
  font-weight: 500;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
}

.orphans-list {
  max-height: calc(100vh - 280px);
  overflow-y: auto;
  padding-right: 2px;
}

.orphan-item {
  border: 1px solid #e2e8f0;
  transition: border-color 0.2s;
}

.orphan-item:hover {
  border-color: var(--primary);
}

.orphan-key {
  font-family: monospace;
  font-size: 0.95rem;
  word-break: break-all;
}

.btn-copy-action {
  background: none;
  border: none;
  font-size: 0.85rem;
  color: var(--primary);
  font-weight: bold;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.btn-copy-action:hover {
  background-color: #eff6ff;
}

.text-xs {
  font-size: 0.75rem;
}

.orphan-value-container {
  font-size: 0.9rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-sm);
  padding: 0.5rem;
  color: var(--text-main);
  max-height: 200px;
  overflow-y: auto;
}

.orphan-value-pre {
  font-family: monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
}

.orphan-value-text {
  word-break: break-word;
  white-space: pre-wrap;
}

@media print {
  .overlay, .drawer {
    display: none !important;
  }
}
</style>
