<template>
  <div
    class="editor-node pa-3 mb-3 border rounded transition-all"
    :class="{
      'bg-white shadow-sm': isBox,
      'bg-grey-lighten-5': !isBox,
      'border-primary border-2 shadow-md': isSelected,
      'border-dashed border-grey': !isSelected && isBox,
    }"
    @click.stop="selectNode"
  >
    <div class="d-flex justify-space-between align-center mb-2">
      <div class="font-weight-bold d-flex align-center gap-2">
        <span class="mdi mdi-drag cursor-grab drag-handle text-grey-darken-1"></span>
        <span v-if="isBox" class="text-primary">{{ node.title || 'Box' }} ({{ node.direction || 'column' }})</span>
        <span v-else class="text-secondary">{{ node.label || 'Champ' }} ({{ node.inputType }})</span>
      </div>
      <div class="actions d-flex gap-2">
        <button class="btn-icon bg-warning text-white rounded-circle d-flex align-center justify-center" style="width: 28px; height: 28px; border: none; cursor: pointer;" @click.stop="toggleEdit" title="Éditer">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
        </button>
        <button class="btn-icon bg-error text-white rounded-circle d-flex align-center justify-center" style="width: 28px; height: 28px; border: none; cursor: pointer;" @click.stop="deleteNode" title="Supprimer">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
        </button>
      </div>
    </div>

    <!-- In-place Editor Form -->
    <div v-if="isEditing" class="in-place-editor pa-3 mt-2 bg-white rounded border border-grey-lighten-2 shadow-sm" @click.stop>
      <h4 class="text-subtitle-2 mb-3">Éditer les propriétés</h4>

      <div class="row d-flex flex-wrap gap-3">
        <!-- Box Properties -->
        <template v-if="isBox">
          <div class="input-group flex-1 min-w-200">
            <label class="input-label text-caption font-weight-bold">Titre</label>
            <input v-model="node.title" type="text" class="input-field py-1 px-2 text-body-2" />
          </div>
          <div class="input-group flex-1 min-w-200">
            <label class="input-label text-caption font-weight-bold">Direction</label>
            <select v-model="node.direction" class="input-field py-1 px-2 text-body-2">
              <option value="column">Colonne (Vertical)</option>
              <option value="row">Ligne (Horizontal)</option>
            </select>
          </div>
        </template>

        <!-- Input Properties -->
        <template v-else>
          <div class="input-group flex-1 min-w-200">
            <label class="input-label text-caption font-weight-bold">Label</label>
            <input v-model="node.label" type="text" class="input-field py-1 px-2 text-body-2" />
          </div>
          <div class="input-group flex-1 min-w-200">
            <label class="input-label text-caption font-weight-bold">Type de champ</label>
            <select v-model="node.inputType" class="input-field py-1 px-2 text-body-2">
              <option value="text">Texte Court</option>
              <option value="textarea">Texte Long</option>
              <option value="number">Nombre</option>
              <option value="checkbox">Case à cocher</option>
              <option value="radio">Boutons Radio</option>
              <option value="select">Liste Déroulante</option>
              <option value="date">Date</option>
            </select>
          </div>
          <div class="input-group flex-1 min-w-200">
            <label class="input-label text-caption font-weight-bold">Clé JSON</label>
            <input v-model="node.key" type="text" class="input-field py-1 px-2 text-body-2" />
          </div>

          <div class="w-100 d-flex gap-4 align-center mt-2">
            <label class="d-flex align-center gap-1 cursor-pointer">
              <input type="checkbox" v-model="node.required" />
              <span class="text-caption">Obligatoire</span>
            </label>
            <div class="d-flex align-center gap-1">
              <span v-if="node.actionReports && node.actionReports.length > 0" class="badge-action-report px-2 py-1 rounded bg-warning text-white text-caption">⚡ Report actif (éditer en JSON)</span>
            </div>
            <div class="d-flex align-center gap-1">
              <button class="btn btn-sm btn-info d-flex align-center gap-1 py-1" @click="editAiPrompt">
                <span class="text-caption">Prompt IA</span>
                <span class="badge-help rounded-circle bg-info text-white d-inline-flex align-center justify-center" style="width: 14px; height: 14px; font-size: 10px;" title="Configurer un prompt d'Intelligence Artificielle pour pré-remplir ce champ.">?</span>
              </button>
            </div>
          </div>

          <div class="input-group w-100 mt-2" v-if="['select', 'radio', 'checkbox'].includes(node.inputType)">
            <label class="input-label text-caption font-weight-bold">Options (Une par ligne)</label>
            <textarea
              :value="node.options ? node.options.join('\n') : ''"
              @input="updateOptions($event)"
              class="input-field py-1 px-2 text-body-2"
              rows="3"
            ></textarea>
          </div>

          <div class="input-group w-100 mt-2" v-if="node.aiPrompt !== undefined && node.aiPrompt !== ''">
             <label class="input-label text-caption font-weight-bold text-primary">Aperçu du Prompt IA:</label>
             <div class="text-caption bg-grey-lighten-4 pa-2 rounded text-truncate" :title="node.aiPrompt">{{ node.aiPrompt }}</div>
          </div>
        </template>
      </div>

      <div class="d-flex justify-end mt-3">
        <button class="btn btn-sm btn-primary" @click="toggleEdit">Terminer l'édition</button>
      </div>
    </div>

    <!-- Recursive Box Content -->
    <div v-if="isBox" class="box-content mt-2 pa-2 bg-grey-lighten-4 rounded" :class="{'d-flex gap-3': node.direction === 'row'}">
      <draggable
        :list="node.children"
        item-key="id"
        group="form-builder"
        class="min-h-50 w-100"
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

      <div v-if="!node.children || node.children.length === 0" class="text-center text-grey py-4 border-dashed border-grey rounded w-100">
        Glissez des composants ici
      </div>
    </div>

    <!-- Input Preview (Non-interactive in editor) -->
    <div v-else class="input-preview mt-2">
      <input v-if="['text', 'number', 'date'].includes(node.inputType)" type="text" class="input-field disabled-input" :placeholder="node.placeholder || '...'" disabled />
      <textarea v-if="node.inputType === 'textarea'" class="input-field disabled-input" rows="2" disabled></textarea>
      <select v-if="node.inputType === 'select'" class="input-field disabled-input" disabled>
        <option>Sélectionnez une option</option>
      </select>
      <div v-if="node.inputType === 'radio' || node.inputType === 'checkbox'" class="d-flex gap-2">
        <div v-for="opt in node.options" :key="opt" class="d-flex align-center gap-1">
          <input :type="node.inputType" disabled />
          <label class="text-caption mb-0">{{ opt }}</label>
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

const updateOptions = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  props.node.options = target.value.split('\n').filter(o => o.trim() !== '');
};

// Assuming openPromptEditor is available globally or we import it
import { openPromptEditor } from '../../utils/promptEditorState';

const editAiPrompt = () => {
    // If it's undefined, initialize it to empty string so it's reactive
    if (props.node.aiPrompt === undefined) {
        props.node.aiPrompt = '';
    }
    openPromptEditor(props.node);
};

const selectNode = () => {
  emit('select-node', props.node);
};

const deleteNode = () => {
  // Try to delete from immediate parent first
  const idx = props.parentList.indexOf(props.node);
  if (idx !== -1) {
    props.parentList.splice(idx, 1);
  } else {
      // If deeply nested, rely on global event
      emit('delete-node', props.node);
  }
};
</script>

<style scoped>
.editor-node {
  position: relative;
}
.border-2 {
  border-width: 2px !important;
}
.cursor-grab {
  cursor: grab;
}
.cursor-grab:active {
  cursor: grabbing;
}
.disabled-input {
  background-color: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}
.min-h-50 {
  min-height: 50px;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.btn-info { background-color: #38bdf8; color: white; }
.btn-info:hover { background-color: #0284c7; }
</style>
