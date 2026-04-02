<template>
  <div class="editor-properties pa-4 bg-grey-lighten-4">
    <h3 class="text-subtitle-1 font-weight-bold mb-4">Propriétés</h3>

    <div v-if="!selectedNode" class="text-center text-grey">
      Sélectionnez un élément pour modifier ses propriétés.
    </div>

    <div v-else class="properties-form">
      <!-- General Properties (Both Box & Input) -->
      <div class="input-group mb-3">
        <label class="input-label font-weight-bold">ID (Optionnel)</label>
        <input v-model="selectedNode.id" type="text" class="input-field" />
      </div>

      <!-- Box Properties -->
      <template v-if="selectedNode.type === 'box'">
        <div class="input-group mb-3">
          <label class="input-label font-weight-bold">Titre (Optionnel)</label>
          <input v-model="selectedNode.title" type="text" class="input-field" />
        </div>

        <div class="input-group mb-3">
          <label class="input-label font-weight-bold">Direction</label>
          <select v-model="selectedNode.direction" class="input-field">
            <option value="column">Colonne (Vertical)</option>
            <option value="row">Ligne (Horizontal)</option>
          </select>
        </div>
      </template>

      <!-- Input Properties -->
      <template v-if="selectedNode.type === 'input'">
        <div class="input-group mb-3">
          <label class="input-label font-weight-bold">Type de champ</label>
          <select v-model="selectedNode.inputType" class="input-field">
            <option value="text">Texte Court</option>
            <option value="textarea">Texte Long</option>
            <option value="number">Nombre</option>
            <option value="checkbox">Case à cocher</option>
            <option value="radio">Boutons Radio</option>
            <option value="select">Liste Déroulante</option>
            <option value="date">Date</option>
          </select>
        </div>

        <div class="input-group mb-3">
          <label class="input-label font-weight-bold">Label</label>
          <input v-model="selectedNode.label" type="text" class="input-field" />
        </div>

        <div class="input-group mb-3">
          <label class="input-label font-weight-bold">Clé (JSON)</label>
          <input v-model="selectedNode.key" type="text" class="input-field" />
        </div>

        <div class="input-group mb-3 d-flex align-center gap-2">
          <input type="checkbox" id="prop-required" v-model="selectedNode.required" />
          <label for="prop-required" class="mb-0">Obligatoire</label>
        </div>

        <div class="input-group mb-3">
          <label class="input-label font-weight-bold">Placeholder (Optionnel)</label>
          <input v-model="selectedNode.placeholder" type="text" class="input-field" />
        </div>

        <div class="input-group mb-3" v-if="selectedNode.inputType === 'select'">
            <div class="d-flex align-center gap-2">
                <input type="checkbox" id="prop-multiple" v-model="selectedNode.multiple" />
                <label for="prop-multiple" class="mb-0">Choix multiple</label>
            </div>
        </div>

        <!-- Options for Choice Inputs -->
        <div class="input-group mb-3" v-if="['select', 'radio', 'checkbox'].includes(selectedNode.inputType)">
          <label class="input-label font-weight-bold">Options (Une par ligne)</label>
          <textarea
            :value="selectedNode.options ? selectedNode.options.join('\n') : ''"
            @input="updateOptions($event)"
            class="input-field"
            rows="4"
          ></textarea>
        </div>
      </template>

      <div class="d-flex justify-center mt-6">
          <button class="btn btn-error" @click="$emit('delete-node', selectedNode)">Supprimer l'élément</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
  selectedNode: {
    type: Object as PropType<any>,
    default: null
  }
});

const emit = defineEmits(['delete-node']);

const updateOptions = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  if (props.selectedNode) {
    props.selectedNode.options = target.value.split('\n').filter(o => o.trim() !== '');
  }
};
</script>

<style scoped>
.editor-properties {
  width: 300px;
  min-height: 100%;
  border-left: 1px solid #e0e0e0;
  overflow-y: auto;
}
.properties-form {
  font-size: 0.9em;
}
</style>
