<template>
  <div>
    <!-- Overlay -->
    <div v-if="isPromptEditorOpen" class="overlay" @click="closePromptEditor"></div>

    <!-- Drawer Panel -->
    <div class="drawer" :class="{ 'drawer-open': isPromptEditorOpen }">
      <div class="drawer-header bg-primary text-white">
        <h2 class="text-h6 mb-0 d-flex align-center gap-2">
          <span>⚙️ Éditeur de Prompt IA</span>
        </h2>
        <button class="btn-close text-white" @click="closePromptEditor" title="Fermer">×</button>
      </div>

      <div class="drawer-content" v-if="activePromptNode">

        <div class="alert alert-warning mb-4 shadow-sm" style="background-color: #fff3cd; color: #856404; border-color: #ffeeba;">
            <h4 class="font-weight-bold mb-1">⚠️ Attention</h4>
            <p class="text-caption mb-0">L'Intelligence Artificielle peut générer des informations inexactes ou inappropriées. <strong>Il est impératif de relire et de valider</strong> avec esprit critique tout contenu généré avant de l'utiliser.</p>
        </div>

        <div class="mb-4">
            <label class="input-label font-weight-bold d-block mb-1 text-primary">Champ concerné</label>
            <div class="pa-2 bg-grey-lighten-4 rounded border">
                <strong>{{ activePromptNode.label }}</strong> <span class="text-caption text-grey">({{ activePromptNode.inputType }})</span>
            </div>
        </div>

        <div class="input-group">
          <label class="input-label font-weight-bold d-flex justify-space-between">
              <span>Prompt envoyé à l'IA</span>
              <span class="text-caption text-grey" title="Tapez double accolade pour insérer une variable dynamique">Astuce: tapez double accolade</span>
          </label>
          <RichTextPromptEditor :model-value="activePromptNode.aiPrompt || ''" @update:model-value="val => { if(activePromptNode) activePromptNode.aiPrompt = val; }" />
          <small class="text-muted d-block mt-2">
            Utilisez les crochets <code>{{ 'id' }}</code> pour insérer dynamiquement les réponses d'autres champs.
          </small>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isPromptEditorOpen, activePromptNode, closePromptEditor } from '../utils/promptEditorState';
import RichTextPromptEditor from './RichTextPromptEditor.vue';
</script>

<style scoped>
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
  right: -400px;
  width: 400px;
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
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
  line-height: 1;
}

.btn-close:hover {
  opacity: 0.8;
}

.drawer-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}
</style>
