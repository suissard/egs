const fs = require('fs');

let content = fs.readFileSync('src/components/editor/EditorSidebar.vue', 'utf8');

const replacementTemplate = `<template>
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
        <div class="component-item card pa-3 mb-2 cursor-pointer elevation-1 text-center" :class="getComponentClass(element)">
          <span class="font-weight-medium" :class="getTextClass(element)">{{ element.label }}</span>
        </div>
      </template>
    </draggable>
  </div>
</template>`;

content = content.replace(/<template>[\s\S]*?<\/template>/, replacementTemplate);

const getComponentClassCode = `
const getComponentClass = (element: any) => {
  if (element.type === 'box') return 'bg-primary-lighten';
  switch (element.inputType) {
    case 'text':
    case 'textarea':
      return 'bg-info-lighten';
    case 'number':
    case 'date':
      return 'bg-success-lighten';
    case 'checkbox':
    case 'radio':
    case 'select':
      return 'bg-warning-lighten';
    default:
      return 'bg-white';
  }
};

const getTextClass = (element: any) => {
  if (element.type === 'box') return 'text-primary-dark';
  switch (element.inputType) {
    case 'text':
    case 'textarea':
      return 'text-info-dark';
    case 'number':
    case 'date':
      return 'text-success-dark';
    case 'checkbox':
    case 'radio':
    case 'select':
      return 'text-warning-dark';
    default:
      return 'text-main';
  }
};
`;

content = content.replace(/const cloneComponent = \(original: any\) => \{/, getComponentClassCode + '\nconst cloneComponent = (original: any) => {');

const stylesCode = `
.bg-primary-lighten { background-color: #e0e7ff; border-color: #a5b4fc; }
.text-primary-dark { color: #3730a3; }
.bg-info-lighten { background-color: #e0f2fe; border-color: #7dd3fc; }
.text-info-dark { color: #075985; }
.bg-success-lighten { background-color: #dcfce7; border-color: #86efac; }
.text-success-dark { color: #166534; }
.bg-warning-lighten { background-color: #fef9c3; border-color: #fde047; }
.text-warning-dark { color: #854d0e; }

.component-item {
  border-width: 2px;
  border-style: solid;
  transition: all 0.2s;
}
.component-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  filter: brightness(0.95);
}
`;

content = content.replace(/\.component-item \{[\s\S]*?\}\s*\.component-item:hover \{[\s\S]*?\}/, stylesCode);

fs.writeFileSync('src/components/editor/EditorSidebar.vue', content);
