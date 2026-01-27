<template>
  <div class="input-wrapper">
    <!-- Text Input -->
    <v-text-field
      v-if="['text', 'email', 'tel', 'number', 'password'].includes(node.inputType)"
      v-model="node.value"
      :label="node.label"
      :type="node.inputType"
      :required="node.required"
      :rules="rules"
      variant="outlined"
      density="comfortable"
    ></v-text-field>

    <!-- Select Input -->
    <v-select
      v-else-if="node.inputType === 'select'"
      v-model="node.value"
      :items="node.options"
      :label="node.label"
      :required="node.required"
      :rules="rules"
      variant="outlined"
      density="comfortable"
    ></v-select>

    <!-- Checkbox -->
    <v-checkbox
      v-else-if="node.inputType === 'checkbox'"
      v-model="node.value"
      :label="node.label"
      :required="node.required"
      :rules="rules"
    ></v-checkbox>

    <!-- Date Input -->
    <v-text-field
      v-else-if="node.inputType === 'date'"
      v-model="node.value"
      :label="node.label"
      type="date"
      :required="node.required"
      :rules="rules"
      variant="outlined"
      density="comfortable"
    ></v-text-field>

    <!-- Textarea -->
    <v-textarea
      v-else-if="node.inputType === 'textarea'"
      v-model="node.value"
      :label="node.label"
      :required="node.required"
      :rules="rules"
      variant="outlined"
      density="comfortable"
    ></v-textarea>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { InputNode } from '../models/InputNode';

const props = defineProps<{
  node: InputNode;
}>();

const rules = computed(() => {
  const r = [];
  if (props.node.required) {
    r.push((v: any) => !!v || `${props.node.label} est requis`);
  }
  if (props.node.inputType === 'email') {
    r.push((v: string) => /.+@.+\..+/.test(v) || 'Email invalide');
  }
  return r;
});
</script>
