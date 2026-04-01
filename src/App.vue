<template>
  <div class="app-container bg-grey-lighten-4 min-h-screen">
    <div class="container py-10">
      <div class="row justify-center">
        <div class="col" style="max-width: 900px; width: 100%;">
          <h1 class="text-h3 mb-8 text-center font-weight-bold text-primary">Formulaire Dynamique</h1>

          <div class="card pa-6 mb-8">
            <div class="d-flex justify-space-between align-center">
                <div class="input-group mb-0 flex-grow-1 mr-4">
                  <label class="input-label font-weight-bold">Choisir un modèle</label>

              <select v-model="selectedModelKey" class="input-field" @change="loadSelectedModel">
                <option v-for="item in availableModels" :key="item.key" :value="item.key">
                  {{ item.title }}
                </option>
              </select>
                </div>
                <div class="d-flex align-center gap-2">
                  <label class="font-weight-bold">Mode Édition</label>
                  <label class="switch">
                    <input type="checkbox" v-model="isEditMode">
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>
          </div>

          <div v-if="isEditMode && currentConfigData">
            <FormEditor :initial-data="currentConfigData" @save="handleSaveEditor" />
          </div>
          <div v-else-if="formRoot"  class="my-4" ref="formContainer">
            <form ref="form" @submit.prevent="submitForm">
              <FormRenderer :node="formRoot" :root-data="formData" />

              <div class="card mt-8 pa-4 bg-grey-lighten-5" style="border: none;">
                <button type="submit" class="btn btn-primary btn-block btn-lg text-uppercase mb-4">
                  Valider le formulaire
                </button>

                <div class="d-flex gap-3 mt-4 flex-wrap justify-center">
                  <button type="button" class="btn btn-secondary" @click="handleCopy">
                    Presse-papier
                  </button>

                  <button type="button" class="btn btn-error" @click="handlePdf">
                    PDF (Visuel)
                  </button>

                  <button type="button" class="btn btn-success" @click="handleExportJson">
                    Export JSON
                  </button>

                  <button type="button" class="btn btn-warning" @click="triggerImportJson">
                    Import JSON
                  </button>
                </div>
              </div>
            </form>
          </div>

          <input type="file" ref="fileInput" style="display: none" accept=".json" @change="handleImportJson" />

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
import { ref, onMounted, watch, provide } from 'vue';
import { FormFactory } from './models/FormFactory';
import { FormNode } from './models/FormNode';
import { BoxNode } from './models/BoxNode';
import { InputNode } from './models/InputNode';
import FormRenderer from './components/FormRenderer.vue';
import FormEditor from './components/editor/FormEditor.vue';
import personalCoordinates from './data/personalCoordinates.json';
import fullFormExample from './data/fullFormExample.json';
import egs from './data/egs.json';
import geriatricAssessment from './data/geriatricAssessment.json';
import psychologicalAnalysis from './data/psychologicalAnalysis.json';
import type { FormConfig } from './types/FormConfig';

import { copyToClipboard, generateVisualPdf, exportToJson, importFromJson } from './utils/exportUtils';

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

function handleSaveEditor(newConfig: any) {
  currentConfigData.value = newConfig;
  const rootNode = FormFactory.create(newConfig as unknown as FormConfig);
  formRoot.value = rootNode;
  updateFormData();
  isEditMode.value = false;
  showSnackbar('Structure mise à jour avec succès !', 'success');
}

function updateFormData() {
  if (formRoot.value && formRoot.value instanceof BoxNode) {
    formData.value = formRoot.value.getData();
  } else {
    formData.value = {};
  }
}

provide('triggerDataUpdate', updateFormData);

const STORAGE_KEY = 'egs-form-data';

const availableModels = [
  { key: 'egs', title: 'Évaluation Gériatrique Standardisée (EGS)', data: egs },
  { title: 'Coordonnées Personnelles', key: 'personal' },
  { title: 'Exemple Complet', key: 'full' },
  { title: 'Évaluation Gériatrique Standardisée', key: 'geriatric' }
  , { title: 'Analyse Psychologique', key: 'psychological' }
];
const selectedModelKey = ref('egs');
const isEditMode = ref(false);
const currentConfigData = ref<any>(null);

function loadSelectedModel() {
  let config: any;
  if (selectedModelKey.value === 'egs') {
    config = egs;
  } else if (selectedModelKey.value === 'full') {
    config = fullFormExample;
  } else if (selectedModelKey.value === 'geriatric') {
    config = geriatricAssessment;
  } else if (selectedModelKey.value === 'psychological') {
    config = psychologicalAnalysis;
  } else {
    config = personalCoordinates;
  }

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
  loadSelectedModel();

  // 3. Watch for changes
  watch(
    formRoot,
    (newVal) => {
      if (newVal && newVal instanceof BoxNode) {
        const data = newVal.getData();
        updateFormData();
        localStorage.setItem(`${STORAGE_KEY}-${selectedModelKey.value}`, JSON.stringify(data));
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
        applyDataToNode(formRoot.value, data);
        showSnackbar('Données importées avec succès !', 'success');
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
</script>

<style>
.min-h-screen {
  min-height: 100vh;
}

.snackbar {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #333;
  color: white;
  padding: 12px 24px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 300px;
  justify-content: space-between;
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
</style>
