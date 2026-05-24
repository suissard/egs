<template>
  <div class="form-editor-container d-flex">
    <!-- Left Sidebar: Components -->
    <EditorSidebar />

    <!-- Center Canvas: Builder Area -->
    <div class="editor-canvas flex-grow-1 pa-6 bg-slate-50 position-relative">
      <div class="d-flex justify-space-between align-center mb-6 flex-wrap gap-4">
        <div>
          <h2 class="text-h4 font-weight-bold text-slate-800 mb-1">Constructeur de Formulaire</h2>
          <p class="text-body-2 text-slate-500">Configurez et agencez la structure dynamique de votre formulaire en temps réel.</p>
        </div>
        <div class="actions d-flex flex-wrap gap-2">
          <button class="btn btn-error-tonal btn-sm text-error rounded-lg" @click="clearForm" title="Réinitialiser le canevas">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Vider
          </button>
          <button class="btn btn-secondary-tonal btn-sm text-slate-700 rounded-lg" @click="triggerImport" title="Importer un fichier JSON de structure">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Importer
          </button>
          <button class="btn btn-secondary-tonal btn-sm text-slate-700 rounded-lg" @click="saveForm" title="Exporter la structure actuelle en JSON">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Exporter
          </button>
          <button class="btn btn-primary btn-sm rounded-lg" @click="saveAsModel" title="Sauvegarder ce formulaire comme nouveau modèle sélectionnable">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            Sauvegarder le modèle
          </button>
          <input type="file" ref="fileInput" accept=".json" style="display: none" @change="handleImportStructure" />
        </div>
      </div>

      <div class="canvas-area card pa-6" style="min-height: 72vh;">
        <draggable
          v-if="formData && formData.children"
          :list="formData.children"
          item-key="id"
          group="form-builder"
          class="w-100 h-100 min-h-600 d-flex flex-column gap-3"
          ghost-class="ghost"
          handle=".drag-handle"
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

        <div v-if="!formData || !formData.children || formData.children.length === 0" class="canvas-empty-state d-flex flex-column align-center justify-center py-12 text-center">
          <div class="empty-icon-circle rounded-circle d-flex align-center justify-center mb-4">
            <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="12" y2="12"></line></svg>
          </div>
          <h4 class="text-subtitle-1 font-weight-bold text-slate-800 mb-1">Votre canevas est vide</h4>
          <p class="text-body-2 text-slate-500 max-w-350 mx-auto">
            Glissez-déposez des composants depuis la barre latérale gauche pour commencer à construire votre formulaire.
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import draggable from 'vuedraggable';
import EditorSidebar from './EditorSidebar.vue';
import EditorNode from './EditorNode.vue';
import { exportToJson, importFromJson } from '../../utils/exportUtils';

const props = defineProps({
  initialData: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'save', 'save-model']);

const formData = ref<any>(null);
const selectedNode = ref<any>(null);
const fileInput = ref<HTMLInputElement | null>(null);

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
};

const saveAsModel = () => {
  const modelName = window.prompt("Entrez le nom du nouveau modèle :");
  if (modelName && modelName.trim() !== "") {
    emit('save-model', { name: modelName.trim(), data: formData.value });
  }
};

const triggerImport = () => {
  fileInput.value?.click();
};

const handleImportStructure = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    try {
      const data = await importFromJson(file!);
      formData.value = data;
    } catch (e) {
      console.error('Erreur lors de l\'import de la structure', e);
      alert('Erreur lors de l\'import de la structure');
    } finally {
      target.value = '';
    }
  }
};
</script>

<style scoped>
.form-editor-container {
  height: calc(100vh - 120px);
  overflow: hidden;
  border-radius: var(--radius-xl, 1rem);
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
  background-color: #ffffff;
}

.editor-canvas {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.canvas-area {
  flex-grow: 1;
  background-color: #fafbfc;
  background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
  background-size: 20px 20px;
  border: 1.5px solid #e2e8f0;
  box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.03);
  position: relative;
  overflow-y: auto;
}

.min-h-600 {
  min-height: 600px;
}

.ghost {
  opacity: 0.4;
  background-color: #e0e7ff;
  border: 2px dashed #4f46e5 !important;
}

/* Empty State Illustration */
.canvas-empty-state {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.empty-icon-circle {
  width: 64px;
  height: 64px;
  background-color: #eff6ff;
  border: 2px dashed #3b82f6;
  border-radius: 50%;
  animation: pulse 2s infinite ease-in-out;
}

@keyframes pulse {
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
}

/* Premium Buttons */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: none;
}

.btn-secondary-tonal {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
}
.btn-secondary-tonal:hover {
  background-color: #e2e8f0;
}

.btn-error-tonal {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
}
.btn-error-tonal:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
}

.max-w-350 {
  max-w: 350px;
}

.text-slate-800 { color: #1e293b; }
.text-slate-500 { color: #64748b; }
.bg-slate-50 { background-color: #f8fafc; }
</style>
