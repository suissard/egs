<template>
  <div class="editor-sidebar pa-4 bg-grey-lighten-4">
    <h3 class="text-subtitle-1 font-weight-bold mb-4">Composants</h3>
    <draggable
      :list="availableComponents"
      :group="{ name: 'form-builder', pull: 'clone', put: false }"
      item-key="type"
      :clone="cloneComponent"
      class="component-list"
    >
      <template #item="{ element }">
        <div class="component-item card pa-3 mb-2 cursor-pointer elevation-1 text-center">
          <span class="font-weight-medium">{{ element.label }}</span>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import draggable from 'vuedraggable';

const availableComponents = ref([
  { type: 'box', label: 'Box (Conteneur)' },
  { type: 'input', inputType: 'text', label: 'Texte Court' },
  { type: 'input', inputType: 'textarea', label: 'Texte Long' },
  { type: 'input', inputType: 'number', label: 'Nombre' },
  { type: 'input', inputType: 'checkbox', label: 'Case à cocher' },
  { type: 'input', inputType: 'radio', label: 'Boutons Radio' },
  { type: 'input', inputType: 'select', label: 'Liste Déroulante' },
  { type: 'input', inputType: 'date', label: 'Date' }
]);

const generateId = () => Math.random().toString(36).substring(2, 9);

const cloneComponent = (original: any) => {
  const clone = { ...original, id: generateId() };
  if (clone.type === 'box') {
    clone.direction = 'column';
    clone.children = [];
    clone.title = 'Nouvelle Box';
  } else if (clone.type === 'input') {
    clone.key = `field_${generateId()}`;
    clone.label = `Nouveau Champ`;
    clone.required = false;

    if (['select', 'radio', 'checkbox'].includes(clone.inputType)) {
      clone.options = ['Option 1', 'Option 2'];
    }
  }
  return clone;
};
</script>

<style scoped>
.editor-sidebar {
  width: 250px;
  min-height: 100%;
  border-right: 1px solid #e0e0e0;
}
.component-item {
  background: white;
  border: 1px dashed #ccc;
  transition: all 0.2s;
}
.component-item:hover {
  border-color: var(--primary);
  background: #f0f8ff;
}
.cursor-pointer {
  cursor: grab;
}
.cursor-pointer:active {
  cursor: grabbing;
}
</style>
