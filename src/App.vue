<template>
  <div class="app-container bg-grey-lighten-4 min-h-screen">
    <div class="container py-10">
      <div class="row justify-center">
        <div class="col editor-container-transition" :style="{ 'max-width': isEditMode ? '1400px' : '900px', 'width': '100%' }">
          <h1 class="text-h3 mb-8 text-center font-weight-bold text-primary">Formulaire Dynamique</h1>

          <div class="card pa-4 mb-8 sticky-header shadow-sm no-print">
            <div class="d-flex justify-space-between align-center flex-wrap gap-4">
              <div class="input-group mb-0 flex-grow-1 mr-4" style="min-width: 250px;">
                <label class="input-label font-weight-bold">Choisir un modèle</label>
                <select v-model="selectedModelKey" class="input-field" @change="loadSelectedModel">
                  <option v-for="item in availableModels" :key="item.key" :value="item.key">
                    {{ item.title }}
                  </option>
                </select>
              </div>
              <div class="d-flex align-center gap-3">
                <button
                  v-if="!isFormVierge && !isEditMode && !showDocumentation"
                  type="button"
                  class="btn-clear-data"
                  @click="triggerResetForm"
                  title="Effacer toutes les données du formulaire"
                >
                  🗑️
                </button>
                <button
                  type="button"
                  class="btn-edit-structure"
                  :class="{ 'active': isEditMode }"
                  @click="isEditMode = !isEditMode"
                  title="Modifier la structure du formulaire"
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>


          <div v-if="showDocumentation">
            <div class="mb-4 d-flex justify-start">
               <button class="btn btn-secondary" @click="showDocumentation = false">
                  &larr; Retour au formulaire
               </button>
            </div>
            <UsageDoc v-if="!isEditMode" />
            <EditorDoc v-else />
          </div>
          <div v-else-if="isEditMode && currentConfigData">

            <FormEditor :initial-data="currentConfigData" @save="handleSaveEditor" @save-model="handleSaveModel" />
          </div>
          <div v-else-if="formRoot"  class="my-4" ref="formContainer">
            <form ref="form" @submit.prevent="submitForm">
              <FormRenderer :node="formRoot" :root-data="formData" />

              <div class="card mt-8 pa-4 bg-grey-lighten-5 border no-print" style="box-shadow: none;">
                <button type="submit" class="btn btn-primary btn-block btn-lg text-uppercase mb-4" style="letter-spacing: 0.05em;">
                  ✅ Valider le formulaire
                </button>

                <div class="d-flex gap-3 mt-4 flex-wrap justify-center">
                  <button type="button" class="btn btn-secondary" @click="handleCopy">
                    📋 Copier Presse-papier
                  </button>

                  <button type="button" class="btn btn-error" @click="handlePdf">
                    📄 Générer PDF
                  </button>

                  <button type="button" class="btn btn-success" @click="handleExportJson">
                    📥 Exporter JSON
                  </button>

                  <button type="button" class="btn btn-warning" @click="triggerImportJson">
                    📤 Importer JSON
                  </button>
                </div>
              </div>
            </form>
          </div>

          <input type="file" ref="fileInput" style="display: none" accept=".json" @change="handleImportJson" />

          <AISettingsDrawer @open-doc="handleOpenDoc" />
          <AIPromptEditorDrawer />
          <ActionReportEditorDrawer />
          <AIErrorDrawer />
          <OrphanDataDrawer />

          <div v-if="submittedData" class="alert alert-info mt-6">
            <h3 class="font-weight-bold mb-2">Données soumises</h3>
            <pre style="overflow-x: auto;">{{ submittedData }}</pre>
          </div>

          <!-- Custom Snackbar -->
          <div v-if="snackbar" :class="['snackbar', `snackbar-${snackbarColor}`]">
            <span>{{ snackbarText }}</span>
            <button class="btn-text" @click="snackbar = false">Fermer</button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, provide, computed } from 'vue';
import { FormFactory } from './models/FormFactory';
import { FormNode } from './models/FormNode';
import { BoxNode } from './models/BoxNode';
import { InputNode } from './models/InputNode';
import FormRenderer from './components/FormRenderer.vue';
import AISettingsDrawer from './components/AISettingsDrawer.vue';
import AIPromptEditorDrawer from './components/AIPromptEditorDrawer.vue';
import ActionReportEditorDrawer from './components/ActionReportEditorDrawer.vue';
import AIErrorDrawer from './components/AIErrorDrawer.vue';
import OrphanDataDrawer from './components/OrphanDataDrawer.vue';
import FormEditor from './components/editor/FormEditor.vue';
import UsageDoc from './components/docs/UsageDoc.vue';
import EditorDoc from './components/docs/EditorDoc.vue';
// import personalCoordinates from './data/personalCoordinates.json';
import fullFormExample from './data/fullFormExample.json';
import geriatricAssessment from './data/EGS.json';
import psychologicalAnalysis from './data/psychologicalAnalysis.json';
import type { FormConfig } from './types/FormConfig';

import { copyToClipboard, generateVisualPdf, exportToJson, importFromJson } from './utils/exportUtils';
import { formAvailableKeys, currentFormData } from './utils/promptEditorState';
import { isOrphanDrawerOpen, orphanedData } from './utils/orphanImportState';

const formRoot = ref<FormNode | null>(null);
// const valid = ref(false); // No longer needed as we use native browser validation mostly, or simple check
const submittedData = ref<string | null>(null);
const snackbar = ref(false);
const snackbarText = ref('');
const snackbarColor = ref('info');
const formContainer = ref<HTMLElement | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);

// Ref to store form data reactively so we can compute display conditions
const formData = ref<Record<string, any>>({});

const isFormVierge = computed(() => {
  return Object.values(formData.value).every(val => {
    if (val === null || val === undefined || val === "") return true;
    if (Array.isArray(val) && val.length === 0) return true;
    if (typeof val === 'boolean' && !val) return true;
    return false;
  });
});

function resetFormValues(node: FormNode, askConfirm: boolean = true) {
  const resetNode = (n: FormNode) => {
    if (n instanceof BoxNode) {
      n.children.forEach(child => resetNode(child));
    } else if (n instanceof InputNode) {
      if (n.inputType === 'checkbox') {
        if (n.options && n.options.length > 0) {
          n.value = [];
        } else {
          n.value = false;
        }
      } else if (n.inputType === 'table') {
        n.value = [];
      } else {
        n.value = null;
      }
    }
  };

  if (askConfirm) {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données saisies ?')) {
      return;
    }
  }

  resetNode(node);
  updateFormData();

  if (askConfirm) {
    showSnackbar('Formulaire réinitialisé !', 'info');
  }
}

function triggerResetForm() {
  if (formRoot.value) {
    resetFormValues(formRoot.value, true);
  }
}

const CUSTOM_MODELS_STORAGE_KEY = 'egs-custom-models';
const availableModels = ref([
  // { key: 'egs', title: 'Évaluation Gériatrique Standardisée (EGS)', data: egs },
  { title: 'Évaluation Gériatrique Standardisée', key: 'geriatric', data: geriatricAssessment },
  // { title: 'Coordonnées Personnelles', key: 'personal', data: personalCoordinates },
  { title: 'Exemple Complet', key: 'full', data: fullFormExample },
  { title: 'Analyse Psychologique', key: 'psychological', data: psychologicalAnalysis }
]);

function handleSaveEditor(newConfig: any) {
  currentConfigData.value = newConfig;
  const rootNode = FormFactory.create(newConfig as unknown as FormConfig);
  formRoot.value = rootNode;
  updateFormData();
  isEditMode.value = false;
  showSnackbar('Structure mise à jour avec succès !', 'success');
}


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


// Helper pour trouver un noeud par sa clé (id ou key)
function findNodeByKey(node: FormNode, key: string): FormNode | null {
  if (node instanceof InputNode && node.key === key) {
    return node;
  }
  if (node instanceof BoxNode) {
    for (const child of node.children) {
      const found = findNodeByKey(child, key);
      if (found) return found;
    }
  }
  return null;
}

// Fonction de propagation récursive des actionReports avec détection de cycles
function propagateChange(
  sourceKey: string,
  oldValue: any,
  newValue: any,
  root: FormNode,
  propagationPath: string[],
  propagatedKeys: Set<string>
) {
  // Enregistrer que cette clé est en cours de propagation
  propagatedKeys.add(sourceKey);

  // Trouver le nœud source
  const sourceNode = findNodeByKey(root, sourceKey);
  if (!sourceNode || !(sourceNode instanceof InputNode) || !sourceNode.actionReports) {
    return;
  }

  for (const report of sourceNode.actionReports) {
    let isTriggeredOld = false;
    let isTriggeredNew = false;

    // Détermine si le triggerValue est vide (déclenchement sur n'importe quel changement)
    const isEmptyTrigger = report.triggerValue === "" || report.triggerValue === null || report.triggerValue === undefined;

    // Évalue l'ancien état du déclencheur
    if (isEmptyTrigger) {
       isTriggeredOld = oldValue !== "" && oldValue !== null && oldValue !== undefined;
    } else if (Array.isArray(report.triggerValue)) {
      isTriggeredOld = Array.isArray(oldValue)
          ? report.triggerValue.some(t => oldValue.includes(t))
          : report.triggerValue.includes(oldValue);
    } else {
      isTriggeredOld = Array.isArray(oldValue)
          ? oldValue.includes(report.triggerValue)
          : oldValue === report.triggerValue;
    }

    // Évalue le nouvel état du déclencheur
    if (isEmptyTrigger) {
       isTriggeredNew = newValue !== "" && newValue !== null && newValue !== undefined;
    } else if (Array.isArray(report.triggerValue)) {
      isTriggeredNew = Array.isArray(newValue)
          ? report.triggerValue.some(t => newValue.includes(t))
          : report.triggerValue.includes(newValue);
    } else {
      isTriggeredNew = Array.isArray(newValue)
          ? newValue.includes(report.triggerValue)
          : newValue === report.triggerValue;
    }

    // Si l'état du déclencheur n'a pas changé, on ignore
    if (isTriggeredOld === isTriggeredNew) {
      continue;
    }

    const targetNode = findNodeByKey(root, report.targetKey);
    if (!targetNode || !(targetNode instanceof InputNode)) {
      continue;
    }

    // --- DÉTECTION DE RÉACTION CIRCULAIRE (CYCLE) ---
    if (propagationPath.includes(targetNode.key)) {
      console.warn(`[ActionReport] Boucle circulaire de report évitée : ${propagationPath.join(' -> ')} -> ${targetNode.key}.`);
      showSnackbar(`Attention : Boucle de report circulaire évitée vers "${targetNode.label || targetNode.key}"`, 'warning');
      continue;
    }

    // Capture de la valeur existante avant modification pour vérifier s'il y a un changement réel
    const targetOldValue = JSON.parse(JSON.stringify(targetNode.value));

    // Application du report (Trigger devenu VRAI)
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

        let rowToAdd: any[];
        if (Array.isArray(report.valueToReport)) {
          rowToAdd = report.valueToReport;
        } else if (typeof report.valueToReport === 'string' && report.valueToReport.includes(',')) {
          rowToAdd = report.valueToReport.split(',').map(item => item.trim());
        } else {
          rowToAdd = [report.valueToReport];
        }

        const exists = targetNode.value.some((row: any[]) => {
          if (!Array.isArray(row) || row.length === 0) return false;
          const targetVal = String(rowToAdd[0] || '').trim();
          return String(row[0] || '').trim() === targetVal;
        });
        if (!exists) {
          targetNode.value.push(rowToAdd);
        }
      } else if (targetNode.inputType === 'textarea' || targetNode.inputType === 'text') {
         const currentText = targetNode.value || '';
         if (!currentText.includes(report.valueToReport)) {
           targetNode.value = currentText ? currentText + '\n- ' + report.valueToReport : '- ' + report.valueToReport;
         }
      } else {
         targetNode.value = report.valueToReport;
      }
    }
    // Application du report (Trigger devenu FAUX)
    else if (isTriggeredOld && !isTriggeredNew) {
      if (targetNode.inputType === 'checkbox' && Array.isArray(targetNode.value)) {
        const index = targetNode.value.indexOf(report.valueToReport);
        if (index > -1) {
          targetNode.value.splice(index, 1);
        }
      } else if (targetNode.inputType === 'table') {
        if (targetNode.value && Array.isArray(targetNode.value)) {
          let rowToRemove: any[];
          if (Array.isArray(report.valueToReport)) {
            rowToRemove = report.valueToReport;
          } else if (typeof report.valueToReport === 'string' && report.valueToReport.includes(',')) {
            rowToRemove = report.valueToReport.split(',').map(item => item.trim());
          } else {
            rowToRemove = [report.valueToReport];
          }

          const index = targetNode.value.findIndex((row: any[]) => {
            if (!Array.isArray(row) || row.length === 0) return false;
            const targetVal = String(rowToRemove[0] || '').trim();
            return String(row[0] || '').trim() === targetVal;
          });
          if (index > -1) {
            const existingRow = targetNode.value[index];
            // Vérifie si l'utilisateur a modifié d'autres colonnes de cette ligne
            let isModified = false;
            for (let i = 1; i < Math.max(existingRow.length, rowToRemove.length); i++) {
              const existingVal = String(existingRow[i] || '').trim();
              const originalVal = String(rowToRemove[i] || '').trim();
              if (existingVal !== originalVal) {
                isModified = true;
                break;
              }
            }
            if (!isModified) {
              targetNode.value.splice(index, 1);
            }
          }
        }
      } else if (targetNode.inputType === 'textarea' || targetNode.inputType === 'text') {
        let currentText = targetNode.value || '';
        const strToRemove1 = "\n- " + report.valueToReport;
        const strToRemove2 = "- " + report.valueToReport + "\n";
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

    const targetNewValue = targetNode.value;

    // Si la valeur a réellement changé, on propage la modification récursivement !
    if (JSON.stringify(targetOldValue) !== JSON.stringify(targetNewValue)) {
      propagateChange(
        targetNode.key,
        targetOldValue,
        targetNewValue,
        root,
        [...propagationPath, targetNode.key],
        propagatedKeys
      );
    }
  }
}

function updateFormData() {
  if (formRoot.value && formRoot.value instanceof BoxNode) {
    const oldData = { ...formData.value };
    const newData = formRoot.value.getData();

    // Traite les reports d'action s'il y a des changements de données
    if (Object.keys(oldData).length > 0) {
      const changedKeys: string[] = [];
      for (const key of Object.keys(newData)) {
        if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
          changedKeys.push(key);
        }
      }

      if (changedKeys.length > 0) {
        const propagatedKeys = new Set<string>();
        for (const key of changedKeys) {
          if (!propagatedKeys.has(key)) {
            propagateChange(key, oldData[key], newData[key], formRoot.value, [key], propagatedKeys);
          }
        }
      }

      // Re-fetch des données car la propagation récursive a pu modifier d'autres nœuds
      formData.value = formRoot.value.getData();
    } else {
      formData.value = newData;
    }

    currentFormData.value = formData.value;
    formAvailableKeys.value = extractKeysFromNode(formRoot.value);
  } else {
    formData.value = {};
  }
}

provide('triggerDataUpdate', updateFormData);

const STORAGE_KEY = 'egs-form-data';


const selectedModelKey = ref('geriatric');
const showDocumentation = ref(false);
const isEditMode = ref(false);
const currentConfigData = ref<any>(null);


function handleOpenDoc(mode: 'usage' | 'editor') {
  showDocumentation.value = true;
  isEditMode.value = mode === 'editor';
}

function loadSelectedModel() {
  const selectedModel = availableModels.value.find(m => m.key === selectedModelKey.value);
  const config = selectedModel ? selectedModel.data : geriatricAssessment;
  

  // 1. Create structure from config
  const rootParams = config as unknown as FormConfig;
  currentConfigData.value = JSON.parse(JSON.stringify(config));
  const rootNode = FormFactory.create(rootParams);

  // 2. Check local storage for the specific model
  const savedData = localStorage.getItem(`${STORAGE_KEY}-${selectedModelKey.value}`);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      applyDataToNode(rootNode, parsed);
      console.log(`Restored data for ${selectedModelKey.value} from LocalStorage`);
    } catch (e) {
      console.error('Error restoring data', e);
    }
  }

  formRoot.value = rootNode;
  updateFormData();
  submittedData.value = null; // Reset submitted data on change
}

onMounted(() => {
  const savedCustomModels = localStorage.getItem(CUSTOM_MODELS_STORAGE_KEY);
  if (savedCustomModels) {
    try {
      const parsedModels = JSON.parse(savedCustomModels);
      availableModels.value.push(...parsedModels);
    } catch (e) {
      console.error('Error parsing custom models', e);
    }
  }
  loadSelectedModel();

  // 3. Watch for changes in form structure to update form data
  watch(
    formRoot,
    (newVal) => {
      if (newVal && newVal instanceof BoxNode) {
        updateFormData();
      }
    },
    { deep: true }
  );

  // Watch for any changes in the form data values to persist to local storage
  watch(
    formData,
    (newVal) => {
      if (newVal) {
        localStorage.setItem(`${STORAGE_KEY}-${selectedModelKey.value}`, JSON.stringify(newVal));
      }
    },
    { deep: true }
  );
});

// Helper to apply data recursively
function applyDataToNode(node: FormNode, data: Record<string, any>) {
  if (node instanceof BoxNode) {
    node.children.forEach(child => applyDataToNode(child, data));
  } else if (node instanceof InputNode) {
    if (data[node.key] !== undefined) {
      if (node.inputType === 'checkbox') {
        if (node.options && node.options.length > 0) {
          // Checkbox multiple: Vue v-model expects an array
          node.value = Array.isArray(data[node.key]) ? data[node.key] : [data[node.key]];
        } else {
          // Checkbox single: Vue v-model expects a boolean
          node.value = Boolean(data[node.key]);
        }
      } else {
        node.value = data[node.key];
      }
    }
  }
}

function submitForm() {
  if (formRoot.value && formRoot.value instanceof BoxNode) {
    if (formRoot.value.validate()) {
      const data = formRoot.value.getData();
      console.log('Form Data:', data);
      submittedData.value = JSON.stringify(data, null, 2);
    } else {
      showSnackbar('Veuillez remplir tous les champs obligatoires.', 'warning');
    }
  }
}

async function handleCopy() {
  if (formRoot.value) {
    try {
      await copyToClipboard(formRoot.value);
      showSnackbar('Copié dans le presse-papier !', 'success');
    } catch (e) {
      showSnackbar('Erreur lors de la copie.', 'error');
    }
  }
}

function handlePdf() {
  if (formContainer.value) {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const filename = `formulaire_${year}-${month}-${day}_${hours}h${minutes}m${seconds}s.pdf`;

    generateVisualPdf(formContainer.value, filename);
    showSnackbar('PDF (Visuel) généré !', 'success');
  }
}

function handleExportJson() {
  if (formRoot.value && formRoot.value instanceof BoxNode) {
    const data = formRoot.value.getData();
    exportToJson(data, 'mes_donnees.json');
    showSnackbar('JSON Exporté !', 'success');
  }
}

function triggerImportJson() {
  fileInput.value?.click();
}

async function handleImportJson(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (!file) return;

    try {
      const data = await importFromJson(file);
      if (formRoot.value) {
        // Detect structure differences (orphaned keys)
        const currentKeys = extractKeysFromNode(formRoot.value);
        const importedKeys = Object.keys(data);
        const orphans: Record<string, any> = {};
        let hasOrphans = false;

        for (const key of importedKeys) {
          if (!currentKeys.includes(key)) {
            const val = data[key];
            // Only consider meaningful non-empty orphaned values
            const isEmpty = val === null || val === undefined || val === "" || (Array.isArray(val) && val.length === 0);
            if (!isEmpty) {
              orphans[key] = val;
              hasOrphans = true;
            }
          }
        }

        // Reset form values to have a clean slate before importing
        resetFormValues(formRoot.value, false);

        // Apply data to the existing fields
        applyDataToNode(formRoot.value, data);

        if (hasOrphans) {
          orphanedData.value = orphans;
          isOrphanDrawerOpen.value = true;
          showSnackbar('Données importées, mais certains champs de l\'ancienne version n\'existent plus.', 'warning');
        } else {
          orphanedData.value = {};
          showSnackbar('Données importées avec succès !', 'success');
        }
      }
    } catch (e) {
      showSnackbar('Erreur lors de l\'import.', 'error');
      console.error(e);
    } finally {
      target.value = ''; // Reset input
    }
  }
}

function showSnackbar(text: string, color: string = 'info') {
  snackbarText.value = text;
  snackbarColor.value = color; // expecting 'info', 'success', 'warning', 'error'
  snackbar.value = true;
  setTimeout(() => {
    snackbar.value = false;
  }, 3000);
}

function handleSaveModel(model: { name: string, data: any }) {
  const existingModel = availableModels.value.find(m => m.title === model.name || m.key === model.name);
  if (existingModel) {
    alert("Un modèle avec ce nom existe déjà. Veuillez choisir un autre nom.");
    return;
  }

  const newModel = {
    key: `custom-${Date.now()}`,
    title: model.name,
    data: model.data
  };

  availableModels.value.push(newModel);

  const customModels = availableModels.value.filter(m => m.key.startsWith('custom-'));
  localStorage.setItem(CUSTOM_MODELS_STORAGE_KEY, JSON.stringify(customModels));

  selectedModelKey.value = newModel.key;
  loadSelectedModel();

  isEditMode.value = false;
  showSnackbar(`Modèle "${model.name}" sauvegardé avec succès !`, 'success');
}

</script>

<style>
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  margin-top: -10px; /* Offset some padding */
  border-bottom: 1px solid var(--border);
  box-shadow: 0 4px 20px -5px rgba(0, 0, 0, 0.05);
}

.min-h-screen {
  min-height: 100vh;
}

.snackbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(8px);
  color: white;
  padding: 10px 20px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  min-width: 320px;
  justify-content: space-between;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
}

.snackbar-info {
  background-color: #333;
}

.snackbar-success {
  background-color: var(--success);
}

.snackbar-warning {
  background-color: var(--warning);
  color: black;
}

.snackbar-error {
  background-color: var(--error);
}

.btn-text {
  background: none;
  border: none;
  color: inherit;
  font-weight: bold;
  cursor: pointer;
  text-transform: uppercase;
}

/* The switch - the box around the slider */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--primary);
}

input:checked + .slider:before {
  -webkit-transform: translateX(22px);
  -ms-transform: translateX(22px);
  transform: translateX(22px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 28px;
}

.slider.round:before {
  border-radius: 50%;
}

.editor-container-transition {
  transition: max-width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-edit-structure {
  background-color: white;
  border: 1px solid var(--border);
  color: var(--text-main);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-edit-structure:hover {
  background-color: #f8fafc;
  border-color: #cbd5e1;
  transform: rotate(30deg) scale(1.05);
}

.btn-edit-structure:active {
  transform: scale(0.95);
}

.btn-edit-structure.active {
  background-color: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-edit-structure.active:hover {
  background-color: var(--primary-dark);
  border-color: var(--primary-dark);
  transform: rotate(90deg) scale(1.05);
}

.btn-clear-data {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  color: var(--error);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.08);
}

.btn-clear-data:hover {
  background-color: var(--error);
  color: white;
  border-color: var(--error);
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.btn-clear-data:active {
  transform: scale(0.95);
}
</style>

