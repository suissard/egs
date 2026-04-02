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
        <button class="btn btn-sm btn-error py-1 px-2 text-caption" @click.stop="deleteNode">Supprimer</button>
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
import { computed } from 'vue';
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
</style>
