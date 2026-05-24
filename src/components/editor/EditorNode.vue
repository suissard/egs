<template>
  <div
    class="editor-node pa-4 mb-3 border rounded-xl transition-all"
    :class="[
      getNodeBorderClass,
      {
        'bg-white shadow-sm': isBox,
        'bg-slate-50 border-slate-200': !isBox,
        'editor-node-selected': isSelected,
      }
    ]"
    @click.stop="selectNode"
  >
    <div class="header-container d-flex justify-space-between align-center mb-2 position-relative">
      <div class="font-weight-bold d-flex align-center gap-2 flex-wrap flex-grow-1 pe-16">
        <!-- Modern Grip SVG Drag Handle -->
        <div class="drag-handle d-flex align-center justify-center cursor-grab text-slate-400 hover:text-slate-600">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle><circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle></svg>
        </div>
        
        <!-- Component Label -->
        <span v-if="isBox" class="text-slate-800 font-weight-bold">{{ node.title || 'Section sans titre' }}</span>
        <span v-else class="text-slate-800 font-weight-semibold">{{ node.label || 'Champ sans étiquette' }}</span>
        
        <!-- Technical Key badge -->
        <span v-if="!isBox && node.key" class="badge-key text-caption bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 border border-slate-200">{{ node.key }}</span>

        <!-- Layout Direction / Component Type Badge -->
        <span v-if="isBox" class="badge-type bg-indigo-light text-indigo rounded-full px-2 py-0.5 text-caption font-weight-medium">
          {{ node.direction === 'row' ? 'Ligne ↔' : 'Colonne ↕' }}
        </span>
        <span v-else class="badge-type rounded-full px-2 py-0.5 text-caption font-weight-medium" :class="getTypeBadgeClass(node.inputType)">
          {{ getFriendlyTypeLabel(node.inputType) }}
        </span>

        <!-- Obligatoire Indicator -->
        <span v-if="!isBox && node.required" class="badge-required bg-rose-light text-rose rounded-full px-2 py-0.5 text-caption font-weight-medium">Obligatoire</span>

        <!-- AI active Indicator -->
        <div v-if="!isBox && node.aiPrompt" title="Génération IA configurée" class="status-indicator bg-sky text-white rounded-full px-2 py-0.5 d-flex align-center gap-1 text-caption font-weight-medium">
          <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
          IA
        </div>

        <!-- Action Report active Indicator -->
        <div v-if="!isBox && node.actionReports && node.actionReports.length > 0" title="Mécanique de report active" class="status-indicator bg-amber text-white rounded-full px-2 py-0.5 d-flex align-center gap-1 text-caption font-weight-medium">
          <svg viewBox="0 0 24 24" width="10" height="10" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
          Report
        </div>
      </div>

      <!-- Action Pill (Floating Toolbar) -->
      <div class="actions d-flex gap-1.5 position-absolute" style="top: -2px; right: 0px; z-index: 10;">
        <button class="node-btn-action btn-edit rounded-lg d-flex align-center justify-center p-0" @click.stop="toggleEdit" title="Éditer les propriétés">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </button>
        <button class="node-btn-action btn-delete rounded-lg d-flex align-center justify-center p-0" @click.stop="deleteNode" title="Supprimer le composant">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>

    <!-- In-place Editor Form (Popup Panel style) -->
    <div v-if="isEditing" class="in-place-editor pa-4 mt-3 rounded-xl border border-slate-200 shadow-md bg-white" @click.stop>
      <div class="d-flex justify-space-between align-center mb-4 pb-2 border-bottom">
        <h4 class="text-subtitle-2 font-weight-bold text-slate-800 d-flex align-center gap-1.5">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          Configuration du composant
        </h4>
        <span class="text-caption text-slate-400 font-weight-medium">ID: {{ node.id }}</span>
      </div>

      <div class="row flex-wrap gap-4">
        <!-- Box/Section Properties -->
        <template v-if="isBox">
          <div class="input-group flex-grow-1 min-w-200 mb-0">
            <label class="input-label text-caption font-weight-bold text-slate-600 mb-1">Titre de la section</label>
            <input v-model="node.title" type="text" class="input-field py-1.5 px-3 text-body-2" placeholder="Ex: Informations Médicales" />
          </div>
          <div class="input-group flex-grow-1 min-w-200 mb-0">
            <label class="input-label text-caption font-weight-bold text-slate-600 mb-1">Orientation de mise en page</label>
            <select v-model="node.direction" class="input-field py-1.5 px-3 text-body-2">
              <option value="column">Colonne (Alignement Vertical)</option>
              <option value="row">Ligne (Alignement Horizontal)</option>
            </select>
          </div>
        </template>

        <!-- Input Properties -->
        <template v-else>
          <div class="input-group flex-grow-1 min-w-200 mb-0">
            <label class="input-label text-caption font-weight-bold text-slate-600 mb-1">Étiquette (Label)</label>
            <input v-model="node.label" type="text" class="input-field py-1.5 px-3 text-body-2" />
          </div>
          <div class="input-group flex-grow-1 min-w-200 mb-0">
            <label class="input-label text-caption font-weight-bold text-slate-600 mb-1">Type de champ</label>
            <select v-model="node.inputType" class="input-field py-1.5 px-3 text-body-2">
              <option value="text">Texte Court</option>
              <option value="textarea">Texte Long</option>
              <option value="number">Nombre</option>
              <option value="checkbox">Case à cocher</option>
              <option value="radio">Boutons Radio</option>
              <option value="select">Liste Déroulante</option>
              <option value="date">Date</option>
              <option value="table">Tableau Dynamique</option>
            </select>
          </div>
          <div class="input-group flex-grow-1 min-w-200 mb-0">
            <label class="input-label text-caption font-weight-bold text-slate-600 mb-1">Clé d'export JSON</label>
            <input v-model="node.key" type="text" class="input-field py-1.5 px-3 text-body-2" placeholder="Ex: score_mna, ddn_patient" />
          </div>

          <!-- Options Config (Select, Radio, Checkbox) -->
          <div class="input-group w-100 mb-0 mt-1" v-if="['select', 'radio', 'checkbox'].includes(node.inputType)">
            <label class="input-label text-caption font-weight-bold text-slate-600 mb-1">Options configurées (Une par ligne)</label>
            <textarea
              :value="node.options ? node.options.join('\n') : ''"
              @input="updateOptions($event)"
              class="input-field py-2 px-3 text-body-2 font-mono"
              rows="3"
              placeholder="Option 1&#10;Option 2&#10;Option 3"
            ></textarea>
          </div>

          <!-- Table Columns Config -->
          <div class="input-group w-100 mb-0 mt-1" v-if="node.inputType === 'table'">
            <label class="input-label text-caption font-weight-bold text-slate-600 mb-1">Colonnes du tableau (Une par ligne)</label>
            <textarea
              :value="node.columns ? node.columns.join('\n') : ''"
              @input="updateColumns($event)"
              class="input-field py-2 px-3 text-body-2 font-mono"
              rows="3"
              placeholder="Colonne 1&#10;Colonne 2"
            ></textarea>
          </div>

          <!-- Advanced Actions Toolbar (Tonal style) -->
          <div class="w-100 bg-slate-50 pa-3 rounded-lg border border-slate-100 d-flex flex-wrap gap-4 align-center mt-2">
            <span class="text-caption font-weight-bold text-slate-500">PARAMÈTRES :</span>
            
            <label class="d-flex align-center gap-1.5 cursor-pointer mb-0">
              <input type="checkbox" v-model="node.required" class="checkbox-input" />
              <span class="text-caption text-slate-700 font-weight-medium">Obligatoire</span>
            </label>

            <button type="button" class="btn btn-sm btn-info-tonal py-1.5 px-3 d-flex align-center gap-1 text-sky rounded" @click="editAiPrompt">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
              Génération IA
              <span v-if="node.aiPrompt" class="rounded-circle bg-sky" style="width: 6px; height: 6px; display: inline-block;"></span>
            </button>

            <button type="button" class="btn btn-sm btn-warning-tonal py-1.5 px-3 d-flex align-center gap-1 text-amber rounded" @click="editReport">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
              Report Auto (⚡)
              <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-dot-amber"></span>
            </button>
          </div>

          <!-- AI Prompt Preview if configured -->
          <div class="input-group w-100 mb-0 mt-3" v-if="node.aiPrompt !== undefined && node.aiPrompt !== ''">
             <label class="input-label text-caption font-weight-bold text-sky mb-1">Aperçu du Prompt IA :</label>
             <div class="text-caption bg-sky-50 text-sky-800 pa-2.5 rounded-lg border border-sky-100 text-truncate" :title="node.aiPrompt">
               {{ node.aiPrompt }}
             </div>
          </div>
        </template>
      </div>

      <div class="d-flex justify-end gap-2 mt-4 pt-3 border-top">
        <button type="button" class="btn btn-sm btn-primary rounded-lg" @click="toggleEdit">
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          Appliquer et fermer
        </button>
      </div>
    </div>

    <!-- Recursive Box Content (Nested Draggable Canvas Area) -->
    <div v-if="isBox" class="box-content mt-3 pa-3 rounded-xl" :class="{'d-flex gap-3': node.direction === 'row'}">
      <draggable
        :list="node.children"
        item-key="id"
        group="form-builder"
        class="min-h-50 w-100 d-flex flex-column gap-2"
        handle=".drag-handle"
        ghost-class="ghost"
      >
        <template #item="{ element, index }">
          <EditorNode
            :node="element"
            :index="index"
            :parent-list="node.children"
            :selected-node="selectedNode"
            @select-node="$emit('select-node', $event)"
            @delete-node="$emit('delete-node', $event)"
            :class="{'flex-1': node.direction === 'row'}"
          />
        </template>
      </draggable>

      <div v-if="!node.children || node.children.length === 0" class="empty-box-placeholder text-center text-slate-400 py-6 border-dashed rounded-lg w-100">
        Glissez-déposez des champs ou des conteneurs ici
      </div>
    </div>

    <!-- Input Preview (Non-interactive inside builder canvas) -->
    <div v-else class="input-preview mt-3">
      <input v-if="['text', 'number', 'date'].includes(node.inputType)" type="text" class="input-field disabled-input" :placeholder="node.placeholder || '...'" disabled />
      <textarea v-if="node.inputType === 'textarea'" class="input-field disabled-input" rows="2" disabled></textarea>
      <select v-if="node.inputType === 'select'" class="input-field disabled-input" disabled>
        <option>Option de la liste...</option>
      </select>
      
      <!-- Radio / Checkbox preview -->
      <div v-if="node.inputType === 'radio' || node.inputType === 'checkbox'" class="d-flex flex-wrap gap-3 py-1">
        <div v-for="opt in node.options" :key="opt" class="d-flex align-center gap-1.5 opacity-60">
          <input :type="node.inputType" disabled class="disabled-input-element" />
          <label class="text-caption mb-0 text-slate-600 font-weight-medium">{{ opt }}</label>
        </div>
      </div>
      
      <!-- Table preview -->
      <div v-if="node.inputType === 'table'" class="mt-2">
        <div class="table-responsive rounded-lg border border-slate-200">
          <table class="w-100 border-collapse text-caption" style="border: none;">
            <thead>
              <tr class="bg-slate-100 border-bottom border-slate-200">
                <th v-for="col in node.columns" :key="col" class="text-left pa-2 text-slate-600 font-weight-semibold">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="bg-white">
                <td v-for="col in node.columns" :key="'td-'+col" class="pa-2 text-slate-400">Exemple de données...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PropType } from 'vue';
import draggable from 'vuedraggable';

const props = defineProps({
  node: {
    type: Object as PropType<any>,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  parentList: {
    type: Array as PropType<any[]>,
    required: true
  },
  selectedNode: {
    type: Object as PropType<any>,
    default: null
  }
});

const emit = defineEmits(['select-node', 'delete-node']);

const isBox = computed(() => props.node.type === 'box');
const isSelected = computed(() => props.selectedNode === props.node);

const isEditing = ref(false);

const toggleEdit = () => {
  isEditing.value = !isEditing.value;
};

const updateColumns = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  props.node.columns = target.value.split('\n').filter(c => c.trim() !== '');
};

const updateOptions = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  props.node.options = target.value.split('\n').filter(o => o.trim() !== '');
};

import { openPromptEditor } from '../../utils/promptEditorState';
import { openReportEditor } from '../../utils/reportEditorState';

const editAiPrompt = () => {
    if (props.node.aiPrompt === undefined) {
        props.node.aiPrompt = '';
    }
    openPromptEditor(props.node);
};

const editReport = () => {
    openReportEditor(props.node);
};

const selectNode = () => {
  emit('select-node', props.node);
};

const deleteNode = () => {
  const idx = props.parentList.indexOf(props.node);
  if (idx !== -1) {
    props.parentList.splice(idx, 1);
  } else {
      emit('delete-node', props.node);
  }
};

const getFriendlyTypeLabel = (type: string) => {
  switch (type) {
    case 'text': return 'Texte Court';
    case 'textarea': return 'Texte Long';
    case 'number': return 'Nombre';
    case 'date': return 'Date';
    case 'checkbox': return 'Case à cocher';
    case 'radio': return 'Radio';
    case 'select': return 'Liste déroulante';
    case 'table': return 'Tableau';
    default: return type;
  }
};

const getTypeBadgeClass = (type: string) => {
  switch (type) {
    case 'text':
    case 'textarea':
      return 'bg-cyan-light text-cyan';
    case 'number':
    case 'date':
      return 'bg-emerald-light text-emerald';
    case 'checkbox':
    case 'radio':
    case 'select':
      return 'bg-amber-light text-amber';
    case 'table':
      return 'bg-violet-light text-violet';
    default:
      return 'bg-slate-100 text-slate-600';
  }
};

const getNodeBorderClass = computed(() => {
  if (isBox.value) return 'border-layout';
  switch (props.node.inputType) {
    case 'text':
    case 'textarea':
      return 'border-text';
    case 'number':
    case 'date':
      return 'border-number';
    case 'checkbox':
    case 'radio':
    case 'select':
      return 'border-choice';
    case 'table':
      return 'border-advanced';
    default:
      return '';
  }
});
</script>

<style scoped>
.editor-node {
  position: relative;
  background-color: #ffffff;
  border-width: 1px;
  border-style: solid;
  border-color: #e2e8f0;
  cursor: pointer;
}

.editor-node:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

/* Color Coding Borders mapped to Sidebar themes */
.border-layout {
  border-left: 4px solid #6366f1 !important;
}
.border-text {
  border-left: 4px solid #06b6d4 !important;
}
.border-number {
  border-left: 4px solid #10b981 !important;
}
.border-choice {
  border-left: 4px solid #f59e0b !important;
}
.border-advanced {
  border-left: 4px solid #a855f7 !important;
}

/* Selected Node outline and glow */
.editor-node-selected {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15), 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
  transform: translateY(-1px);
}

.header-container {
  min-height: 28px;
}

.pe-16 {
  padding-right: 76px !important;
}

/* Technical & Functional Badges */
.badge-key {
  font-family: monospace;
  font-size: 0.7rem;
}
.badge-type {
  font-size: 0.7rem;
  letter-spacing: -0.01em;
}
.bg-indigo-light { background-color: #eeebff; color: #4f46e5; }
.bg-cyan-light { background-color: #ecfeff; color: #0891b2; }
.bg-emerald-light { background-color: #f0fdf4; color: #059669; }
.bg-amber-light { background-color: #fffbeb; color: #d97706; }
.bg-violet-light { background-color: #faf5ff; color: #9333ea; }
.bg-rose-light { background-color: #fef2f2; color: #e11d48; }

.bg-sky { background-color: #0ea5e9; }
.bg-amber { background-color: #f59e0b; }

/* Actions Bar Buttons */
.node-btn-action {
  width: 28px;
  height: 28px;
  border: 1px solid #e2e8f0;
  background-color: #ffffff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}
.node-btn-action:hover {
  color: #1e293b;
  background-color: #f8fafc;
}
.btn-edit:hover {
  border-color: #10b981;
  color: #10b981;
  background-color: #f0fdf4;
}
.btn-delete:hover {
  border-color: #f43f5e;
  color: #f43f5e;
  background-color: #fff1f2;
}

.drag-handle {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  transition: all 0.2s;
}
.drag-handle:hover {
  background-color: #f1f5f9;
}

.disabled-input {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.5rem;
  color: #94a3b8;
  cursor: not-allowed;
  font-size: 0.875rem;
}

.box-content {
  border: 1.5px dashed #cbd5e1;
  background-color: #f8fafc;
  min-height: 60px;
}
.box-content:hover {
  border-color: #94a3b8;
}

.empty-box-placeholder {
  border: 1.5px dashed #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  background-color: #ffffff;
}

.checkbox-input {
  width: 15px;
  height: 15px;
  border-radius: 3px;
  border: 1px solid #cbd5e1;
  cursor: pointer;
}

.btn-info-tonal {
  background-color: #f0f9ff;
  border: 1px solid #e0f2fe;
}
.btn-info-tonal:hover {
  background-color: #e0f2fe;
}
.btn-warning-tonal {
  background-color: #fffbeb;
  border: 1px solid #fef3c7;
}
.btn-warning-tonal:hover {
  background-color: #fef3c7;
}

.badge-dot-amber {
  width: 6px;
  height: 6px;
  background-color: #f59e0b;
  border-radius: 50%;
  display: inline-block;
}

.ghost {
  opacity: 0.4;
  background-color: #e0e7ff;
  border: 2px dashed #4f46e5 !important;
}

.disabled-input-element {
  pointer-events: none;
  cursor: not-allowed;
}
</style>
