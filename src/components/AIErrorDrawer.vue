<template>
  <div>
    <!-- Overlay -->
    <div v-if="isErrorDrawerOpen" class="overlay" @click="closeDrawer"></div>

    <!-- Drawer Panel -->
    <div class="drawer" :class="{ 'drawer-open': isErrorDrawerOpen }">
      <div class="drawer-header bg-error-light">
        <div class="d-flex align-center gap-2">
          <span class="error-icon">⚠️</span>
          <h2 class="text-h6 mb-0 text-error font-weight-bold">Échec de Génération IA</h2>
        </div>
        <button class="btn-close" @click="closeDrawer" title="Fermer">×</button>
      </div>

      <div class="drawer-content" v-if="lastAIError">
        <div class="error-card pa-3 mb-4 rounded border-error bg-error-xlight">
          <div class="font-weight-bold text-error mb-1">Message d'erreur :</div>
          <div class="error-msg">{{ lastAIError.message }}</div>
        </div>

        <div class="info-group mb-4">
          <span class="info-label">Champ concerné :</span>
          <span class="info-value">{{ lastAIError.fieldLabel }}</span>
        </div>

        <div class="info-group mb-4">
          <span class="info-label">Date/Heure :</span>
          <span class="info-value">{{ lastAIError.timestamp }}</span>
        </div>

        <div v-if="lastAIError.responseStatus" class="info-group mb-4">
          <span class="info-label">Code HTTP :</span>
          <span class="info-value badge-status">{{ lastAIError.responseStatus }}</span>
        </div>

        <div class="section-title mt-4 mb-2">Prompt envoyé à l'IA</div>
        <div class="prompt-box pa-3 rounded border bg-grey-lighten-4 mb-4">
          {{ lastAIError.prompt }}
        </div>

        <div v-if="lastAIError.rawResponse" class="section-title mt-2 mb-2">Réponse brute de l'API</div>
        <pre v-if="lastAIError.rawResponse" class="raw-box pa-3 rounded border bg-grey-lighten-4">{{ lastAIError.rawResponse }}</pre>

        <div class="section-title mt-4 mb-2 text-primary">💡 Recommandations de dépannage</div>
        <ul class="troubleshoot-list pl-4">
          <li>Vérifiez votre <strong>clé API OpenRouter</strong> dans les préférences (icône ⚙️ en bas à droite).</li>
          <li>Assurez-vous d'avoir une connexion internet active.</li>
          <li>Vérifiez si le modèle sélectionné (par exemple <code>nvidia/nemotron-3-super-120b-a12b:free</code>) est disponible et gratuit ou si votre compte a des crédits suffisants.</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isErrorDrawerOpen, lastAIError } from '../utils/aiSettings';

function closeDrawer() {
  isErrorDrawerOpen.value = false;
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
  border-bottom: 1px solid #fecaca;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bg-error-light {
  background-color: #fee2e2;
}

.bg-error-xlight {
  background-color: #fef2f2;
}

.border-error {
  border: 1px solid #fca5a5;
}

.text-error {
  color: #dc2626;
}

.error-icon {
  font-size: 1.4rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.6rem;
  cursor: pointer;
  color: #7f1d1d;
  padding: 0 0.5rem;
  line-height: 1;
  transition: color 0.1s;
}

.btn-close:hover {
  color: #dc2626;
}

.drawer-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  font-size: 0.9rem;
  color: #374151;
}

.error-msg {
  color: #b91c1c;
  font-family: monospace;
  word-break: break-word;
  white-space: pre-wrap;
}

.info-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px dashed #e5e7eb;
  padding-bottom: 0.5rem;
}

.info-label {
  font-weight: 600;
  color: #4b5563;
}

.info-value {
  color: #111827;
}

.badge-status {
  background-color: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
}

.section-title {
  font-weight: bold;
  font-size: 0.95rem;
  border-left: 3px solid #8b5cf6;
  padding-left: 8px;
  color: #1f2937;
}

.prompt-box, .raw-box {
  font-family: monospace;
  font-size: 0.8rem;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 150px;
  overflow-y: auto;
  border-color: #e5e7eb;
}

.troubleshoot-list li {
  margin-bottom: 0.4rem;
  line-height: 1.35;
}

@media print {
  .overlay, .drawer {
    display: none !important;
  }
}
</style>
