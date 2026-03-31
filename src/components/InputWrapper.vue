<template>
  <div class="input-wrapper">
    <!-- Text Input -->
    <div v-if="['text', 'email', 'tel', 'number', 'password'].includes(node.inputType)" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>
      </label>
      <input v-model="node.value" :type="node.inputType" :required="node.required" class="input-field" :disabled="readonly" />
    </div>

    <!-- Select Input -->
    <div v-else-if="node.inputType === 'select'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>
      </label>
      <select v-model="node.value" :required="node.required" class="input-field" :multiple="node.multiple" :disabled="readonly">
        <option v-for="opt in node.options" :key="opt" :value="opt">{{ opt }}</option>
      </select>
    </div>

    <!-- Radio Group -->
    <div v-else-if="node.inputType === 'radio'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>
      </label>
      <div class="d-flex flex-wrap gap-3">
        <label v-for="opt in node.options" :key="opt" class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
          <input type="radio" v-model="node.value" :value="opt" name="radio-group" :disabled="readonly">
          {{ opt }}
        </label>
      </div>
    </div>

    <!-- Switch -->
    <div v-else-if="node.inputType === 'switch'" class="input-group d-flex align-center gap-3">
      <label class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
        <input type="checkbox" v-model="node.value" :disabled="readonly">
        <span class="font-weight-bold">{{ node.label }}</span> <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>
      </label>
    </div>

    <!-- Checkbox (Single or Multiple) -->
    <div v-else-if="node.inputType === 'checkbox'" class="input-group">
      <label class="input-label" v-if="node.options && node.options.length > 0">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>
      </label>

      <!-- Multiple checkboxes -->
      <div v-if="node.options && node.options.length > 0" class="d-flex flex-wrap gap-3">
        <label v-for="opt in node.options" :key="opt" class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" v-model="node.value" :value="opt" :disabled="readonly">
          {{ opt }}
        </label>
      </div>

      <!-- Single checkbox -->
      <div v-else class="d-flex align-center gap-3">
        <label class="d-flex align-center" style="gap: 0.5rem; cursor: pointer;">
          <input type="checkbox" v-model="node.value" :required="node.required" :disabled="readonly">
          <span>{{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span></span>
        </label>
      </div>
    </div>

    <!-- Date Input -->
    <div v-else-if="node.inputType === 'date'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>
      </label>
      <input v-model="node.value" type="date" :required="node.required" class="input-field" :disabled="readonly" />
    </div>

    <!-- Textarea -->
    <div v-else-if="node.inputType === 'textarea'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>
      </label>
      <textarea v-model="node.value" :required="node.required" class="input-field" rows="3" :disabled="readonly"></textarea>
    </div>

    <!-- Slider -->
    <div v-else-if="node.inputType === 'slider'" class="input-group">
      <label class="input-label">
        {{ node.label }}: {{ node.value }} <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>
      </label>
      <input type="range" v-model="node.value" :min="node.min" :max="node.max" :step="node.step" class="w-100" :disabled="readonly" />
    </div>

    <!-- File Input -->
    <div v-else-if="node.inputType === 'file'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>
      </label>
      <input type="file" @change="(e: any) => node.value = e.target.files[0]" :required="node.required" class="input-field" :disabled="readonly" />
    </div>

    <!-- Time Input -->
    <div v-else-if="node.inputType === 'time'" class="input-group">
      <label class="input-label">
        {{ node.label }} <span v-if="node.required" class="text-error">*</span> <span v-if="node.hasActionReport" class="badge-action-report" title="Ce champ peut déclencher un plan d'action">⚡ Rapport</span>
      </label>
      <input v-model="node.value" type="time" :required="node.required" class="input-field" :disabled="readonly" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { InputNode } from '../models/InputNode';

defineProps<{
  node: InputNode;
  readonly?: boolean;
}>();

</script>

<style scoped>
.text-error {
  color: var(--error);
}

.badge-action-report {
  background-color: #ff9800;
  color: white;
  font-size: 0.7em;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: 8px;
  vertical-align: middle;
  cursor: help;
}
</style>
