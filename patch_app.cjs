const fs = require('fs');

let content = fs.readFileSync('src/App.vue', 'utf8');

// Insert AIPromptEditorDrawer next to AISettingsDrawer
content = content.replace(
  `<AISettingsDrawer @open-doc="handleOpenDoc" />`,
  `<AISettingsDrawer @open-doc="handleOpenDoc" />\n          <AIPromptEditorDrawer />`
);

// Import AIPromptEditorDrawer
content = content.replace(
  `import AISettingsDrawer from './components/AISettingsDrawer.vue';`,
  `import AISettingsDrawer from './components/AISettingsDrawer.vue';\nimport AIPromptEditorDrawer from './components/AIPromptEditorDrawer.vue';`
);

// Import state to update keys and data
content = content.replace(
  `import { copyToClipboard, generateVisualPdf, exportToJson, importFromJson } from './utils/exportUtils';`,
  `import { copyToClipboard, generateVisualPdf, exportToJson, importFromJson } from './utils/exportUtils';\nimport { formAvailableKeys, currentFormData } from './utils/promptEditorState';`
);

// Function to extract all keys
const extractKeysFn = `
function extractKeysFromNode(node: FormNode): string[] {
  let keys: string[] = [];
  if (node instanceof BoxNode) {
    node.children.forEach(child => {
      keys = keys.concat(extractKeysFromNode(child));
    });
  } else if (node instanceof InputNode) {
    if (node.key) keys.push(node.key);
  }
  return keys;
}
`;

content = content.replace(
  `function updateFormData() {`,
  `${extractKeysFn}\n\nfunction updateFormData() {`
);

content = content.replace(
  `formData.value = formRoot.value.getData();`,
  `formData.value = formRoot.value.getData();\n    currentFormData.value = formData.value;\n    formAvailableKeys.value = extractKeysFromNode(formRoot.value);`
);

fs.writeFileSync('src/App.vue', content);
