<template>
  <div class="form-editor-container d-flex">
    <!-- Left Sidebar: Components -->
    <EditorSidebar />

    <!-- Center Canvas: Builder Area -->
    <div class="editor-canvas flex-grow-1 pa-6 bg-grey-lighten-5 position-relative">
      <div class="d-flex justify-space-between align-center mb-6">
        <h2 class="text-h4 font-weight-bold text-primary">Constructeur de Formulaire</h2>
        <div class="actions">
          <button class="btn btn-secondary mr-2" @click="clearForm">Vider</button>
          <button class="btn btn-primary" @click="saveForm">Enregistrer JSON</button>
        </div>
      </div>

      <div class="canvas-area card pa-6" style="min-height: 70vh;">
        <draggable
          v-if="formData && formData.children"
          :list="formData.children"
          item-key="id"
          group="form-builder"
          class="w-100 h-100 min-h-300"
          ghost-class="ghost"
        >
          <template #item="{ element, index }">
            <EditorNode
              :node="element"
              :index="index"
              :parent-list="formData.children"
              :selected-node="selectedNode"
              @select-node="selectNode"
              @delete-node="deleteNodeGlobally"
            />
          </template>
        </draggable>

        <div v-if="!formData || !formData.children || formData.children.length === 0" class="text-center text-grey py-12 border-dashed border-grey rounded">
          Glissez votre premier composant ici
        </div>
      </div>
    </div>

    <!-- Right Sidebar: Properties -->
    <EditorProperties
      :selected-node="selectedNode"
      @delete-node="deleteNodeGlobally"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import draggable from 'vuedraggable';
import EditorSidebar from './EditorSidebar.vue';
import EditorProperties from './EditorProperties.vue';
import EditorNode from './EditorNode.vue';
import { exportToJson } from '../../utils/exportUtils';

const props = defineProps({
  initialData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

const formData = ref<any>(null);
const selectedNode = ref<any>(null);

onMounted(() => {
  // Deep clone to avoid mutating the original directly until saved
  formData.value = JSON.parse(JSON.stringify(props.initialData));

  // Ensure root is a box
  if (!formData.value.type || formData.value.type !== 'box') {
      formData.value = { type: 'box', direction: 'column', children: [formData.value] };
  }
  if (!formData.value.children) formData.value.children = [];
});

watch(formData, (newVal) => {
    emit('update:modelValue', newVal);
}, { deep: true });

const selectNode = (node: any) => {
  selectedNode.value = node;
};

// Helper to recursively find and delete a node
const deleteNodeRecursive = (parent: any, nodeToDelete: any): boolean => {
    if (!parent.children) return false;

    const index = parent.children.findIndex((c: any) => c === nodeToDelete);
    if (index !== -1) {
        parent.children.splice(index, 1);
        return true;
    }

    for (const child of parent.children) {
        if (child.type === 'box') {
            if (deleteNodeRecursive(child, nodeToDelete)) return true;
        }
    }
    return false;
};

const deleteNodeGlobally = (node: any) => {
    if (formData.value && formData.value.children) {
        deleteNodeRecursive(formData.value, node);
        if (selectedNode.value === node) {
            selectedNode.value = null;
        }
    }
};

const clearForm = () => {
    if(confirm('Êtes-vous sûr de vouloir vider le formulaire ?')) {
        formData.value.children = [];
        selectedNode.value = null;
    }
};

const saveForm = () => {
    // Export JSON file
    exportToJson(formData.value, 'form_structure.json');
    emit('save', formData.value);
    alert('Structure du formulaire exportée et sauvegardée en local !');
};
</script>

<style scoped>
.form-editor-container {
  height: calc(100vh - 80px); /* Adjust based on navbar height if any */
  overflow: hidden;
}
.editor-canvas {
  overflow-y: auto;
}
.min-h-300 {
  min-height: 300px;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.border-dashed {
  border-style: dashed;
}
</style>
