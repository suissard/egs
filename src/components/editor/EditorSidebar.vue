<template>
  <div class="editor-sidebar pa-4">
    <div class="sidebar-header mb-5">
      <h3 class="text-subtitle-1 font-weight-bold text-slate-800 d-flex align-center gap-2">
        <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="text-primary"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
        Composants
      </h3>
      <p class="text-caption text-muted">Glissez-déposez des éléments dans la zone de construction à droite.</p>
    </div>

    <div v-for="category in categories" :key="category.title" class="category-group mb-5">
      <h4 class="category-title text-caption font-weight-bold text-uppercase tracking-wider mb-2 text-slate-500">
        {{ category.title }}
      </h4>
      
      <draggable
        :list="category.items"
        :group="{ name: 'form-builder', pull: 'clone', put: false }"
        item-key="label"
        :clone="cloneComponent"
        class="component-list d-flex flex-column gap-2"
      >
        <template #item="{ element }">
          <div class="component-item card px-3 py-2.5 cursor-grab d-flex align-center gap-3 transition-all" :class="getComponentClass(element)">
            <div class="component-icon-container d-flex align-center justify-center rounded" :class="getIconContainerClass(element)">
              <span v-html="getComponentIcon(element)"></span>
            </div>
            <span class="font-weight-medium text-body-2 text-slate-700">{{ element.label }}</span>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import draggable from 'vuedraggable';

const categories = ref([
  {
    title: 'Mise en Page',
    items: [
      { type: 'box', label: 'Section / Box' }
    ]
  },
  {
    title: 'Saisie de Texte',
    items: [
      { type: 'input', inputType: 'text', label: 'Texte Court' },
      { type: 'input', inputType: 'textarea', label: 'Texte Long' }
    ]
  },
  {
    title: 'Nombres & Dates',
    items: [
      { type: 'input', inputType: 'number', label: 'Nombre' },
      { type: 'input', inputType: 'date', label: 'Date' }
    ]
  },
  {
    title: 'Choix & Listes',
    items: [
      { type: 'input', inputType: 'checkbox', label: 'Case à cocher' },
      { type: 'input', inputType: 'radio', label: 'Bouton Radio' },
      { type: 'input', inputType: 'select', label: 'Liste Déroulante' }
    ]
  },
  {
    title: 'Avancé',
    items: [
      { type: 'input', inputType: 'table', label: 'Tableau Dynamique' }
    ]
  }
]);

const generateId = () => Math.random().toString(36).substring(2, 9);

const getComponentIcon = (element: any) => {
  if (element.type === 'box') {
    return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="3 3"></rect><path d="M12 3v18M3 12h18"></path></svg>`;
  }
  switch (element.inputType) {
    case 'text':
      return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V4h16v3M9 20h6M12 4v16"></path></svg>`;
    case 'textarea':
      return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="3" y2="12"></line><line x1="17" y1="18" x2="3" y2="18"></line></svg>`;
    case 'number':
      return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>`;
    case 'date':
      return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>`;
    case 'checkbox':
      return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`;
    case 'radio':
      return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4" fill="currentColor"></circle></svg>`;
    case 'select':
      return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    case 'table':
      return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="12" y2="12"></line></svg>`;
  }
};

const getComponentClass = (element: any) => {
  if (element.type === 'box') return 'item-layout';
  switch (element.inputType) {
    case 'text':
    case 'textarea':
      return 'item-text';
    case 'number':
    case 'date':
      return 'item-number';
    case 'checkbox':
    case 'radio':
    case 'select':
      return 'item-choice';
    case 'table':
      return 'item-advanced';
    default:
      return '';
  }
};

const getIconContainerClass = (element: any) => {
  if (element.type === 'box') return 'icon-layout';
  switch (element.inputType) {
    case 'text':
    case 'textarea':
      return 'icon-text';
    case 'number':
    case 'date':
      return 'icon-number';
    case 'checkbox':
    case 'radio':
    case 'select':
      return 'icon-choice';
    case 'table':
      return 'icon-advanced';
    default:
      return 'bg-slate-100 text-slate-500';
  }
};

const cloneComponent = (original: any) => {
  const clone = JSON.parse(JSON.stringify(original));
  clone.id = generateId();
  if (clone.type === 'box') {
    clone.direction = 'column';
    clone.children = [];
    clone.title = 'Nouvelle Box';
  } else if (clone.type === 'input') {
    clone.key = `field_${generateId()}`;
    clone.label = original.label;
    clone.required = false;

    if (['select', 'radio', 'checkbox'].includes(clone.inputType)) {
      clone.options = ['Option 1', 'Option 2'];
    }
    if (clone.inputType === 'table') {
      clone.columns = ['Colonne 1', 'Colonne 2'];
      clone.value = [];
    }
  }
  return clone;
};
</script>

<style scoped>
.editor-sidebar {
  width: 320px;
  flex-shrink: 0;
  min-height: 100%;
  border-right: 1px solid #e2e8f0;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
}

.sidebar-header {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 0.75rem;
}

.category-title {
  font-size: 0.7rem;
  letter-spacing: 0.07em;
  font-weight: 700;
  margin-top: 0.25rem;
}

.component-list {
  min-height: 40px;
}

.component-item {
  border: 1px solid #e2e8f0;
  border-radius: var(--radius-lg, 0.5rem);
  background-color: #ffffff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}

.component-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border-color: #cbd5e1;
}

.cursor-grab {
  cursor: grab;
}
.cursor-grab:active {
  cursor: grabbing;
}

/* Component Icons & Styles */
.component-icon-container {
  width: 30px;
  height: 30px;
  flex-shrink: 0;
}

/* Layout Color System */
.item-layout {
  border-left: 3px solid #6366f1;
}
.item-layout:hover {
  background-color: #f5f3ff;
}
.icon-layout {
  background-color: #e0e7ff;
  color: #4f46e5;
}

/* Text Inputs Color System */
.item-text {
  border-left: 3px solid #06b6d4;
}
.item-text:hover {
  background-color: #ecfeff;
}
.icon-text {
  background-color: #cffafe;
  color: #0891b2;
}

/* Numbers & Dates Color System */
.item-number {
  border-left: 3px solid #10b981;
}
.item-number:hover {
  background-color: #f0fdf4;
}
.icon-number {
  background-color: #d1fae5;
  color: #059669;
}

/* Choices & Lists Color System */
.item-choice {
  border-left: 3px solid #f59e0b;
}
.item-choice:hover {
  background-color: #fffbeb;
}
.icon-choice {
  background-color: #fef3c7;
  color: #d97706;
}

/* Advanced Color System */
.item-advanced {
  border-left: 3px solid #a855f7;
}
.item-advanced:hover {
  background-color: #faf5ff;
}
.icon-advanced {
  background-color: #f3e8ff;
  color: #9333ea;
}

.gap-2 {
  gap: 0.5rem;
}
.gap-3 {
  gap: 0.75rem;
}
.text-slate-800 { color: #1e293b; }
.text-slate-700 { color: #334155; }
.text-slate-500 { color: #64748b; }
.text-body-2 { font-size: 0.875rem; }
.text-caption { font-size: 0.75rem; line-height: 1.25rem; }
.text-muted { color: #64748b; }
.tracking-wider { letter-spacing: 0.05em; }
</style>
