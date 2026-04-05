<template>
  <div class="input-wrapper">
    <!-- Text Input -->
    <div v-if="['text', 'email', 'tel', 'number', 'password'].includes(node.inputType)" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span></span>
        <div v-if="node.aiPrompt !== undefined && openRouterApiKey" class="d-flex align-center gap-1">
          <button @click.prevent="generateAI" class="btn btn-secondary btn-sm" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
            <span v-if="isLoadingAI" class="spinner"></span>
            <span v-else>✨ Générer par IA</span>
          </button>
          <button @click.prevent="openPromptEditor(node)" class="btn btn-secondary btn-sm px-2" :disabled="readonly" type="button" title="Configurer le prompt">
            ⚙️
          </button>
        </div>
      </label>
      <input v-model="node.value" :type="node.inputType" :required="node.required" class="input-field" :disabled="readonly || isLoadingAI" />
    </div>

    <!-- Select Input -->
    <div v-else-if="node.inputType === 'select'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span>
      </label>
      <select v-model="node.value" :required="node.required" class="input-field" :multiple="node.multiple" :disabled="readonly">
        <option v-for="opt in node.options" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </div>

    <!-- Radio Group -->
    <div v-else-if="node.inputType === 'radio'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span>
      </label>
      <div class="d-flex flex-wrap gap-3">
        <label v-for="opt in node.options" :key="opt" class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
          <input type="radio" v-model="node.value" :value="opt" :name="'radio-group-' + node.id" :disabled="readonly">
          {{ opt }}
        </label>
      </div>
    </div>

    <!-- Switch -->
    <div v-else-if="node.inputType === 'switch'" class="input-group d-flex align-center gap-3">
      <label class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
        <input type="checkbox" v-model="node.value" :disabled="readonly">
        <span class="font-weight-bold">{{ node.label }}</span> <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span>
      </label>
    </div>

    <!-- Checkbox (Single or Multiple) -->
    <div v-else-if="node.inputType === 'checkbox'" class="input-group">
      <label class="input-label" v-if="node.options && node.options.length > 0">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span>
      </label>

      <!-- Multiple checkboxes -->
      <div v-if="node.options && node.options.length > 0" class="d-flex flex-wrap gap-3">
        <label v-for="opt in node.options" :key="opt" class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" v-model="node.value" :value="opt" :disabled="readonly">
          {{ opt }}
        </label>
      </div>

      <!-- Single checkbox -->
      <div v-else class="d-flex align-center gap-3">
        <label class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" v-model="node.value" :required="node.required" :disabled="readonly">
          <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span></span>
        </label>
      </div>
    </div>

    <!-- Date Input -->
    <div v-else-if="node.inputType === 'date'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span>
      </label>
      <input v-model="node.value" type="date" :required="node.required" class="input-field" :disabled="readonly" />
    </div>

    <!-- Textarea -->
    <div v-else-if="node.inputType === 'textarea'" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span></span>
        <div v-if="node.aiPrompt !== undefined && openRouterApiKey" class="d-flex align-center gap-1">
          <button @click.prevent="generateAI" class="btn btn-secondary btn-sm" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
            <span v-if="isLoadingAI" class="spinner"></span>
            <span v-else>✨ Générer par IA</span>
          </button>
          <button @click.prevent="openPromptEditor(node)" class="btn btn-secondary btn-sm px-2" :disabled="readonly" type="button" title="Configurer le prompt">
            ⚙️
          </button>
        </div>
      </label>
      <textarea v-model="node.value" :required="node.required" class="input-field" rows="3" :disabled="readonly || isLoadingAI" @input="autoResize" ref="textareaRef" style="overflow:hidden;"></textarea>
    </div>

    <!-- Slider -->
    <div v-else-if="node.inputType === 'slider'" class="input-group">
      <label class="input-label">
        {{ node.label }}: {{ node.value }} <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span>
      </label>
      <input type="range" v-model="node.value" :min="node.min" :max="node.max" :step="node.step" class="w-100" :disabled="readonly" />
    </div>

    <!-- File Input -->
    <div v-else-if="node.inputType === 'file'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span>
      </label>
      <input type="file" @change="(e: any) => node.value = e.target.files[0]" :required="node.required" class="input-field" :disabled="readonly" />
    </div>

    <!-- Time Input -->
    <div v-else-if="node.inputType === 'time'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Report</span>
      </label>
      <input v-model="node.value" type="time" :required="node.required" class="input-field" :disabled="readonly" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { InputNode } from '../models/InputNode';
import { ref } from 'vue';
import { openRouterApiKey, openRouterModel } from '../utils/aiSettings';
import { openPromptEditor } from '../utils/promptEditorState';


const isLoadingAI = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

function autoResize(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  target.style.height = 'auto'; // Reset height to recalculate
  target.style.height = target.scrollHeight + 'px';
}

import { onMounted, nextTick } from 'vue';
onMounted(() => {
  nextTick(() => {
     if(textareaRef.value) {
         // trigger resize on load if there's initial value
         textareaRef.value.style.height = 'auto';
         textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
     }
  });
});


const props = defineProps<{
  node: InputNode;
  readonly?: boolean;
  rootData?: Record<string, any>;
}>();

async function generateAI() {
  if (!openRouterApiKey.value) {
    alert("Veuillez configurer une clé API OpenRouter dans les paramètres.");
    return;
  }
  if (!props.node.aiPrompt) return;

  isLoadingAI.value = true;

  try {
    let finalPrompt = props.node.aiPrompt;

    // Replace {{ key }} with actual values from rootData
    if (props.rootData) {
      finalPrompt = finalPrompt.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
        return props.rootData?.[key] !== undefined ? props.rootData[key] : match;
      });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openRouterApiKey.value}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: openRouterModel.value || "openrouter/free",
        messages: [
          { role: "user", content: finalPrompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      props.node.value = data.choices[0].message.content;
    }
  } catch (error) {
    console.error("Erreur lors de la génération IA:", error);
    alert("Erreur lors de la génération IA. Vérifiez votre clé API et la console.");
  } finally {
    isLoadingAI.value = false;
  }
}
</script>

<style scoped>
.text-error {
  color: var(--error);
}

.badge-action-report {
  background-color: #ff9800;
  color: white;
  font-size: 0.7em;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
  cursor: help;
}
.btn-sm {
  padding: 4px 8px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  border: 2px solid rgba(0, 0, 0, 0.1);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border-left-color: var(--primary);
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
