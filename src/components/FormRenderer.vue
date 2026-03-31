<template>
  <div class="form-renderer" v-if="isVisible">
    <template v-if="isBox(node)">
      <div :class="[
        'rounded-lg',
        node.title ? 'card' : ''
      ]">
        <div v-if="node.title" class="card-title bg-primary text-white font-weight-bold text-subtitle-1">
          {{ node.title }}
        </div>

        <div :class="[node.title ? 'pa-4' : 'pa-0', 'd-flex', 'flex-column']">
          <!-- Row Layout: Flexbox with gap -->
          <div v-if="node.direction === 'row'" class="d-flex flex-wrap" style="gap: 16px">
            <FormRenderer v-for="child in node.children" :key="child.id" :node="child" :root-data="rootData" class="flex-grow-1"
              :style="{ minWidth: child.minWidth || '200px' }" />
          </div>

          <!-- Column Layout: Flexbox with gap -->
          <div v-else class="d-flex flex-column" style="gap: 16px">
            <div v-for="child in node.children" :key="child.id">
              <FormRenderer :node="child" :root-data="rootData" />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-else-if="isInput(node)">
      <InputWrapper :node="node" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FormNode } from '../models/FormNode';
import { BoxNode } from '../models/BoxNode';
import { InputNode } from '../models/InputNode';
import InputWrapper from './InputWrapper.vue';

// Define props
const props = defineProps<{
  node: FormNode;
  rootData: Record<string, any>;
}>();

// Computed property to determine visibility based on showIf condition
const isVisible = computed(() => {
  if (!props.node.showIf) return true;

  const condition = props.node.showIf;
  const targetValue = props.rootData[condition.dependsOn];

  if (Array.isArray(condition.value)) {
    return condition.value.includes(targetValue);
  }
  return targetValue === condition.value;
});

// Type guards
function isBox(node: FormNode): node is BoxNode {
  return node.type === 'box';
}

function isInput(node: FormNode): node is InputNode {
  return node.type === 'input';
}
</script>

<script lang="ts">
export default {
  name: 'FormRenderer'
}
</script>
