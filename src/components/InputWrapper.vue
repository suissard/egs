<template>
  <div class="input-wrapper">
    <!-- Text Input -->
    <div v-if="['text', 'email', 'tel', 'number', 'password'].includes(node.inputType)" class="input-group">
      <div class="input-label-container">
        <label class="input-label">{{ node.label }} <span v-if="node.required" class="text-error">*</span></label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="generateAI" :class="[node.aiButtonLabel ? 'btn-ai-labeled' : 'btn-ai-circle', 'no-print']" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
          <span v-if="isLoadingAI" class="spinner-small"></span>
          <span v-else>✨<span v-if="node.aiButtonLabel" class="ai-btn-text">{{ node.aiButtonLabel }}</span></span>
        </button>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="openPromptEditor(node)" :class="[node.aiButtonLabel ? 'btn-secondary-labeled' : 'btn-secondary-circle', 'no-print']" :disabled="readonly" type="button" title="Configurer le prompt">
          ⚙️
        </button>
      </div>
      <input v-model="node.value" :type="node.inputType" :required="node.required" class="input-field" :disabled="readonly || isLoadingAI" />
    </div>

    <!-- Select Input -->
    <div v-else-if="node.inputType === 'select'" class="input-group">
      <div class="input-label-container">
        <label class="input-label">{{ node.label }} <span v-if="node.required" class="text-error">*</span></label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="generateAI" :class="[node.aiButtonLabel ? 'btn-ai-labeled' : 'btn-ai-circle', 'no-print']" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
          <span v-if="isLoadingAI" class="spinner-small"></span>
          <span v-else>✨<span v-if="node.aiButtonLabel" class="ai-btn-text">{{ node.aiButtonLabel }}</span></span>
        </button>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="openPromptEditor(node)" :class="[node.aiButtonLabel ? 'btn-secondary-labeled' : 'btn-secondary-circle', 'no-print']" :disabled="readonly" type="button" title="Configurer le prompt">
          ⚙️
        </button>
      </div>
      <select v-model="node.value" :required="node.required" class="input-field" :multiple="node.multiple" :disabled="readonly">
        <option v-for="opt in node.options" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </div>

    <!-- Radio Group -->
    <div v-else-if="node.inputType === 'radio'" class="input-group">
      <div class="input-label-container">
        <label class="input-label">{{ node.label }} <span v-if="node.required" class="text-error">*</span></label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="generateAI" :class="[node.aiButtonLabel ? 'btn-ai-labeled' : 'btn-ai-circle', 'no-print']" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
          <span v-if="isLoadingAI" class="spinner-small"></span>
          <span v-else>✨<span v-if="node.aiButtonLabel" class="ai-btn-text">{{ node.aiButtonLabel }}</span></span>
        </button>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="openPromptEditor(node)" :class="[node.aiButtonLabel ? 'btn-secondary-labeled' : 'btn-secondary-circle', 'no-print']" :disabled="readonly" type="button" title="Configurer le prompt">
          ⚙️
        </button>
      </div>
      <div class="d-flex flex-wrap gap-3">
        <label v-for="opt in node.options" :key="opt" class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
          <input type="radio" v-model="node.value" :value="opt" :name="'radio-group-' + node.id" :disabled="readonly">
          {{ opt }}
        </label>
      </div>
    </div>

    <!-- Switch -->
    <div v-else-if="node.inputType === 'switch'" class="input-group">
      <div class="d-flex align-center gap-2">
        <label class="d-flex align-center mb-0" style="gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" v-model="node.value" :disabled="readonly">
          <span class="font-weight-bold">{{ node.label }}</span>
        </label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
      </div>
    </div>

    <!-- Checkbox (Single or Multiple) -->
    <div v-else-if="node.inputType === 'checkbox'" class="input-group">
      <!-- Multiple checkboxes header -->
      <div class="input-label-container" v-if="node.options && node.options.length > 0">
        <label class="input-label">{{ node.label }} <span v-if="node.required" class="text-error">*</span></label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
      </div>

      <!-- Multiple checkboxes -->
      <div v-if="node.options && node.options.length > 0" class="d-flex flex-wrap gap-3">
        <label v-for="opt in node.options" :key="opt" class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" v-model="node.value" :value="opt" :disabled="readonly">
          {{ opt }}
        </label>
      </div>

      <!-- Single checkbox -->
      <div v-else class="d-flex align-center gap-2">
        <label class="d-flex align-center mb-0" style="gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" v-model="node.value" :required="node.required" :disabled="readonly">
          <span class="font-weight-bold">{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        </label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
      </div>
    </div>

    <!-- Date Input -->
    <div v-else-if="node.inputType === 'date'" class="input-group">
      <div class="input-label-container">
        <label class="input-label">{{ node.label }} <span v-if="node.required" class="text-error">*</span></label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="generateAI" :class="[node.aiButtonLabel ? 'btn-ai-labeled' : 'btn-ai-circle', 'no-print']" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
          <span v-if="isLoadingAI" class="spinner-small"></span>
          <span v-else>✨<span v-if="node.aiButtonLabel" class="ai-btn-text">{{ node.aiButtonLabel }}</span></span>
        </button>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="openPromptEditor(node)" :class="[node.aiButtonLabel ? 'btn-secondary-labeled' : 'btn-secondary-circle', 'no-print']" :disabled="readonly" type="button" title="Configurer le prompt">
          ⚙️
        </button>
      </div>
      <input v-model="node.value" type="date" :required="node.required" class="input-field" :disabled="readonly" />
    </div>

    <!-- Textarea -->
    <div v-else-if="node.inputType === 'textarea'" class="input-group">
      <div class="input-label-container">
        <label class="input-label">{{ node.label }} <span v-if="node.required" class="text-error">*</span></label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="generateAI" :class="[node.aiButtonLabel ? 'btn-ai-labeled' : 'btn-ai-circle', 'no-print']" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
          <span v-if="isLoadingAI" class="spinner-small"></span>
          <span v-else>✨<span v-if="node.aiButtonLabel" class="ai-btn-text">{{ node.aiButtonLabel }}</span></span>
        </button>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="openPromptEditor(node)" :class="[node.aiButtonLabel ? 'btn-secondary-labeled' : 'btn-secondary-circle', 'no-print']" :disabled="readonly" type="button" title="Configurer le prompt">
          ⚙️
        </button>
      </div>
      <textarea v-model="node.value" :required="node.required" class="input-field" rows="3" :disabled="readonly || isLoadingAI" @input="autoResize" ref="textareaRef" style="overflow:hidden;"></textarea>
    </div>

    <!-- Slider -->
    <div v-else-if="node.inputType === 'slider'" class="input-group">
      <div class="input-label-container">
        <label class="input-label">{{ node.label }}: {{ node.value }}</label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
      </div>
      <input type="range" v-model="node.value" :min="node.min" :max="node.max" :step="node.step" class="w-100" :disabled="readonly" />
    </div>

    <!-- File Input -->
    <div v-else-if="node.inputType === 'file'" class="input-group">
      <div class="input-label-container">
        <label class="input-label">{{ node.label }} <span v-if="node.required" class="text-error">*</span></label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
      </div>
      <input type="file" @change="(e: any) => node.value = e.target.files[0]" :required="node.required" class="input-field" :disabled="readonly" />
    </div>

    <!-- Table Input -->
    <div v-else-if="node.inputType === 'table'" class="input-group">
      <div class="input-label-container">
        <label class="input-label">{{ node.label }} <span v-if="node.required" class="text-error">*</span></label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="generateAI" :class="[node.aiButtonLabel ? 'btn-ai-labeled' : 'btn-ai-circle', 'no-print']" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
          <span v-if="isLoadingAI" class="spinner-small"></span>
          <span v-else>✨<span v-if="node.aiButtonLabel" class="ai-btn-text">{{ node.aiButtonLabel }}</span></span>
        </button>
        <button v-if="node.aiPrompt && openRouterApiKey" @click.prevent="openPromptEditor(node)" :class="[node.aiButtonLabel ? 'btn-secondary-labeled' : 'btn-secondary-circle', 'no-print']" :disabled="readonly" type="button" title="Configurer le prompt">
          ⚙️
        </button>
      </div>
      <div class="table-responsive shadow-sm">
        <table class="w-100">
          <thead>
            <tr>
              <th v-for="col in node.columns" :key="col" class="text-left">{{ col }}</th>
              <th class="w-50px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(_, rowIndex) in node.value" :key="rowIndex" class="table-row-hover">
              <td v-for="(_, colIndex) in node.columns" :key="colIndex">
                <textarea v-model="node.value[rowIndex][colIndex]" class="cell-textarea" rows="1" :disabled="readonly" @input="autoResize" placeholder="..."></textarea>
              </td>
              <td class="text-center" style="padding-right: 8px;">
                <button type="button" @click="node.value.splice(rowIndex, 1)" class="btn btn-sm btn-error px-2" :disabled="readonly" title="Supprimer la ligne">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="button" @click="addTableRow" class="btn btn-sm btn-secondary mt-3" :disabled="readonly">➕ Ajouter une ligne</button>
    </div>

    <!-- Time Input -->
    <div v-else-if="node.inputType === 'time'" class="input-group">
      <div class="input-label-container">
        <label class="input-label">{{ node.label }} <span v-if="node.required" class="text-error">*</span></label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡</span>
      </div>
      <input v-model="node.value" type="time" :required="node.required" class="input-field" :disabled="readonly" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { InputNode } from '../models/InputNode';
import { ref, onMounted, nextTick, inject, watch } from 'vue';
import { openRouterApiKey, openRouterModel, triggerAIError, isErrorDrawerOpen } from '../utils/aiSettings';
import { openPromptEditor } from '../utils/promptEditorState';

const isLoadingAI = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

function addTableRow() {
  if (!props.node.value) props.node.value = [];
  props.node.value.push(new Array(props.node.columns?.length || 0).fill(''));
}

function autoResize(event: Event) {
  const target = event.target as HTMLTextAreaElement;
  target.style.height = 'auto'; // Reset height to recalculate
  target.style.height = target.scrollHeight + 'px';
}

function getReportTooltip(node: InputNode): string {
  if (!node.actionReports || node.actionReports.length === 0) return '';
  const targets = node.actionReports.map(r => {
    const targetName = r.targetKey === 'plan_action_tableau' ? "Tableau des actions" : r.targetKey;
    const val = Array.isArray(r.valueToReport) ? r.valueToReport[0] : r.valueToReport;
    return `• Si "${r.triggerValue}", ajoute la ligne "${val}" dans "${targetName}"`;
  });
  return `⚡ Report automatique :\n` + targets.join('\n');
}

const props = defineProps<{
  node: InputNode;
  readonly?: boolean;
  rootData?: Record<string, any>;
}>();

const triggerDataUpdate = inject<() => void>('triggerDataUpdate');

function resizeTextarea() {
  nextTick(() => {
     if(textareaRef.value) {
         // trigger resize on load/update if there's initial value
         textareaRef.value.style.height = 'auto';
         textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
     }
     // Auto-resize table cell textareas on load/update
     const textareas = document.querySelectorAll('textarea.cell-textarea');
     textareas.forEach((ta) => {
       const el = ta as HTMLTextAreaElement;
       el.style.height = 'auto';
       el.style.height = el.scrollHeight + 'px';
     });
  });
}

onMounted(() => {
  resizeTextarea();
});

watch(
  () => props.node.value,
  () => {
    if (triggerDataUpdate) {
      triggerDataUpdate();
    }
    resizeTextarea();
  },
  { deep: true }
);

function getAnonymousDataSummary(rootData: Record<string, any>): string {
  if (!rootData) return '';
  const lines: string[] = [];
  
  for (const [key, value] of Object.entries(rootData)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('nom') ||
      lowerKey.includes('prenom') ||
      lowerKey.includes('ddn') ||
      lowerKey.includes('birth') ||
      lowerKey.includes('naissance') ||
      lowerKey.includes('tel') ||
      lowerKey.includes('phone') ||
      lowerKey.includes('email') ||
      lowerKey.includes('mail') ||
      lowerKey.includes('adresse') ||
      lowerKey.includes('address') ||
      lowerKey.includes('age') ||
      lowerKey.includes('date_eval') ||
      lowerKey.includes('date_evaluation')
    ) {
      continue;
    }

    if (value === undefined || value === null || value === '') continue;

    let valStr = '';
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      if (value.every(item => Array.isArray(item))) {
        valStr = '\n' + value.map(row => '    * ' + row.join(' | ')).join('\n');
      } else {
        valStr = value.join(', ');
      }
    } else if (typeof value === 'object') {
      valStr = JSON.stringify(value);
    } else {
      valStr = String(value);
    }

    const label = key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^\w/, c => c.toUpperCase());

    lines.push(`- ${label}: ${valStr}`);
  }
  return lines.join('\n');
}

async function generateAI() {
  if (!openRouterApiKey.value) {
    alert("Veuillez configurer une clé API OpenRouter dans les préférences (icône d'engrenage ⚙️ en bas à droite).");
    return;
  }

  isLoadingAI.value = true;
  
  // Use custom prompt if set, otherwise a smart default based on the field
  let finalPrompt = props.node.aiPrompt || "";
  if (!finalPrompt.trim()) {
    if (props.node.inputType === 'table') {
      finalPrompt = `Tu es un assistant médical. Remplis le tableau "${props.node.label}" (colonnes : ${props.node.columns.join(', ')}) sous forme d'un tableau JSON (un tableau de tableaux de chaînes de caractères, ex: [["ligne1_col1", "ligne1_col2"], ["ligne2_col1", "ligne2_col2"]]). Rédige uniquement le JSON, sans explications, sans bloc de code markdown, en te basant sur les informations suivantes :\n{{ ALL_ANONYMOUS }}`;
    } else if (props.node.inputType === 'radio' || props.node.inputType === 'select') {
      finalPrompt = `Tu es un assistant médical. Sélectionne une seule option pour le champ "${props.node.label}" parmi les options suivantes : [${props.node.options.join(', ')}]. Rédige uniquement l'option choisie, sans aucune autre explication, en te basant sur les informations suivantes :\n{{ ALL_ANONYMOUS }}`;
    } else {
      finalPrompt = `Tu es un assistant médical. Rédige une synthèse professionnelle et concise pour le champ "${props.node.label}" en te basant sur les informations suivantes :\n{{ ALL_ANONYMOUS }}`;
    }
  }

  try {
    // Replace {{ now }} with today's date in French format
    if (finalPrompt.includes('now')) {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      const nowStr = `${day}/${month}/${year}`;
      finalPrompt = finalPrompt.replace(/\{\{\s*now\s*\}\}/g, nowStr);
    }

    // Replace {{ ALL_ANONYMOUS }} with anonymous summary of all data
    if (finalPrompt.includes('{{ ALL_ANONYMOUS }}')) {
      const anonSummary = getAnonymousDataSummary(props.rootData || {});
      finalPrompt = finalPrompt.replace(/\{\{\s*ALL_ANONYMOUS\s*\}\}/g, anonSummary);
    }

    // Replace {{ key }} with actual values from rootData
    if (props.rootData) {
      finalPrompt = finalPrompt.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key) => {
        if (key === 'ALL_ANONYMOUS' || key === 'now') return match;
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
        model: openRouterModel.value || "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [
          { role: "user", content: finalPrompt }
        ]
      })
    });

    if (!response.ok) {
      const rawText = await response.text();
      let errMsg = `Erreur API OpenRouter (${response.status})`;
      try {
        const errJson = JSON.parse(rawText);
        if (errJson.error && errJson.error.message) {
          errMsg = errJson.error.message;
        }
      } catch (e) {}
      
      triggerAIError({
        message: errMsg,
        fieldLabel: props.node.label,
        prompt: finalPrompt,
        responseStatus: response.status,
        rawResponse: rawText,
        timestamp: new Date().toLocaleString('fr-FR')
      });
      throw new Error(errMsg);
    }

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      let content = data.choices[0].message.content.trim();

      if (props.node.inputType === 'table') {
        try {
          // Find the JSON array inside the content if there's any markdown code block or extra text
          const jsonMatch = content.match(/\[\s*\[[\s\S]*\]\s*\]/);
          if (jsonMatch) {
            content = jsonMatch[0];
          }
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed.every(row => Array.isArray(row))) {
            props.node.value = parsed;
            nextTick(() => {
              const textareas = document.querySelectorAll('textarea.cell-textarea');
              textareas.forEach((ta) => {
                const el = ta as HTMLTextAreaElement;
                el.style.height = 'auto';
                el.style.height = el.scrollHeight + 'px';
              });
            });
          } else {
            throw new Error("Format de tableau invalide");
          }
        } catch (e) {
          console.error("Erreur de parsing de la réponse de table de l'IA:", e);
          triggerAIError({
            message: "Format de réponse JSON de table invalide. L'IA a renvoyé du texte brut au lieu du tableau attendu.",
            fieldLabel: props.node.label,
            prompt: finalPrompt,
            rawResponse: content,
            timestamp: new Date().toLocaleString('fr-FR')
          });
          throw e;
        }
      } else {
        props.node.value = content;
      }
    }
  } catch (error: any) {
    console.error("Erreur lors de la génération IA:", error);
    if (!isErrorDrawerOpen.value) {
      triggerAIError({
        message: error.message || String(error),
        fieldLabel: props.node.label,
        prompt: finalPrompt,
        timestamp: new Date().toLocaleString('fr-FR')
      });
    }
  } finally {
    isLoadingAI.value = false;
  }
}
</script>

<style scoped>
.text-error {
  color: var(--error);
}

.input-label-container {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.input-label-container .input-label {
  margin-bottom: 0;
  display: inline-block;
}

.badge-action-report {
  background-color: #f59e0b;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.2);
  flex-shrink: 0;
}

.btn-ai-circle {
  background-color: #8b5cf6;
  color: white;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
  flex-shrink: 0;
  padding: 0;
}

.btn-ai-circle:hover {
  background-color: #7c3aed;
  transform: scale(1.08);
}

.btn-ai-circle:active {
  transform: scale(0.92);
}

.btn-ai-circle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary-circle {
  background-color: #f1f5f9;
  border: 1px solid var(--border);
  color: var(--text-main);
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  padding: 0;
}

.btn-secondary-circle:hover {
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  transform: scale(1.08);
}

.btn-secondary-circle:active {
  transform: scale(0.92);
}

.btn-secondary-circle:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.spinner-small {
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border-left-color: white;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

.btn-sm {
  padding: 5px 10px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Elegant grid styles for tables */
.table-responsive {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  background-color: var(--surface);
  margin-top: 0.5rem;
}

table {
  border-collapse: collapse;
}

table th {
  background-color: #f8fafc;
  color: #475569;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

table td {
  padding: 6px 8px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.table-row-hover:hover {
  background-color: #f8fafc;
}

table tr:last-child td {
  border-bottom: none;
}

.cell-textarea {
  min-height: 34px;
  height: 100%;
  resize: none;
  overflow: hidden;
  line-height: 1.5;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid transparent;
  background-color: transparent;
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  font-family: inherit;
  font-size: 0.925rem;
  color: var(--text-main);
  transition: all 0.2s ease;
}

.cell-textarea:hover {
  background-color: #f1f5f9;
}

.cell-textarea:focus {
  outline: none;
  background-color: white;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>

<style scoped>
.btn-ai-labeled {
  background-color: #8b5cf6;
  color: white;
  height: 22px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(139, 92, 246, 0.2);
  padding: 0 8px;
}

.btn-ai-labeled:hover {
  background-color: #7c3aed;
  transform: scale(1.05);
}

.btn-ai-labeled:active {
  transform: scale(0.95);
}

.btn-ai-labeled:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary-labeled {
  background-color: #f1f5f9;
  border: 1px solid var(--border);
  color: var(--text-main);
  height: 22px;
  border-radius: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0 8px;
}

.btn-secondary-labeled:hover {
  background-color: #e2e8f0;
  transform: scale(1.05);
}

.btn-secondary-labeled:active {
  transform: scale(0.95);
}

.btn-secondary-labeled:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.ai-btn-text {
  margin-left: 4px;
}
</style>
