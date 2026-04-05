<template>
  <div>
    <!-- Overlay -->
    <div v-if="isReportEditorOpen" class="overlay" @click="closeReportEditor"></div>

    <!-- Drawer Panel -->
    <div class="drawer" :class="{ 'drawer-open': isReportEditorOpen }">
      <div class="drawer-header bg-warning text-white">
        <h2 class="text-h6 mb-0 d-flex align-center gap-2">
          <span>⚡ Configuration des Reports</span>
        </h2>
        <button class="btn-close text-white" @click="closeReportEditor" title="Fermer">×</button>
      </div>

      <div class="drawer-content" v-if="activeReportNode">
        <div class="mb-4">
            <label class="input-label font-weight-bold d-block mb-1 text-primary">Champ source</label>
            <div class="pa-2 bg-grey-lighten-4 rounded border">
                <strong>{{ activeReportNode.label }}</strong> <span class="text-caption text-grey">({{ activeReportNode.inputType }})</span>
            </div>
        </div>

        <div class="reports-list">
          <div v-for="(report, index) in activeReportNode.actionReports" :key="index" class="report-item pa-3 mb-3 border rounded shadow-sm bg-white position-relative">
            <button class="btn-delete-report" @click="deleteReport(index)" title="Supprimer ce report">×</button>
            <h4 class="text-subtitle-2 mb-2 font-weight-bold">Report #{{ index + 1 }}</h4>
            
            <div class="input-group mb-2">
              <label class="text-caption font-weight-bold">Valeur déclencheur (triggerValue)</label>
              <input v-model="report.triggerValue" type="text" class="input-field py-1 px-2 text-body-2" placeholder="Ex: Oui, 10, ..." />
              <small class="text-grey text-caption">Si la valeur du champ source est égale à ceci...</small>
            </div>

            <div class="input-group mb-2">
              <label class="text-caption font-weight-bold">Clé cible (targetKey)</label>
              <input v-model="report.targetKey" type="text" class="input-field py-1 px-2 text-body-2" placeholder="Ex: montant_total" />
              <small class="text-grey text-caption">...alors on met à jour ce champ JSON.</small>
            </div>

            <div class="input-group mb-0">
              <label class="text-caption font-weight-bold">Valeur à reporter (valueToReport)</label>
              <input v-model="report.valueToReport" type="text" class="input-field py-1 px-2 text-body-2" placeholder="Ex: 50, Non, ..." />
              <small class="text-grey text-caption">Valeur envoyée au champ cible.</small>
            </div>
          </div>

          <button class="btn btn-emerald w-100 d-flex align-center justify-center gap-2 py-2 mt-4 text-white" @click="addReport" style="background-color: #10b981;">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Ajouter un report
          </button>
        </div>
      </div>
      
      <div class="drawer-footer pa-4 border-top bg-grey-lighten-5">
          <button class="btn btn-emerald w-100 text-white" @click="closeReportEditor" style="background-color: #10b981;">Terminer et fermer</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isReportEditorOpen, activeReportNode, closeReportEditor } from '../utils/reportEditorState';

const addReport = () => {
    if (activeReportNode.value) {
        if (!activeReportNode.value.actionReports) {
            activeReportNode.value.actionReports = [];
        }
        activeReportNode.value.actionReports.push({
            targetKey: '',
            triggerValue: '',
            valueToReport: ''
        });
    }
};

const deleteReport = (index: number) => {
    if (activeReportNode.value && activeReportNode.value.actionReports) {
        activeReportNode.value.actionReports.splice(index, 1);
    }
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1001;
}

.drawer {
  position: fixed;
  top: 0;
  right: -450px;
  width: 450px;
  height: 100vh;
  background-color: #f8fafc;
  box-shadow: -4px 0 15px rgba(0,0,0,0.1);
  z-index: 1002;
  transition: right 0.3s ease-in-out;
  display: flex;
  flex-direction: column;
}

.drawer-open {
  right: 0;
}

.drawer-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
  line-height: 1;
}

.drawer-content {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.report-item {
    background: white;
    border: 1px solid #e2e8f0;
}

.btn-delete-report {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #fee2e2;
    color: #ef4444;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
}

.btn-delete-report:hover {
    background: #fecaca;
}

.input-field {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 4px;
    outline: none;
}
.input-field:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.bg-warning {
    background-color: #ff9800 !important;
}

.text-primary {
    color: #3b82f6 !important;
}
</style>
