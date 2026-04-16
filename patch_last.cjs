const fs = require('fs');
const path = 'src/App.vue';
let content = fs.readFileSync(path, 'utf8');

// I accidentally reset the files AND discarded my changes to the index.
// I need to re-apply the correct fix to App.vue and FormEditor.vue and then build!

// First, FormEditor.vue
const pathEditor = 'src/components/editor/FormEditor.vue';
let editorContent = fs.readFileSync(pathEditor, 'utf8');

editorContent = editorContent.replace(
  `<button class="btn btn-success" @click="saveForm">Enregistrer JSON</button>`,
  `<button class="btn btn-secondary mr-2" @click="triggerImport">Importer</button>\n          <button class="btn btn-secondary mr-2" @click="saveForm">Exporter</button>\n          <button class="btn btn-primary" @click="saveAsModel">Sauvegarder comme modèle</button>\n          <input type="file" ref="fileInput" accept=".json" style="display: none" @change="handleImportStructure" />`
);

editorContent = editorContent.replace(
  `import { exportToJson } from '../../utils/exportUtils';`,
  `import { exportToJson, importFromJson } from '../../utils/exportUtils';`
);

editorContent = editorContent.replace(
  `const emit = defineEmits(['update:modelValue', 'save']);`,
  `const emit = defineEmits(['update:modelValue', 'save', 'save-model']);`
);

editorContent = editorContent.replace(
  `const selectedNode = ref<any>(null);`,
  `const selectedNode = ref<any>(null);\nconst fileInput = ref<HTMLInputElement | null>(null);`
);

editorContent = editorContent.replace(
  `const saveForm = () => {
    // Export JSON file
    exportToJson(formData.value, 'form_structure.json');
    emit('save', formData.value);
    alert('Structure du formulaire exportée et sauvegardée en local !');
};`,
  `const saveForm = () => {
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
      const data = await importFromJson(file);
      formData.value = data;
    } catch (e) {
      console.error('Erreur lors de l\\'import de la structure', e);
      alert('Erreur lors de l\\'import de la structure');
    } finally {
      target.value = '';
    }
  }
};`
);

fs.writeFileSync(pathEditor, editorContent);

// Second, App.vue fixing syntax errors and adding feature
const fixSyntax = `if (targetNode && targetNode instanceof InputNode) {
          // Trigger devenu VRAI
          if (!isTriggeredOld && isTriggeredNew) {
            if (targetNode.inputType === 'checkbox') {
              if (targetNode.options && targetNode.options.length > 0) {
                 if (!targetNode.value) targetNode.value = [];
                 if (!targetNode.value.includes(report.valueToReport)) {
                    targetNode.value.push(report.valueToReport);
                 }
              } else {
                 targetNode.value = report.valueToReport;
              }
            } else if (targetNode.inputType === 'table') {
              if (!targetNode.value) targetNode.value = [];
              const rowToAdd = Array.isArray(report.valueToReport) ? report.valueToReport : [report.valueToReport];
              const exists = targetNode.value.some((row: any[]) => JSON.stringify(row) === JSON.stringify(rowToAdd));
              if (!exists) {
                targetNode.value.push(rowToAdd);
              }
            } else if (targetNode.inputType === 'textarea' || targetNode.inputType === 'text') {
               const currentText = targetNode.value || '';
               if (!currentText.includes(report.valueToReport)) {
                 targetNode.value = currentText ? currentText + '\\n- ' + report.valueToReport : '- ' + report.valueToReport;
               }
            } else {
               targetNode.value = report.valueToReport;
            }
          }
          // Trigger devenu FAUX
          else if (isTriggeredOld && !isTriggeredNew) {
            if (targetNode.inputType === 'checkbox' && Array.isArray(targetNode.value)) {
              const index = targetNode.value.indexOf(report.valueToReport);
              if (index > -1) {
                targetNode.value.splice(index, 1);
              }
            } else if (targetNode.inputType === 'table') {
              if (targetNode.value && Array.isArray(targetNode.value)) {
                const rowToRemove = Array.isArray(report.valueToReport) ? report.valueToReport : [report.valueToReport];
                const index = targetNode.value.findIndex((row: any[]) => JSON.stringify(row) === JSON.stringify(rowToRemove));
                if (index > -1) {
                  targetNode.value.splice(index, 1);
                }
              }
            } else if (targetNode.inputType === 'textarea' || targetNode.inputType === 'text') {
              let currentText = targetNode.value || '';
              const strToRemove1 = "\\n- " + report.valueToReport;
              const strToRemove2 = "- " + report.valueToReport + "\\n";
              const strToRemove3 = "- " + report.valueToReport;

              if (currentText.includes(strToRemove1)) {
                 currentText = currentText.replace(strToRemove1, "");
              } else if (currentText.includes(strToRemove2)) {
                 currentText = currentText.replace(strToRemove2, "");
              } else if (currentText.includes(strToRemove3)) {
                 currentText = currentText.replace(strToRemove3, "");
              }
              targetNode.value = currentText;
            } else {
               if (targetNode.value === report.valueToReport) {
                  targetNode.value = null;
               }
            }
          }
        }`;
const bigBlockRegex = /if \(targetNode && targetNode instanceof InputNode\) \{[\s\S]*?removeValueFromNode\(targetNode, oldValueToReport\);\n          \}\n        \}/;
content = content.replace(bigBlockRegex, fixSyntax);
const fnAddRegex = /function addValueToNode[\s\S]*?targetNode\.value = value;\n  \}\n\}/;
const fnRemoveRegex = /function removeValueFromNode[\s\S]*?targetNode\.value = null;\n     \}\n  \}\n\}/;
content = content.replace(fnAddRegex, '');
content = content.replace(fnRemoveRegex, '');

const originalModels = `const availableModels = [
  { key: 'egs', title: 'Évaluation Gériatrique Standardisée (EGS)', data: egs },
  { title: 'Coordonnées Personnelles', key: 'personal' },
  { title: 'Exemple Complet', key: 'full' },
  { title: 'Évaluation Gériatrique Standardisée', key: 'geriatric' }
  , { title: 'Analyse Psychologique', key: 'psychological' }
];`;

content = content.replace(originalModels, '');

const stateToAdd = `const CUSTOM_MODELS_STORAGE_KEY = 'egs-custom-models';
const availableModels = ref([
  { key: 'egs', title: 'Évaluation Gériatrique Standardisée (EGS)', data: egs },
  { title: 'Coordonnées Personnelles', key: 'personal', data: personalCoordinates },
  { title: 'Exemple Complet', key: 'full', data: fullFormExample },
  { title: 'Évaluation Gériatrique Standardisée', key: 'geriatric', data: geriatricAssessment },
  { title: 'Analyse Psychologique', key: 'psychological', data: psychologicalAnalysis }
]);`;

// Put the state at the top, just after formData
content = content.replace(`const formData = ref<Record<string, any>>({});`, `const formData = ref<Record<string, any>>({});\n\n${stateToAdd}`);

const loadModelRegex = /function loadSelectedModel\(\) \{\n  let config: any;\n  if \(selectedModelKey\.value === 'egs'\) \{\n    config = egs;\n  \} else if \(selectedModelKey\.value === 'full'\) \{\n    config = fullFormExample;\n  \} else if \(selectedModelKey\.value === 'geriatric'\) \{\n    config = geriatricAssessment;\n  \} else if \(selectedModelKey\.value === 'psychological'\) \{\n    config = psychologicalAnalysis;\n  \} else \{\n    config = personalCoordinates;\n  \}/;

content = content.replace(loadModelRegex, `function loadSelectedModel() {
  const selectedModel = availableModels.value.find(m => m.key === selectedModelKey.value);
  const config = selectedModel ? selectedModel.data : egs;`);

const onMountedRegex = /onMounted\(\(\) => \{\n  loadSelectedModel\(\);/;

content = content.replace(onMountedRegex, `onMounted(() => {
  const savedCustomModels = localStorage.getItem(CUSTOM_MODELS_STORAGE_KEY);
  if (savedCustomModels) {
    try {
      const parsedModels = JSON.parse(savedCustomModels);
      availableModels.value.push(...parsedModels);
    } catch (e) {
      console.error('Error parsing custom models', e);
    }
  }
  loadSelectedModel();`);

const saveModelFn = `
function handleSaveModel(model: { name: string, data: any }) {
  const existingModel = availableModels.value.find(m => m.title === model.name || m.key === model.name);
  if (existingModel) {
    alert("Un modèle avec ce nom existe déjà. Veuillez choisir un autre nom.");
    return;
  }

  const newModel = {
    key: \`custom-\${Date.now()}\`,
    title: model.name,
    data: model.data
  };

  availableModels.value.push(newModel);

  const customModels = availableModels.value.filter(m => m.key.startsWith('custom-'));
  localStorage.setItem(CUSTOM_MODELS_STORAGE_KEY, JSON.stringify(customModels));

  selectedModelKey.value = newModel.key;
  loadSelectedModel();

  isEditMode.value = false;
  showSnackbar(\`Modèle "\${model.name}" sauvegardé avec succès !\`, 'success');
}
`;

content = content.replace('</script>', `${saveModelFn}\n</script>`);

content = content.replace(/function handleSaveEditor\(newConfig: any\) \{[\s\S]*?showSnackbar\('Structure mise à jour avec succès !', 'success'\);\n\}/, `function handleSaveEditor(newConfig: any) {
  currentConfigData.value = newConfig;
  const rootNode = FormFactory.create(newConfig as unknown as FormConfig);
  formRoot.value = rootNode;
  updateFormData();
  isEditMode.value = false;
  showSnackbar('Structure mise à jour avec succès !', 'success');
}`);


content = content.replace(`<FormEditor :initial-data="currentConfigData" @save="handleSaveEditor" />`, `<FormEditor :initial-data="currentConfigData" @save="handleSaveEditor" @save-model="handleSaveModel" />`);

fs.writeFileSync(path, content);
console.log("Restored my hard work.");
