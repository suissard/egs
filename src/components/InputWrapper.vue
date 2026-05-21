<template>
  <div class="input-wrapper">
    <!-- Text Input -->
    <div v-if="['text', 'email', 'tel', 'number', 'password'].includes(node.inputType)" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        <div class="d-flex align-center gap-2">
          <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
          <div v-if="node.aiPrompt !== undefined" class="d-flex align-center gap-1 no-print">
            <button @click.prevent="generateAI" class="btn btn-ai btn-sm" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
              <span v-if="isLoadingAI" class="spinner"></span>
              <span v-else>✨ Générer par IA</span>
            </button>
            <button @click.prevent="openPromptEditor(node)" class="btn btn-secondary btn-sm px-2" :disabled="readonly" type="button" title="Configurer le prompt">
              ⚙️
            </button>
          </div>
        </div>
      </label>
      <input v-model="node.value" :type="node.inputType" :required="node.required" class="input-field" :disabled="readonly || isLoadingAI" />
    </div>

    <!-- Select Input -->
    <div v-else-if="node.inputType === 'select'" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        <div class="d-flex align-center gap-2">
          <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
          <div v-if="node.aiPrompt !== undefined" class="d-flex align-center gap-1 no-print">
            <button @click.prevent="generateAI" class="btn btn-ai btn-sm" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
              <span v-if="isLoadingAI" class="spinner"></span>
              <span v-else>✨ Générer par IA</span>
            </button>
            <button @click.prevent="openPromptEditor(node)" class="btn btn-secondary btn-sm px-2" :disabled="readonly" type="button" title="Configurer le prompt">
              ⚙️
            </button>
          </div>
        </div>
      </label>
      <select v-model="node.value" :required="node.required" class="input-field" :multiple="node.multiple" :disabled="readonly">
        <option v-for="opt in node.options" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </div>

    <!-- Radio Group -->
    <div v-else-if="node.inputType === 'radio'" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        <div class="d-flex align-center gap-2">
          <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
          <div v-if="node.aiPrompt !== undefined" class="d-flex align-center gap-1 no-print">
            <button @click.prevent="generateAI" class="btn btn-ai btn-sm" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
              <span v-if="isLoadingAI" class="spinner"></span>
              <span v-else>✨ Générer par IA</span>
            </button>
            <button @click.prevent="openPromptEditor(node)" class="btn btn-secondary btn-sm px-2" :disabled="readonly" type="button" title="Configurer le prompt">
              ⚙️
            </button>
          </div>
        </div>
      </label>
      <div class="d-flex flex-wrap gap-3">
        <label v-for="opt in node.options" :key="opt" class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
          <input type="radio" v-model="node.value" :value="opt" :name="'radio-group-' + node.id" :disabled="readonly">
          {{ opt }}
        </label>
      </div>
    </div>

    <!-- Switch -->
    <div v-else-if="node.inputType === 'switch'" class="input-group">
      <div class="d-flex justify-space-between align-center">
        <label class="d-flex align-center mb-0" style="gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" v-model="node.value" :disabled="readonly">
          <span class="font-weight-bold">{{ node.label }}</span>
        </label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
      </div>
    </div>

    <!-- Checkbox (Single or Multiple) -->
    <div v-else-if="node.inputType === 'checkbox'" class="input-group">
      <label class="input-label d-flex justify-space-between align-center" v-if="node.options && node.options.length > 0">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
      </label>

      <!-- Multiple checkboxes -->
      <div v-if="node.options && node.options.length > 0" class="d-flex flex-wrap gap-3">
        <label v-for="opt in node.options" :key="opt" class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" v-model="node.value" :value="opt" :disabled="readonly">
          {{ opt }}
        </label>
      </div>

      <!-- Single checkbox -->
      <div v-else class="d-flex justify-space-between align-center">
        <label class="d-flex align-center mb-0" style="gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" v-model="node.value" :required="node.required" :disabled="readonly">
          <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        </label>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
      </div>
    </div>

    <!-- Date Input -->
    <div v-else-if="node.inputType === 'date'" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        <div class="d-flex align-center gap-2">
          <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
          <div v-if="node.aiPrompt !== undefined" class="d-flex align-center gap-1 no-print">
            <button @click.prevent="generateAI" class="btn btn-ai btn-sm" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
              <span v-if="isLoadingAI" class="spinner"></span>
              <span v-else>✨ Générer par IA</span>
            </button>
            <button @click.prevent="openPromptEditor(node)" class="btn btn-secondary btn-sm px-2" :disabled="readonly" type="button" title="Configurer le prompt">
              ⚙️
            </button>
          </div>
        </div>
      </label>
      <input v-model="node.value" type="date" :required="node.required" class="input-field" :disabled="readonly" />
    </div>

    <!-- Textarea -->
    <div v-else-if="node.inputType === 'textarea'" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        <div class="d-flex align-center gap-2">
          <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
          <div v-if="node.aiPrompt !== undefined" class="d-flex align-center gap-1 no-print">
            <button @click.prevent="generateAI" class="btn btn-ai btn-sm" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
              <span v-if="isLoadingAI" class="spinner"></span>
              <span v-else>✨ Générer par IA</span>
            </button>
            <button @click.prevent="openPromptEditor(node)" class="btn btn-secondary btn-sm px-2" :disabled="readonly" type="button" title="Configurer le prompt">
              ⚙️
            </button>
          </div>
        </div>
      </label>
      <textarea v-model="node.value" :required="node.required" class="input-field" rows="3" :disabled="readonly || isLoadingAI" @input="autoResize" ref="textareaRef" style="overflow:hidden;"></textarea>
    </div>

    <!-- Slider -->
    <div v-else-if="node.inputType === 'slider'" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }}: {{ node.value }}</span>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
      </label>
      <input type="range" v-model="node.value" :min="node.min" :max="node.max" :step="node.step" class="w-100" :disabled="readonly" />
    </div>

    <!-- File Input -->
    <div v-else-if="node.inputType === 'file'" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
      </label>
      <input type="file" @change="(e: any) => node.value = e.target.files[0]" :required="node.required" class="input-field" :disabled="readonly" />
    </div>

    <!-- Table Input -->
    <div v-else-if="node.inputType === 'table'" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        <div class="d-flex align-center gap-2">
          <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
          <div v-if="node.aiPrompt !== undefined" class="d-flex align-center gap-1 no-print">
            <button @click.prevent="generateAI" class="btn btn-ai btn-sm" :disabled="isLoadingAI || readonly" type="button" title="Générer avec l'IA">
              <span v-if="isLoadingAI" class="spinner"></span>
              <span v-else>✨ Générer par IA</span>
            </button>
            <button @click.prevent="openPromptEditor(node)" class="btn btn-secondary btn-sm px-2" :disabled="readonly" type="button" title="Configurer le prompt">
              ⚙️
            </button>
          </div>
        </div>
      </label>
      <div class="table-responsive">
        <table class="w-100 border-collapse">
          <thead>
            <tr>
              <th v-for="col in node.columns" :key="col" class="text-left pa-2 border-bottom">{{ col }}</th>
              <th class="pa-2 border-bottom w-50px"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(_, rowIndex) in node.value" :key="rowIndex">
              <td v-for="(_, colIndex) in node.columns" :key="colIndex" class="pa-1 border-bottom">
                <textarea v-model="node.value[rowIndex][colIndex]" class="input-field py-1 px-2 cell-textarea" rows="1" :disabled="readonly" @input="autoResize" style="overflow:hidden; resize:none;"></textarea>
              </td>
              <td class="pa-1 border-bottom text-center">
                <button type="button" @click="node.value.splice(rowIndex, 1)" class="btn btn-sm btn-error" :disabled="readonly" title="Supprimer la ligne">X</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <button type="button" @click="addTableRow" class="btn btn-sm btn-secondary mt-2" :disabled="readonly">+ Ajouter une ligne</button>
    </div>

    <!-- Time Input -->
    <div v-else-if="node.inputType === 'time'" class="input-group">
      <label class="input-label d-flex justify-space-between align-center">
        <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span></span>
        <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report no-print" :title="getReportTooltip(node)">⚡ Report</span>
      </label>
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

onMounted(() => {
  nextTick(() => {
     if(textareaRef.value) {
         // trigger resize on load if there's initial value
         textareaRef.value.style.height = 'auto';
         textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
     }
     // Auto-resize table cell textareas on load
     const textareas = document.querySelectorAll('textarea.cell-textarea');
     textareas.forEach((ta) => {
       const el = ta as HTMLTextAreaElement;
       el.style.height = 'auto';
       el.style.height = el.scrollHeight + 'px';
     });
  });
});

const props = defineProps<{
  node: InputNode;
  readonly?: boolean;
  rootData?: Record<string, any>;
}>();

const triggerDataUpdate = inject<() => void>('triggerDataUpdate');

watch(
  () => props.node.value,
  () => {
    if (triggerDataUpdate) {
      triggerDataUpdate();
    }
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
  if (!props.node.aiPrompt) return;

  isLoadingAI.value = true;
  let finalPrompt = props.node.aiPrompt;

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

.badge-action-report {
  background-color: #ff9800;
  color: white;
  font-size: 0.7em;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
  cursor: help;
  display: inline-block;
  white-space: nowrap;
}
.btn-sm {
  padding: 4px 8px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-ai {
  background-color: #8b5cf6 !important;
  color: white !important;
  border: none !important;
  transition: background-color 0.2s;
}

.btn-ai:hover {
  background-color: #7c3aed !important;
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

.cell-textarea {
  min-height: 32px;
  height: 100%;
  resize: none;
  overflow: hidden;
  line-height: 1.4;
  width: 100%;
  box-sizing: border-box;
}

table td {
  vertical-align: top;
  height: 100%;
}

table th {
  vertical-align: top;
}
</style>
